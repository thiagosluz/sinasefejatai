'use server'

import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'

import { ActionResponse, handleError } from '@/lib/action-utils'
import { requireAdmin } from '@/lib/dal'
import { sendEmail } from '@/lib/email'
import { createAdminClient } from '@/lib/supabase/admin'

export async function gerarLinkAtualizacao(filiadoId: string): Promise<ActionResponse<{ link: string }>> {
  try {
    await requireAdmin()
    const supabase = createAdminClient()

    // Buscar dados atuais do filiado
    const { data: filiado, error: filiadoError } = await supabase
      .from('filiados')
      .select('*')
      .eq('id', filiadoId)
      .single()

    if (filiadoError || !filiado) {
      return { success: false, error: 'Filiado não encontrado.' }
    }

    const token = randomUUID()
    
    // Inserir solicitação pendente
    const { error: insertError } = await supabase
      .from('atualizacoes_cadastrais')
      .insert({
        filiado_id: filiadoId,
        token: token,
        status: 'PENDENTE_ENVIO',
        dados_atuais: filiado,
        expira_em: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
      })

    if (insertError) {
      console.error(insertError)
      return { success: false, error: 'Erro ao gerar o link de atualização no banco de dados.' }
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const link = `${baseUrl}/atualizar/${token}`

    revalidatePath('/admin/filiados')
    return { success: true, data: { link } }
  } catch (err) {
    return handleError(err, 'Ocorreu um erro ao gerar link.')
  }
}

export async function enviarEmailAtualizacao(filiadoId: string, link: string): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const supabase = createAdminClient()

    const { data: filiado } = await supabase
      .from('filiados')
      .select('nome, email')
      .eq('id', filiadoId)
      .single()

    if (!filiado?.email) {
      return { success: false, error: 'Filiado não possui e-mail cadastrado.' }
    }

    const htmlBody = `
      <div style="font-family: sans-serif; color: #333;">
        <h2>Atualização Cadastral - SINASEFE Jataí</h2>
        <p>Olá, <strong>${filiado.nome}</strong>!</p>
        <p>A diretoria do SINASEFE Jataí solicitou que você verifique e atualize seus dados cadastrais em nossa base.</p>
        <p>Por favor, clique no botão abaixo para acessar o formulário seguro (este link expira em 7 dias):</p>
        <div style="margin: 30px 0;">
          <a href="${link}" style="background-color: #991b1b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Atualizar Meus Dados
          </a>
        </div>
        <p>Se o botão não funcionar, copie e cole o seguinte link no seu navegador:</p>
        <p style="word-break: break-all; color: #666; font-size: 14px;">${link}</p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
        <p style="font-size: 12px; color: #888;">Esta é uma mensagem automática. Por favor, não responda este e-mail.</p>
      </div>
    `

    await sendEmail({
      to: filiado.email,
      subject: 'SINASEFE Jataí: Atualização Cadastral',
      html: htmlBody
    })

    return { success: true }
  } catch (err) {
    return handleError(err, 'Erro ao enviar e-mail.')
  }
}

export async function aprovarAtualizacao(solicitacaoId: string): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const supabase = createAdminClient()

    // 1. Buscar a solicitação
    const { data: solicitacao, error: fetchError } = await supabase
      .from('atualizacoes_cadastrais')
      .select('*, filiados (id)')
      .eq('id', solicitacaoId)
      .single()

    if (fetchError || !solicitacao) {
      return { success: false, error: 'Solicitação não encontrada.' }
    }

    if (solicitacao.status !== 'EM_ANALISE') {
      return { success: false, error: 'Esta solicitação não está mais pendente de análise.' }
    }

    // 2. Atualizar tabela de filiados
    // Os dados já foram validados via Zod no form, então podemos injetá-los diretamente, exceto chaves sensíveis.
    const novosDados = solicitacao.novos_dados
    
    // Proteção adicional para não sobrescrever cpf ou siape por engano via public form manipulation
    delete novosDados.cpf
    delete novosDados.siape
    
    const { error: updateFiliadoError } = await supabase
      .from('filiados')
      .update(novosDados)
      .eq('id', solicitacao.filiado_id)

    if (updateFiliadoError) {
      return { success: false, error: 'Erro ao aplicar atualizações no cadastro do filiado.' }
    }

    // 3. Marcar solicitação como aprovada
    const { error: updateSolicitacaoError } = await supabase
      .from('atualizacoes_cadastrais')
      .update({ status: 'APROVADO', updated_at: new Date().toISOString() })
      .eq('id', solicitacaoId)

    if (updateSolicitacaoError) {
      return { success: false, error: 'Dados atualizados, mas erro ao mudar status da solicitação.' }
    }

    revalidatePath('/admin/filiados/atualizacoes')
    revalidatePath('/admin/filiados')
    return { success: true }
  } catch (err) {
    return handleError(err, 'Ocorreu um erro ao aprovar.')
  }
}

export async function rejeitarAtualizacao(solicitacaoId: string): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('atualizacoes_cadastrais')
      .update({ status: 'REJEITADO', updated_at: new Date().toISOString() })
      .eq('id', solicitacaoId)

    if (error) {
      return { success: false, error: 'Erro ao rejeitar a solicitação.' }
    }

    revalidatePath('/admin/filiados/atualizacoes')
    return { success: true }
  } catch (err) {
    return handleError(err, 'Ocorreu um erro ao rejeitar.')
  }
}
