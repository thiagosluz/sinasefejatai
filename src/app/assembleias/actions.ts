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
  
  // Pautas we can receive as a simple text area, one per line, and split by newline.
  const pautasRaw = formData.get('pautas') as string
  const pautas = pautasRaw ? pautasRaw.split('\n').map(p => p.trim()).filter(p => p !== '') : []

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
    pautas,
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
