import Link from 'next/link'
import { redirect } from 'next/navigation'

import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'
import { createClient } from '@/lib/supabase/server'

import ParecerFiscalDetalheCliente from './parecer-fiscal-detalhe-cliente'

interface PageProps {
  params: Promise<{ mes_ano: string }>
}

export default async function ParecerFiscalDetalhePage({ params }: PageProps) {
  const { mes_ano } = await params

  const supabase = await createClient()

  // Validar autenticação
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Buscar se o usuário é do conselho fiscal
  const { data: perfil } = await supabase
    .from('perfis')
    .select('role')
    .eq('id', user.id)
    .single()
  
  const isConselhoFiscal = perfil?.role === 'conselho_fiscal'

  // Buscar transações APENAS DO MÊS, ou deixamos a lógica de filtragem igual à de prestacao (mandamos tudo do DB ou prefiltramos?)
  // Para evitar mandar tudo, vamos filtrar na query: ano_mes
  // Wait, no. usePrestacaoMath filters locally using string startsWith. It's safe to fetch everything or fetch just the month + anterior.
  // Actually, to correctly calculate saldo_anterior, we MUST fetch all transactions until the end of the month.
  const { data: transacoes } = await supabase
    .from('financeiro')
    .select('*')
    .order('data', { ascending: true })

  // Buscar status da prestacao
  const { data: prestacaoMensal } = await supabase
    .from('financeiro_prestacoes_mensais')
    .select('*')
    .eq('mes_ano', mes_ano)
    .single()

  // Buscar configurações de cabeçalho
  const { data: config } = await supabase
    .from('configuracoes')
    .select('*')
    .eq('id', 1)
    .single()

  // Buscar total de conselheiros
  const { count: countConselheiros } = await supabase
    .from('conselho_fiscal_membros')
    .select('id, conselho_fiscal_gestoes!inner(is_atual)', { count: 'exact', head: true })
    .eq('conselho_fiscal_gestoes.is_atual', true)
    .neq('nome', '')
    .not('nome', 'is', null)

  const totalConselheiros = Math.max(1, countConselheiros || 1)

  // Buscar assinaturas se já tiver documento criado
  let assinaturasCount = 0
  let jaAssinou = false

  if (prestacaoMensal?.documento_parecer_id) {
    const { data: verificacao } = await supabase
      .from('documento_verificacoes')
      .select('id')
      .eq('tipo_documento', 'parecer_fiscal')
      .eq('documento_id', prestacaoMensal.documento_parecer_id)
      .single()

    if (verificacao) {
      const { data: assinaturas } = await supabase
        .from('documento_assinaturas')
        .select('usuario_id')
        .eq('verificacao_id', verificacao.id)

      if (assinaturas) {
        assinaturasCount = assinaturas.length
        jaAssinou = assinaturas.some(a => a.usuario_id === user.id)
      }
    }
  }

  return (
    <AdminPageWrapper>
      <AdminPageHeader titulo={`Análise do Mês ${mes_ano}`} subtitulo="Revisão detalhada do balancete, notas e inserção de parecer">
        <div className="flex gap-4">
          <Link href="/admin/parecer-fiscal" className="btn-secondary text-sm">
            Voltar
          </Link>
        </div>
      </AdminPageHeader>
      
      <ParecerFiscalDetalheCliente 
        mesAno={mes_ano}
        transacoes={transacoes || []}
        config={config}
        prestacaoMensal={prestacaoMensal}
        totalConselheiros={totalConselheiros}
        assinaturasCount={assinaturasCount}
        jaAssinou={jaAssinou}
        isConselhoFiscal={isConselhoFiscal}
      />
    </AdminPageWrapper>
  )
}
