import { Suspense } from 'react'

import { createClient } from '@/lib/supabase/server'

import FormMemorando from './form-memorando'

export default async function NovoMemorandoPage() {
  const supabase = await createClient()
  const { data: config } = await supabase.from('configuracoes').select('*').eq('id', 1).single()

  return (
    <Suspense fallback={<div>Carregando formulário...</div>}>
      <FormMemorando config={config} />
    </Suspense>
  )
}
