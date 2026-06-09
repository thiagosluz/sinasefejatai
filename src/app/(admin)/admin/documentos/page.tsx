import { FileText, PlusCircle } from 'lucide-react'
import Link from 'next/link'

import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'
import { formatarDataPtBR } from '@/lib/date-utils'
import { createClient } from '@/lib/supabase/server'

import { DeleteDocButton } from './components/delete-doc-button'
import { DocumentosFiltros } from './components/documentos-filtros'
import { Paginacao } from './components/paginacao'
import { formatarTipo, getSlugByTipo } from './lib/tipos-documento'

export default async function DocumentosPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; mes?: string; ano?: string; tipo?: string; page?: string }>
}) {
  const supabase = await createClient()

  const resolvedSearchParams = await searchParams
  const q = resolvedSearchParams?.q || ''
  const mes = resolvedSearchParams?.mes || ''
  const ano = resolvedSearchParams?.ano || ''
  const tipo = resolvedSearchParams?.tipo || ''
  const currentPage = Number(resolvedSearchParams?.page) || 1
  const ITEMS_PER_PAGE = 10
  const offset = (currentPage - 1) * ITEMS_PER_PAGE

  let query = supabase
    .from('documentos_administrativos')
    .select('id, tipo, titulo, numero, data_emissao, status, created_at', { count: 'exact' })

  if (q) {
    query = query.or(`titulo.ilike.%${q}%,numero.ilike.%${q}%`)
  }

  if (tipo) {
    query = query.eq('tipo', tipo)
  }

  if (ano) {
    const anoNum = parseInt(ano)
    if (!isNaN(anoNum)) {
      let startDate, endDate
      if (mes) {
        const mesNum = parseInt(mes)
        startDate = new Date(anoNum, mesNum - 1, 1).toISOString()
        endDate = new Date(anoNum, mesNum, 0, 23, 59, 59).toISOString()
      } else {
        startDate = new Date(anoNum, 0, 1).toISOString()
        endDate = new Date(anoNum, 11, 31, 23, 59, 59).toISOString()
      }
      query = query.gte('data_emissao', startDate).lte('data_emissao', endDate)
    }
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1)

  const { data: documentos, count } = await query

  // Busca as assinaturas correspondentes manualmente pois o PostgREST não encontrou o FK automático reverso
  type Documento = NonNullable<typeof documentos>[0]
  type Verificacao = {
    documento_id: string
    documento_assinaturas: Array<{ id: string }>
  }
  type DocumentoEstendido = Documento & {
    documento_verificacoes?: Verificacao[]
  }

  let verifs: Verificacao[] = []
  if (documentos && documentos.length > 0) {
    const ids = documentos.map(d => d.id)
    const res = await supabase
      .from('documento_verificacoes')
      .select('documento_id, documento_assinaturas(id)')
      .in('documento_id', ids)
    
    verifs = (res.data as unknown as Verificacao[]) || []
  }

  const documentosEstendidos: DocumentoEstendido[] = (documentos || []).map(doc => {
    const verif = verifs.find(v => v.documento_id === doc.id)
    return { ...doc, documento_verificacoes: verif ? [verif] : [] }
  })

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0

  return (
    <AdminPageWrapper>
      <AdminPageHeader
        titulo="Central de Documentos"
        subtitulo="Gestão de Recibos, Ofícios, Declarações e outros"
      >
        <Link
          href="/admin/documentos/novo"
          className="bg-brand-tinto hover:bg-brand-tinto-light text-white text-xs font-serif font-bold uppercase tracking-wider py-2.5 px-4 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle size={15} />
          <span>Emitir Documento</span>
        </Link>
      </AdminPageHeader>

      <div className="bg-white border border-brand-border p-6 shadow-[4px_4px_0px_var(--brand-ink)]">
        <DocumentosFiltros />

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-brand-ink">
            <thead className="bg-brand-cream/50 uppercase text-[10px] tracking-wider font-bold border-y border-brand-border">
              <tr>
                <th className="px-4 py-3">Tipo / Número</th>
                <th className="px-4 py-3">Título Referência</th>
                <th className="px-4 py-3">Emissão</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {!documentosEstendidos || documentosEstendidos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-zinc-500 italic">
                    Nenhum documento emitido até o momento.
                  </td>
                </tr>
              ) : (
                documentosEstendidos.map((doc) => {
                  const slug = getSlugByTipo(doc.tipo)
                  return (
                    <tr key={doc.id} className={`transition-colors ${doc.status === 'cancelado' ? 'bg-red-50/50 hover:bg-red-50' : doc.status === 'revogado' ? 'bg-orange-50/50 hover:bg-orange-50' : 'hover:bg-zinc-50'}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className={doc.status === 'cancelado' ? "text-red-400" : doc.status === 'revogado' ? "text-orange-400" : "text-zinc-400"} />
                          <div>
                            <span className={`font-semibold block uppercase text-[10px] tracking-wider ${doc.status === 'cancelado' ? 'text-red-700' : doc.status === 'revogado' ? 'text-orange-700' : 'text-brand-ink/70'}`}>
                              {formatarTipo(doc.tipo)}
                            </span>
                            {doc.numero && <span className="font-mono text-xs">{doc.numero}</span>}
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 py-3 font-medium ${doc.status === 'cancelado' ? 'text-red-800 line-through opacity-70' : doc.status === 'revogado' ? 'text-orange-800 opacity-70' : ''}`}>
                        {doc.titulo}
                        {doc.status === 'cancelado' && (
                          <span className="ml-2 text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full uppercase tracking-wider no-underline inline-block">Cancelado</span>
                        )}
                        {doc.status === 'revogado' && (
                          <span className="ml-2 text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full uppercase tracking-wider no-underline inline-block">Revogada</span>
                        )}
                        {doc.status === 'ativo' && (
                          (() => {
                            const verificacoes = doc.documento_verificacoes || []
                            const assinado = verificacoes.some(v => v.documento_assinaturas && v.documento_assinaturas.length > 0)
                            
                            if (assinado) {
                              return <span className="ml-2 text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full uppercase tracking-wider no-underline inline-block">Assinado</span>
                            } else {
                              return <span className="ml-2 text-[9px] bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded-full uppercase tracking-wider no-underline inline-block">Minuta</span>
                            }
                          })()
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-600">
                        {formatarDataPtBR(doc.data_emissao)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {doc.status !== 'cancelado' && doc.status !== 'revogado' && (
                            (() => {
                              const verificacoes = doc.documento_verificacoes || []
                              const assinado = verificacoes.some(v => v.documento_assinaturas && v.documento_assinaturas.length > 0)
                              
                              if (!assinado) {
                                return (
                                  <Link
                                    href={`/admin/documentos/${slug}/novo?editar=${doc.id}`}
                                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-600 text-amber-700 transition-colors text-[10px] font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_#d97706] hover:translate-x-[1px] hover:translate-y-[1px]"
                                  >
                                    Editar
                                  </Link>
                                )
                              }
                              return null
                            })()
                          )}
                          <Link
                            href={`/admin/documentos/${slug}/${doc.id}`}
                            className="px-3 py-1.5 bg-brand-cream hover:bg-brand-card border border-brand-ink text-brand-ink transition-colors text-[10px] font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px]"
                          >
                            Visualizar
                          </Link>
                          <DeleteDocButton id={doc.id} />
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <Paginacao totalPages={totalPages} />
      </div>
    </AdminPageWrapper>
  )
}
