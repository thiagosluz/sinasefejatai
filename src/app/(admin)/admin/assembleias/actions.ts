'use server'

import { revalidatePath } from 'next/cache'

import { ActionResponse, handleError } from '@/lib/action-utils'
import { requireAdmin } from '@/lib/dal'
import { formatarDataComDiaParenteses, formatarHora } from '@/lib/date-utils'
import { createClient } from '@/lib/supabase/server'

export async function addAssembleia(formData: FormData): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const numero = formData.get('numero') as string
    const tipo = formData.get('tipo') as string
    const data_realizacao = formData.get('data_realizacao') as string
    const horario_1a_convocacao = formData.get('horario_1a_convocacao') as string
    const horario_2a_convocacao = formData.get('horario_2a_convocacao') as string
    const local = formData.get('local') as string
    const publico_alvo = formData.get('publico_alvo') as string || 'filiados'
    
    // Pautas we can receive as a simple text area, one per line, and split by newline.
    const pautasRaw = formData.get('pautas') as string
    const pautas = pautasRaw ? pautasRaw.split('\n').map(p => p.trim()).filter(p => p !== '') : []
    
    const status = formData.get('status') as string || 'Agendada'

    if (!tipo || !data_realizacao || !horario_1a_convocacao || !horario_2a_convocacao || !local) {
      return { success: false, error: 'Preencha os campos obrigatórios' }
    }

    const { error } = await supabase.from('assembleias').insert({
      numero: numero || null,
      tipo,
      data_realizacao,
      horario_1a_convocacao,
      horario_2a_convocacao,
      local,
      publico_alvo,
      pautas,
      status,
    })

    if (error) {
      return { success: false, error: 'Falha ao agendar assembleia no banco.' }
    }

    revalidatePath('/assembleias')
    return { success: true }
  } catch (err) {
    return handleError(err, 'Falha ao adicionar assembleia')
  }
}

export async function updateStatusAssembleia(id: string, status: string): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await supabase
      .from('assembleias')
      .update({ status })
      .eq('id', id)

    if (error) {
      return { success: false, error: 'Falha ao atualizar status no banco.' }
    }

    revalidatePath('/assembleias')
    return { success: true }
  } catch (err) {
    return handleError(err, 'Falha ao atualizar status da assembleia')
  }
}

export async function deleteAssembleia(id: string): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    // Deletar possíveis atas associadas para evitar erro de Foreign Key
    await supabase.from('atas').delete().eq('assembleia_id', id)

    const { error } = await supabase
      .from('assembleias')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: `Falha ao excluir assembleia: ${error.message}` }
    }

    revalidatePath('/assembleias')
    return { success: true }
  } catch (err) {
    return handleError(err, 'Falha ao excluir assembleia')
  }
}

export async function editAssembleia(id: string, formData: FormData): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const numero = formData.get('numero') as string
    const tipo = formData.get('tipo') as string
    const data_realizacao = formData.get('data_realizacao') as string
    const horario_1a_convocacao = formData.get('horario_1a_convocacao') as string
    const horario_2a_convocacao = formData.get('horario_2a_convocacao') as string
    const local = formData.get('local') as string
    const publico_alvo = formData.get('publico_alvo') as string || 'filiados'
    
    const pautasRaw = formData.get('pautas') as string
    const pautas = pautasRaw ? pautasRaw.split('\n').map(p => p.trim()).filter(p => p !== '') : []
    
    const status = formData.get('status') as string || 'Agendada'
    const motivo_retificacao = formData.get('motivo_retificacao') as string

    if (!tipo || !data_realizacao || !horario_1a_convocacao || !horario_2a_convocacao || !local) {
      return { success: false, error: 'Preencha os campos obrigatórios' }
    }

    const { data: current } = await supabase
      .from('assembleias')
      .select('status, versao_edital, historico_retificacoes')
      .eq('id', id)
      .single()

    let versao_edital = current?.versao_edital || 1
    let historico_retificacoes = current?.historico_retificacoes || []

    if (current?.status === 'Agendada' && status === 'Agendada' && motivo_retificacao) {
      versao_edital += 1
      historico_retificacoes = [
        ...historico_retificacoes,
        {
          versao_anterior: versao_edital - 1,
          data: new Date().toISOString(),
          motivo: motivo_retificacao
        }
      ]
    }

    const { error } = await supabase.from('assembleias').update({
      numero: numero || null,
      tipo,
      data_realizacao,
      horario_1a_convocacao,
      horario_2a_convocacao,
      local,
      publico_alvo,
      pautas,
      status,
      versao_edital,
      historico_retificacoes
    }).eq('id', id)

    if (error) {
      return { success: false, error: 'Falha ao atualizar assembleia no banco.' }
    }

    revalidatePath('/assembleias')
    return { success: true }
  } catch (err) {
    return handleError(err, 'Falha ao editar assembleia')
  }
}

