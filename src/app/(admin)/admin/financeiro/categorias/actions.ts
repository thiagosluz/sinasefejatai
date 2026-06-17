'use server'

import { revalidatePath } from 'next/cache'

import { ActionResponse, handleError } from '@/lib/action-utils'
import { requireAdmin } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'

export async function addCategoria(formData: FormData): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const nome = formData.get('nome') as string
    const tipo = formData.get('tipo') as 'Entrada' | 'Saída'

    if (!nome || !tipo) {
      return { success: false, error: 'Preencha todos os campos obrigatórios' }
    }

    const { error } = await supabase.from('financeiro_categorias').insert({
      nome,
      tipo,
      ativo: true
    })

    if (error) {
      return { success: false, error: 'Erro ao salvar a categoria no banco de dados' }
    }

    revalidatePath('/admin/financeiro')
    revalidatePath('/admin/financeiro/categorias')
    
    return { success: true }
  } catch (err) {
    return handleError(err, 'Ocorreu um erro ao registrar a categoria.')
  }
}

export async function updateCategoria(id: string, formData: FormData): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const nome = formData.get('nome') as string
    const tipo = formData.get('tipo') as 'Entrada' | 'Saída'

    if (!nome || !tipo) {
      return { success: false, error: 'Preencha todos os campos obrigatórios' }
    }

    const { error } = await supabase.from('financeiro_categorias').update({
      nome,
      tipo
    }).eq('id', id)

    if (error) {
      return { success: false, error: 'Erro ao atualizar a categoria no banco de dados' }
    }

    revalidatePath('/admin/financeiro')
    revalidatePath('/admin/financeiro/categorias')
    
    return { success: true }
  } catch (err) {
    return handleError(err, 'Ocorreu um erro ao atualizar a categoria.')
  }
}

export async function toggleCategoriaAtivo(id: string, ativo: boolean): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await supabase.from('financeiro_categorias').update({
      ativo
    }).eq('id', id)

    if (error) {
      return { success: false, error: 'Erro ao alterar status da categoria no banco de dados' }
    }

    revalidatePath('/admin/financeiro')
    revalidatePath('/admin/financeiro/categorias')
    
    return { success: true }
  } catch (err) {
    return handleError(err, 'Ocorreu um erro ao alterar status da categoria.')
  }
}
