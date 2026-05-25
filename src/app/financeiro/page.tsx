import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
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

  const resolvedSearchParams = await searchParams

  return (
    <div className="min-h-screen bg-brand-cream text-brand-ink p-6 md:p-8 font-sans selection:bg-brand-tinto selection:text-white">
      {/* Cabeçalho */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b-2 border-brand-ink pb-6 gap-4">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-serif font-bold text-brand-tinto tracking-tight">Livro Caixa</h1>
          </div>
          <p className="text-zinc-600 text-xs mt-1 uppercase tracking-wider">Controle do Fluxo Financeiro, Lançamentos e Comprovantes</p>
        </div>
      </header>

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

      <FinanceiroCliente transacoesIniciais={transacoes || []} />
    </div>
  )
}
