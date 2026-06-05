import { Suspense } from 'react'

import { createClient } from '@/lib/supabase/server'

import FormCertificado from './form-certificado'

export default async function NovoCertificadoPage() {
  const supabase = await createClient()
  const { data: config } = await supabase.from('configuracoes').select('*').eq('id', 1).single()

  return (
    <Suspense fallback={<div>Carregando formulário...</div>}>
      <FormCertificado config={config} />
    </Suspense>
  )
}
