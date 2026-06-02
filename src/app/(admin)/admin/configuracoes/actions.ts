'use server'

import { revalidatePath } from 'next/cache'

import { ActionResponse, handleError } from '@/lib/action-utils'
import { createClient } from '@/lib/supabase/server'

export async function saveConfiguracoes(formData: FormData): Promise<ActionResponse> {
  try {
    const supabase = await createClient()

    // Verificar se o usuário está autenticado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const titulo = formData.get('titulo') as string
    const secao_sindical = formData.get('secao_sindical') as string
    const endereco = formData.get('endereco') as string
    const cep = formData.get('cep') as string
    const filiacao = formData.get('filiacao') as string
    const fundacao = formData.get('fundacao') as string
    const removerLogo = formData.get('remover_logo') === 'true'

    if (!titulo || !secao_sindical || !endereco || !cep || !filiacao || !fundacao) {
      return { success: false, error: 'Preencha todos os campos obrigatórios' }
    }

    let logoUrl: string | undefined | null = undefined

    if (removerLogo) {
      logoUrl = null
    } else {
      const logoFile = formData.get('logo') as File | null
      if (logoFile && logoFile.size > 0) {
        // Upload do novo logotipo no Supabase Storage
        const fileExt = logoFile.name.split('.').pop() || 'png'
        const fileName = `logo-${Date.now()}.${fileExt}`

        const arrayBuffer = await logoFile.arrayBuffer()
        const fileBuffer = Buffer.from(arrayBuffer)

        const { error: uploadError } = await supabase.storage
          .from('sistema')
          .upload(fileName, fileBuffer, {
            contentType: logoFile.type,
            upsert: true
          })

        if (uploadError) {
          console.error('Erro no upload do logo:', uploadError)
          return { success: false, error: `Falha ao salvar imagem do logotipo: ${uploadError.message}` }
        }

        // Obter URL pública do arquivo
        const { data: { publicUrl } } = supabase.storage
          .from('sistema')
          .getPublicUrl(fileName)

        logoUrl = publicUrl
      }
    }

    // Preparar dados para o upsert
    const updateData: {
      id: number
      titulo: string
      secao_sindical: string
      endereco: string
      cep: string
      filiacao: string
      fundacao: string
      logo_url?: string | null
      updated_at: string
    } = {
      id: 1,
      titulo,
      secao_sindical,
      endereco,
      cep,
      filiacao,
      fundacao,
      updated_at: new Date().toISOString()
    }

    // Só atualizamos ou removemos logo_url se explicitamente definido
    if (logoUrl !== undefined) {
      updateData.logo_url = logoUrl
    }

    const { error: dbError } = await supabase
      .from('configuracoes')
      .upsert(updateData)

    if (dbError) {
      console.error('Erro ao salvar no banco:', dbError)
      return { success: false, error: `Falha ao salvar as configurações: ${dbError.message}` }
    }

    // Revalidar caminhos que utilizam o cabeçalho
    revalidatePath('/admin/configuracoes')
    revalidatePath('/assembleias')
    revalidatePath('/financeiro/prestacao')

    return { success: true, message: 'Configurações atualizadas com sucesso!' }
  } catch (err: unknown) {
    return handleError(err, 'Falha ao salvar configurações')
  }
}
