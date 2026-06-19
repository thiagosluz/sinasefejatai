import { createClient } from '@/lib/supabase/server'
import { LoginForm } from './login-form'

async function getConfiguracoes() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('configuracoes')
    .select('cnpj')
    .eq('id', 1)
    .single()
  return data
}

export default async function LoginPage() {
  const config = await getConfiguracoes()

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream p-4 font-sans text-brand-ink selection:bg-brand-tinto selection:text-white">
      {/* Container: Estilo Ficha Administrativa de Época */}
      <div className="w-full max-w-md bg-[#faf8f5] border-4 border-double border-brand-tinto p-1.5 shadow-2xl">
        <div className="border border-zinc-300 p-8 space-y-6">

          {/* Cabeçalho Editorial */}
          <div className="text-center space-y-2 pb-6 border-b border-dashed border-zinc-300">
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Seção Sindical Jataí</div>
            <h1 className="text-3xl font-serif font-bold text-brand-tinto tracking-tight">SINASEFE</h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600 mt-1">
              Acesso Administrativo
            </p>
          </div>

          <LoginForm />

          {/* Rodapé Arquivístico */}
          <div className="text-[10px] text-center text-zinc-450 uppercase tracking-widest pt-4 border-t border-dashed border-zinc-300">
            Registro Oficial • {config?.cnpj || '03.658.820/0001-18'}
          </div>
        </div>
      </div>
    </div>
  )
}
