'use server'

import { revalidatePath } from 'next/cache'

import { ActionResponse, handleError } from '@/lib/action-utils'
import { assinarDocumento } from '@/lib/actions-assinaturas'
import { createClient } from '@/lib/supabase/server'

// 1. Enviar para o conselho (Chamado pelo tesoureiro)
export async function submeterPrestacao(mesAno: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('Não autorizado')
    
    // Verifica se já existe
    const { data: existente } = await supabase
      .from('financeiro_prestacoes_mensais')
      .select('id')
      .eq('mes_ano', mesAno)
      .maybeSingle()

    if (existente) {
      const { error } = await supabase
        .from('financeiro_prestacoes_mensais')
        .update({
          status: 'ENVIADO_CONSELHO',
          tesoureiro_id: user.id
        })
        .eq('id', existente.id)
      if (error) throw new Error('Erro ao submeter prestação para o conselho: ' + error.message)
    } else {
      const { error } = await supabase
        .from('financeiro_prestacoes_mensais')
        .insert({
          mes_ano: mesAno,
          status: 'ENVIADO_CONSELHO',
          tesoureiro_id: user.id
        })
      if (error) throw new Error('Erro ao criar prestação para o conselho: ' + error.message)
    }
    
    revalidatePath('/admin/financeiro/prestacao')
    revalidatePath('/admin/financeiro/prestacao/historico')
    revalidatePath('/admin/parecer-fiscal')
    return { success: true }
  } catch (err) {
    return handleError(err, 'Erro ao enviar.')
  }
}

// 2. Avaliar prestação (Mudar para COM_RESSALVAS / REJEITADO)
export async function avaliarPrestacao(
  mesAno: string, 
  parecerTexto: string, 
  novoStatus: 'COM_RESSALVAS' | 'REJEITADO' | 'ENVIADO_CONSELHO'
): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autorizado')
    
    await requireConselhoFiscal(supabase, user.id)
    
    const { error } = await supabase
      .from('financeiro_prestacoes_mensais')
      .update({
        status: novoStatus,
        parecer_texto: parecerTexto
      })
      .eq('mes_ano', mesAno)
      
    if (error) throw new Error('Erro ao atualizar status.')
    
    revalidatePath(`/admin/parecer-fiscal/${mesAno}`)
    revalidatePath('/admin/parecer-fiscal')
    revalidatePath('/admin/financeiro/prestacao')
    return { success: true }
  } catch (err) {
    return handleError(err, 'Erro ao avaliar prestação.')
  }
}

