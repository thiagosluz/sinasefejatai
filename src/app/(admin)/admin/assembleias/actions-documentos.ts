'use server'

import { revalidatePath } from 'next/cache'

import { ActionResponse, handleError } from '@/lib/action-utils'
import { createClient } from '@/lib/supabase/server'

export async function salvarDocumentoMetadata(
  assembleia_id: string,
  tipo: string, // 'ata', 'edital', 'presenca'
  arquivo_url: string,
  nome_arquivo: string,
  tamanho_bytes: number
): Promise<ActionResponse> {
  try {
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
      return { success: false, error: 'Erro ao registrar documento no banco de dados.' }
    }

    revalidatePath(`/admin/assembleias/${assembleia_id}`)
    return { success: true }
  } catch (err) {
    return handleError(err, 'Falha ao salvar metadados do documento')
  }
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

export async function excluirDocumento(id: string, arquivo_url: string, assembleia_id: string): Promise<ActionResponse> {
  try {
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
      return { success: false, error: 'Erro ao excluir documento do banco.' }
    }

    revalidatePath(`/admin/assembleias/${assembleia_id}`)
    return { success: true }
  } catch (err) {
    return handleError(err, 'Falha ao excluir documento.')
  }
}
