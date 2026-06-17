import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

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
  const { data: transacoesData } = await supabase
    .from('financeiro')
    .select(`
      *,
      financeiro_categorias ( nome )
    `)
    .order('data', { ascending: true })

  const transacoes = transacoesData?.map(t => ({
    ...t,
    categoria: (t.financeiro_categorias as { nome: string } | null)?.nome || 'Sem Categoria'
  })) || []

  // Buscar status das prestacoes mensais
  const { data: prestacoesMensais } = await supabase
    .from('financeiro_prestacoes_mensais')
    .select('*')

  // Buscar configurações de cabeçalho
  const { data: config } = await supabase
    .from('configuracoes')
    .select('*')
    .eq('id', 1)
    .single()

  return (
    <PrestacaoCliente 
      transacoes={transacoes || []} 
      config={config} 
      prestacoesMensais={prestacoesMensais || []} 
    />
  )
}
