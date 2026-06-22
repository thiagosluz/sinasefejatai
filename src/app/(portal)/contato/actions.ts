'use server'

import { redirect } from 'next/navigation'

import { ActionResponse, handleError } from '@/lib/action-utils'
import { notificarNovoContato } from '@/lib/email'
import { createClient } from '@/lib/supabase/server'
import { ContatoFormData, ContatoSchema } from '@/schemas/contato-schema'

export async function enviarMensagem(dadosRaw: ContatoFormData, turnstileToken: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()

    // 1. Validação do Cloudflare Turnstile
    if (!turnstileToken) {
      return { success: false, error: 'Verificação de segurança falhou. Atualize a página e tente novamente.' }
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY
    if (!secretKey) {
      console.error('[contato] TURNSTILE_SECRET_KEY não configurada no ambiente.')
      return { success: false, error: 'Erro de configuração do servidor.' }
    }

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${turnstileToken}`,
    })

    const verifyData = await verifyRes.json()
    if (!verifyData.success) {
      console.warn('[contato] Turnstile validation failed:', verifyData)
      return { success: false, error: 'Falha na verificação de segurança (Anti-spam). Tente novamente.' }
    }

    // 1. Validação com Zod no servidor
    const validacao = ContatoSchema.safeParse(dadosRaw)
    if (!validacao.success) {
      return { success: false, error: 'Dados preenchidos incorretamente. Verifique os campos.' }
    }

    const { nome, email, assunto, mensagem, website, timestamp } = validacao.data

    // 2. Proteção Anti-Spam (Honeypot + Time-based)
    const isBot = website || (timestamp && Date.now() - parseInt(timestamp, 10) < 3000)
    if (isBot) {
      console.warn('[contato] Submissão bloqueada por suspeita de bot (honeypot/time-based).')
      redirect('/contato?sucesso=1')
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
