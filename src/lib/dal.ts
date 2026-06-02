import { createClient } from '@/lib/supabase/server'

import 'server-only'

/**
 * Verifica a sessão atual do usuário sem lançar exceções de bloqueio.
 * Útil para Server Components que desejam adaptar a UI baseada no login.
 */
export async function verifySession() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

/**
 * Barreira de segurança para Server Actions e Mutators.
 * Garante que a requisição partiu de um usuário validado.
 * Se falhar, lança erro (que deve ser capturado via ActionResponse/handleError).
 */
export async function requireAdmin() {
  const user = await verifySession()

  if (!user) {
    throw new Error('Acesso negado: Você não tem permissão ou sua sessão expirou.')
  }

  return user
}
