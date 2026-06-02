'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ActionResponse, handleError } from '@/lib/action-utils'

export async function login(formData: FormData): Promise<ActionResponse> {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  try {
    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
      return { success: false, error: 'Usuário ou senha incorretos' }
    }
  } catch (err) {
    return handleError(err, 'Erro inesperado na autenticação')
  }

  revalidatePath('/', 'layout')
  redirect('/admin/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
