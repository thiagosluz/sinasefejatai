'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { ActionResponse, handleError } from '@/lib/action-utils'
import { logAudit } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData): Promise<ActionResponse & { requiresMfa?: boolean }> {
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
    
    // Check MFA
    const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    
    // Bypass MFA for E2E testing automation
    if (mfaData?.nextLevel === 'aal2' && process.env.IS_PLAYWRIGHT !== 'true') {
      return { success: true, requiresMfa: true }
    }

    logAudit('LOGIN_SUCCESS', 'auth', { email: data.email })
  } catch (err) {
    return handleError(err, 'Erro inesperado na autenticação')
  }

  revalidatePath('/', 'layout')
  redirect('/admin/dashboard')
}

export async function verifyLoginMfa(code: string): Promise<ActionResponse> {
  const supabase = await createClient()
  
  try {
    const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors()
    
    if (factorsError || !factorsData) {
      return { success: false, error: 'Erro ao carregar fatores de autenticação.' }
    }

    const totpFactor = factorsData.totp.find(f => f.status === 'verified')
    
    if (!totpFactor) {
      return { success: false, error: 'Autenticador 2FA não encontrado.' }
    }

    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: totpFactor.id })
    
    if (challengeError) {
      return { success: false, error: 'Erro ao gerar desafio de autenticação.' }
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: totpFactor.id,
      challengeId: challengeData.id,
      code
    })

    if (verifyError) {
      return { success: false, error: 'Código inválido. Tente novamente.' }
    }

    const { data: { user } } = await supabase.auth.getUser()
    logAudit('LOGIN_SUCCESS', 'auth', { email: user?.email, mfa: true })
    
  } catch (err) {
    return handleError(err, 'Erro ao verificar o código MFA')
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
