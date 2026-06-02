'use server'

import { createClient } from '@/lib/supabase/server'
import { notificarNovoContato } from '@/lib/email'
import { redirect } from 'next/navigation'
import { ActionResponse, handleError } from '@/lib/action-utils'

export async function enviarMensagem(formData: FormData): Promise<ActionResponse> {
  try {
    const supabase = await createClient()

    const nome = (formData.get('nome') as string)?.trim()
    const email = (formData.get('email') as string)?.trim()
    const assunto = (formData.get('assunto') as string)?.trim()
    const mensagem = (formData.get('mensagem') as string)?.trim()

    if (!nome || !email || !mensagem) {
      return { success: false, error: 'Preencha os campos obrigatórios: Nome, E-mail e Mensagem.' }
    }

    const { error } = await supabase.from('mensagens').insert({
      nome,
      email,
      assunto: assunto || null,
      mensagem,
    })

    if (error) {
      return { success: false, error: 'Ocorreu um erro ao enviar. Tente novamente ou entre em contato por e-mail.' }
    }

    // Notificar diretoria por e-mail via Resend (erro aqui não bloqueia o usuário)
    try {
      await notificarNovoContato({ nome, email, assunto, mensagem })
    } catch (emailError) {
      console.error('[contato] Falha ao enviar e-mail de notificação:', emailError)
    }

    redirect('/contato?sucesso=1')
  } catch (err) {
    return handleError(err, 'Falha ao enviar mensagem de contato')
  }
}
