'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function saveAta(formData: FormData) {
  const supabase = await createClient()

  const assembleiaId = formData.get('assembleia_id') as string
  const numero = formData.get('numero') as string
  const redator = formData.get('redator') as string
  const conteudo_rich = formData.get('conteudo_rich') as string

  if (!assembleiaId) {
    redirect('/assembleias?error=Assembleia não especificada')
  }

  const { error } = await supabase.from('atas').upsert({
    assembleia_id: assembleiaId,
    numero: numero || null,
    redator: redator || null,
    conteudo_rich: conteudo_rich || '',
  }, {
    onConflict: 'assembleia_id'
  })

  if (error) {
    console.error('Erro ao salvar ata:', error)
    redirect(`/assembleias/${assembleiaId}/ata?error=Falha ao salvar a ata`)
  }

  revalidatePath(`/assembleias/${assembleiaId}/ata`)
  revalidatePath('/assembleias')
  
  redirect(`/assembleias/${assembleiaId}/ata?success=Ata salva com sucesso`)
}
