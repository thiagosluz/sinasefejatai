import { FileText, PlusCircle, Search } from 'lucide-react'
import Link from 'next/link'

import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'
import { formatarDataPtBR } from '@/lib/date-utils'
import { createClient } from '@/lib/supabase/server'

import { DeleteDocButton } from './components/delete-doc-button'

export default async function DocumentosPage() {
  const supabase = await createClient()

  // Buscar documentos
  const { data: documentos } = await supabase
    .from('documentos_administrativos')
    .select('id, tipo, titulo, numero, data_emissao, status, created_at')
    .order('created_at', { ascending: false })

  return (
    <AdminPageWrapper>
      <AdminPageHeader 
        titulo="Central de Documentos" 
        subtitulo="Gestão de Recibos, Ofícios e Declarações"
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
        {/* Barra de Pesquisa Simulada */}
        <div className="mb-6 flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar documento por título ou número..." 
              className="w-full bg-zinc-50 border border-zinc-200 px-10 py-2.5 text-sm outline-none focus:border-brand-ink focus:ring-1 focus:ring-brand-ink transition-all"
            />
          </div>
        </div>

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
              {!documentos || documentos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-zinc-500 italic">
                    Nenhum documento emitido até o momento.
                  </td>
                </tr>
              ) : (
                documentos.map((doc) => (
                  <tr key={doc.id} className={`transition-colors ${doc.status === 'cancelado' ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-zinc-50'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className={doc.status === 'cancelado' ? "text-red-400" : "text-zinc-400"} />
                        <div>
                          <span className={`font-semibold block uppercase text-[10px] tracking-wider ${doc.status === 'cancelado' ? 'text-red-700' : 'text-brand-ink/70'}`}>
                            {doc.tipo.replace('_', ' ')}
                          </span>
                          {doc.numero && <span className="font-mono text-xs">{doc.numero}</span>}
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 py-3 font-medium ${doc.status === 'cancelado' ? 'text-red-800 line-through opacity-70' : ''}`}>
                      {doc.titulo}
                      {doc.status === 'cancelado' && (
                        <span className="ml-2 text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full uppercase tracking-wider no-underline inline-block">Cancelado</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-600">
                      {formatarDataPtBR(doc.data_emissao)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {doc.tipo === 'recibo_pagamento' && (
                          <Link 
                            href={`/admin/documentos/recibos/${doc.id}`}
                            className="px-3 py-1.5 bg-brand-cream hover:bg-brand-card border border-brand-ink text-brand-ink transition-colors text-[10px] font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px]"
                          >
                            Visualizar
                          </Link>
                        )}
                        <DeleteDocButton id={doc.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPageWrapper>
  )
}
