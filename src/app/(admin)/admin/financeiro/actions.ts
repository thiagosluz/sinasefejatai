'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addTransacao(formData: FormData) {
  const supabase = await createClient()

  const tipo = formData.get('tipo') as 'Entrada' | 'Saída'
  const data = formData.get('data') as string
  const descricao = formData.get('descricao') as string
  const valorRaw = formData.get('valor') as string
  const categoria = formData.get('categoria') as string
  const file = formData.get('comprovante') as File | null

  if (!tipo || !data || !descricao || !valorRaw || !categoria) {
    redirect('/admin/financeiro?error=Preencha todos os campos obrigatórios')
  }

  // Parse valor as numeric float
  const valor = parseFloat(valorRaw.replace(',', '.'))
  if (isNaN(valor) || valor <= 0) {
    redirect('/admin/financeiro?error=O valor inserido deve ser maior que zero')
  }

  let comprovante_url = null

  // Handle Receipt Upload
  if (file && file.size > 0 && file.name !== 'undefined') {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg']
    if (!allowedTypes.includes(file.type)) {
      redirect('/admin/financeiro?error=Formato de comprovante não suportado. Use PDF, PNG ou JPEG.')
    }
    
    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      redirect('/admin/financeiro?error=Comprovante muito grande. O limite de tamanho é 5MB.')
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`

    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const { error: uploadError } = await supabase.storage
        .from('comprovantes')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false
        })

      if (uploadError) {
        console.error('Erro no upload do comprovante:', uploadError)
        redirect('/admin/financeiro?error=Falha ao carregar o arquivo de comprovante')
      }

      const { data: { publicUrl } } = supabase.storage
        .from('comprovantes')
        .getPublicUrl(fileName)

      comprovante_url = publicUrl
    } catch (err) {
      console.error('Falha ao processar arquivo no servidor:', err)
      redirect('/admin/financeiro?error=Erro ao salvar o comprovante')
    }
  }

  const { error } = await supabase.from('financeiro').insert({
    tipo,
    data,
    descricao,
    valor,
    categoria,
    comprovante_url
  })

  if (error) {
    console.error('Erro ao registrar transação:', error)
    redirect('/admin/financeiro?error=Erro ao salvar o lançamento no banco de dados')
  }

  revalidatePath('/financeiro')
  revalidatePath('/financeiro/prestacao')
  
  redirect('/admin/financeiro?success=Lançamento registrado com sucesso!')
}

export async function deleteTransacao(id: string) {
  const supabase = await createClient()

  // Buscar lançamento para ver se existe comprovante
  const { data: transacao, error: fetchError } = await supabase
    .from('financeiro')
    .select('comprovante_url')
    .eq('id', id)
    .single()

  if (fetchError || !transacao) {
    throw new Error('Lançamento não encontrado')
  }

  // Se houver comprovante, deletá-lo do Storage
  if (transacao.comprovante_url) {
    try {
      const parts = transacao.comprovante_url.split('/')
      const fileName = parts[parts.length - 1]
      
      await supabase.storage
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
    console.error('Erro ao excluir transação:', deleteError)
    throw new Error('Falha ao excluir o lançamento')
  }

  revalidatePath('/financeiro')
  revalidatePath('/financeiro/prestacao')
}

export async function updateTransacao(id: string, formData: FormData) {
  const supabase = await createClient()

  const tipo = formData.get('tipo') as 'Entrada' | 'Saída'
  const data = formData.get('data') as string
  const descricao = formData.get('descricao') as string
  const valorRaw = formData.get('valor') as string
  const categoria = formData.get('categoria') as string
  const file = formData.get('comprovante') as File | null
  const manterComprovante = formData.get('manterComprovante') === 'true'

  if (!tipo || !data || !descricao || !valorRaw || !categoria) {
    redirect('/admin/financeiro?error=Preencha todos os campos obrigatórios')
  }

  // Parse valor as numeric float
  const valor = parseFloat(valorRaw.replace(',', '.'))
  if (isNaN(valor) || valor <= 0) {
    redirect('/admin/financeiro?error=O valor inserido deve ser maior que zero')
  }

  // 1. Obter o lançamento atual do banco para saber se já tem um comprovante
  const { data: transacaoAtual, error: fetchError } = await supabase
    .from('financeiro')
    .select('comprovante_url')
    .eq('id', id)
    .single()

  if (fetchError || !transacaoAtual) {
    redirect('/admin/financeiro?error=Lançamento não encontrado para edição')
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
        
        await supabase.storage
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
      redirect('/admin/financeiro?error=Formato de comprovante não suportado. Use PDF, PNG ou JPEG.')
    }
    
    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      redirect('/admin/financeiro?error=Comprovante muito grande. O limite de tamanho é 5MB.')
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`

    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const { error: uploadError } = await supabase.storage
        .from('comprovantes')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false
        })

      if (uploadError) {
        console.error('Erro no upload do novo comprovante:', uploadError)
        redirect('/admin/financeiro?error=Falha ao carregar o arquivo de comprovante')
      }

      const { data: { publicUrl } } = supabase.storage
        .from('comprovantes')
        .getPublicUrl(fileName)

      comprovante_url = publicUrl
    } catch (err) {
      console.error('Falha ao processar novo comprovante no servidor:', err)
      redirect('/admin/financeiro?error=Erro ao salvar o comprovante')
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
      categoria,
      comprovante_url
    })
    .eq('id', id)

  if (updateError) {
    console.error('Erro ao atualizar transação:', updateError)
    redirect('/admin/financeiro?error=Erro ao atualizar o lançamento no banco de dados')
  }

  revalidatePath('/financeiro')
  revalidatePath('/financeiro/prestacao')
  
  redirect('/admin/financeiro?success=Lançamento atualizado com sucesso!')
}