// 3. Aprovar Prestacao Definitivamente e Assinar (1ª ou Nª assinatura)
export async function aprovarPrestacao(
  mesAno: string, 
  parecerTexto: string, 
  senhaUsuario: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autorizado')
    
    await requireConselhoFiscal(supabase, user.id)
    
    // Busca a prestação atual
    const { data: prestacao } = await supabase
      .from('financeiro_prestacoes_mensais')
      .select('*')
      .eq('mes_ano', mesAno)
      .single()

    if (!prestacao) throw new Error('Prestação não encontrada.')

    let docId = prestacao.documento_parecer_id

    // Se é o primeiro a assinar, cria o documento
    if (!docId) {
      const tituloDoc = `Parecer Fiscal - Balancete ${mesAno}`
      const htmlParecer = `
        <div class="parecer-fiscal-content">
          <h2>Parecer do Conselho Fiscal</h2>
          <p><strong>Referência:</strong> Mês ${mesAno}</p>
          <hr/>
          <div style="margin-top: 20px;">
            ${parecerTexto}
          </div>
        </div>
      `
      
      const numeroDoc = mesAno.split('-').reverse().join('/')
      const { data: doc, error: docError } = await supabase
        .from('documentos_administrativos')
        .insert({
          tipo: 'parecer_fiscal',
          titulo: tituloDoc,
          numero: numeroDoc,
          dados: { conteudo_html: htmlParecer },
          autor_id: user.id
        })
        .select('id')
        .single()
        
      if (docError) throw new Error('Erro ao gerar documento do parecer.')
      docId = doc.id
    }
    
    // Chamar fluxo de assinatura nativo do sistema
    const signResponse = await assinarDocumento('parecer_fiscal', docId, senhaUsuario)
    if (!signResponse.success) {
      // Se não for "Você já assinou", lançamos erro
      if (signResponse.error !== 'Você já assinou este documento.') {
        throw new Error(signResponse.error)
      }
    }
    
    // Verifica total de conselheiros ativos
    const { count: countConselheiros } = await supabase
      .from('conselho_fiscal_membros')
      .select('id, conselho_fiscal_gestoes!inner(is_atual)', { count: 'exact', head: true })
      .eq('conselho_fiscal_gestoes.is_atual', true)
      .neq('nome', '')
      .not('nome', 'is', null)

    const totalConselheiros = Math.max(1, countConselheiros || 1)

    // Verifica total de assinaturas no documento
    const { data: verificacao } = await supabase
      .from('documento_verificacoes')
      .select('id')
      .eq('tipo_documento', 'parecer_fiscal')
      .eq('documento_id', docId)
      .single()

    let totalAssinaturas = 0
    if (verificacao) {
      const { count: countAssinaturas } = await supabase
        .from('documento_assinaturas')
        .select('id', { count: 'exact', head: true })
        .eq('verificacao_id', verificacao.id)
      totalAssinaturas = countAssinaturas || 0
    }

    // Se bateu a cota, tranca (APROVADO). Senão, aguarda (AGUARDANDO_ASSINATURAS).
    const novoStatus = totalAssinaturas >= totalConselheiros ? 'APROVADO' : 'AGUARDANDO_ASSINATURAS'

    const { error: updateError } = await supabase
      .from('financeiro_prestacoes_mensais')
      .update({
        status: novoStatus,
        parecer_texto: prestacao.parecer_texto || parecerTexto,
        documento_parecer_id: docId
      })
      .eq('mes_ano', mesAno)
      
    if (updateError) throw new Error('Erro ao atualizar status da prestação.')
    
    revalidatePath(`/admin/parecer-fiscal/${mesAno}`)
    revalidatePath('/admin/parecer-fiscal')
    revalidatePath('/admin/financeiro/prestacao')
    
    return { success: true }
  } catch (err) {
    return handleError(err, 'Erro ao aprovar a prestação.')
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function requireConselhoFiscal(supabase: any, userId: string) {
  const { data: perfil } = await supabase
    .from('perfis')
    .select('filiado_id, role')
    .eq('id', userId)
    .single()

  if (!perfil?.filiado_id || perfil.role !== 'conselho_fiscal') {
    throw new Error('Acesso negado. Apenas membros ativos do Conselho Fiscal podem realizar esta operação.')
  }

  const { data: membro } = await supabase
    .from('conselho_fiscal_membros')
    .select('id, conselho_fiscal_gestoes!inner(is_atual)')
    .eq('filiado_id', perfil.filiado_id)
    .eq('conselho_fiscal_gestoes.is_atual', true)
    .maybeSingle()

  if (!membro) {
    throw new Error('Acesso negado. Apenas membros ativos do Conselho Fiscal podem realizar esta operação.')
  }
}

// 4. Cancelar Parecer Fiscal
export async function cancelarParecerFiscal(documentoId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autorizado')

    await requireConselhoFiscal(supabase, user.id)

    // 2. Fetch the prestacao linked to this document
    const { data: prestacao } = await supabase
      .from('financeiro_prestacoes_mensais')
      .select('id, mes_ano')
      .eq('documento_parecer_id', documentoId)
      .single()

    if (!prestacao) {
      throw new Error('Prestação de contas vinculada a este documento não encontrada.')
    }

    // 3. Mark the document as cancelado
    const { error: cancelError } = await supabase
      .from('documentos_administrativos')
      .update({ status: 'cancelado' })
      .eq('id', documentoId)

    if (cancelError) throw new Error('Erro ao cancelar o documento na base.')

    // 4. Revert the prestacao status back to ENVIADO_CONSELHO and unlink the document
    const { error: resetError } = await supabase
      .from('financeiro_prestacoes_mensais')
      .update({
        status: 'ENVIADO_CONSELHO',
        documento_parecer_id: null
      })
      .eq('id', prestacao.id)

    if (resetError) throw new Error('Erro ao reabrir a prestação de contas.')

    revalidatePath('/admin/documentos')
    revalidatePath(`/admin/documentos/pareceres/${documentoId}`)
    revalidatePath(`/admin/parecer-fiscal/${prestacao.mes_ano}`)
    revalidatePath('/admin/parecer-fiscal')
    revalidatePath('/admin/financeiro/prestacao')

    return { success: true }
  } catch (err) {
    return handleError(err, 'Erro ao cancelar o parecer fiscal.')
  }
}
