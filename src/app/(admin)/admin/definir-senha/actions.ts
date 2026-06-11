'use server'

import { createClient } from '@/lib/supabase/server'

export async function definirSenha(formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || password.length < 6) {
    return { success: false, error: 'A senha deve ter pelo menos 6 caracteres.' }
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'As senhas não conferem.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { success: false, error: `Erro ao definir senha: ${error.message}` }
  }

  return { success: true }
}
