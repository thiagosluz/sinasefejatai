'use server'

import { revalidatePath } from 'next/cache'
import sanitizeHtml from 'sanitize-html'

import { ActionResponse, handleError } from '@/lib/action-utils'
import { requireAdmin } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'

export async function saveAta(formData: FormData): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const assembleiaId = formData.get('assembleia_id') as string
    const numero = formData.get('numero') as string
    const redator = formData.get('redator') as string
    const conteudo_rich_raw = formData.get('conteudo_rich') as string
    const votos_pautas = formData.get('votos_pautas') as string
    
    // Limpeza de XSS
    const conteudo_rich = sanitizeHtml(conteudo_rich_raw || '', {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img', 'u', 's', 'span' ]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        '*': ['style', 'class'], // Permite estilos inline gerados pelo editor TipTap
      }
    })

    if (!assembleiaId) {
      return { success: false, error: 'Assembleia não especificada' }
    }

    const { error } = await supabase.from('atas').upsert({
      assembleia_id: assembleiaId,
      numero: numero || null,
      redator: redator || null,
      conteudo_rich,
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
