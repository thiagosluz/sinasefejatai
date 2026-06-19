import { CalendarRange, FileText, FileWarning, Users } from 'lucide-react'
import { redirect } from 'next/navigation'

import { DemographicsCharts } from '@/components/dashboard/demographics-charts'
import { FinancialBarChart } from '@/components/dashboard/financial-bar-chart'
import { FinancialLineChart } from '@/components/dashboard/financial-line-chart'
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

  // Datas base para filtros
  const hoje = new Date()
  const dataFormatada = hoje.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })

  const startOfMonth = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString()
  const startOfYear = new Date(hoje.getFullYear(), 0, 1).toISOString()
  const sixMonthsAgo = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1).toISOString()

  // Queries (paralelas para performance)
  const [
    { count: filiadosAtivos },
    { count: filiadosMes },
    { count: docsTotal },
    { count: docsAno },
    { count: assembleiasTotal },
    { count: assembleiasAgendadas },
    { count: prestacoesPendentes },
    { data: filiadosList },
    { data: financeiroList }
  ] = await Promise.all([
    // Métricas dos Cards
    supabase.from('filiados').select('id', { count: 'exact', head: true }).eq('ativo', true).eq('status_filiacao', 'aprovado'),
    supabase.from('filiados').select('id', { count: 'exact', head: true }).eq('ativo', true).eq('status_filiacao', 'aprovado').gte('created_at', startOfMonth),
    supabase.from('documentos_administrativos').select('id', { count: 'exact', head: true }).eq('status', 'ativo'),
    supabase.from('documentos_administrativos').select('id', { count: 'exact', head: true }).eq('status', 'ativo').gte('created_at', startOfYear),
    supabase.from('assembleias').select('id', { count: 'exact', head: true }),
    supabase.from('assembleias').select('id', { count: 'exact', head: true }).eq('status', 'Agendada'),
    supabase.from('financeiro_prestacoes_mensais').select('id', { count: 'exact', head: true }).neq('status', 'APROVADO'),
    // Dados para Gráficos: Filiados
    supabase.from('filiados').select('categoria, situacao').eq('ativo', true).eq('status_filiacao', 'aprovado'),
    // Dados para Gráficos: Financeiro (Últimos 6 meses)
    supabase.from('financeiro').select('tipo, valor, data, financeiro_categorias(nome)').gte('data', sixMonthsAgo)
  ])

  // ==========================================
  // PROCESSAMENTO: GRÁFICOS DEMOGRÁFICOS
  // ==========================================
  const catMap: Record<string, number> = {}
  const sitMap: Record<string, number> = {}

  filiadosList?.forEach((f) => {
    const c = f.categoria || 'Não informada'
    const s = f.situacao || 'Não informada'
    catMap[c] = (catMap[c] || 0) + 1
    sitMap[s] = (sitMap[s] || 0) + 1
  })

  const categoriasData = Object.entries(catMap).map(([name, value]) => ({ name, value }))
  const situacoesData = Object.entries(sitMap).map(([name, value]) => ({ name, value }))

  // ==========================================
  // PROCESSAMENTO: GRÁFICOS FINANCEIROS
  // ==========================================
  const monthMap: Record<string, { mes: string, Entradas: number, Saidas: number, sortKey: string }> = {}
  
  // Inicializar os últimos 6 meses vazios
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    const label = d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()
    const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthMap[sortKey] = { mes: label, Entradas: 0, Saidas: 0, sortKey }
  }

  const currentMonthKey = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
  const despesasMesMap: Record<string, number> = {}

  financeiroList?.forEach((f) => {
    const dataObj = new Date(f.data)
    const sortKey = `${dataObj.getFullYear()}-${String(dataObj.getMonth() + 1).padStart(2, '0')}`
    
    // Gráfico de Linha (Evolução)
    if (monthMap[sortKey]) {
      if (f.tipo === 'Entrada') {
        monthMap[sortKey].Entradas += Number(f.valor)
      } else if (f.tipo === 'Saída') {
        monthMap[sortKey].Saidas += Number(f.valor)
      }
    }

    // Gráfico de Barras (Top 5 Despesas do Mês Atual)
    if (sortKey === currentMonthKey && f.tipo === 'Saída') {
      // @ts-expect-error - lidando com o join da categoria
      const catNome = f.financeiro_categorias?.nome || 'Sem Categoria'
      despesasMesMap[catNome] = (despesasMesMap[catNome] || 0) + Number(f.valor)
    }
  })

  const lineChartData = Object.values(monthMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey))
  
  const barChartData = Object.entries(despesasMesMap)
    .map(([categoria, valor]) => ({ categoria, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5) // Pega só o Top 5

  return (
    <AdminPageWrapper>
      <AdminPageHeader titulo="Painel Gerencial" subtitulo={dataFormatada} />

      {/* Painel de Métricas */}
      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Métrica 1: Filiados */}
        <div className="bg-brand-card border border-brand-border p-6 shadow-[4px_4px_0px_var(--brand-ink)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-brand-tinto/5 translate-x-4 -translate-y-4 rotate-45 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-2 mb-4 text-brand-tinto">
            <Users size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/60">Filiados Ativos</span>
          </div>
          <div className="font-serif font-black text-4xl text-brand-ink mb-2">{filiadosAtivos || 0}</div>
          <p className="text-xs text-brand-ink/70">+{filiadosMes || 0} este mês</p>
        </div>

        {/* Métrica 2: Documentos */}
        <div className="bg-brand-card border border-brand-border p-6 shadow-[4px_4px_0px_var(--brand-ink)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-brand-tinto/5 translate-x-4 -translate-y-4 rotate-45 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-2 mb-4 text-brand-tinto">
            <FileText size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/60">Doc. Emitidos</span>
          </div>
          <div className="font-serif font-black text-4xl text-brand-ink mb-2">{docsTotal || 0}</div>
          <p className="text-xs text-brand-ink/70">Neste ano: {docsAno || 0}</p>
        </div>

        {/* Métrica 3: Assembleias */}
        <div className="bg-brand-card border border-brand-border p-6 shadow-[4px_4px_0px_var(--brand-ink)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-brand-tinto/5 translate-x-4 -translate-y-4 rotate-45 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-2 mb-4 text-brand-tinto">
            <CalendarRange size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/60">Assembleias</span>
          </div>
          <div className="font-serif font-black text-4xl text-brand-ink mb-2">{assembleiasTotal || 0}</div>
          <p className="text-xs text-brand-ink/70">{assembleiasAgendadas || 0} agendada(s)</p>
        </div>

        {/* Métrica 4: Pareceres Pendentes */}
        <div className="bg-brand-card border border-brand-border p-6 shadow-[4px_4px_0px_var(--brand-ink)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-brand-tinto/5 translate-x-4 -translate-y-4 rotate-45 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-2 mb-4 text-brand-tinto">
            <FileWarning size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/60">Pareceres Pendentes</span>
          </div>
          <div className="font-serif font-black text-4xl text-brand-ink mb-2">{prestacoesPendentes || 0}</div>
          <p className="text-xs text-brand-ink/70">Aguardando Conselho Fiscal</p>
        </div>

      </main>

      {/* Seção de Gráficos */}
      <section className="mt-8 flex flex-col gap-6">
        
        {/* Linha Superior: Demografia */}
        <div className="bg-[#faf8f5] border border-zinc-300 p-6 shadow-sm">
          <DemographicsCharts categorias={categoriasData} situacoes={situacoesData} />
        </div>

        {/* Linha Inferior: Financeiro */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#faf8f5] border border-zinc-300 p-6 shadow-sm">
            <FinancialLineChart data={lineChartData} />
          </div>
          <div className="bg-[#faf8f5] border border-zinc-300 p-6 shadow-sm">
            <FinancialBarChart data={barChartData} />
          </div>
        </div>

      </section>

      {/* Informativo de Rodapé */}
      <footer className="mt-20 border-t border-dashed border-brand-border pt-6 text-[10px] text-brand-ink/60 uppercase tracking-widest text-center flex flex-col md:flex-row justify-between items-center gap-2">
        <span>Sistema Gestão SINASEFE JATAÍ • Versão 2.1 (Sidebar Edition)</span>
        <span>© 2026 Seção Sindical Jataí</span>
      </footer>
    </AdminPageWrapper>
  )
}
