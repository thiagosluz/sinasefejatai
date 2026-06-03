import { Suspense } from 'react'

import { createClient } from '@/lib/supabase/server'

import FormCliente from './form-cliente'

export default async function NovoReciboPage() {
  const supabase = await createClient()

  // Buscar configurações de cabeçalho
  const { data: config } = await supabase
    .from('configuracoes')
    .select('*')
    .eq('id', 1)
    .single()

  return (
    <Suspense fallback={<div>Carregando formulário...</div>}>
      <FormCliente config={config} />
    </Suspense>
  )
}
