'use server'

import { createClient } from '@/lib/supabase/server'
import { notificarPedidoFiliacao } from '@/lib/email'
import { redirect } from 'next/navigation'
import { ActionResponse, handleError } from '@/lib/action-utils'

export async function solicitarFiliacao(formData: FormData): Promise<ActionResponse> {
  try {
    const supabase = await createClient()

    const nome = (formData.get('nome') as string)?.trim()
    const email = (formData.get('email') as string)?.trim()
    const telefone = (formData.get('telefone') as string)?.trim()
    const siape = (formData.get('siape') as string)?.trim()
    const unidade_lotacao = (formData.get('unidade_lotacao') as string)?.trim()
    const campus = (formData.get('campus') as string)?.trim()
    const categoria = formData.get('categoria') as string
    const situacao = formData.get('situacao') as string

    if (!nome || !email || !siape || !categoria || !situacao) {
      return { success: false, error: 'Preencha todos os campos obrigatórios' }
    }

    const { error } = await supabase.from('filiados').insert({
      nome,
      email,
      telefone: telefone || null,
      siape,
      unidade_lotacao: unidade_lotacao || null,
      campus: campus || null,
      categoria,
      situacao,
      status_filiacao: 'pendente',
      ativo: false,
    })

    if (error) {
      return { success: false, error: 'Ocorreu um erro ao salvar pedido de filiação. Tente novamente ou entre em contato com o sindicato.' }
    }

    // Notificar diretoria via Resend
    try {
      await notificarPedidoFiliacao({ nome, email, siape, categoria, situacao })
    } catch (emailError) {
      console.error('[filiacao] Falha ao enviar e-mail de notificação:', emailError)
    }

    redirect('/filiacao?sucesso=1')
  } catch (err) {
    return handleError(err, 'Falha ao solicitar filiação')
  }
}
