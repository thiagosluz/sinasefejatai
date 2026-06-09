import { createClient } from '@/lib/supabase/server'

import FormResolucao from './form-resolucao'

export default async function NovaResolucaoPage() {
  const supabase = await createClient()
  const { data: config } = await supabase.from('configuracoes').select('*').eq('id', 1).single()

  return <FormResolucao config={config} />
}
