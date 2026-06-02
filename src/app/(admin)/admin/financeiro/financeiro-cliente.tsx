'use client'

import { useCallback,useMemo, useState } from 'react'
import { Filter, PlusCircle, Printer, Search, Upload } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

import { useModal } from '@/providers/modal-provider'

import { FinanceiroFormDrawer } from './components/financeiro-form-drawer'
import { FinanceiroStats } from './components/financeiro-stats'
import { FinanceiroTable } from './components/financeiro-table'
import { deleteTransacao } from './actions'
import { Transacao } from './types'

interface FinanceiroClienteProps {
  transacoesIniciais: Transacao[]
}

export default function FinanceiroCliente({ transacoesIniciais }: FinanceiroClienteProps) {
  const { confirm } = useModal()
  
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const busca = searchParams.get('busca') || ''
  const filtroTipo = (searchParams.get('tipo') || 'Todos') as 'Todos' | 'Entrada' | 'Saída'
  const filtroMesAno = searchParams.get('mes') || ''

  const [drawerAberto, setDrawerAberto] = useState(false)
  const [transacaoEmEdicao, setTransacaoEmEdicao] = useState<Transacao | null>(null)

  const updateQueryParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'Todos') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [searchParams, router, pathname])

  const abrirNovoLancamento = useCallback(() => {
    setTransacaoEmEdicao(null)
    setDrawerAberto(true)
  }, [])

  const abrirEdicaoLancamento = useCallback((t: Transacao) => {
    setTransacaoEmEdicao(t)
    setDrawerAberto(true)
  }, [])

  // Filtragem local reativa
  const transacoesFiltradas = useMemo(() => {
    return transacoesIniciais.filter(t => {
      const bateBusca = t.descricao.toLowerCase().includes(busca.toLowerCase()) || 
                        t.categoria.toLowerCase().includes(busca.toLowerCase())
      const bateTipo = filtroTipo === 'Todos' || t.tipo === filtroTipo
      
      let bateMesAno = true
      if (filtroMesAno) {
        const [ano, mes] = filtroMesAno.split('-')
        const transacaoData = new Date(t.data + 'T12:00:00')
        const transacaoAno = transacaoData.getFullYear().toString()
        const transacaoMes = (transacaoData.getMonth() + 1).toString().padStart(2, '0')
        bateMesAno = transacaoAno === ano && transacaoMes === mes
      }

      return bateBusca && bateTipo && bateMesAno
    })
  }, [transacoesIniciais, busca, filtroTipo, filtroMesAno])

  // Consolidação de saldos baseada no filtro/busca ativa
  const { totalEntradas, totalSaidas, saldoTotal } = useMemo(() => {
    const entradas = transacoesFiltradas
      .filter(t => t.tipo === 'Entrada')
      .reduce((sum, t) => sum + Number(t.valor), 0)

    const saidas = transacoesFiltradas
      .filter(t => t.tipo === 'Saída')
      .reduce((sum, t) => sum + Number(t.valor), 0)

    return {
      totalEntradas: entradas,
      totalSaidas: saidas,
      saldoTotal: entradas - saidas
    }
  }, [transacoesFiltradas])

  const handleDelete = useCallback(async (id: string) => {
    if (await confirm('Deseja realmente excluir este lançamento permanentemente do livro caixa? Esta ação removerá também o comprovante físico se houver.')) {
      const result = await deleteTransacao(id)
      if (!result.success) {
        toast.error(result.error)
      } else {
        toast.success('Lançamento removido com sucesso!')
      }
    }
  }, [confirm])

  // Obter a lista única de meses que contêm transações para popular o seletor de filtros
  const mesesDisponiveis = useMemo(() => {
    const meses = transacoesIniciais.map(t => {
      const d = new Date(t.data + 'T12:00:00')
      const ano = d.getFullYear()
      const mes = (d.getMonth() + 1).toString().padStart(2, '0')
      return { value: `${ano}-${mes}`, label: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) }
    })
    
    const unicos: Record<string, string> = {}
    meses.forEach(m => { unicos[m.value] = m.label })
    
    return Object.entries(unicos).map(([value, label]) => ({ value, label }))
  }, [transacoesIniciais])

  return (
    <div className="relative min-h-screen text-brand-ink">
      
      {/* Grid de Estatísticas extraído para componente */}
      <FinanceiroStats 
        totalEntradas={totalEntradas} 
        totalSaidas={totalSaidas} 
        saldoTotal={saldoTotal} 
      />

      {/* Barra de Ações e Filtros */}
      <div className="bg-brand-card border border-brand-border p-6 mb-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filtros Reativos */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[200px] md:max-w-xs w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-ink/50" />
            <input 
              type="text" 
              placeholder="Buscar lançamento ou categoria..." 
              value={busca}
              onChange={(e) => updateQueryParam('busca', e.target.value)}
              className="w-full bg-brand-cream border border-brand-border rounded-none pl-9 pr-4 py-2 text-xs text-brand-ink focus:outline-none focus:border-brand-tinto focus:ring-1 focus:ring-brand-tinto"
            />
          </div>

          <div className="flex items-center gap-1 border border-brand-border bg-brand-cream p-1 text-[11px] font-bold uppercase tracking-wider">
            {(['Todos', 'Entrada', 'Saída'] as const).map(t => (
              <button
                key={t}
                onClick={() => updateQueryParam('tipo', t)}
                className={`px-3 py-1 transition-colors cursor-pointer ${
                  filtroTipo === t 
                    ? 'bg-brand-card text-brand-ink border border-brand-border font-extrabold shadow-inner' 
                    : 'text-brand-ink/60 hover:text-brand-ink'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="relative">
            <select 
              value={filtroMesAno}
              onChange={(e) => updateQueryParam('mes', e.target.value)}
              className="bg-brand-cream border border-brand-border text-brand-ink text-xs px-3 py-2 focus:outline-none focus:border-brand-tinto pr-8 cursor-pointer rounded-none font-semibold appearance-none"
            >
              <option value="">Todos os meses</option>
              {mesesDisponiveis.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-ink/50 pointer-events-none" />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-3">
          <Link 
            href={`/admin/financeiro/prestacao${filtroMesAno ? `?mes=${filtroMesAno}` : ''}`} 
            className="border border-brand-ink hover:border-brand-ink bg-brand-cream hover:bg-brand-card text-brand-ink py-2.5 px-4 text-xs font-serif font-bold uppercase tracking-wider transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[1px_1px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px]"
          >
            <Printer size={15} className="inline mr-1.5" />
            <span>Emitir Prestação</span>
          </Link>

          <Link 
            href="/admin/financeiro/importar" 
            className="border border-brand-ink hover:border-brand-ink bg-brand-cream hover:bg-brand-card text-brand-ink py-2.5 px-4 text-xs font-serif font-bold uppercase tracking-wider transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[1px_1px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px] flex items-center gap-1.5"
          >
            <Upload size={15} />
            <span>Importar Extrato</span>
          </Link>
          
          <button 
            onClick={abrirNovoLancamento}
            data-testid="btn-lancar-movimento"
            className="bg-brand-tinto hover:bg-brand-tinto-light text-white py-2.5 px-4 text-xs font-serif font-bold uppercase tracking-wider transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[1px_1px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px] flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle size={15} />
            <span>Lançar Movimento</span>
          </button>
        </div>
      </div>

      {/* Tabela extraída para componente */}
      <FinanceiroTable 
        transacoes={transacoesFiltradas} 
        onEdit={abrirEdicaoLancamento} 
        onDelete={handleDelete} 
      />

      {/* Gaveta Lateral (Drawer) extraída para componente */}
      <FinanceiroFormDrawer 
        key={drawerAberto ? (transacaoEmEdicao?.id || 'novo') : 'fechado'}
        aberto={drawerAberto} 
        onClose={() => setDrawerAberto(false)} 
        transacaoEmEdicao={transacaoEmEdicao} 
      />
    </div>
  )
}
