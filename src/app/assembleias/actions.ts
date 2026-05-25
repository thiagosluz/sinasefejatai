'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addAssembleia(formData: FormData) {
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
    redirect('/assembleias/nova?error=Preencha os campos obrigatórios')
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
    console.error(error)
    redirect('/assembleias/nova?error=Falha ao agendar assembleia')
  }

  revalidatePath('/assembleias')
  redirect('/assembleias')
}

export async function updateStatusAssembleia(id: string, status: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('assembleias')
    .update({ status })
    .eq('id', id)

  if (error) {
    console.error(error)
    throw new Error('Falha ao atualizar status')
  }

  revalidatePath('/assembleias')
}

export async function deleteAssembleia(id: string) {
  const supabase = await createClient()

  // Deletar possíveis atas associadas para evitar erro de Foreign Key
  await supabase.from('atas').delete().eq('assembleia_id', id)

  const { error } = await supabase
    .from('assembleias')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro detalhado ao deletar assembleia:', error)
    throw new Error(`Falha ao excluir assembleia: ${error.message}`)
  }

  revalidatePath('/assembleias')
}

export async function editAssembleia(id: string, formData: FormData) {
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
    redirect(`/assembleias/${id}/editar?error=Preencha os campos obrigatórios`)
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
    console.error(error)
    redirect(`/assembleias/${id}/editar?error=Falha ao atualizar assembleia`)
  }

  revalidatePath('/assembleias')
  redirect('/assembleias')
}
