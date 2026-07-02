import { Suspense } from 'react'

import { createClient } from '@/lib/supabase/server'

import { getValoresReferencia } from '../../../configuracoes-gerais/actions'

import FormCliente from './form-cliente'

export default async function NovoReciboPage() {
  const supabase = await createClient()

  // Buscar configurações de cabeçalho
  const { data: config } = await supabase
    .from('configuracoes')
    .select('*')
    .eq('id', 1)
    .single()

  // Buscar salário mínimo dinâmico
  const valoresRef = await getValoresReferencia()

  // Buscar filiados para o autocomplete
  const { data: filiados } = await supabase
    .from('filiados')
    .select('id, nome, cpf')
    .eq('ativo', true)
    .order('nome', { ascending: true })

  return (
    <Suspense fallback={<div>Carregando formulário...</div>}>
      <FormCliente config={config} salarioMinimo={valoresRef.salario_minimo} filiados={filiados || []} />
    </Suspense>
  )
}
