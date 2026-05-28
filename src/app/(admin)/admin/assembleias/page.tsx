import { createClient } from '@/lib/supabase/server'


import AssembleiasCliente from './assembleias-cliente'

export default async function AssembleiasPage() {
  const supabase = await createClient()

  // Buscar assembleias ordenadas por data (mais recentes primeiro)
  // Desempate por created_at garante que eventos no mesmo dia fiquem na ordem de criação
  const { data: assembleias } = await supabase
    .from('assembleias')
    .select('*')
    .order('data_realizacao', { ascending: false })
    .order('created_at', { ascending: false })

  return <AssembleiasCliente assembleiasIniciais={assembleias || []} />
}
