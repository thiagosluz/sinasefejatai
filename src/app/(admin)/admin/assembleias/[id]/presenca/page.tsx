import { notFound } from 'next/navigation'

import { getDocumentoVerificacao } from '@/lib/actions-assinaturas'
import { createClient } from '@/lib/supabase/server'

import PresencaCliente from './presenca-cliente'

export default async function ListaPresencaPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()

  // Buscar usuário logado
  const { data: { user } } = await supabase.auth.getUser()

  // Buscar assembleia
  const { data: assembleia } = await supabase
    .from('assembleias')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!assembleia) {
    notFound()
  }

  // Buscar configuração do cabeçalho
  const { data: config } = await supabase
    .from('configuracoes')
    .select('*')
    .eq('id', 1)
    .single()

  // Buscar filiados ativos
  const { data: filiados } = await supabase
    .from('filiados')
    .select('nome, siape')
    .eq('ativo', true)
    .order('nome', { ascending: true })

  // Buscar documento anexado (Lista de Presença)
  const { data: documentos } = await supabase
    .from('assembleia_documentos')
    .select('id, arquivo_url, nome_arquivo')
    .eq('assembleia_id', params.id)
    .eq('tipo', 'presenca')
    
  const documentoPresenca = documentos?.[0] || null

  // Buscar lacre de verificação (para lista de presença usamos ID da assembleia)
  const verificacao = await getDocumentoVerificacao('presenca', assembleia.id)

  return (
    <PresencaCliente 
      assembleia={assembleia}
      config={config}
      filiados={filiados || []}
      documentoExistente={documentoPresenca}
      verificacaoInicial={verificacao}
      currentUserId={user?.id}
    />
  )
}
