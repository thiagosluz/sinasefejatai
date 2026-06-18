'use server'

import { redirect } from 'next/navigation'

import { ActionResponse, handleError } from '@/lib/action-utils'
import { notificarPedidoFiliacao } from '@/lib/email'
import { createClient } from '@/lib/supabase/server'
import { FiliacaoFormData, FiliacaoSchema } from '@/schemas/filiacao-schema'

export async function solicitarFiliacao(dadosRaw: FiliacaoFormData): Promise<ActionResponse> {
  try {
    const supabase = await createClient()

    // 1. Validação com Zod no servidor
    const validacao = FiliacaoSchema.safeParse(dadosRaw)
    if (!validacao.success) {
      return { success: false, error: 'Dados preenchidos incorretamente. Verifique os campos.' }
    }

    const { 
      nome, email, telefone, siape, unidade_lotacao, campus, categoria, situacao, 
      data_nascimento, nome_pai, nome_mae, cpf, rg, sexo,
      endereco_rua, endereco_bairro, endereco_cep, endereco_cidade, endereco_estado,
      website, timestamp 
    } = validacao.data

    // 2. Proteção Anti-Spam (Honeypot + Time-based)
    const isBot = website || (timestamp && Date.now() - parseInt(timestamp, 10) < 3000)
    if (isBot) {
      console.warn('[filiacao] Submissão bloqueada por suspeita de bot (honeypot/time-based).')
      redirect('/filiacao?sucesso=1')
    }

    const { data: newFiliado, error } = await supabase.from('filiados').insert({
      nome,
      email,
      telefone: telefone || null,
      siape,
      unidade_lotacao: unidade_lotacao || null,
      campus: campus || null,
      categoria,
      situacao,
      data_nascimento: data_nascimento || null,
      nome_pai: nome_pai || null,
      nome_mae: nome_mae || null,
      cpf: cpf || null,
      rg: rg || null,
      sexo: sexo || null,
      endereco_rua: endereco_rua || null,
      endereco_bairro: endereco_bairro || null,
      endereco_cep: endereco_cep || null,
      endereco_cidade: endereco_cidade || null,
      endereco_estado: endereco_estado || null,
      status_filiacao: 'pendente',
      ativo: false,
    }).select('id').single()

    if (error || !newFiliado) {
      console.error(error)
      return { success: false, error: 'Ocorreu um erro ao salvar pedido de filiação. Tente novamente ou entre em contato com o sindicato.' }
    }

    // Notificar diretoria via Resend
    try {
      await notificarPedidoFiliacao({ nome, email, siape, categoria, situacao })
    } catch (emailError) {
      console.error('[filiacao] Falha ao enviar e-mail de notificação:', emailError)
    }

    redirect(`/filiacao?sucesso=1&id=${newFiliado.id}`)
  } catch (err) {
    return handleError(err, 'Falha ao solicitar filiação')
  }
}
