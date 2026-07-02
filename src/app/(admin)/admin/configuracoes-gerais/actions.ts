'use server'

import { revalidatePath } from 'next/cache'

import { ActionResponse } from '@/lib/action-utils'
import { requireAdmin } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'

export interface ValoresReferencia {
  salario_minimo: number
  ano: number
}

export async function getValoresReferencia(): Promise<ValoresReferencia> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('configuracoes_sistema')
    .select('valor')
    .eq('chave', 'valores_referencia')
    .single()
    
  if (error || !data) {
    // Default fallback case it is not in the DB yet
    return { salario_minimo: 1621.00, ano: 2026 }
  }
  
  return data.valor as ValoresReferencia
}

export async function salvarValoresReferencia(valores: ValoresReferencia): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await supabase
      .from('configuracoes_sistema')
      .upsert({
        chave: 'valores_referencia',
        valor: valores as unknown as Record<string, unknown>
      }, { onConflict: 'chave' })

    if (error) {
      console.error('Erro ao salvar valores de referência:', error)
      return { success: false, error: 'Falha ao salvar configurações no banco de dados.' }
    }

    revalidatePath('/admin/configuracoes-gerais')
    revalidatePath('/admin/documentos/recibos/novo')
    return { success: true }
  } catch (err: unknown) {
    console.error(err)
    return { success: false, error: err instanceof Error ? err.message : 'Erro inesperado' }
  }
}
