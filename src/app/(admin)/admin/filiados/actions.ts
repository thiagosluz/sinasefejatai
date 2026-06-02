'use server'

import { revalidatePath } from 'next/cache'

import { ActionResponse, handleError } from '@/lib/action-utils'
import { requireAdmin } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'

export async function addFiliado(formData: FormData): Promise<ActionResponse> {
  const nome = formData.get('nome') as string
  const email = formData.get('email') as string
  const telefone = formData.get('telefone') as string
  const siape = formData.get('siape') as string
  const cargo = formData.get('cargo') as string

  if (!nome) {
    return { success: false, error: 'O nome é obrigatório' }
  }

  try {
    await requireAdmin()
    const supabase = await createClient()
    const { error } = await supabase.from('filiados').insert({
      nome,
      email: email || null,
      telefone: telefone || null,
      siape: siape || null,
      cargo: cargo || null,
    })

    if (error) {
      return { success: false, error: 'Falha ao cadastrar filiado no banco.' }
    }

    revalidatePath('/admin/filiados')
    return { success: true }
  } catch (err) {
    return handleError(err, 'Ocorreu um erro inesperado ao cadastrar.')
  }
}

export async function editFiliado(id: string, formData: FormData): Promise<ActionResponse> {
  const nome = formData.get('nome') as string
  const email = formData.get('email') as string
  const telefone = formData.get('telefone') as string
  const siape = formData.get('siape') as string
  const cargo = formData.get('cargo') as string
  const ativo = formData.get('ativo') === 'on'

  if (!nome) {
    return { success: false, error: 'O nome é obrigatório' }
  }

  try {
    await requireAdmin()
    const supabase = await createClient()
    const { error } = await supabase
      .from('filiados')
      .update({
        nome,
        email: email || null,
        telefone: telefone || null,
        siape: siape || null,
        cargo: cargo || null,
        ativo,
      })
      .eq('id', id)

    if (error) {
      return { success: false, error: 'Falha ao editar filiado no banco.' }
    }

    revalidatePath('/admin/filiados')
    return { success: true }
  } catch (err) {
    return handleError(err, 'Ocorreu um erro inesperado ao editar.')
  }
}

export async function toggleAtivo(id: string, currentStatus: boolean): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { error } = await supabase
      .from('filiados')
      .update({ ativo: !currentStatus })
      .eq('id', id)

    if (error) {
      return { success: false, error: 'Falha ao alterar status no banco.' }
    }

    revalidatePath('/admin/filiados')
    return { success: true }
  } catch (err) {
    return handleError(err, 'Falha ao alterar status')
  }
}
