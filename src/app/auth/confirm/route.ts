import { type EmailOtpType } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/admin/dashboard'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      // Remover parâmetros sensíveis da URL
      const url = request.nextUrl.clone()
      url.pathname = next
      url.searchParams.delete('token_hash')
      url.searchParams.delete('type')
      url.searchParams.delete('next')
      return NextResponse.redirect(url)
    }
  }

  // Em caso de erro, redireciona para a home ou página de erro
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  url.searchParams.set('error', 'Token de convite inválido ou expirado')
  return NextResponse.redirect(url)
}
