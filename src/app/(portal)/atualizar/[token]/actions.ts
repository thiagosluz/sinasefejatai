'use server'

import { redirect } from 'next/navigation'

import { ActionResponse, handleError } from '@/lib/action-utils'
import { createAdminClient } from '@/lib/supabase/admin'
import { AtualizacaoFormData, AtualizacaoSchema } from '@/schemas/atualizacao-schema'

export async function submeterAtualizacao(
  token: string,
  dadosRaw: AtualizacaoFormData,
  turnstileToken: string
): Promise<ActionResponse> {
  try {
    const supabase = createAdminClient()

    // 1. Validação do Cloudflare Turnstile
    if (!turnstileToken) {
      return { success: false, error: 'Verificação de segurança falhou. Atualize a página e tente novamente.' }
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY
    if (!secretKey) {
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
      return { success: false, error: 'Falha na verificação de segurança (Anti-spam). Tente novamente.' }
    }

    // 2. Validação com Zod no servidor
    const validacao = AtualizacaoSchema.safeParse(dadosRaw)
    if (!validacao.success) {
      return { success: false, error: 'Dados preenchidos incorretamente. Verifique os campos.' }
    }

    const novosDados = validacao.data

    // Proteção Anti-Spam (Honeypot + Time-based)
    const { website, timestamp } = novosDados
    const isBot = website || (timestamp && Date.now() - parseInt(timestamp, 10) < 3000)
    if (isBot) {
      redirect(`/atualizar/${token}?sucesso=1`)
    }

    // Remover campos honeypot antes de salvar
    delete novosDados.website
    delete novosDados.timestamp

    // 3. Atualizar no banco de dados
    const { data: solicitacao, error: fetchError } = await supabase
      .from('atualizacoes_cadastrais')
      .select('id, status')
      .eq('token', token)
      .single()

    if (fetchError || !solicitacao) {
      return { success: false, error: 'Link de atualização inválido ou não encontrado.' }
    }

    if (solicitacao.status !== 'PENDENTE_ENVIO') {
      return { success: false, error: 'Esta solicitação já foi enviada e está em análise.' }
    }

    const { error: updateError } = await supabase
      .from('atualizacoes_cadastrais')
      .update({
        novos_dados: novosDados,
        status: 'EM_ANALISE',
        updated_at: new Date().toISOString()
      })
      .eq('token', token)

    if (updateError) {
      return { success: false, error: 'Ocorreu um erro ao enviar sua atualização. Tente novamente.' }
    }

    redirect(`/atualizar/${token}?sucesso=1`)
  } catch (err) {
    return handleError(err, 'Falha ao enviar atualização')
  }
}
