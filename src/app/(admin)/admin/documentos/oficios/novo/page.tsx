import { Suspense } from 'react'

import { createClient } from '@/lib/supabase/server'

import FormOficio from './form-oficio'

export default async function NovoOficioPage() {
  const supabase = await createClient()

  const { data: config } = await supabase
    .from('configuracoes')
    .select('*')
    .eq('id', 1)
    .single()

  return (
    <Suspense fallback={<div>Carregando formulário...</div>}>
      <FormOficio config={config} />
    </Suspense>
  )
}
