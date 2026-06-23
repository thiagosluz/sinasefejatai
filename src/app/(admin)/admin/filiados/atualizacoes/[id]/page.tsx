import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, CheckCircle, Clock, XCircle } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'
import { createAdminClient } from '@/lib/supabase/admin'

import { AprovarRejeitarButtons } from '../components/aprovar-rejeitar-buttons'

export default async function DetalhesAtualizacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: solicitacao } = await supabase
    .from('atualizacoes_cadastrais')
    .select('*, filiados (*)')
    .eq('id', id)
    .single()

  if (!solicitacao) {
    notFound()
  }

  const antigos = solicitacao.dados_atuais || {}
  const novos = solicitacao.novos_dados || {}

  const chavesImportantes = [
    { key: 'nome', label: 'Nome Completo' },
    { key: 'email', label: 'E-mail' },
    { key: 'telefone', label: 'Telefone' },
    { key: 'data_nascimento', label: 'Data de Nasc.' },
    { key: 'rg', label: 'RG' },
    { key: 'cpf', label: 'CPF' },
    { key: 'siape', label: 'SIAPE' },
    { key: 'categoria', label: 'Categoria' },
    { key: 'situacao', label: 'Situação' },
    { key: 'campus', label: 'Campus' },
    { key: 'unidade_lotacao', label: 'Lotação' },
    { key: 'endereco_rua', label: 'Logradouro' },
    { key: 'endereco_bairro', label: 'Bairro' },
    { key: 'endereco_cidade', label: 'Cidade' },
    { key: 'endereco_estado', label: 'Estado' },
    { key: 'endereco_cep', label: 'CEP' },
  ]

  // Verifica se o valor mudou
  const foiAlterado = (key: string) => {
    if (!novos[key] && !antigos[key]) return false
    return novos[key] !== antigos[key]
  }

  return (
    <AdminPageWrapper>
      <div className="mb-4">
        <Link href="/admin/filiados/atualizacoes" className="text-zinc-500 hover:text-brand-ink flex items-center gap-2 text-sm font-medium w-fit">
          <ArrowLeft size={16} /> Voltar para Atualizações
        </Link>
      </div>

      <AdminPageHeader 
        titulo={`Revisão: ${solicitacao.filiados?.nome}`} 
        subtitulo="Comparativo de alterações enviadas pelo filiado." 
      />

      <div className="bg-white border border-brand-border shadow-xl rounded mt-6">
        <div className="p-6 border-b border-brand-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-serif text-brand-ink mb-1">Status da Solicitação</h2>
            <p className="text-sm text-zinc-500">
              Enviado em: {format(new Date(solicitacao.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {solicitacao.status === 'PENDENTE_ENVIO' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 rounded">
                <Clock size={14} /> Aguardando Filiado
              </span>
            )}
            {solicitacao.status === 'EM_ANALISE' && (
              <>
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-700 rounded">
                  <Clock size={14} /> Em Análise
                </span>
                <div className="pl-4 border-l border-zinc-200">
                  <AprovarRejeitarButtons solicitacaoId={solicitacao.id} />
                </div>
              </>
            )}
            {solicitacao.status === 'APROVADO' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold uppercase tracking-wider bg-green-100 text-green-700 rounded">
                <CheckCircle size={14} /> Aprovado
              </span>
            )}
            {solicitacao.status === 'REJEITADO' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700 rounded">
                <XCircle size={14} /> Rejeitado
              </span>
            )}
          </div>
        </div>

        <div className="p-0 sm:p-6 overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-brand-cream border-y border-brand-border text-brand-ink/70 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 w-1/4">Campo</th>
                <th className="px-6 py-4 w-1/3 border-l border-zinc-200">Dados Anteriores</th>
                <th className="px-6 py-4 w-1/3 border-l border-zinc-200">Novos Dados (Preenchidos)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {chavesImportantes.map(({ key, label }) => {
                const mudou = foiAlterado(key)
                // Se a solicitação ainda não foi preenchida, não temos 'novos'
                const novoValor = solicitacao.status === 'PENDENTE_ENVIO' ? '-' : (novos[key] || '-')

                return (
                  <tr key={key} className={mudou ? 'bg-amber-50/30' : ''}>
                    <td className="px-6 py-4 font-medium text-brand-ink">
                      {label}
                      {mudou && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-amber-500" title="Campo alterado" />}
                    </td>
                    <td className="px-6 py-4 text-zinc-600 border-l border-zinc-200">
                      {antigos[key] || '-'}
                    </td>
                    <td className={`px-6 py-4 border-l border-zinc-200 font-medium ${mudou ? 'text-amber-700' : 'text-zinc-600'}`}>
                      {novoValor}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPageWrapper>
  )
}
