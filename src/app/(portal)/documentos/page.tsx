import { ArrowRight, FileText } from 'lucide-react'
import Link from 'next/link'

import { formatarTipo } from '@/app/(admin)/admin/documentos/lib/tipos-documento'
import { formatarDataPtBR } from '@/lib/date-utils'
import { createClient } from '@/lib/supabase/server'

type DocumentoItem = {
  id: string
  titulo: string
  categoria: string
  data: string
  tipo: 'externo' | 'resolucao'
  url: string
}

async function getDocumentosPublicos(): Promise<DocumentoItem[]> {
  const supabase = await createClient()
  const items: DocumentoItem[] = []

  // 1. Buscar Publicações Externas
  const { data: publicacoes } = await supabase
    .from('publicacoes')
    .select('id, titulo, categoria, data_publicacao, arquivo_url')
    
  if (publicacoes) {
    publicacoes.forEach(p => {
      items.push({
        id: p.id,
        titulo: p.titulo,
        categoria: p.categoria,
        data: p.data_publicacao,
        tipo: 'externo',
        url: p.arquivo_url
      })
    })
  }

  // 2. Buscar Resoluções Públicas
  const { data: resolucoes } = await supabase
    .from('documentos_administrativos')
    .select('id, tipo, titulo, numero, data_emissao')
    .eq('is_publico', true)
    .eq('status', 'ativo')

  if (resolucoes) {
    resolucoes.forEach(r => {
      items.push({
        id: r.id,
        titulo: r.titulo,
        categoria: formatarTipo(r.tipo) + (r.numero ? ` Nº ${r.numero}` : ''),
        data: r.data_emissao,
        tipo: 'resolucao',
        url: `/documentos/resolucoes/${r.id}`
      })
    })
  }

  // Ordenar por data decrescente
  items.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

  return items
}

function formatDate(dateStr: string) {
  return formatarDataPtBR(dateStr, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default async function DocumentosPublicosPage() {
  const documentos = await getDocumentosPublicos()

  const porAno = documentos.reduce<Record<string, typeof documentos>>((acc, d) => {
    const ano = d.data.slice(0, 4)
    if (!acc[ano]) acc[ano] = []
    acc[ano].push(d)
    return acc
  }, {})

  const anos = Object.keys(porAno).sort((a, b) => Number(b) - Number(a))

  return (
    <>
      {/* Hero */}
      <section
        className="py-16 sm:py-20"
        style={{ background: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-red-300 font-semibold text-sm uppercase tracking-widest mb-3">Transparência</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif mb-4">Documentos Públicos</h1>
          <p className="text-white/75 text-lg max-w-2xl">
            Acesso público a regimentos, notas, resoluções normativas e balanços do SINASEFE JATAÍ.
          </p>
        </div>
      </section>

      {/* Listagem */}
      <section className="bg-brand-cream flex-1 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {documentos.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">📄</div>
              <h2 className="text-xl font-bold text-brand-ink font-serif mb-2">Nenhum documento público encontrado</h2>
              <p className="text-zinc-500">Os documentos estarão disponíveis aqui em breve.</p>
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
    </>
  )
}
