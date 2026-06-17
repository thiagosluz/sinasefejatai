'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, CalendarDays, MapPin, Search, Users, X } from 'lucide-react'
import Link from 'next/link'

import { formatarDataPtBR, formatarHora } from '@/lib/date-utils'

interface Assembleia {
  id: string
  numero: string | null
  tipo: string | null
  data_realizacao: string
  horario_1a_convocacao: string | null
  local: string
  status: string
  pautas: string[] | null
  publico_alvo: string | null
}

const statusConfig: Record<string, { label: string; classes: string; dot: string }> = {
  Agendada: { label: 'Agendada', classes: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  Realizada: { label: 'Realizada', classes: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
  Cancelada: { label: 'Cancelada', classes: 'bg-zinc-50 text-zinc-500 border-zinc-200', dot: 'bg-zinc-400' },
}

const MESES = [
  { value: '', label: 'Todos os meses' },
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
]

function formatDate(dateStr: string) {
  return formatarDataPtBR(dateStr, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function AssembleiasCliente({ assembleias }: { assembleias: Assembleia[] }) {
  const anoAtual = new Date().getFullYear().toString()
  const anosDisponiveis = useMemo(() => {
    const set = new Set(assembleias.map(a => a.data_realizacao.slice(0, 4)))
    if (!set.has(anoAtual)) set.add(anoAtual)
    return Array.from(set).sort((a, b) => Number(b) - Number(a))
  }, [assembleias, anoAtual])

  const [filtroAno, setFiltroAno] = useState(anoAtual)
  const [filtroMes, setFiltroMes] = useState('')
  const [busca, setBusca] = useState('')

  const filtradas = useMemo(() => {
    const termoBusca = busca.toLowerCase().trim()

    return assembleias.filter(a => {
      const ano = a.data_realizacao.slice(0, 4)
      const mes = a.data_realizacao.slice(5, 7)

      if (filtroAno && ano !== filtroAno) return false
      if (filtroMes && mes !== filtroMes) return false

      if (termoBusca) {
        const matchNumero = a.numero?.toLowerCase().includes(termoBusca)
        const matchPauta = a.pautas?.some(p => p.toLowerCase().includes(termoBusca))
        const matchTipo = a.tipo?.toLowerCase().includes(termoBusca)
        const matchLocal = a.local.toLowerCase().includes(termoBusca)
        if (!matchNumero && !matchPauta && !matchTipo && !matchLocal) return false
      }

      return true
    })
  }, [assembleias, filtroAno, filtroMes, busca])

  const porAno = useMemo(() => {
    const agrupado = filtradas.reduce<Record<string, Assembleia[]>>((acc, a) => {
      const ano = a.data_realizacao.slice(0, 4)
      if (!acc[ano]) acc[ano] = []
      acc[ano].push(a)
      return acc
    }, {})
    return agrupado
  }, [filtradas])

  const anos = Object.keys(porAno).sort((a, b) => Number(b) - Number(a))
  const temFiltroAtivo = filtroMes !== '' || busca !== ''

  return (
    <section className="bg-brand-cream flex-1 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Barra de Filtros */}
        <div className="bg-white border border-brand-border-muted rounded-2xl p-4 sm:p-5 mb-10">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Filtro Ano */}
            <div className="sm:w-40">
              <label htmlFor="filtro-ano" className="block text-[10px] font-bold text-brand-ink/50 uppercase tracking-widest mb-1.5">
                Ano
              </label>
              <select
                id="filtro-ano"
                value={filtroAno}
                onChange={e => setFiltroAno(e.target.value)}
                className="w-full border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-ink bg-brand-cream/50 font-medium focus:outline-none focus:ring-2 focus:ring-brand-tinto/20 focus:border-brand-tinto transition-colors"
              >
                <option value="">Todos</option>
                {anosDisponiveis.map(ano => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
            </div>

            {/* Filtro Mês */}
            <div className="sm:w-48">
              <label htmlFor="filtro-mes" className="block text-[10px] font-bold text-brand-ink/50 uppercase tracking-widest mb-1.5">
                Mês
              </label>
              <select
                id="filtro-mes"
                value={filtroMes}
                onChange={e => setFiltroMes(e.target.value)}
                className="w-full border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-ink bg-brand-cream/50 font-medium focus:outline-none focus:ring-2 focus:ring-brand-tinto/20 focus:border-brand-tinto transition-colors"
              >
                {MESES.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Campo de Busca */}
            <div className="flex-1">
              <label htmlFor="busca-assembleia" className="block text-[10px] font-bold text-brand-ink/50 uppercase tracking-widest mb-1.5">
                Pesquisar
              </label>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  id="busca-assembleia"
                  type="text"
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  placeholder="Nº do edital, pauta, tipo..."
                  className="w-full border border-brand-border rounded-lg pl-9 pr-9 py-2.5 text-sm text-brand-ink bg-brand-cream/50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-tinto/20 focus:border-brand-tinto transition-colors"
                />
                {busca && (
                  <button
                    type="button"
                    onClick={() => setBusca('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-brand-ink transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Limpar filtros */}
            {temFiltroAtivo && (
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => { setFiltroMes(''); setBusca(''); setFiltroAno(anoAtual) }}
                  className="px-4 py-2.5 text-xs font-semibold text-brand-tinto hover:text-white border border-brand-tinto/30 hover:bg-brand-tinto rounded-lg transition-all cursor-pointer"
                >
                  Limpar
                </button>
              </div>
            )}
          </div>

          {/* Contador de resultados */}
          <div className="mt-3 pt-3 border-t border-brand-border-muted flex items-center justify-between">
            <p className="text-xs text-zinc-400">
              {filtradas.length === 0
                ? 'Nenhuma assembleia encontrada'
                : `${filtradas.length} assembleia${filtradas.length !== 1 ? 's' : ''} encontrada${filtradas.length !== 1 ? 's' : ''}`
              }
            </p>
            {filtroAno && (
              <span className="text-xs font-semibold text-brand-tinto bg-brand-tinto/5 border border-brand-tinto/15 px-2.5 py-1 rounded-full">
                {filtroAno}
              </span>
            )}
          </div>
        </div>

        {/* Listagem */}
        {filtradas.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-bold text-brand-ink font-serif mb-2">
              {assembleias.length === 0 ? 'Nenhuma assembleia publicada' : 'Nenhum resultado para os filtros selecionados'}
            </h2>
            <p className="text-zinc-500">
              {assembleias.length === 0
                ? 'As assembleias futuras aparecerão aqui em breve.'
                : 'Tente alterar o ano, mês ou termo de pesquisa.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {anos.map((ano) => (
              <div key={ano}>
                {/* Cabeçalho do ano */}
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-brand-ink font-serif">{ano}</h2>
                  <div className="flex-1 h-px bg-brand-border" />
                  <span className="text-sm text-zinc-400 font-medium">
                    {porAno[ano].length} assembleia{porAno[ano].length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Cards do ano */}
                <div className="space-y-4">
                  {porAno[ano].map((a) => {
                    const status = statusConfig[a.status] ?? statusConfig.Agendada
                    return (
                      <article
                        key={a.id}
                        className="bg-white border border-brand-border-muted rounded-2xl p-6 hover:shadow-md hover:border-brand-tinto/20 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          {/* Info principal */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <span
                                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${status.classes}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                {status.label}
                              </span>
                              {a.tipo && (
                                <span className="text-xs text-zinc-400 font-medium bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-full">
                                  {a.tipo}
                                </span>
                              )}
                              {a.numero && (
                                <span className="text-xs text-zinc-400 font-mono">Nº {a.numero}</span>
                              )}
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mb-4">
                              <div className="flex items-center gap-2 text-sm text-zinc-600">
                                <CalendarDays size={15} className="text-brand-tinto flex-shrink-0" />
                                <span className="capitalize">{formatDate(a.data_realizacao)}</span>
                                {a.horario_1a_convocacao && (
                                  <span className="text-zinc-400">às {formatarHora(a.horario_1a_convocacao)}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-zinc-600">
                                <MapPin size={15} className="text-brand-tinto flex-shrink-0" />
                                <span>{a.local}</span>
                              </div>
                            </div>

                            {/* Pautas */}
                            {a.pautas && a.pautas.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Pauta</p>
                                <ul className="space-y-1">
                                  {a.pautas.map((pauta: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-600">
                                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-tinto flex-shrink-0" />
                                      {pauta}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {/* Público-alvo e Botão */}
                          <div className="sm:ml-6 flex-shrink-0 flex flex-col items-end gap-3">
                            {a.publico_alvo && (
                              <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2">
                                <Users size={13} />
                                <span className="capitalize">{a.publico_alvo}</span>
                              </div>
                            )}
                            <Link 
                              href={`/assembleias/${a.id}`}
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-tinto text-white text-xs font-semibold rounded-full hover:bg-brand-tinto-light transition-all hover:shadow-md mt-auto"
                            >
                              Ver Detalhes
                              <ArrowRight size={14} />
                            </Link>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
