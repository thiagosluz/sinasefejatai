import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import ImportadorCliente from './importador-cliente'

export default async function ImportarOFXPage() {
  const supabase = await createClient()

  // Validar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="min-h-screen bg-brand-cream text-brand-ink p-6 md:p-8 font-sans selection:bg-brand-tinto selection:text-white">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between mb-8 border-b-2 border-brand-ink pb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-tinto tracking-tight">Importador de Extrato Bancário</h1>
          <p className="text-zinc-600 text-xs mt-1 uppercase tracking-wider">Mapeamento, Conciliação e Prevenção de Duplicidades (OFX)</p>
        </div>
      </header>

      <ImportadorCliente />
    </div>
  )
}
