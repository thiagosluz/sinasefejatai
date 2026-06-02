'use server'

import { revalidatePath } from 'next/cache'

import { ActionResponse, handleError } from '@/lib/action-utils'
import { createClient } from '@/lib/supabase/server'

export async function addLocal(formData: FormData): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const nome_curto = formData.get('nome_curto') as string
    const texto_completo = formData.get('texto_completo') as string

    if (!nome_curto || !texto_completo) {
      return { success: false, error: 'Preencha todos os campos obrigatórios.' }
    }

    const { error } = await supabase
      .from('locais')
      .insert([{ nome_curto, texto_completo }])

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/locais')
    revalidatePath('/assembleias/nova')
    return { success: true }
  } catch (err) {
    return handleError(err, 'Falha ao adicionar local.')
  }
}

export async function updateLocal(id: string, formData: FormData): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const nome_curto = formData.get('nome_curto') as string
    const texto_completo = formData.get('texto_completo') as string

    if (!nome_curto || !texto_completo) {
      return { success: false, error: 'Preencha todos os campos obrigatórios.' }
    }

    const { error } = await supabase
      .from('locais')
      .update({ nome_curto, texto_completo })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/locais')
    revalidatePath('/assembleias/nova')
    return { success: true }
  } catch (err) {
    return handleError(err, 'Falha ao atualizar local.')
  }
}

export async function deleteLocal(id: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('locais')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/locais')
    revalidatePath('/assembleias/nova')
    return { success: true }
  } catch (err) {
    return handleError(err, 'Falha ao deletar local.')
  }
}
