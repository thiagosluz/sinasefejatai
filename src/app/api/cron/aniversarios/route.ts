import { verifySignatureAppRouter } from '@upstash/qstash/dist/nextjs'
import { NextResponse } from 'next/server'

import { enviarEmailAniversario } from '@/lib/email'
import { createAdminClient } from '@/lib/supabase/admin'

// Função interna que executa a lógica
async function handler() {
  try {
    const supabase = createAdminClient()

    // 1. Verifica se a automação está realmente ativa
    const { data: configData } = await supabase
      .from('configuracoes_sistema')
      .select('valor')
      .eq('chave', 'automacao_aniversarios')
      .single()

    const config = configData?.valor as { ativo: boolean } | undefined
    
    if (!config?.ativo) {
      return NextResponse.json({ success: true, message: 'Automação desativada.' })
    }

    // 2. Busca aniversariantes de HOJE
    // O Supabase não tem uma função nativa fácil para extrair dia/mês via JS
    // Podemos fazer isso buscando todos os ativos e filtrando no JS (se forem poucos, < 5000)
    // Para um sindicato local, isso é perfeitamente performático.
    const { data: filiados, error } = await supabase
      .from('filiados')
      .select('id, nome, email, data_nascimento, ativo')
      .eq('ativo', true)
      .not('data_nascimento', 'is', null)
      .not('email', 'is', null)
      .not('email', 'eq', '')

    if (error) throw error

    const hoje = new Date()
    const diaAtual = hoje.getDate()
    const mesAtual = hoje.getMonth() + 1 // JS months are 0-indexed

    const aniversariantes = filiados?.filter(f => {
      const dataNasc = new Date(f.data_nascimento + 'T00:00:00') // Force UTC
      return dataNasc.getDate() === diaAtual && (dataNasc.getMonth() + 1) === mesAtual
    }) || []

    if (aniversariantes.length === 0) {
      return NextResponse.json({ success: true, message: 'Nenhum aniversariante hoje.' })
    }

    // 3. Verifica o histórico de HOJE para não enviar duplicado
    // Pega o início e fim do dia atual em UTC
    const inicioDoDia = new Date(hoje.setHours(0,0,0,0)).toISOString()
    const fimDoDia = new Date(hoje.setHours(23,59,59,999)).toISOString()

    const { data: enviosDeHoje } = await supabase
      .from('historico_emails_aniversario')
      .select('filiado_id')
      .gte('enviado_em', inicioDoDia)
      .lte('enviado_em', fimDoDia)
      .eq('status', 'sucesso')

    const idsEnviados = new Set(enviosDeHoje?.map(h => h.filiado_id) || [])

    let enviados = 0
    let falhas = 0

    // 4. Dispara os e-mails
    for (const filiado of aniversariantes) {
      if (idsEnviados.has(filiado.id)) {
        continue // Já enviou hoje
      }

      try {
        await enviarEmailAniversario({
          to: filiado.email,
          nome: filiado.nome,
        })

        // Grava sucesso
        await supabase.from('historico_emails_aniversario').insert({
          filiado_id: filiado.id,
          filiado_nome: filiado.nome,
          filiado_email: filiado.email,
          status: 'sucesso'
        })
        
        enviados++
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        console.error(`Erro ao enviar aniversário para ${filiado.email}:`, err)
        // Grava falha
        await supabase.from('historico_emails_aniversario').insert({
          filiado_id: filiado.id,
          filiado_nome: filiado.nome,
          filiado_email: filiado.email,
          status: 'falha',
          erro_msg: errorMsg.substring(0, 255)
        })
        falhas++
      }
    }

    return NextResponse.json({ 
      success: true, 
      enviados,
      falhas
    })

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('Erro geral no cron de aniversários:', error)
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 })
  }
}

// Envolvemos o handler com verifySignatureAppRouter do QStash 
// Isso garante que apenas o QStash consiga chamar essa rota.
// Para testar localmente SEM QStash, comente a linha abaixo e exporte o handler diretamente:
// export const POST = handler
export const POST = verifySignatureAppRouter(handler)
