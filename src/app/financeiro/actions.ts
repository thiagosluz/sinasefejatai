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
    redirect('/financeiro?error=Preencha todos os campos obrigatórios')
  }

  // Parse valor as numeric float
  const valor = parseFloat(valorRaw.replace(',', '.'))
  if (isNaN(valor) || valor <= 0) {
    redirect('/financeiro?error=O valor inserido deve ser maior que zero')
  }

  let comprovante_url = null

  // Handle Receipt Upload
  if (file && file.size > 0 && file.name !== 'undefined') {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg']
    if (!allowedTypes.includes(file.type)) {
      redirect('/financeiro?error=Formato de comprovante não suportado. Use PDF, PNG ou JPEG.')
    }
    
    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      redirect('/financeiro?error=Comprovante muito grande. O limite de tamanho é 5MB.')
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
        redirect('/financeiro?error=Falha ao carregar o arquivo de comprovante')
      }

      const { data: { publicUrl } } = supabase.storage
        .from('comprovantes')
        .getPublicUrl(fileName)

      comprovante_url = publicUrl
    } catch (err) {
      console.error('Falha ao processar arquivo no servidor:', err)
      redirect('/financeiro?error=Erro ao salvar o comprovante')
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
    redirect('/financeiro?error=Erro ao salvar o lançamento no banco de dados')
  }

  revalidatePath('/financeiro')
  revalidatePath('/financeiro/prestacao')
  
  redirect('/financeiro?success=Lançamento registrado com sucesso!')
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
