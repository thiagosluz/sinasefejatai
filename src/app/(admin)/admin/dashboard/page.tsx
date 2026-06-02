import { CalendarRange, Landmark, LogOut, MapPin, Sliders, Users, UsersRound } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { logout } from '@/app/login/actions'
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
      <AdminPageHeader titulo="SINASEFE Jataí" subtitulo={dataFormatada}>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-ink/60 block">Operador Autenticado</span>
            <span className="text-xs font-semibold text-brand-ink">{user.email}</span>
          </div>
          <form action={logout}>
            <button className="px-3.5 py-2 border border-brand-ink bg-brand-cream hover:bg-brand-card transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 active:scale-98 shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[1px_1px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer">
              <LogOut size={13} />
              <span>Sair</span>
            </button>
          </form>
        </div>
      </AdminPageHeader>

      {/* Painel em Formato de Mural de Avisos da Seção */}
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Bloco 1: Filiados */}
        <div className="bg-brand-card border border-brand-border p-6 flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-tinto/5 translate-x-8 -translate-y-8 rotate-45 transition-transform group-hover:scale-110"></div>
          <div>
            <div className="flex items-center gap-2 mb-4 text-brand-tinto">
              <Users size={20} />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-ink/60">Módulo Administrativo</span>
            </div>
            <h2 className="font-serif font-bold text-xl mb-2 text-brand-ink">Base de Filiados</h2>
            <p className="text-brand-ink/80 text-xs leading-relaxed mb-6">
              Gerencie fichas cadastrais, status de filiação, cargos e busca dinâmica por SIAPE ou nome dos servidores.
            </p>
          </div>
          <a 
            href="/admin/filiados" 
            className="inline-flex items-center justify-between border border-brand-ink bg-brand-cream hover:bg-brand-card py-2.5 px-4 text-xs font-bold uppercase tracking-wider transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[1px_1px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px]"
          >
            <span>Gerenciar Servidores</span>
            <span>&rarr;</span>
          </a>
        </div>
        
        {/* Bloco 2: Diretoria */}
        <div className="bg-brand-card border border-brand-border p-6 flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-tinto/5 translate-x-8 -translate-y-8 rotate-45 transition-transform group-hover:scale-110"></div>
          <div>
            <div className="flex items-center gap-2 mb-4 text-brand-tinto">
              <UsersRound size={20} />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-ink/60">Módulo Institucional</span>
            </div>
            <h2 className="font-serif font-bold text-xl mb-2 text-brand-ink">Diretoria & Gestões</h2>
            <p className="text-brand-ink/80 text-xs leading-relaxed mb-6">
              Gerencie a atual direção, registre histórico de mandatos e mantenha o acervo público.
            </p>
          </div>
          <Link 
            href="/admin/diretoria" 
            className="inline-flex items-center justify-between border border-brand-ink bg-brand-cream hover:bg-brand-card py-2.5 px-4 text-xs font-bold uppercase tracking-wider transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[1px_1px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px]"
          >
            <span>Gestões e Membros</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* Bloco 3: Assembleias e Atas */}
        <div className="bg-brand-card border border-brand-border p-6 flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-tinto/5 translate-x-8 -translate-y-8 rotate-45 transition-transform group-hover:scale-110"></div>
          <div>
            <div className="flex items-center gap-2 mb-4 text-brand-tinto">
              <CalendarRange size={20} />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-ink/60">Módulo Documental</span>
            </div>
            <h2 className="font-serif font-bold text-xl mb-2 text-brand-ink">Assembleias & Documentos</h2>
            <p className="text-brand-ink/80 text-xs leading-relaxed mb-6">
              Agende assembleias, publique editais formais, emita listas de presença timbradas e redija atas em tempo real.
            </p>
          </div>
          <a 
            href="/admin/assembleias" 
            className="inline-flex items-center justify-between border border-brand-ink bg-brand-cream hover:bg-brand-card py-2.5 px-4 text-xs font-bold uppercase tracking-wider transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[1px_1px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px]"
          >
            <span>Atos e Editais</span>
            <span>&rarr;</span>
          </a>
        </div>

        {/* Bloco 3: Financeiro */}
        <div className="bg-brand-card border border-brand-border p-6 flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-tinto/5 translate-x-8 -translate-y-8 rotate-45 transition-transform group-hover:scale-110"></div>
          <div>
            <div className="flex items-center gap-2 mb-4 text-brand-tinto">
              <Landmark size={20} />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-ink/60">Módulo Financeiro</span>
            </div>
            <h2 className="font-serif font-bold text-xl mb-2 text-brand-ink">Caixa & Auditoria</h2>
            <p className="text-brand-ink/80 text-xs leading-relaxed mb-6">
              Monitore o fluxo de caixa, envie recibos físicos, audite transações e emita relatórios mensais para o Conselho Fiscal.
            </p>
          </div>
          <a 
            href="/admin/financeiro" 
            className="inline-flex items-center justify-between border border-brand-ink bg-brand-cream hover:bg-brand-card py-2.5 px-4 text-xs font-bold uppercase tracking-wider transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[1px_1px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px]"
          >
            <span>Livro Caixa</span>
            <span>&rarr;</span>
          </a>
        </div>

        {/* Bloco 4: Configurações de Layout */}
        <div className="bg-brand-card border border-brand-border p-6 flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-tinto/5 translate-x-8 -translate-y-8 rotate-45 transition-transform group-hover:scale-110"></div>
          <div>
            <div className="flex items-center gap-2 mb-4 text-brand-tinto">
              <Sliders size={20} />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-ink/60">Identidade Visual</span>
            </div>
            <h2 className="font-serif font-bold text-xl mb-2 text-brand-ink">Cabeçalhos & Timbre</h2>
            <p className="text-brand-ink/80 text-xs leading-relaxed mb-6">
              Configure as informações oficiais impressas e altere o logotipo oficial dos editais, atas e relatórios financeiros da seção.
            </p>
          </div>
          <a 
            href="/admin/configuracoes" 
            className="inline-flex items-center justify-between border border-brand-ink bg-brand-cream hover:bg-brand-card py-2.5 px-4 text-xs font-bold uppercase tracking-wider transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[1px_1px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px] mb-2"
          >
            <span>Ajustar Documentos</span>
            <span>&rarr;</span>
          </a>
        </div>
        
        {/* Bloco 5: Locais de Reunião */}
        <div className="bg-brand-card border border-brand-border p-6 flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-tinto/5 translate-x-8 -translate-y-8 rotate-45 transition-transform group-hover:scale-110"></div>
          <div>
            <div className="flex items-center gap-2 mb-4 text-brand-tinto">
              <MapPin size={20} />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-ink/60">Infraestrutura</span>
            </div>
            <h2 className="font-serif font-bold text-xl mb-2 text-brand-ink">Locais de Reunião</h2>
            <p className="text-brand-ink/80 text-xs leading-relaxed mb-6">
              Gerencie os locais padronizados para atas, assembleias e reuniões gerais do sindicato.
            </p>
          </div>
          <a 
            href="/admin/locais" 
            className="inline-flex items-center justify-between border border-brand-ink bg-brand-cream hover:bg-brand-card py-2.5 px-4 text-xs font-bold uppercase tracking-wider transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[1px_1px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px]"
          >
            <span>Gerenciar Locais</span>
            <span>&rarr;</span>
          </a>
        </div>
      </main>

      {/* Informativo de Rodapé */}
      <footer className="mt-20 border-t border-dashed border-brand-border pt-6 text-[10px] text-brand-ink/60 uppercase tracking-widest text-center flex flex-col md:flex-row justify-between items-center gap-2">
        <span>Sistema Gestão SINASEFE Jataí • Versão 2.0 (Retro-Editorial Edition)</span>
        <span>© 2026 Seção Sindical Jataí</span>
      </footer>
    </AdminPageWrapper>
  )
}
