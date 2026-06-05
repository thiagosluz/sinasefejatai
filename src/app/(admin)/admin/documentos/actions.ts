'use server'

import { revalidatePath } from 'next/cache'

import { requireAdmin } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'

import { getSlugByTipo } from './lib/tipos-documento'

interface DocumentoAdministrativoInput {
  tipo: string
  titulo: string
  numero?: string
  dados: Record<string, unknown>
}

async function gerarNumeroDocumento(
  supabase: ReturnType<typeof Object>,
  tipo: string,
  dataEmissao?: string
): Promise<string> {
  const anoAtual = dataEmissao
    ? new Date(dataEmissao as string).getFullYear()
    : new Date().getFullYear()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: ultimosDocs } = await (supabase as any)
    .from('documentos_administrativos')
    .select('numero')
    .eq('tipo', tipo)
    .neq('status', 'cancelado')
    .ilike('numero', `%/${anoAtual}`)
    .order('created_at', { ascending: false })
    .limit(50)

  let maiorNum = 0
  if (ultimosDocs && ultimosDocs.length > 0) {
    ultimosDocs.forEach((doc: { numero: string | null }) => {
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
  return `${String(maiorNum).padStart(3, '0')}/${anoAtual}`
}

export async function salvarDocumentoAdministrativo(input: DocumentoAdministrativoInput) {
  const supabase = await createClient()
  const user = await requireAdmin()

  const finalNumero = input.numero || await gerarNumeroDocumento(
    supabase,
    input.tipo,
    input.dados?.data_emissao as string | undefined
  )

  const { data, error } = await supabase
    .from('documentos_administrativos')
    .insert([
      {
        tipo: input.tipo,
        titulo: input.titulo,
        numero: finalNumero,
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

  // Buscar o tipo para revalidate dinâmico
  const { data: doc } = await supabase
    .from('documentos_administrativos')
    .select('tipo')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('documentos_administrativos')
    .update({ status: 'cancelado' })
    .eq('id', id)

  if (error) {
    throw new Error('Erro ao cancelar documento: ' + error.message)
  }

  revalidatePath('/admin/documentos')
  if (doc) {
    const slug = getSlugByTipo(doc.tipo)
    revalidatePath(`/admin/documentos/${slug}/${id}`)
  }
}
