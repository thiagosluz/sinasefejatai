import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PresencaCliente from './presenca-cliente'

export default async function ListaPresencaPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()

  // Buscar assembleia
  const { data: assembleia } = await supabase
    .from('assembleias')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!assembleia) {
    notFound()
  }

  // Buscar configuração do cabeçalho
  const { data: config } = await supabase
    .from('configuracoes')
    .select('*')
    .eq('id', 1)
    .single()

  // Buscar filiados ativos
  const { data: filiados } = await supabase
    .from('filiados')
    .select('nome, siape')
    .eq('ativo', true)
    .order('nome', { ascending: true })

  return (
    <PresencaCliente 
      assembleia={assembleia}
      config={config}
      filiados={filiados || []}
    />
  )
}
