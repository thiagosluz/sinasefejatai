import React from 'react'
import { ArrowLeft, Ban } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AssinaturasWidget } from '@/components/assinaturas-widget'
import { getDocumentoVerificacao } from '@/lib/actions-assinaturas'
import { formatarDataPtBR } from '@/lib/date-utils'
import { createClient } from '@/lib/supabase/server'

import { formatarTipo, getSlugByTipo } from '../lib/tipos-documento'

import { DocumentoActions } from './documento-actions'
import { PrintButton } from './print-button'

interface DocumentoViewWrapperProps {
  id: string
  tipoDocumento: string
  children: React.ReactNode
}

export async function DocumentoViewWrapper({ id, tipoDocumento, children }: DocumentoViewWrapperProps) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: doc } = await supabase
    .from('documentos_administrativos')
    .select('*')
    .eq('id', id)
    .single()

  if (!doc) {
    notFound()
  }

  const verificacao = await getDocumentoVerificacao(tipoDocumento, id)
  const tipoLabel = formatarTipo(doc.tipo)
  const tipoSlug = getSlugByTipo(doc.tipo)

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col">
      {/* Barra superior (não aparece na impressão) */}
      <div className="print:hidden bg-white border-b border-zinc-200 p-4 sticky top-0 z-50 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/documentos"
            className="flex items-center gap-2 text-zinc-600 hover:text-brand-ink transition-colors"
            title="Voltar para a lista"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline font-semibold">Voltar</span>
          </Link>
          <div className="h-6 w-[1px] bg-zinc-300"></div>
          <div>
            <h1 className="font-bold text-brand-ink">
              {doc.titulo}
              {doc.status === 'cancelado' && (
                <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Cancelado</span>
              )}
            </h1>
            <p className="text-xs text-zinc-500">
              Emitido em {formatarDataPtBR(doc.data_emissao)}
              {doc.numero && ` • Nº ${doc.numero}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DocumentoActions
            id={id}
            status={doc.status || 'ativo'}
            tipoSlug={tipoSlug}
            tipoLabel={tipoLabel}
            dadosOriginais={doc.dados}
          />

          <div className="flex border border-zinc-200 ml-2 divide-x divide-zinc-200 h-9">
            <AssinaturasWidget
              tipoDocumento={tipoDocumento}
              documentoId={id}
              verificacaoInicial={verificacao}
              currentUserId={user?.id}
              variant="toolbar"
              disabled={doc.status === 'cancelado'}
            />
          </div>

          <div className="ml-2">
            <PrintButton />
          </div>
        </div>
      </div>

      {/* Banner de cancelamento */}
      {doc.status === 'cancelado' && (
        <div className="print:hidden bg-red-50 border-b border-red-200 p-3 text-center text-red-700 text-sm font-semibold flex items-center justify-center gap-2">
          <Ban size={16} /> Este {tipoLabel.toLowerCase()} foi cancelado e não possui mais validade.
        </div>
      )}

      {/* Container de visualização */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center print:p-0 print:overflow-visible">
        <div id="documento-print-area" className="w-full max-w-[21cm]">
          {children}
        </div>
      </div>
    </div>
  )
}

// Exporta os dados do documento para uso nos layouts
export async function getDocumentoData(id: string) {
  const supabase = await createClient()

  const { data: doc } = await supabase
    .from('documentos_administrativos')
    .select('*')
    .eq('id', id)
    .single()

  const { data: config } = await supabase
    .from('configuracoes')
    .select('*')
    .eq('id', 1)
    .single()

  return { doc, config }
}
