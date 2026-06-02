import { SupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

type ServerActionCallback<T> = (supabase: SupabaseClient) => Promise<T>

interface ActionOptions {
  errorMessage?: string
  redirectErrorPath?: string
  redirectSuccessPath?: string
  revalidatePaths?: string[]
}

/**
 * Utilitário central para rodar Server Actions, encapsulando boilerplate do Supabase e Error Handling
 */
export async function executeServerAction<T>(
  action: ServerActionCallback<T>,
  options?: ActionOptions
): Promise<T | void> {
  try {
    const supabase = await createClient()
    const result = await action(supabase)

    if (options?.revalidatePaths) {
      options.revalidatePaths.forEach(path => revalidatePath(path))
    }

    if (options?.redirectSuccessPath) {
      redirect(options.redirectSuccessPath)
    }

    return result

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error
    }

    console.error('Erro na Server Action:', error)
    
    if (options?.redirectErrorPath) {
      const msg = error instanceof Error ? error.message : options.errorMessage || 'Falha na operação'
      redirect(`${options.redirectErrorPath}?error=${msg}`)
    }
    
    throw error
  }
}