export async function dispararEditalEmLote(assembleiaId: string): Promise<ActionResponse<{ enviados: number }>> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    // 1. Buscar assembleia
    const { data: assembleia } = await supabase
      .from('assembleias')
      .select('*')
      .eq('id', assembleiaId)
      .single()

    if (!assembleia) {
      return { success: false, error: 'Assembleia não encontrada.' }
    }

    // 2. Buscar Filiados ATIVOS com e-mail
    const { data: filiados } = await supabase
      .from('filiados')
      .select('nome, email')
      .eq('ativo', true)
      .eq('status_filiacao', 'aprovado')
      .not('email', 'is', null)
      .neq('email', '')

    if (!filiados || filiados.length === 0) {
      return { success: false, error: 'Nenhum filiado ativo com e-mail cadastrado foi encontrado para o envio.' }
    }

    // 3. Buscar anexo PDF (se existir)
    const { data: documentos } = await supabase
      .from('assembleia_documentos')
      .select('id, arquivo_url, nome_arquivo')
      .eq('assembleia_id', assembleiaId)
      .eq('tipo', 'edital')

    const documentoEdital = documentos?.[0] || null

    // 4. Montar Corpo do E-mail HTML
    const dataRealizacao = formatarDataComDiaParenteses(assembleia.data_realizacao)
    const hora1 = formatarHora(assembleia.horario_1a_convocacao)
    const hora2 = formatarHora(assembleia.horario_2a_convocacao)
    
    let pautasHtml = ''
    if (assembleia.pautas && assembleia.pautas.length > 0) {
      pautasHtml = `
        <ol style="margin-top: 16px; margin-bottom: 24px; padding-left: 24px;">
          ${assembleia.pautas.map((p: string) => `<li>${p}</li>`).join('')}
        </ol>
      `
    }

    const publicLink = `https://www.sinasefejatai.org.br/assembleias/${assembleia.id}`
    const subjectTitle = `[Assembleia Geral ${assembleia.tipo}] Edital de Convocação Nº ${assembleia.numero || 'S/N'}`

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #991b1b; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">SINASEFE Jataí/GO</h1>
        </div>
        <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #111827; font-size: 18px; margin-top: 0; text-align: center;">
            EDITAL DE CONVOCAÇÃO Nº ${assembleia.numero || '___/____'}
            <br/><small style="font-weight: normal; color: #4b5563;">ASSEMBLEIA GERAL ${assembleia.tipo.toUpperCase()}</small>
          </h2>

          <p style="color: #374151; line-height: 1.6; text-align: justify; margin-top: 24px;">
            A Coordenação da Seção Sindical Jataí do SINASEFE, no uso de suas atribuições estatutárias, 
            <strong>CONVOCA OS SERVIDORES DOCENTES E TÉCNICO-ADMINISTRATIVOS FILIADOS</strong> para participarem da 
            <strong>Assembleia Geral ${assembleia.tipo}</strong>, a ser realizada no dia <strong>${dataRealizacao}</strong>, no(a) <strong>${assembleia.local}</strong>.
          </p>

          <p style="color: #374151; line-height: 1.6; text-align: justify;">
            A Assembleia instalar-se-á em primeira convocação, com 1/3 (um terço) do número de sindicalizados, às <strong>${hora1}</strong>, ou, em segunda convocação com qualquer quórum às <strong>${hora2}</strong>, oportunidade em que serão apreciados os seguintes pontos de pauta:
          </p>

          ${pautasHtml}

          <div style="text-align: center; margin: 32px 0;">
            <a href="${publicLink}" style="background-color: #991b1b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
              Acessar Edital Completo no Portal
            </a>
          </div>

          <hr style="border-color: #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            Você está recebendo este e-mail pois consta como filiado ativo na base do SINASEFE Jataí.<br/>
            Se você não é mais filiado ou não deseja receber essas comunicações, entre em contato com a secretaria.
          </p>
        </div>
      </div>
    `

    // 5. Disparar Edge Function em background (fire-and-forget)
    const edgeFunctionSecret = process.env.EDGE_FUNCTION_SECRET
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!edgeFunctionSecret || !supabaseUrl) {
      return { success: false, error: 'Configuração da Edge Function não encontrada no ambiente.' }
    }

    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/enviar-edital`

    const payload = {
      filiados,
      subject: subjectTitle,
      html: htmlContent,
      attachment: documentoEdital?.arquivo_url
        ? { filename: documentoEdital.nome_arquivo || 'Edital_de_Convocacao.pdf', url: documentoEdital.arquivo_url }
        : undefined,
      replyTo: 'sinasefe.jatai.go@gmail.com'
    }

    // Fire-and-forget: não esperamos a resposta completa
    fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${edgeFunctionSecret}`,
      },
      body: JSON.stringify(payload),
    }).catch(err => {
      console.error('[dispararEditalEmLote] Erro ao chamar Edge Function:', err)
    })

    return { 
      success: true, 
      data: { enviados: filiados.length }, 
      message: `Envio iniciado! ${filiados.length} filiados serão notificados em breve.` 
    }

  } catch (err) {
    return handleError(err, 'Falha ao disparar edital para filiados.')
  }
}

