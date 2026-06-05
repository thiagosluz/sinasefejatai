'use server'

import { revalidatePath } from 'next/cache'

import { requireAdmin } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'

interface DocumentoAdministrativoInput {
  tipo: string
  titulo: string
  numero?: string
  dados: Record<string, unknown>
}

export async function salvarDocumentoAdministrativo(input: DocumentoAdministrativoInput) {
  const supabase = await createClient()

  // Buscar autor
  const user = await requireAdmin()

  let finalNumero = input.numero

  // Geração automática de número para recibos
  if (input.tipo === 'recibo_pagamento' && !finalNumero) {
    const anoAtual = input.dados?.data_emissao 
      ? new Date(input.dados.data_emissao as string).getFullYear() 
      : new Date().getFullYear()

    const { data: ultimosRecibos } = await supabase
      .from('documentos_administrativos')
      .select('numero')
      .eq('tipo', 'recibo_pagamento')
      .neq('status', 'cancelado')
      .ilike('numero', `%/${anoAtual}`)
      .order('created_at', { ascending: false })
      .limit(50)

    let maiorNum = 0
    if (ultimosRecibos && ultimosRecibos.length > 0) {
      ultimosRecibos.forEach(doc => {
        if (doc.numero) {
          const match = doc.numero.match(/(\d+)\/\d{4}/)
          if (match) {
            const num = parseInt(match[1], 10)
            if (num > maiorNum) maiorNum = num
          }
        }
      })
    }
    
    maiorNum += 1
    finalNumero = `${String(maiorNum).padStart(3, '0')}/${anoAtual}`
  }

  const { data, error } = await supabase
    .from('documentos_administrativos')
    .insert([
      {
        tipo: input.tipo,
        titulo: input.titulo,
        numero: finalNumero || null,
        dados: input.dados,
        autor_id: user.id
      }
    ])
    .select('id')
    .single()

  if (error) {
    console.error('Erro ao salvar documento:', error)
    throw new Error('Falha ao registrar o documento no sistema.')
  }

  revalidatePath('/admin/documentos')
  
  return data
}

export async function excluirDocumentoAdministrativo(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('documentos_administrativos')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error('Erro ao excluir documento.')
  }

  revalidatePath('/admin/documentos')
}

export async function cancelarDocumentoAdministrativo(id: string) {
  const supabase = await createClient()
  await requireAdmin()

  const { error } = await supabase
    .from('documentos_administrativos')
    .update({ status: 'cancelado' })
    .eq('id', id)

  if (error) {
    throw new Error('Erro ao cancelar documento: ' + error.message)
  }

  revalidatePath('/admin/documentos')
  revalidatePath(`/admin/documentos/recibos/${id}`)
}
