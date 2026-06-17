'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, FileText, Search, X } from 'lucide-react'
import Link from 'next/link'

import { formatarDataPtBR } from '@/lib/date-utils'

interface DocumentoItem {
  id: string
  titulo: string
  categoria: string
  data: string
  tipo: 'externo' | 'resolucao'
  url: string
}

function formatDate(dateStr: string) {
  return formatarDataPtBR(dateStr, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function DocumentosCliente({ documentos }: { documentos: DocumentoItem[] }) {
  const anoAtual = new Date().getFullYear().toString()

  const anosDisponiveis = useMemo(() => {
    const set = new Set(documentos.map(d => d.data.slice(0, 4)))
    if (!set.has(anoAtual)) set.add(anoAtual)
    return Array.from(set).sort((a, b) => Number(b) - Number(a))
  }, [documentos, anoAtual])

  const categoriasDisponiveis = useMemo(() => {
    const set = new Set(documentos.map(d => d.categoria))
    return Array.from(set).sort()
  }, [documentos])

  const [filtroAno, setFiltroAno] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [busca, setBusca] = useState('')

  const filtrados = useMemo(() => {
    const termoBusca = busca.toLowerCase().trim()

    return documentos.filter(d => {
      const ano = d.data.slice(0, 4)

      if (filtroAno && ano !== filtroAno) return false
      if (filtroCategoria && d.categoria !== filtroCategoria) return false

      if (termoBusca) {
        const matchTitulo = d.titulo.toLowerCase().includes(termoBusca)
        const matchCategoria = d.categoria.toLowerCase().includes(termoBusca)
        if (!matchTitulo && !matchCategoria) return false
      }

      return true
    })
  }, [documentos, filtroAno, filtroCategoria, busca])

  const porAno = useMemo(() => {
    return filtrados.reduce<Record<string, DocumentoItem[]>>((acc, d) => {
      const ano = d.data.slice(0, 4)
      if (!acc[ano]) acc[ano] = []
      acc[ano].push(d)
      return acc
    }, {})
  }, [filtrados])

  const anos = Object.keys(porAno).sort((a, b) => Number(b) - Number(a))
  const temFiltroAtivo = filtroCategoria !== '' || busca !== ''

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

            {/* Filtro Categoria */}
            <div className="sm:w-56">
              <label htmlFor="filtro-categoria" className="block text-[10px] font-bold text-brand-ink/50 uppercase tracking-widest mb-1.5">
                Categoria
              </label>
              <select
                id="filtro-categoria"
                value={filtroCategoria}
                onChange={e => setFiltroCategoria(e.target.value)}
                className="w-full border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-ink bg-brand-cream/50 font-medium focus:outline-none focus:ring-2 focus:ring-brand-tinto/20 focus:border-brand-tinto transition-colors"
              >
                <option value="">Todas as categorias</option>
                {categoriasDisponiveis.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Campo de Busca */}
            <div className="flex-1">
              <label htmlFor="busca-documento" className="block text-[10px] font-bold text-brand-ink/50 uppercase tracking-widest mb-1.5">
                Pesquisar
              </label>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  id="busca-documento"
                  type="text"
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  placeholder="Título, número, categoria..."
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
                  onClick={() => { setFiltroCategoria(''); setBusca(''); setFiltroAno(anoAtual) }}
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
              {filtrados.length === 0
                ? 'Nenhum documento encontrado'
                : `${filtrados.length} documento${filtrados.length !== 1 ? 's' : ''} encontrado${filtrados.length !== 1 ? 's' : ''}`
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
        {filtrados.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📄</div>
            <h2 className="text-xl font-bold text-brand-ink font-serif mb-2">
              {documentos.length === 0 ? 'Nenhum documento público encontrado' : 'Nenhum resultado para os filtros selecionados'}
            </h2>
            <p className="text-zinc-500">
              {documentos.length === 0
                ? 'Os documentos estarão disponíveis aqui em breve.'
                : 'Tente alterar o ano, categoria ou termo de pesquisa.'
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
                    {porAno[ano].length} documento{porAno[ano].length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Cards do ano */}
                <div className="space-y-4">
                  {porAno[ano].map((doc) => (
                    <article
                      key={doc.id}
                      className="bg-white border border-brand-border-muted rounded-2xl p-6 hover:shadow-md hover:border-brand-tinto/20 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        {/* Info principal */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border bg-zinc-50 text-zinc-600 border-zinc-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                              {doc.categoria}
                            </span>
                            <span className="text-xs text-zinc-400 font-medium bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-full">
                              {formatDate(doc.data)}
                            </span>
                          </div>

                          <h3 className="text-lg font-medium text-brand-ink mb-2">{doc.titulo}</h3>
                        </div>

                        {/* Botão */}
                        <div className="sm:ml-6 flex-shrink-0 flex flex-col items-end justify-center">
                          {doc.tipo === 'externo' ? (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-ink text-white text-xs font-semibold rounded-full hover:bg-brand-ink/80 transition-all hover:shadow-md"
                            >
                              Abrir PDF
                              <FileText size={14} />
                            </a>
                          ) : (
                            <Link
                              href={doc.url}
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-tinto text-white text-xs font-semibold rounded-full hover:bg-brand-tinto-light transition-all hover:shadow-md"
                            >
                              Ler Resolução
                              <ArrowRight size={14} />
                            </Link>
                          )}
                        </div>
                      </div>
                    </article>
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
