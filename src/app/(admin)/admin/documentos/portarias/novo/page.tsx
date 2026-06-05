import { Suspense } from 'react'

import { createClient } from '@/lib/supabase/server'

import FormPortaria from './form-portaria'

export default async function NovaPortariaPage() {
  const supabase = await createClient()
  const { data: config } = await supabase.from('configuracoes').select('*').eq('id', 1).single()

  return (
    <Suspense fallback={<div>Carregando formulário...</div>}>
      <FormPortaria config={config} />
    </Suspense>
  )
}
