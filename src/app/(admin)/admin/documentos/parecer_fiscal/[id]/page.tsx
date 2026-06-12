import { notFound } from 'next/navigation'

import { getDocumentoVerificacao } from '@/lib/actions-assinaturas'
import { createClient } from '@/lib/supabase/server'

import { DocumentoViewWrapper } from '../../components/documento-view-wrapper'
import { ParecerFiscalLayout } from '../../components/parecer-fiscal-layout'

export default async function VisualizarParecerFiscalPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()

  const { data: doc } = await supabase
    .from('documentos_administrativos')
    .select('*')
    .eq('id', params.id)
    .single()

  const { data: config } = await supabase
    .from('configuracoes')
    .select('*')
    .eq('id', 1)
    .single()

  if (!doc || doc.tipo !== 'parecer_fiscal') notFound()

  const verificacao = await getDocumentoVerificacao('parecer_fiscal', params.id)

  return (
    <DocumentoViewWrapper id={params.id} tipoDocumento="parecer_fiscal">
      <ParecerFiscalLayout
        dados={doc.dados as { conteudo_html?: string }}
        numero={doc.numero}
        config={config}
        verificacao={verificacao}
        status={doc.status || 'ativo'}
      />
    </DocumentoViewWrapper>
  )
}
