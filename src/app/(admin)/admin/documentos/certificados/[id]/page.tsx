import { notFound } from 'next/navigation'

import { getDocumentoVerificacao } from '@/lib/actions-assinaturas'
import { createClient } from '@/lib/supabase/server'

import { CertificadoLayout } from '../../components/certificado-layout'
import { DocumentoViewWrapper } from '../../components/documento-view-wrapper'

export default async function VisualizarCertificadoPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()
  const { data: doc } = await supabase.from('documentos_administrativos').select('*').eq('id', params.id).single()
  const { data: config } = await supabase.from('configuracoes').select('*').eq('id', 1).single()
  if (!doc) notFound()
  const verificacao = await getDocumentoVerificacao('certificado', params.id)

  return (
    <DocumentoViewWrapper id={params.id} tipoDocumento="certificado">
      <CertificadoLayout dados={doc.dados} numero={doc.numero} config={config} verificacao={verificacao} status={doc.status || 'ativo'} />
    </DocumentoViewWrapper>
  )
}
