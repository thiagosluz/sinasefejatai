import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PrestacaoCliente from './prestacao-cliente'

export default async function PrestacaoPage() {
  const supabase = await createClient()

  // Validar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Buscar todas as transações para processamento e filtragem no lado do cliente
  const { data: transacoes } = await supabase
    .from('financeiro')
    .select('*')
    .order('data', { ascending: true })

  return (
    <PrestacaoCliente transacoes={transacoes || []} />
  )
}
