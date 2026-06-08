import { CalendarRange, FileText, Landmark, Users } from 'lucide-react'
import { redirect } from 'next/navigation'

import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Obter data formatada no servidor
  const hoje = new Date()
  const dataFormatada = hoje.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })

  return (
    <AdminPageWrapper>
      <AdminPageHeader titulo="Painel Gerencial" subtitulo={dataFormatada} />

      {/* Painel de Métricas (Placeholders) */}
      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Métrica 1: Filiados */}
        <div className="bg-brand-card border border-brand-border p-6 shadow-[4px_4px_0px_var(--brand-ink)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-brand-tinto/5 translate-x-4 -translate-y-4 rotate-45 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-2 mb-4 text-brand-tinto">
            <Users size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/60">Filiados Ativos</span>
          </div>
          <div className="font-serif font-black text-4xl text-brand-ink mb-2">142</div>
          <p className="text-xs text-brand-ink/70">+3 este mês</p>
        </div>

        {/* Métrica 2: Documentos */}
        <div className="bg-brand-card border border-brand-border p-6 shadow-[4px_4px_0px_var(--brand-ink)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-brand-tinto/5 translate-x-4 -translate-y-4 rotate-45 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-2 mb-4 text-brand-tinto">
            <FileText size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/60">Doc. Emitidos</span>
          </div>
          <div className="font-serif font-black text-4xl text-brand-ink mb-2">85</div>
          <p className="text-xs text-brand-ink/70">Neste ano</p>
        </div>

        {/* Métrica 3: Assembleias */}
        <div className="bg-brand-card border border-brand-border p-6 shadow-[4px_4px_0px_var(--brand-ink)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-brand-tinto/5 translate-x-4 -translate-y-4 rotate-45 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-2 mb-4 text-brand-tinto">
            <CalendarRange size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/60">Assembleias</span>
          </div>
          <div className="font-serif font-black text-4xl text-brand-ink mb-2">12</div>
          <p className="text-xs text-brand-ink/70">1 agendada</p>
        </div>

        {/* Métrica 4: Caixa */}
        <div className="bg-brand-card border border-brand-border p-6 shadow-[4px_4px_0px_var(--brand-ink)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-brand-tinto/5 translate-x-4 -translate-y-4 rotate-45 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-2 mb-4 text-brand-tinto">
            <Landmark size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/60">Saldo em Caixa</span>
          </div>
          <div className="font-serif font-black text-3xl text-brand-ink mb-2">R$ 14.500</div>
          <p className="text-xs text-brand-ink/70">Atualizado ontem</p>
        </div>

      </main>

      <div className="mt-8 bg-zinc-100 border border-brand-border p-12 flex items-center justify-center border-dashed">
        <p className="text-center text-brand-ink/50 text-sm font-serif italic">
          Gráficos e detalhamentos gerenciais serão adicionados aqui no futuro.
        </p>
      </div>

      {/* Informativo de Rodapé */}
      <footer className="mt-20 border-t border-dashed border-brand-border pt-6 text-[10px] text-brand-ink/60 uppercase tracking-widest text-center flex flex-col md:flex-row justify-between items-center gap-2">
        <span>Sistema Gestão SINASEFE Jataí • Versão 2.1 (Sidebar Edition)</span>
        <span>© 2026 Seção Sindical Jataí</span>
      </footer>
    </AdminPageWrapper>
  )
}
