'use client'

import { useState, useMemo } from 'react'
import { PlusCircle, Calendar, MapPin, Clock, Search, CheckCircle2, XCircle, Edit3, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { updateStatusAssembleia, deleteAssembleia } from './actions'
import { useModal } from '@/providers/modal-provider'

interface Assembleia {
  id: string
  numero: string | null
  tipo: string
  data_realizacao: string
  horario_1a_convocacao: string
  horario_2a_convocacao: string
  local: string
  status: string
  pautas: string[]
  versao_edital?: number
}

interface AssembleiasClienteProps {
  assembleiasIniciais: Assembleia[]
}

type TabType = 'Todas' | 'Agendada' | 'Rascunho' | 'Concluída' | 'Cancelada'

export default function AssembleiasCliente({ assembleiasIniciais }: AssembleiasClienteProps) {
  const { confirm, prompt, alert } = useModal()
  
  const [busca, setBusca] = useState('')
  const [abaAtiva, setAbaAtiva] = useState<TabType>('Todas')
  
  const anoAtual = new Date().getFullYear().toString()
  const [anoFiltro, setAnoFiltro] = useState<string>(anoAtual)
  const [mesFiltro, setMesFiltro] = useState<string>('Todos')

  // Extrair Anos Dinamicamente
  const anosDisponiveis = useMemo(() => {
    const anos = new Set(assembleiasIniciais.map(a => {
      // Ajuste para evitar fuso horário quebrando o ano: usamos substring da data ISO (yyyy-mm-dd)
      return a.data_realizacao.substring(0, 4)
    }))
    anos.add(anoAtual) // Garante que o ano atual sempre apareça
    return Array.from(anos).sort((a,b) => b.localeCompare(a))
  }, [assembleiasIniciais, anoAtual])

  // Extrair Meses Dinamicamente baseado no Ano Selecionado
  const mesesDisponiveis = useMemo(() => {
    if (anoFiltro === 'Todos') return []
    const meses = new Set(
      assembleiasIniciais
        .filter(a => a.data_realizacao.substring(0, 4) === anoFiltro)
        .map(a => {
          // Extrair mês de yyyy-mm-dd (retorna '01' a '12')
          return a.data_realizacao.substring(5, 7)
        })
    )
    return Array.from(meses).sort()
  }, [assembleiasIniciais, anoFiltro])

  const nomesMeses: Record<string, string> = {
    '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril', 
    '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto', 
    '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
  }

  // Filtragem Client-Side Instantânea
  const assembleiasFiltradas = useMemo(() => {
    return assembleiasIniciais.filter((a) => {
      // 1. Filtro por Aba/Status
      const passaAba = abaAtiva === 'Todas' || a.status === abaAtiva

      // 2. Filtro por Ano
      const passaAno = anoFiltro === 'Todos' || a.data_realizacao.substring(0, 4) === anoFiltro

      // 3. Filtro por Mês
      const passaMes = mesFiltro === 'Todos' || a.data_realizacao.substring(5, 7) === mesFiltro

      // 4. Filtro por Texto (Título, Edital ou Pautas)
      const termoBusca = busca.toLowerCase()
      const textoPautas = a.pautas?.join(' ') || ''
      const passaBusca = 
        a.tipo.toLowerCase().includes(termoBusca) || 
        (a.numero && a.numero.toLowerCase().includes(termoBusca)) ||
        textoPautas.toLowerCase().includes(termoBusca)

      return passaAba && passaAno && passaMes && passaBusca
    })
  }, [assembleiasIniciais, abaAtiva, anoFiltro, mesFiltro, busca])

  // Ações de Mudança de Status
  const handleAlterarStatus = async (id: string, novoStatus: string) => {
    if (await confirm(`Deseja realmente marcar esta assembleia como ${novoStatus}?`)) {
      try {
        await updateStatusAssembleia(id, novoStatus)
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleDeletarSeguro = async (id: string) => {
    const word = await prompt('Para excluir definitivamente esta assembleia e todos os seus dados, digite a palavra DELETAR:', 'DELETAR')
    if (word === 'DELETAR') {
      try {
        await deleteAssembleia(id)
      } catch (err: unknown) {
        console.error(err)
        await alert(err instanceof Error ? err.message : 'Erro ao deletar assembleia.')
      }
    } else if (word !== null) {
      await alert('Palavra de segurança incorreta. A exclusão foi cancelada.')
    }
  }

  return (
    <div className="min-h-screen bg-brand-cream text-brand-ink p-6 md:p-8 font-sans selection:bg-brand-tinto selection:text-white">
      {/* Cabeçalho */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b-2 border-brand-ink pb-6 gap-4">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-serif font-bold text-brand-tinto tracking-tight">Atos & Assembleias</h1>
          </div>
          <p className="text-zinc-600 text-xs mt-1 uppercase tracking-wider">Agendamento e Emissão de Editais, Listas e Atas</p>
        </div>
        <Link 
          href="/admin/assembleias/nova" 
          className="bg-brand-tinto hover:bg-brand-tinto-light text-white text-xs font-serif font-bold uppercase tracking-wider py-2.5 px-4 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle size={15} />
          <span>Agendar Assembleia</span>
        </Link>
      </header>

      {/* Barra de Filtros e Buscas */}
      <div className="mb-8 flex flex-col justify-between items-start gap-4 bg-brand-border/10 p-4 border-2 border-brand-border">
        {/* Linha Superior: Abas e Selects de Data */}
        <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {(['Todas', 'Agendada', 'Rascunho', 'Concluída', 'Cancelada'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setAbaAtiva(tab)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-2 ${
                  abaAtiva === tab 
                    ? 'bg-brand-ink text-brand-cream border-brand-ink' 
                    : 'bg-transparent text-brand-ink border-transparent hover:border-brand-ink/30'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              value={anoFiltro}
              onChange={(e) => {
                setAnoFiltro(e.target.value)
                setMesFiltro('Todos') // reseta o mês ao trocar de ano
              }}
              className="bg-brand-cream border-2 border-brand-border px-4 py-2 text-xs font-bold uppercase text-brand-ink focus:outline-none focus:border-brand-ink cursor-pointer"
            >
              <option value="Todos">Todos os Anos</option>
              {anosDisponiveis.map(ano => (
                <option key={ano} value={ano}>{ano}</option>
              ))}
            </select>

            <select
              value={mesFiltro}
              onChange={(e) => setMesFiltro(e.target.value)}
              disabled={anoFiltro === 'Todos' || mesesDisponiveis.length === 0}
              className="bg-brand-cream border-2 border-brand-border px-4 py-2 text-xs font-bold uppercase text-brand-ink focus:outline-none focus:border-brand-ink cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="Todos">Todos os Meses</option>
              {mesesDisponiveis.map(mes => (
                <option key={mes} value={mes}>{nomesMeses[mes]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Linha Inferior: Busca por Texto */}
        <div className="relative w-full">
          <input 
            type="text" 
            placeholder="Buscar termo, pauta ou edital..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-brand-cream border-2 border-brand-border px-10 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-ink placeholder:text-brand-ink/40"
          />
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-ink/40" />
        </div>
      </div>

      {/* Grid de Convocatórias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {assembleiasFiltradas.length === 0 ? (
          <div className="lg:col-span-2 bg-brand-card border border-brand-border p-12 text-center shadow-xl">
            <Search className="mx-auto h-12 w-12 text-brand-ink/40 mb-4" />
            <h3 className="text-lg font-serif font-bold text-brand-ink">Nenhuma assembleia encontrada</h3>
            <p className="text-zinc-600 text-xs mt-2">Tente buscar por outras palavras ou alterar a aba de status.</p>
          </div>
        ) : (
          assembleiasFiltradas.map((assembleia) => (
            <div key={assembleia.id} className="bg-brand-card border border-brand-border shadow-[4px_4px_0px_var(--brand-ink)] flex flex-col justify-between group overflow-hidden">
              {/* Tarja de Cancelada (se aplicável) */}
              {assembleia.status === 'Cancelada' && (
                <div className="bg-brand-tinto text-white text-[10px] font-bold uppercase tracking-widest py-1 text-center w-full">
                  ASSEMBLEIA CANCELADA
                </div>
              )}
              
              <div className={`p-6 ${assembleia.status === 'Cancelada' ? 'opacity-70' : ''}`}>
                {/* Status e Identificador da Convocatória */}
                <div className="flex items-center justify-between mb-4 border-b border-dashed border-brand-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                      assembleia.status === 'Agendada' ? 'bg-blue-100 text-blue-800 border-blue-300' 
                      : assembleia.status === 'Rascunho' ? 'bg-orange-100 text-orange-800 border-orange-300'
                      : assembleia.status === 'Concluída' ? 'bg-brand-olive/10 text-brand-olive border-brand-olive/30' 
                      : 'bg-brand-tinto/10 text-brand-tinto border-brand-tinto/30'
                    }`}>
                      {assembleia.status}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {assembleia.numero && (
                      <span className="text-xs font-bold uppercase tracking-widest text-brand-ink/60">
                        Edital nº {assembleia.numero}
                      </span>
                    )}
                    {assembleia.versao_edital && assembleia.versao_edital > 1 && (
                      <span className="text-[10px] font-bold text-brand-tinto flex items-center gap-1">
                        <Edit3 size={10} /> RETIFICADO (V{assembleia.versao_edital})
                      </span>
                    )}
                  </div>
                </div>

                {/* Título Convocatória */}
                <h2 className="text-xl font-serif font-bold text-brand-ink mb-4 group-hover:text-brand-tinto transition-colors">
                  Assembleia Geral {assembleia.tipo}
                </h2>

                {/* Infos Detalhadas com Ícones Físicos */}
                <div className="space-y-2.5 mb-6 text-xs text-brand-ink/80">
                  <div className="flex items-center gap-2.5">
                    <Calendar size={14} className="text-brand-tinto" />
                    <span className="font-semibold">{new Date(assembleia.data_realizacao).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock size={14} className="text-brand-tinto" />
                    <span className="font-medium">1ª Convocação: {assembleia.horario_1a_convocacao.slice(0, 5)}h | 2ª Convocação: {assembleia.horario_2a_convocacao.slice(0, 5)}h</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin size={14} className="text-brand-tinto" />
                    <span className="font-medium">{assembleia.local}</span>
                  </div>
                </div>

                {/* Pautas */}
                <div className="border-t border-brand-border pt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-brand-ink/60 mb-2 font-serif">Pauta de Deliberações:</h3>
                  <ul className="list-disc list-inside text-xs text-brand-ink/80 space-y-1">
                    {assembleia.pautas && assembleia.pautas.map((pauta: string, i: number) => (
                      <li key={i} className="font-medium truncate" title={pauta}>{pauta}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Barra de Ações Administrativas Estilo Jornal */}
              <div className="bg-brand-cream border-t border-brand-border p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className={`flex flex-1 items-center gap-2 ${assembleia.status === 'Cancelada' ? 'pointer-events-none opacity-50' : ''}`}>
                  {(assembleia.status === 'Rascunho' || assembleia.status === 'Agendada') && (
                    <Link 
                      href={`/admin/assembleias/${assembleia.id}/editar`}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 transition-colors text-[10px] font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px] ${
                        assembleia.status === 'Agendada' 
                          ? 'bg-brand-tinto/10 hover:bg-brand-tinto/20 border border-brand-tinto text-brand-tinto'
                          : 'bg-amber-100 hover:bg-amber-200 border border-amber-600 text-amber-900'
                      }`}
                    >
                      <Edit3 size={12} /> {assembleia.status === 'Agendada' ? 'Retificar' : 'Editar'}
                    </Link>
                  )}
                  {assembleia.status !== 'Rascunho' && (
                    <>
                      <Link 
                        href={`/admin/assembleias/${assembleia.id}/edital`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 bg-brand-cream hover:bg-brand-card border border-brand-ink text-brand-ink transition-colors text-[10px] font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px]"
                      >
                        Edital
                      </Link>
                      <Link 
                        href={`/admin/assembleias/${assembleia.id}/presenca`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 bg-brand-cream hover:bg-brand-card border border-brand-ink text-brand-ink transition-colors text-[10px] font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px]"
                      >
                        Presença
                      </Link>
                      <Link 
                        href={`/admin/assembleias/${assembleia.id}/ata`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 bg-brand-tinto hover:bg-brand-tinto-light border-transparent text-white transition-colors text-[10px] font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px]"
                      >
                        Ata
                      </Link>
                    </>
                  )}
                </div>
                
                {/* Controles de Máquina de Estado Rápidos */}
                {assembleia.status !== 'Cancelada' && assembleia.status !== 'Rascunho' && (
                  <div className="flex sm:flex-col items-stretch sm:items-end gap-2 sm:border-l border-brand-border sm:pl-3">
                    {assembleia.status !== 'Concluída' && (
                      <button onClick={() => handleAlterarStatus(assembleia.id, 'Concluída')} className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-brand-olive hover:text-brand-olive-light transition-colors">
                        <CheckCircle2 size={12} /> Concluir
                      </button>
                    )}
                    {assembleia.status !== 'Concluída' && (
                      <button onClick={() => handleAlterarStatus(assembleia.id, 'Cancelada')} className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-brand-tinto hover:text-brand-tinto-light transition-colors">
                        <XCircle size={12} /> Cancelar
                      </button>
                    )}
                  </div>
                )}
                
                {/* Deletar Seguro */}
                {assembleia.status === 'Cancelada' && (
                  <div className="flex sm:flex-col items-stretch sm:items-end gap-2 sm:border-l border-brand-border sm:pl-3">
                    <button onClick={() => handleDeletarSeguro(assembleia.id)} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-tinto hover:bg-brand-tinto-light text-white text-[10px] font-bold uppercase tracking-wider transition-colors shadow-[1.5px_1.5px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px]">
                      <Trash2 size={12} /> Excluir Permanentemente
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
