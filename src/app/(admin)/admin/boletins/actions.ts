'use server'

import { revalidatePath } from 'next/cache'

import { ActionResponse, handleError } from '@/lib/action-utils'
import { requireAdmin } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'

export async function salvarBoletim(formData: FormData, id?: string): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const titulo = formData.get('titulo') as string
    const data_publicacao = formData.get('data_publicacao') as string
    const status = formData.get('status') as string
    const corpo_texto = formData.get('corpo_texto') as string
    const link_externo = formData.get('link_externo') as string | null

    const capaFile = formData.get('capa') as File | null
    const pdfFile = formData.get('arquivo_pdf') as File | null

    if (!titulo || !data_publicacao || !status || !corpo_texto) {
      return { success: false, error: 'Preencha os campos obrigatórios (Título, Data, Status e Corpo do texto).' }
    }

    let capa_url = formData.get('capa_url_existente') as string | null
    let arquivo_pdf_url = formData.get('pdf_url_existente') as string | null

    // Upload Capa (Imagem)
    if (capaFile && capaFile.size > 0 && capaFile.name !== 'undefined') {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(capaFile.type)) {
        return { success: false, error: 'A capa deve ser uma imagem (JPG, PNG ou WEBP).' }
      }
      if (capaFile.size > 5 * 1024 * 1024) {
        return { success: false, error: 'A capa não pode exceder 5MB.' }
      }

      const fileExt = capaFile.name.split('.').pop()
      const fileName = `capas/${crypto.randomUUID()}.${fileExt}`

      try {
        const bytes = await capaFile.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const { error: uploadError } = await supabase.storage
          .from('boletins')
          .upload(fileName, buffer, { contentType: capaFile.type })

        if (uploadError) throw new Error('Falha ao fazer upload da capa')

        const { data: { publicUrl } } = supabase.storage
          .from('boletins')
          .getPublicUrl(fileName)

        capa_url = publicUrl
      } catch (err) {
        return handleError(err, 'Erro ao processar a imagem de capa')
      }
    }

    // Upload PDF
    if (pdfFile && pdfFile.size > 0 && pdfFile.name !== 'undefined') {
      if (pdfFile.type !== 'application/pdf') {
        return { success: false, error: 'O anexo deve ser um arquivo PDF.' }
      }
      if (pdfFile.size > 15 * 1024 * 1024) {
        return { success: false, error: 'O PDF não pode exceder 15MB.' }
      }

      const fileExt = pdfFile.name.split('.').pop()
      const fileName = `pdfs/${crypto.randomUUID()}.${fileExt}`

      try {
        const bytes = await pdfFile.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const { error: uploadError } = await supabase.storage
          .from('boletins')
          .upload(fileName, buffer, { contentType: pdfFile.type })

        if (uploadError) throw new Error('Falha ao fazer upload do PDF')

        const { data: { publicUrl } } = supabase.storage
          .from('boletins')
          .getPublicUrl(fileName)

        arquivo_pdf_url = publicUrl
      } catch (err) {
        return handleError(err, 'Erro ao processar o arquivo PDF')
      }
    }

    if (!capa_url) {
      return { success: false, error: 'A imagem de capa é obrigatória.' }
    }

    const payload = {
      titulo,
      data_publicacao,
      status,
      corpo_texto,
      link_externo,
      capa_url,
      arquivo_pdf_url,
    }

    if (id) {
      const { error } = await supabase.from('boletins').update(payload).eq('id', id)
      if (error) return { success: false, error: 'Erro ao atualizar o boletim' }
    } else {
      const { error } = await supabase.from('boletins').insert(payload)
      if (error) return { success: false, error: 'Erro ao criar o boletim' }
    }

    revalidatePath('/admin/boletins')
    revalidatePath('/boletins')
    
    return { success: true }
  } catch (err) {
    return handleError(err, 'Ocorreu um erro ao salvar o boletim.')
  }
}

export async function excluirBoletim(id: string): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data: boletim, error: fetchError } = await supabase
      .from('boletins')
      .select('capa_url, arquivo_pdf_url')
      .eq('id', id)
      .single()

    if (fetchError || !boletim) {
      return { success: false, error: 'Boletim não encontrado' }
    }

    // Deletar arquivos do storage se existirem
    const filesToRemove = []
    if (boletim.capa_url) {
      const parts = boletim.capa_url.split('/')
      filesToRemove.push(`capas/${parts[parts.length - 1]}`)
    }
    if (boletim.arquivo_pdf_url) {
      const parts = boletim.arquivo_pdf_url.split('/')
      filesToRemove.push(`pdfs/${parts[parts.length - 1]}`)
    }

    if (filesToRemove.length > 0) {
      await supabase.storage.from('boletins').remove(filesToRemove)
    }

    const { error: deleteError } = await supabase
      .from('boletins')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return { success: false, error: 'Falha ao excluir o boletim' }
    }

    revalidatePath('/admin/boletins')
    revalidatePath('/boletins')
    
    return { success: true }
  } catch (err) {
    return handleError(err, 'Ocorreu um erro ao excluir o boletim.')
  }
}
