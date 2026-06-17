import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import { CategoriasCliente } from './categorias-cliente'

export default async function CategoriasFinanceiroPage() {
  const supabase = await createClient()

  // Validar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Buscar todas as categorias (ativas e inativas)
  const { data: categoriasData } = await supabase
    .from('financeiro_categorias')
    .select('*')
    .order('nome')

  const categorias = categoriasData || []

  return (
    <div className="min-h-screen bg-brand-cream text-brand-ink p-6 md:p-8 font-sans selection:bg-brand-tinto selection:text-white">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between mb-8 border-b-2 border-brand-ink pb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-tinto tracking-tight">Categorias Financeiras</h1>
          <p className="text-zinc-600 text-xs mt-1 uppercase tracking-wider">Gerencie as categorias de entradas e saídas</p>
        </div>
      </header>

      <CategoriasCliente categorias={categorias} />
    </div>
  )
}
