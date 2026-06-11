import { createClient } from '@supabase/supabase-js'

/**
 * Cria uma instância do cliente Supabase usando a SERVICE_ROLE_KEY.
 * CUIDADO: Este cliente ignora TODAS as regras de RLS (Row Level Security).
 * Deve ser usado apenas em Server Actions para tarefas administrativas seguras,
 * como gerenciamento de contas (auth.admin) e afins.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL ou Service Role Key não configurados no ambiente.')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
