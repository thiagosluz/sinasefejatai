'use server'

import { Client } from '@upstash/qstash'
import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

// Initialize QStash Client
const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN || '',
})

export async function getAniversariosConfig() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('configuracoes_sistema')
    .select('valor')
    .eq('chave', 'automacao_aniversarios')
    .single()
    
  if (error || !data) {
    return { ativo: false, horario: '09:00', schedule_id: null }
  }
  
  return data.valor as { ativo: boolean; horario: string; schedule_id: string | null }
}

export async function salvarAniversariosConfig(ativo: boolean, horario: string) {
  const supabase = await createClient()
  
  // 1. Get current config to check if we need to delete an old schedule
  const currentConfig = await getAniversariosConfig()
  
  let newScheduleId = currentConfig.schedule_id

  try {
    // Se mudou o estado de ativo ou mudou o horário, precisamos reconfigurar o QStash
    if (currentConfig.ativo !== ativo || currentConfig.horario !== horario) {
      // Deleta o schedule antigo se existir
      if (currentConfig.schedule_id) {
        try {
          await qstashClient.schedules.delete(currentConfig.schedule_id)
        } catch (e) {
          console.error("Falha ao deletar schedule antigo no QStash:", e)
        }
        newScheduleId = null
      }

      // Se a automação foi ligada (ou continuou ligada com novo horário)
      if (ativo) {
        // Converte "09:00" para Cron (UTC)
        // Horário de Brasília (UTC-3) - se o admin informou "09:00" em BRT, no QStash (UTC) será "12:00"
        // Extrai hora e minuto
        const [horaStr, minutoStr] = horario.split(':')
        const horaLocal = parseInt(horaStr, 10)
        
        // Converte para UTC (somando 3 horas)
        let horaUTC = horaLocal + 3
        if (horaUTC >= 24) horaUTC -= 24
        
        const cron = `${minutoStr} ${horaUTC} * * *`
        
        // Nossa URL pública onde a API estará ouvindo
        // Nota: O QStash não consegue bater em localhost. Para testes locais, você precisaria de um ngrok.
        // Assumiremos a URL de produção via VERCEL_URL ou uma ENV
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sinasefejatai.org.br'
        
        const schedule = await qstashClient.schedules.create({
          destination: `${baseUrl}/api/cron/aniversarios`,
          cron: cron
        })
        
        newScheduleId = schedule.scheduleId
      }
    }

    // 2. Salva a nova configuração no banco
    const novaConfig = { ativo, horario, schedule_id: newScheduleId }
    
    const { error } = await supabase
      .from('configuracoes_sistema')
      .upsert({
        chave: 'automacao_aniversarios',
        valor: novaConfig,
        atualizado_em: new Date().toISOString()
      })
      
    if (error) throw error

    revalidatePath('/admin/filiados/aniversarios')
    return { success: true }
    
  } catch (error) {
    console.error('Erro ao salvar configuração:', error)
    return { success: false, error: 'Falha ao salvar configuração' }
  }
}

export async function getHistoricoAniversarios(page = 1) {
  const supabase = await createClient()
  const itemsPerPage = 50
  
  const from = (page - 1) * itemsPerPage
  const to = from + itemsPerPage - 1
  
  const { data, count } = await supabase
    .from('historico_emails_aniversario')
    .select('*', { count: 'exact' })
    .order('enviado_em', { ascending: false })
    .range(from, to)
    
  return {
    historico: data || [],
    total: count || 0,
    totalPages: count ? Math.ceil(count / itemsPerPage) : 0
  }
}
