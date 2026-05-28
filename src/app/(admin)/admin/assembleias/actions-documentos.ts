'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function salvarDocumentoMetadata(
  assembleia_id: string,
  tipo: string, // 'ata', 'edital', 'presenca'
  arquivo_url: string,
  nome_arquivo: string,
  tamanho_bytes: number
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('assembleia_documentos')
    .insert({
      assembleia_id,
      tipo,
      arquivo_url,
      nome_arquivo,
      tamanho_bytes
    })

  if (error) {
    console.error('Erro ao salvar metadados do documento:', error)
    throw new Error('Erro ao registrar documento no banco de dados.')
  }

  revalidatePath(`/admin/assembleias/${assembleia_id}`)
}

export async function getDocumentosPorAssembleia(assembleia_id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('assembleia_documentos')
    .select('*')
    .eq('assembleia_id', assembleia_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar documentos:', error)
    return []
  }

  return data
}

export async function excluirDocumento(id: string, arquivo_url: string, assembleia_id: string) {
  const supabase = await createClient()

  // Extrair o nome do arquivo da URL para excluir do storage
  const fileName = arquivo_url.split('/').pop()

  if (fileName) {
    const { error: storageError } = await supabase.storage
      .from('documentos')
      .remove([fileName])

    if (storageError) {
      console.error('Erro ao excluir arquivo do storage:', storageError)
      // Não joga erro aqui para garantir que a linha no banco seja deletada mesmo se o arquivo já não existir
    }
  }

  const { error } = await supabase
    .from('assembleia_documentos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao excluir registro de documento:', error)
    throw new Error('Erro ao excluir documento do banco.')
  }

  revalidatePath(`/admin/assembleias/${assembleia_id}`)
}
