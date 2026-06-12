import { redirect } from 'next/navigation'

import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'
import { createClient } from '@/lib/supabase/server'

import FinanceiroCliente from './financeiro-cliente'

interface FinanceiroPageProps {
  searchParams: Promise<{
    success?: string
    error?: string
  }>
}

export default async function FinanceiroPage({ searchParams }: FinanceiroPageProps) {
  const supabase = await createClient()

  // Validar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Buscar lançamentos financeiros ordenados por data decrescente
  const { data: transacoes } = await supabase
    .from('financeiro')
    .select('*')
    .order('data', { ascending: false })
    .order('created_at', { ascending: false })

  // Buscar meses aprovados para travar a interface
  const { data: mesesAprovadosData } = await supabase
    .from('financeiro_prestacoes_mensais')
    .select('mes_ano')
    .eq('status', 'APROVADO')
  
  const mesesAprovados = mesesAprovadosData?.map(m => m.mes_ano) || []

  const resolvedSearchParams = await searchParams

  return (
    <AdminPageWrapper>
      <AdminPageHeader titulo="Livro Caixa" subtitulo="Controle do Fluxo Financeiro, Lançamentos e Comprovantes" />

      {resolvedSearchParams.success && (
        <div className="bg-brand-cream border-2 border-dashed border-brand-olive text-brand-olive px-4 py-3.5 text-xs font-bold uppercase tracking-wider mb-6">
          {resolvedSearchParams.success}
        </div>
      )}

      {resolvedSearchParams.error && (
        <div className="bg-brand-cream border-2 border-dashed border-brand-tinto text-brand-tinto px-4 py-3.5 text-xs font-bold uppercase tracking-wider mb-6">
          {resolvedSearchParams.error}
        </div>
      )}

      <FinanceiroCliente transacoesIniciais={transacoes || []} mesesAprovados={mesesAprovados} />
    </AdminPageWrapper>
  )
}
