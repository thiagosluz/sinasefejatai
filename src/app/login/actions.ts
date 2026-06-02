'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { ActionResponse, handleError } from '@/lib/action-utils'
import { logAudit } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData): Promise<ActionResponse> {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  try {
    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
      logAudit('LOGIN_FAILED', 'auth', { email: data.email }, 'warn')
      return { success: false, error: 'Usuário ou senha incorretos' }
    }
    
    logAudit('LOGIN_SUCCESS', 'auth', { email: data.email })
  } catch (err) {
    return handleError(err, 'Erro inesperado na autenticação')
  }

  revalidatePath('/', 'layout')
  redirect('/admin/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    logAudit('LOGOUT', 'auth', { email: user.email })
  }
  await supabase.auth.signOut()
  redirect('/login')
}
