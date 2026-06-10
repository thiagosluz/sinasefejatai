'use server'

import { revalidatePath } from 'next/cache'

import { ActionResponse, handleError } from '@/lib/action-utils'
import { requireAdmin } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'

export async function addPublicacao(formData: FormData): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const titulo = formData.get('titulo') as string
    const categoria = formData.get('categoria') as string
    const data_publicacao = formData.get('data_publicacao') as string
    const file = formData.get('arquivo') as File | null

    if (!titulo || !categoria || !data_publicacao) {
      return { success: false, error: 'Preencha todos os campos obrigatórios' }
    }

    if (!file || file.size === 0 || file.name === 'undefined') {
      return { success: false, error: 'O arquivo PDF é obrigatório.' }
    }

    const allowedTypes = ['application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Apenas arquivos PDF são permitidos.' }
    }
    
    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'Arquivo muito grande. O limite de tamanho é 10MB.' }
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    let arquivo_url = null

    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const { error: uploadError } = await supabase.storage
        .from('documentos_publicos')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false
        })

      if (uploadError) {
        return { success: false, error: 'Falha ao fazer upload do arquivo' }
      }

      const { data: { publicUrl } } = supabase.storage
        .from('documentos_publicos')
        .getPublicUrl(fileName)

      arquivo_url = publicUrl
    } catch (err) {
      return handleError(err, 'Erro ao processar o arquivo')
    }

    const { error } = await supabase.from('publicacoes').insert({
      titulo,
      categoria,
      data_publicacao,
      arquivo_url
    })

    if (error) {
      return { success: false, error: 'Erro ao salvar o documento no banco de dados' }
    }

    revalidatePath('/admin/publicacoes')
    revalidatePath('/documentos')
    
    return { success: true }
  } catch (err) {
    return handleError(err, 'Ocorreu um erro ao registrar a publicação.')
  }
}

export async function deletePublicacao(id: string): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data: publicacao, error: fetchError } = await supabase
      .from('publicacoes')
      .select('arquivo_url')
      .eq('id', id)
      .single()

    if (fetchError || !publicacao) {
      return { success: false, error: 'Publicação não encontrada' }
    }

    if (publicacao.arquivo_url) {
      try {
        const parts = publicacao.arquivo_url.split('/')
        const fileName = parts[parts.length - 1]
        
        await supabase.storage
          .from('documentos_publicos')
          .remove([fileName])
      } catch (err) {
        console.error('Erro ao deletar arquivo físico:', err)
      }
    }

    const { error: deleteError } = await supabase
      .from('publicacoes')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return { success: false, error: 'Falha ao excluir a publicação' }
    }

    revalidatePath('/admin/publicacoes')
    revalidatePath('/documentos')
    
    return { success: true }
  } catch (err) {
    return handleError(err, 'Ocorreu um erro ao excluir a publicação.')
  }
}
