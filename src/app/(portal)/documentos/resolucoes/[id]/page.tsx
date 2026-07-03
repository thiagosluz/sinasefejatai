import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PrintButton } from '@/app/(admin)/admin/documentos/components/print-button'
import { ResolucaoLayout } from '@/app/(admin)/admin/documentos/components/resolucao-layout'
import { getDocumentoVerificacao } from '@/lib/actions-assinaturas'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export default async function VisualizarResolucaoPublicaPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = createAdminClient()

  // Buscar o documento e verificar se ele é público
  const { data: doc } = await supabase
    .from('documentos_administrativos')
    .select('*')
    .eq('id', params.id)
    .single()

  const { data: config } = await supabase.from('configuracoes').select('*').eq('id', 1).single()

  if (!doc || !doc.is_publico || doc.status !== 'ativo') {
    notFound()
  }

  const verificacao = await getDocumentoVerificacao('resolucao_normativa', params.id)

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col print:block print:bg-white print:min-h-0 print:h-auto">
      {/* Header Público */}
      <div className="print:hidden bg-brand-ink text-brand-cream border-b border-brand-ink p-4 sticky top-0 z-50 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/documentos"
            className="flex items-center gap-2 text-brand-cream/80 hover:text-white transition-colors"
            title="Voltar para a lista"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline font-semibold uppercase tracking-wider text-xs">Voltar</span>
          </Link>
          <div className="h-6 w-[1px] bg-brand-cream/20"></div>
          <div>
            <h1 className="font-bold text-white text-sm sm:text-base">
              {doc.titulo}
            </h1>
            <p className="text-[10px] text-brand-cream/60 uppercase tracking-wider">
              Portal da Transparência
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PrintButton />
        </div>
      </div>

      {/* Container de visualização */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center print:block print:p-0 print:overflow-visible print:h-auto">
        <div className="w-full max-w-[21cm] bg-white shadow-xl print:shadow-none">
          <ResolucaoLayout 
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
