'use client'

import { useState } from 'react'
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  PlusCircle, 
  Search, 
  Trash2, 
  FileText, 
  Filter,
  X,
  Printer
} from 'lucide-react'
import Link from 'next/link'
import { addTransacao, deleteTransacao } from './actions'

interface Transacao {
  id: string
  tipo: 'Entrada' | 'Saída'
  data: string
  descricao: string
  valor: number
  categoria: string
  comprovante_url: string | null
  created_at: string
}

interface FinanceiroClienteProps {
  transacoesIniciais: Transacao[]
}

const CATEGORIAS_ENTRADA = [
  'Repasse Nacional',
  'Contribuição de Filiados',
  'Rendimentos',
  'Saldo de Abertura',
  'Outros'
]

const CATEGORIAS_SAIDA = [
  'Despesas com Viagens',
  'Material de Consumo',
  'Eventos/Mobilizações',
  'Serviços de Terceiros',
  'Despesas Administrativas',
  'Tarifas Bancárias',
  'Outros'
]

export default function FinanceiroCliente({ transacoesIniciais }: FinanceiroClienteProps) {
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<'Todos' | 'Entrada' | 'Saída'>('Todos')
  const [filtroMesAno, setFiltroMesAno] = useState('')
  const [drawerAberto, setDrawerAberto] = useState(false)
  
  // Estados do formulário de novo lançamento
  const [formTipo, setFormTipo] = useState<'Saída' | 'Entrada'>('Saída')
  const [formCategoria, setFormCategoria] = useState(CATEGORIAS_SAIDA[0])
  const [salvando, setSalvando] = useState(false)

  // Mudar categorias automaticamente se o tipo mudar no formulário
  const handleFormTipoChange = (tipo: 'Entrada' | 'Saída') => {
    setFormTipo(tipo)
    setFormCategoria(tipo === 'Entrada' ? CATEGORIAS_ENTRADA[0] : CATEGORIAS_SAIDA[0])
  }

  // Filtragem local reativa
  const transacoesFiltradas = transacoesIniciais.filter(t => {
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

  // Consolidação de saldos baseada no filtro/busca ativa
  const totalEntradas = transacoesFiltradas
    .filter(t => t.tipo === 'Entrada')
    .reduce((sum, t) => sum + Number(t.valor), 0)

  const totalSaidas = transacoesFiltradas
    .filter(t => t.tipo === 'Saída')
    .reduce((sum, t) => sum + Number(t.valor), 0)

  const saldoTotal = totalEntradas - totalSaidas

  // Função para deletar movimentação
  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir este lançamento permanentemente do livro caixa? Esta ação removerá também o comprovante físico se houver.')) {
      try {
        await deleteTransacao(id)
      } catch (err) {
        const error = err as Error
        alert(error.message || 'Erro ao deletar transação')
      }
    }
  }

  // Obter a lista única de meses que contêm transações para popular o seletor de filtros
  const obterMesesDisponiveis = () => {
    const meses = transacoesIniciais.map(t => {
      const d = new Date(t.data + 'T12:00:00')
      const ano = d.getFullYear()
      const mes = (d.getMonth() + 1).toString().padStart(2, '0')
      return { value: `${ano}-${mes}`, label: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) }
    })
    
    const unicos: Record<string, string> = {}
    meses.forEach(m => { unicos[m.value] = m.label })
    
    return Object.entries(unicos).map(([value, label]) => ({ value, label }))
  }

  const mesesDisponiveis = obterMesesDisponiveis()

  return (
    <div className="relative min-h-screen text-brand-ink">
      
      {/* Grid de Estatísticas / Indicadores Geométricos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Card Entradas */}
        <div className="bg-brand-card border border-zinc-350 p-6 rounded-none flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs font-bold text-zinc-550 uppercase tracking-wider block mb-1">Total Entradas</span>
            <span className="text-2xl font-bold text-brand-olive">
              R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-brand-olive/10 border border-brand-olive/20 p-3 text-brand-olive">
            <ArrowUpRight size={24} />
          </div>
        </div>

        {/* Card Saídas */}
        <div className="bg-brand-card border border-zinc-350 p-6 rounded-none flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs font-bold text-zinc-550 uppercase tracking-wider block mb-1">Total Saídas</span>
            <span className="text-2xl font-bold text-brand-tinto">
              R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-brand-tinto/10 border border-brand-tinto/20 p-3 text-brand-tinto">
            <ArrowDownRight size={24} />
          </div>
        </div>

        {/* Card Saldo Consolidado */}
        <div className="bg-brand-card border border-zinc-350 p-6 rounded-none flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs font-bold text-zinc-550 uppercase tracking-wider block mb-1">Saldo Líquido</span>
            <span className={`text-2xl font-bold ${saldoTotal >= 0 ? 'text-brand-olive' : 'text-brand-tinto'}`}>
              R$ {saldoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className={`p-3 border ${
            saldoTotal >= 0 
              ? 'bg-brand-olive/10 border-brand-olive/20 text-brand-olive' 
              : 'bg-brand-tinto/10 border-brand-tinto/20 text-brand-tinto'
          }`}>
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      {/* Barra de Ações e Filtros */}
      <div className="bg-brand-card border border-zinc-350 p-6 mb-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filtros Reativos */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Campo de Busca */}
          <div className="relative min-w-[200px] md:max-w-xs w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Buscar lançamento ou categoria..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-brand-cream border border-zinc-350 rounded-none pl-9 pr-4 py-2 text-xs text-brand-ink focus:outline-none focus:border-brand-tinto focus:ring-1 focus:ring-brand-tinto"
            />
          </div>

          {/* Filtro por Tipo */}
          <div className="flex items-center gap-1 border border-zinc-355 bg-brand-cream p-1 text-[11px] font-bold uppercase tracking-wider">
            {(['Todos', 'Entrada', 'Saída'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFiltroTipo(t)}
                className={`px-3 py-1 transition-colors cursor-pointer ${
                  filtroTipo === t 
                    ? 'bg-brand-card text-brand-ink border border-zinc-300 font-extrabold shadow-inner' 
                    : 'text-zinc-500 hover:text-brand-ink'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Filtro por Mês/Ano */}
          <div className="relative">
            <select 
              value={filtroMesAno}
              onChange={(e) => setFiltroMesAno(e.target.value)}
              className="bg-brand-cream border border-zinc-350 text-brand-ink text-xs px-3 py-2 focus:outline-none focus:border-brand-tinto pr-8 cursor-pointer rounded-none font-semibold appearance-none"
            >
              <option value="">Todos os meses</option>
              {mesesDisponiveis.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-3">
          <Link 
            href="/financeiro/prestacao" 
            className="border border-brand-ink hover:border-zinc-700 bg-brand-cream hover:bg-brand-card text-zinc-800 py-2.5 px-4 text-xs font-serif font-bold uppercase tracking-wider transition-all shadow-[2px_2px_0px_#121214] hover:shadow-[1px_1px_0px_#121214] hover:translate-x-[1px] hover:translate-y-[1px]"
          >
            <Printer size={15} className="inline mr-1.5" />
            <span>Emitir Prestação</span>
          </Link>
          
          <button 
            onClick={() => setDrawerAberto(true)}
            className="bg-brand-tinto hover:bg-brand-tinto-light text-white py-2.5 px-4 text-xs font-serif font-bold uppercase tracking-wider transition-all shadow-[2px_2px_0px_#121214] hover:shadow-[1px_1px_0px_#121214] hover:translate-x-[1px] hover:translate-y-[1px] flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle size={15} />
            <span>Lançar Movimento</span>
          </button>
        </div>
      </div>

      {/* Tabela de Transações (Livro Caixa) */}
      <div className="bg-brand-card border border-zinc-350 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
            <thead className="bg-[#e9e6de] border-b border-zinc-350 text-zinc-650 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6 border-r border-zinc-350">Data</th>
                <th className="py-4 px-6 border-r border-zinc-350">Descrição / Histórico</th>
                <th className="py-4 px-6 border-r border-zinc-350">Categoria</th>
                <th className="py-4 px-6 border-r border-zinc-350 text-center">Fluxo</th>
                <th className="py-4 px-6 border-r border-zinc-350 text-right">Valor</th>
                <th className="py-4 px-6 border-r border-zinc-350 text-center">Recibo</th>
                <th className="py-4 px-6 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-300">
              {transacoesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-550 italic font-serif">
                    Nenhum lançamento contábil registrado para os filtros ativos.
                  </td>
                </tr>
              ) : (
                transacoesFiltradas.map((t) => (
                  <tr key={t.id} className="hover:bg-brand-cream/40 transition-colors">
                    <td className="py-4 px-6 font-semibold text-brand-ink border-r border-zinc-300">
                      {new Date(t.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-4 px-6 text-brand-ink border-r border-zinc-300 max-w-xs truncate" title={t.descricao}>
                      {t.descricao}
                    </td>
                    <td className="py-4 px-6 text-zinc-600 border-r border-zinc-300 text-xs font-bold uppercase tracking-wider">
                      {t.categoria}
                    </td>
                    <td className="py-4 px-6 text-center border-r border-zinc-300">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                        t.tipo === 'Entrada' 
                          ? 'bg-brand-olive/10 text-brand-olive border-brand-olive/30' 
                          : 'bg-brand-tinto/10 text-brand-tinto border-brand-tinto/30'
                      }`}>
                        {t.tipo === 'Entrada' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-brand-ink border-r border-zinc-300">
                      R$ {Number(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6 text-center border-r border-zinc-300">
                      {t.comprovante_url ? (
                        <a 
                          href={t.comprovante_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 border border-brand-tinto bg-brand-cream text-brand-tinto px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider hover:bg-brand-tinto hover:text-white transition-all shadow-[1px_1px_0px_#121214] hover:shadow-none"
                        >
                          <FileText size={11} />
                          <span>Ver Recibo</span>
                        </a>
                      ) : (
                        <span className="text-zinc-400 text-xs font-medium">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button 
                        onClick={() => handleDelete(t.id)}
                        className="p-1 hover:bg-zinc-200 text-zinc-500 hover:text-brand-tinto transition-colors cursor-pointer"
                        title="Excluir Lançamento"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gaveta Lateral Deslizante (Drawer) para Novo Lançamento */}
      {drawerAberto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end print:hidden">
          <div className="flex-1" onClick={() => setDrawerAberto(false)}></div>
          
          <div className="w-full max-w-md bg-brand-cream border-l-2 border-brand-ink p-6 flex flex-col justify-between shadow-2xl relative animate-slide-left">
            <div>
              {/* Cabeçalho */}
              <div className="flex items-center justify-between border-b-2 border-brand-ink pb-4 mb-6">
                <h3 className="text-lg font-serif font-bold text-brand-tinto">Lançar Movimentação</h3>
                <button 
                  onClick={() => setDrawerAberto(false)}
                  className="p-1 hover:bg-brand-card text-zinc-500 hover:text-brand-ink transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Formulário */}
              <form action={addTransacao} onSubmit={() => setSalvando(true)} className="space-y-4">
                {/* Tipo de Lançamento */}
                <div>
                  <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 font-serif">
                    Tipo de Fluxo Contábil
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleFormTipoChange('Saída')}
                      className={`py-3 text-center border font-bold text-xs tracking-wider uppercase transition-all cursor-pointer ${
                        formTipo === 'Saída'
                          ? 'border-brand-tinto bg-brand-tinto/10 text-brand-tinto shadow-inner'
                          : 'border-zinc-300 bg-brand-cream text-zinc-500 hover:text-brand-ink'
                      }`}
                    >
                      Saída (Despesa)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormTipoChange('Entrada')}
                      className={`py-3 text-center border font-bold text-xs tracking-wider uppercase transition-all cursor-pointer ${
                        formTipo === 'Entrada'
                          ? 'border-brand-olive bg-brand-olive/10 text-brand-olive shadow-inner'
                          : 'border-zinc-300 bg-brand-cream text-zinc-500 hover:text-brand-ink'
                      }`}
                    >
                      Entrada (Receita)
                    </button>
                  </div>
                  <input type="hidden" name="tipo" value={formTipo} />
                </div>

                {/* Data */}
                <div>
                  <label htmlFor="data" className="block text-xs font-bold text-zinc-550 uppercase tracking-wider mb-2 font-serif">
                    Data do Lançamento
                  </label>
                  <input 
                    id="data"
                    name="data"
                    type="date" 
                    defaultValue={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full bg-brand-card border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label htmlFor="descricao" className="block text-xs font-bold text-zinc-550 uppercase tracking-wider mb-2 font-serif">
                    Descrição / Histórico
                  </label>
                  <input 
                    id="descricao"
                    name="descricao"
                    type="text" 
                    placeholder="Ex: Aquisição de resmas de papel para assembleia"
                    required
                    className="w-full bg-brand-card border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
                  />
                </div>

                {/* Valor */}
                <div>
                  <label htmlFor="valor" className="block text-xs font-bold text-zinc-550 uppercase tracking-wider mb-2 font-serif">
                    Valor (R$)
                  </label>
                  <input 
                    id="valor"
                    name="valor"
                    type="text" 
                    placeholder="0,00"
                    required
                    className="w-full bg-brand-card border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto font-bold"
                  />
                </div>

                {/* Categoria Dinâmica */}
                <div>
                  <label htmlFor="categoria" className="block text-xs font-bold text-zinc-550 uppercase tracking-wider mb-2 font-serif">
                    Categoria
                  </label>
                  <select
                    id="categoria"
                    name="categoria"
                    value={formCategoria}
                    onChange={(e) => setFormCategoria(e.target.value)}
                    className="w-full bg-brand-card border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto cursor-pointer"
                  >
                    {formTipo === 'Entrada' 
                      ? CATEGORIAS_ENTRADA.map(c => <option key={c} value={c}>{c}</option>)
                      : CATEGORIAS_SAIDA.map(c => <option key={c} value={c}>{c}</option>)
                    }
                  </select>
                </div>

                {/* Arquivo de Comprovante */}
                <div>
                  <label htmlFor="comprovante" className="block text-xs font-bold text-zinc-550 uppercase tracking-wider mb-2 font-serif">
                    Comprovante / Recibo (Opcional)
                  </label>
                  <input 
                    id="comprovante"
                    name="comprovante"
                    type="file" 
                    accept=".pdf,image/png,image/jpeg"
                    className="w-full text-xs text-zinc-500 border border-zinc-350 bg-brand-card px-4 py-2.5 focus:outline-none focus:border-brand-tinto file:mr-4 file:py-1 file:px-2.5 file:border file:border-zinc-350 file:bg-brand-cream file:text-xs file:font-semibold file:text-brand-ink hover:file:bg-brand-card file:cursor-pointer cursor-pointer"
                  />
                  <span className="block text-[10px] text-zinc-500 mt-1">Formatos aceitos: PDF, PNG, JPEG. Limite de 5MB.</span>
                </div>

                {/* Botões do Rodapé */}
                <div className="pt-6 border-t border-dashed border-zinc-300 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setDrawerAberto(false)}
                    className="flex-1 border border-brand-ink hover:border-zinc-700 bg-brand-cream text-brand-ink py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={salvando}
                    className="flex-1 bg-brand-tinto hover:bg-brand-tinto-light text-white py-3 text-xs font-serif font-bold uppercase tracking-wider transition-all shadow-[2px_2px_0px_#121214]"
                  >
                    {salvando ? 'Salvando...' : 'Confirmar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
