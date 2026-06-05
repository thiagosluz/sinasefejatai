import { Suspense } from 'react'

import { createClient } from '@/lib/supabase/server'

import FormDeclaracao from './form-declaracao'

export default async function NovaDeclaracaoPage() {
  const supabase = await createClient()
  const { data: config } = await supabase.from('configuracoes').select('*').eq('id', 1).single()

  return (
    <Suspense fallback={<div>Carregando formulário...</div>}>
      <FormDeclaracao config={config} />
    </Suspense>
  )
}
