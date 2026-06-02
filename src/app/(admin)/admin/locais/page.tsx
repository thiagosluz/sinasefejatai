import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import LocaisCliente from './locais-cliente'

export const dynamic = 'force-dynamic'

export default async function LocaisPage() {
  const supabase = await createClient()

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Buscar locais
  const { data: locais } = await supabase
    .from('locais')
    .select('*')
    .order('created_at', { ascending: false })

  return <LocaisCliente locais={locais || []} />
}
