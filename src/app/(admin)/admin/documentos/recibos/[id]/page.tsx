import { ArrowLeft, Ban } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AssinaturasWidget } from '@/components/assinaturas-widget'
import { getDocumentoVerificacao } from '@/lib/actions-assinaturas'
import { formatarDataPtBR } from '@/lib/date-utils'
import { createClient } from '@/lib/supabase/server'

import { PrintButton } from '../../components/print-button'
import { ReciboLayout } from '../../components/recibo-layout'

import { ReciboActions } from './recibo-actions'

export default async function VisualizarReciboPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()

  // Buscar usuário logado (para habilitar o widget de assinatura)
  const { data: { user } } = await supabase.auth.getUser()

  const { data: doc } = await supabase
    .from('documentos_administrativos')
    .select('*')
    .eq('id', params.id)
    .single()

  // Buscar configurações de cabeçalho
  const { data: config } = await supabase
    .from('configuracoes')
    .select('*')
    .eq('id', 1)
    .single()

  if (!doc) {
    notFound()
  }

  // Buscar verificação de assinatura
  const verificacao = await getDocumentoVerificacao('recibo', params.id)

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
          {/* Ações de Cancelamento / Retificação */}
          <ReciboActions id={params.id} status={doc.status || 'ativo'} dadosOriginais={doc.dados} possuiAssinatura={!!verificacao} />

          {/* Assinatura Eletrônica (Sempre desabilitada se o recibo estiver cancelado) */}
          <div className="flex border border-zinc-200 ml-2 divide-x divide-zinc-200 h-9">
            <AssinaturasWidget
              tipoDocumento="recibo"
              documentoId={params.id}
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

      {/* Banner de aviso de cancelamento visível apenas na tela */}
      {doc.status === 'cancelado' && (
        <div className="print:hidden bg-red-50 border-b border-red-200 p-3 text-center text-red-700 text-sm font-semibold flex items-center justify-center gap-2">
          <Ban size={16} /> Este recibo foi cancelado e não possui mais validade.
        </div>
      )}

      {/* Container de visualização */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center print:p-0 print:overflow-visible">
        <div id="recibo-print-area" className="w-full max-w-[21cm]">
          <ReciboLayout 
            dados={doc.dados} 
            numero={doc.numero}
            config={config} 
            verificacao={verificacao} 
            status={doc.status || 'ativo'} 
          />
        </div>
      </div>
    </div>
  )
}
