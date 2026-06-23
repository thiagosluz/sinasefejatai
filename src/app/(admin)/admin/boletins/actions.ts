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

export async function dispararBoletimEmLote(id: string): Promise<ActionResponse<{ enviados: number }>> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    // 1. Buscar boletim
    const { data: boletim } = await supabase
      .from('boletins')
      .select('*')
      .eq('id', id)
      .single()

    if (!boletim) {
      return { success: false, error: 'Boletim não encontrado.' }
    }

    if (boletim.status !== 'Publicado') {
      return { success: false, error: 'Apenas boletins publicados podem ser disparados.' }
    }

    if (boletim.enviado_email) {
      return { success: false, error: 'Este boletim já foi disparado por e-mail.' }
    }

    // 2. Buscar Filiados ATIVOS com e-mail
    const { data: filiados } = await supabase
      .from('filiados')
      .select('nome, email')
      .eq('ativo', true)
      .eq('status_filiacao', 'aprovado')
      .not('email', 'is', null)
      .neq('email', '')

    if (!filiados || filiados.length === 0) {
      return { success: false, error: 'Nenhum filiado ativo com e-mail cadastrado foi encontrado para o envio.' }
    }

    // 3. Montar Corpo do E-mail HTML
    const publicLink = `https://www.sinasefejatai.org.br/boletins/${boletim.id}`
    const subjectTitle = `[Boletim SINASEFE Jataí] ${boletim.titulo}`

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: #991b1b; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">SINASEFE Jataí/GO</h1>
        </div>
        <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #111827; font-size: 18px; margin-top: 0; text-align: center;">
            ${boletim.titulo}
          </h2>

          <div style="text-align: center; margin: 24px 0;">
            <img src="${boletim.capa_url}" alt="Capa do Boletim" style="max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb;" />
          </div>

          <div style="color: #374151; line-height: 1.6; text-align: justify;">
            ${boletim.corpo_texto}
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${publicLink}" style="background-color: #991b1b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
              Acessar Boletim Completo no Portal
            </a>
          </div>

          ${boletim.link_externo ? `
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${boletim.link_externo}" style="color: #991b1b; text-decoration: underline;">
              Link Externo Adicional
            </a>
          </div>
          ` : ''}

          <hr style="border-color: #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            Você está recebendo este e-mail pois consta como filiado ativo na base do SINASEFE Jataí.<br/>
            Se você não é mais filiado ou não deseja receber essas comunicações, entre em contato com a secretaria.
          </p>
        </div>
      </div>
    `

    // 4. Disparar Edge Function em background (fire-and-forget)
    const edgeFunctionSecret = process.env.EDGE_FUNCTION_SECRET
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!edgeFunctionSecret || !supabaseUrl) {
      return { success: false, error: 'Configuração da Edge Function não encontrada no ambiente.' }
    }

    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/disparo-emails`

    const payload = {
      filiados,
      subject: subjectTitle,
      html: htmlContent,
      attachment: boletim.arquivo_pdf_url
        ? { filename: `Boletim_${boletim.titulo.replace(/\s+/g, '_')}.pdf`, url: boletim.arquivo_pdf_url }
        : undefined,
      replyTo: 'sinasefe.jatai.go@gmail.com'
    }

    // Fire-and-forget: não esperamos a resposta completa
    fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${edgeFunctionSecret}`,
      },
      body: JSON.stringify(payload),
    }).catch(err => {
      console.error('[dispararBoletimEmLote] Erro ao chamar Edge Function:', err)
    })

    // 5. Atualizar no banco indicando que o e-mail foi enviado
    await supabase
      .from('boletins')
      .update({ enviado_email: true })
      .eq('id', id)

    revalidatePath('/admin/boletins')

    return { 
      success: true, 
      data: { enviados: filiados.length }, 
      message: `Envio iniciado! ${filiados.length} filiados serão notificados em breve.` 
    }

  } catch (err) {
    return handleError(err, 'Falha ao processar disparo do boletim.')
  }
}
