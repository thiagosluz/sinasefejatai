'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, CalendarDays, FileText,Search, X } from 'lucide-react'
import Link from 'next/link'

import { formatarDataPtBR } from '@/lib/date-utils'

interface Boletim {
  id: string
  titulo: string
  data_publicacao: string
  capa_url: string
  status: string
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

export function BoletinsCliente({ boletins }: { boletins: Boletim[] }) {
  const anoAtual = new Date().getFullYear().toString()
  const anosDisponiveis = useMemo(() => {
    const set = new Set(boletins.map(b => b.data_publicacao.slice(0, 4)))
    if (!set.has(anoAtual)) set.add(anoAtual)
    return Array.from(set).sort((a, b) => Number(b) - Number(a))
  }, [boletins, anoAtual])

  const [filtroAno, setFiltroAno] = useState(anoAtual)
  const [filtroMes, setFiltroMes] = useState('')
  const [busca, setBusca] = useState('')

  const filtradas = useMemo(() => {
    const termoBusca = busca.toLowerCase().trim()

    return boletins.filter(b => {
      const ano = b.data_publicacao.slice(0, 4)
      const mes = b.data_publicacao.slice(5, 7)

      if (filtroAno && ano !== filtroAno) return false
      if (filtroMes && mes !== filtroMes) return false

      if (termoBusca) {
        if (!b.titulo.toLowerCase().includes(termoBusca)) return false
      }

      return true
    })
  }, [boletins, filtroAno, filtroMes, busca])

  const porAno = useMemo(() => {
    const agrupado = filtradas.reduce<Record<string, Boletim[]>>((acc, b) => {
      const ano = b.data_publicacao.slice(0, 4)
      if (!acc[ano]) acc[ano] = []
      acc[ano].push(b)
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
              <label htmlFor="busca-boletim" className="block text-[10px] font-bold text-brand-ink/50 uppercase tracking-widest mb-1.5">
                Pesquisar
              </label>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  id="busca-boletim"
                  type="text"
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  placeholder="Buscar pelo título do boletim..."
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
                ? 'Nenhum boletim encontrado'
                : `${filtradas.length} boletim${filtradas.length !== 1 ? 's' : ''} encontrado${filtradas.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
        </div>

        {/* Listagem */}
        {filtradas.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📰</div>
            <h2 className="text-xl font-bold text-brand-ink font-serif mb-2">
              {boletins.length === 0 ? 'Nenhum boletim publicado' : 'Nenhum resultado para os filtros selecionados'}
            </h2>
            <p className="text-zinc-500">
              {boletins.length === 0
                ? 'Os próximos boletins aparecerão aqui em breve.'
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
                    {porAno[ano].length} boletim{porAno[ano].length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Grid de Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {porAno[ano].map((b) => (
                    <Link
                      key={b.id}
                      href={`/boletins/${b.id}`}
                      className="group bg-white border border-brand-border-muted rounded-2xl overflow-hidden hover:shadow-md hover:border-brand-tinto/20 transition-all flex flex-col"
                    >
                      <div className="aspect-[4/3] bg-brand-cream relative overflow-hidden border-b border-brand-border-muted">
                        {b.capa_url ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={b.capa_url} 
                              alt={b.titulo}
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                            />
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-brand-ink/20">
                            <FileText size={48} />
                          </div>
                        )}
                      </div>
                      
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
                          <CalendarDays size={14} className="text-brand-tinto" />
                          <span>{formatarDataPtBR(b.data_publicacao)}</span>
                        </div>
                        <h3 className="text-brand-ink font-bold font-serif text-lg leading-tight mb-4 group-hover:text-brand-tinto transition-colors line-clamp-2">
                          {b.titulo}
                        </h3>
                        
                        <div className="mt-auto flex items-center justify-end text-brand-tinto text-sm font-semibold pt-4 border-t border-brand-border-muted">
                          Ler Edição <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
