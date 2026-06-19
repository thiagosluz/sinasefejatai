'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const nome = formData.get('nome') as string
  const email = formData.get('email') as string

  if (!nome || !email) {
    return { success: false, error: 'Nome e email são obrigatórios.' }
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Usuário não autenticado.' }
  }

  const updatePayload: { data: { full_name: string }; email?: string } = {
    data: { full_name: nome }
  }

  // Só atualizar email se for diferente
  if (user.email !== email) {
    updatePayload.email = email
  }

  const { error } = await supabase.auth.updateUser(updatePayload)

  if (error) {
    return { success: false, error: error.message }
  }

  // Também atualizar a tabela `perfis` com o nome
  await supabase.from('perfis').update({ nome }).eq('id', user.id)

  revalidatePath('/', 'layout')
  
  if (user.email !== email) {
    return { success: true, message: 'Perfil atualizado. Verifique seu email antigo e o novo para confirmar a alteração do endereço.' }
  }

  return { success: true, message: 'Perfil atualizado com sucesso.' }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || password.length < 6) {
    return { success: false, error: 'A senha deve ter pelo menos 6 caracteres.' }
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'As senhas não coincidem.' }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, message: 'Senha atualizada com sucesso.' }
}

export async function getMfaStatus() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { enrolled: false }

  const { data, error } = await supabase.auth.mfa.listFactors()
  
  if (error) {
    return { enrolled: false, error: error.message }
  }

  const totpFactor = data.totp.find(f => f.status === 'verified')
  
  return {
    enrolled: !!totpFactor,
    factorId: totpFactor?.id
  }
}

export async function enrollMfa() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    issuer: 'SINASEFE JATAÍ'
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { 
    success: true, 
    factorId: data.id, 
    qrCode: data.totp.qr_code, 
    secret: data.totp.secret 
  }
}

export async function verifyMfa(factorId: string, code: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.mfa.challenge({ factorId })
  
  if (error) {
    return { success: false, error: error.message }
  }

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: data.id,
    code
  })

  if (verifyError) {
    return { success: false, error: 'Código inválido. Tente novamente.' }
  }

  revalidatePath('/admin/perfil')
  return { success: true, message: 'Autenticação de Dois Fatores ativada com sucesso!' }
}

export async function unenrollMfa(factorId: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.mfa.unenroll({ factorId })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/perfil')
  return { success: true, message: 'Autenticação de Dois Fatores desativada.' }
}

// Para a Foto de Perfil
export async function updateAvatar(url: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    data: { avatar_url: url }
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
