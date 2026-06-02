'use server'

import { revalidatePath } from 'next/cache'

import { ActionResponse, handleError } from '@/lib/action-utils'
import { createClient } from '@/lib/supabase/server'

export async function saveAta(formData: FormData): Promise<ActionResponse> {
  try {
    const supabase = await createClient()

    const assembleiaId = formData.get('assembleia_id') as string
    const numero = formData.get('numero') as string
    const redator = formData.get('redator') as string
    const conteudo_rich = formData.get('conteudo_rich') as string
    const votos_pautas = formData.get('votos_pautas') as string
    
    if (!assembleiaId) {
      return { success: false, error: 'Assembleia não especificada' }
    }

    const { error } = await supabase.from('atas').upsert({
      assembleia_id: assembleiaId,
      numero: numero || null,
      redator: redator || null,
      conteudo_rich: conteudo_rich || '',
      votos_pautas: JSON.parse(votos_pautas || '{}'),
    }, {
      onConflict: 'assembleia_id'
    })

    if (error) {
      return { success: false, error: 'Falha ao salvar a ata no banco de dados.' }
    }

    revalidatePath(`/admin/assembleias/${assembleiaId}/ata`)
    revalidatePath('/admin/assembleias')
    
    return { success: true }
  } catch (err) {
    return handleError(err, 'Falha ao salvar a ata')
  }
}
