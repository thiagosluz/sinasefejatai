'use server'

import { revalidatePath } from 'next/cache'

import { ActionResponse, handleError } from '@/lib/action-utils'
import { requireAdmin } from '@/lib/dal'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function addTransacao(formData: FormData): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const tipo = formData.get('tipo') as 'Entrada' | 'Saída'
    const data = formData.get('data') as string
    const descricao = formData.get('descricao') as string
    const valorRaw = formData.get('valor') as string
    const categoria_id = formData.get('categoria_id') as string
    const file = formData.get('comprovante') as File | null

    if (!tipo || !data || !descricao || !valorRaw || !categoria_id) {
      return { success: false, error: 'Preencha todos os campos obrigatórios' }
    }

    // Parse valor as numeric float
    const valor = parseFloat(valorRaw.replace(',', '.'))
    if (isNaN(valor) || valor <= 0) {
      return { success: false, error: 'O valor inserido deve ser maior que zero' }
    }

  let comprovante_url = null

    // Handle Receipt Upload
    if (file && file.size > 0 && file.name !== 'undefined') {
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg']
      if (!allowedTypes.includes(file.type)) {
        return { success: false, error: 'Formato de comprovante não suportado. Use PDF, PNG ou JPEG.' }
      }
      
      // 5MB limit
      if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: 'Comprovante muito grande. O limite de tamanho é 5MB.' }
      }

    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`

    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const supabaseAdmin = createAdminClient()
      const { error: uploadError } = await supabaseAdmin.storage
        .from('comprovantes')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false
        })

        if (uploadError) {
          console.error('Upload error in addTransacao:', uploadError)
          return { success: false, error: 'Falha ao carregar o arquivo de comprovante' }
        }

        const { data: { publicUrl } } = supabase.storage
          .from('comprovantes')
          .getPublicUrl(fileName)

        comprovante_url = publicUrl
      } catch (err) {
        return handleError(err, 'Erro ao salvar o comprovante')
      }
    }

    const { error } = await supabase.from('financeiro').insert({
      tipo,
      data,
      descricao,
      valor,
      categoria_id,
      comprovante_url
    })

    if (error) {
      return { success: false, error: 'Erro ao salvar o lançamento no banco de dados' }
    }

    revalidatePath('/financeiro')
    revalidatePath('/financeiro/prestacao')
    
    return { success: true }
  } catch (err) {
    return handleError(err, 'Ocorreu um erro ao registrar a transação.')
  }
}

export async function deleteTransacao(id: string): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    // Buscar lançamento para ver se existe comprovante
    const { data: transacao, error: fetchError } = await supabase
      .from('financeiro')
      .select('comprovante_url')
      .eq('id', id)
      .single()

    if (fetchError || !transacao) {
      return { success: false, error: 'Lançamento não encontrado' }
    }

  // Se houver comprovante, deletá-lo do Storage
  if (transacao.comprovante_url) {
    try {
      const parts = transacao.comprovante_url.split('/')
      const fileName = parts[parts.length - 1]
      
      const supabaseAdmin = createAdminClient()
      await supabaseAdmin.storage
        .from('comprovantes')
        .remove([fileName])
    } catch (err) {
      console.error('Erro ao deletar arquivo físico de comprovante:', err)
    }
  }

    // Deletar o registro
    const { error: deleteError } = await supabase
      .from('financeiro')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return { success: false, error: 'Falha ao excluir o lançamento' }
    }

    revalidatePath('/financeiro')
    revalidatePath('/financeiro/prestacao')
    
    return { success: true }
  } catch (err) {
    return handleError(err, 'Ocorreu um erro ao excluir a transação.')
  }
}

export async function updateTransacao(id: string, formData: FormData): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const tipo = formData.get('tipo') as 'Entrada' | 'Saída'
    const data = formData.get('data') as string
    const descricao = formData.get('descricao') as string
    const valorRaw = formData.get('valor') as string
    const categoria_id = formData.get('categoria_id') as string
    const file = formData.get('comprovante') as File | null
    const manterComprovante = formData.get('manterComprovante') === 'true'

    if (!tipo || !data || !descricao || !valorRaw || !categoria_id) {
      return { success: false, error: 'Preencha todos os campos obrigatórios' }
    }

    // Parse valor as numeric float
    const valor = parseFloat(valorRaw.replace(',', '.'))
    if (isNaN(valor) || valor <= 0) {
      return { success: false, error: 'O valor inserido deve ser maior que zero' }
    }

    // 1. Obter o lançamento atual do banco para saber se já tem um comprovante
    const { data: transacaoAtual, error: fetchError } = await supabase
      .from('financeiro')
      .select('comprovante_url')
      .eq('id', id)
      .single()

    if (fetchError || !transacaoAtual) {
      return { success: false, error: 'Lançamento não encontrado para edição' }
    }

  let comprovante_url = transacaoAtual.comprovante_url

  // Se o usuário explicitamente pediu para remover o comprovante ou se enviou um novo
  const enviouNovoArquivo = file && file.size > 0 && file.name !== 'undefined'
  
  if (!manterComprovante || enviouNovoArquivo) {
    // Remover arquivo físico antigo se existir
    if (transacaoAtual.comprovante_url) {
      try {
        const parts = transacaoAtual.comprovante_url.split('/')
        const fileName = parts[parts.length - 1]
        
        const supabaseAdmin = createAdminClient()
        await supabaseAdmin.storage
          .from('comprovantes')
          .remove([fileName])
      } catch (err) {
        console.error('Erro ao deletar arquivo de comprovante antigo:', err)
      }
    }
    comprovante_url = null
  }

  // 2. Se enviou novo comprovante, fazer upload
    if (enviouNovoArquivo) {
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg']
      if (!allowedTypes.includes(file.type)) {
        return { success: false, error: 'Formato de comprovante não suportado. Use PDF, PNG ou JPEG.' }
      }
      
      // 5MB limit
      if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: 'Comprovante muito grande. O limite de tamanho é 5MB.' }
      }

    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`

    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const supabaseAdmin = createAdminClient()
      const { error: uploadError } = await supabaseAdmin.storage
        .from('comprovantes')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false
        })

        if (uploadError) {
          console.error('Upload error in updateTransacao:', uploadError)
          return { success: false, error: 'Falha ao carregar o arquivo de comprovante' }
        }

        const { data: { publicUrl } } = supabase.storage
          .from('comprovantes')
          .getPublicUrl(fileName)

        comprovante_url = publicUrl
      } catch (err) {
        return handleError(err, 'Erro ao salvar o comprovante')
      }
    }

    // 3. Atualizar os dados no banco
    const { error: updateError } = await supabase
      .from('financeiro')
      .update({
        tipo,
        data,
        descricao,
        valor,
        categoria_id,
        comprovante_url
      })
      .eq('id', id)

    if (updateError) {
      return { success: false, error: 'Erro ao atualizar o lançamento no banco de dados' }
    }

    revalidatePath('/financeiro')
    revalidatePath('/financeiro/prestacao')
    
    return { success: true }
  } catch (err) {
    return handleError(err, 'Ocorreu um erro ao atualizar a transação.')
  }
}
