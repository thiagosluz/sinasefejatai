import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle, Clock, Search, XCircle } from 'lucide-react'
import Link from 'next/link'

import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'
import { createAdminClient } from '@/lib/supabase/admin'

import { AprovarRejeitarButtons } from './components/aprovar-rejeitar-buttons'

export default async function AtualizacoesPage() {
  const supabase = createAdminClient()

  // Buscar todas as atualizações cadastradas com os nomes dos filiados
  const { data: solicitacoes } = await supabase
    .from('atualizacoes_cadastrais')
    .select('*, filiados (nome)')
    .order('created_at', { ascending: false })

  return (
    <AdminPageWrapper>
      <AdminPageHeader 
        titulo="Atualizações Cadastrais" 
        subtitulo="Revise e aprove as alterações solicitadas pelos filiados" 
      />

      <div className="bg-brand-card border border-brand-border shadow-xl overflow-hidden mt-6">
        <div className="p-4 border-b border-brand-border bg-white flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por nome..." 
              className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/20 focus:border-brand-tinto transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
            <thead className="bg-brand-cream border-b border-brand-border text-brand-ink/70 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 border-r border-zinc-350">Filiado</th>
                <th className="px-6 py-4 border-r border-zinc-350 text-center">Status</th>
                <th className="px-6 py-4 border-r border-zinc-350">Data</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {!solicitacoes || solicitacoes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-550 italic font-serif">
                    Nenhuma solicitação de atualização cadastral encontrada.
                  </td>
                </tr>
              ) : (
                solicitacoes.map((solicitacao) => (
                  <tr key={solicitacao.id} className="hover:bg-brand-ink/5 transition-colors">
                    <td className="px-6 py-4 font-semibold text-brand-ink border-r border-brand-border">
                      {solicitacao.filiados?.nome || 'Filiado não encontrado'}
                    </td>
                    <td className="px-6 py-4 text-center border-r border-brand-border">
                      <div className="flex flex-col items-center gap-1.5">
                        {solicitacao.status === 'PENDENTE_ENVIO' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border bg-zinc-100 text-zinc-600 border-zinc-300">
                            <Clock size={10} /> Aguardando Filiado
                          </span>
                        )}
                        {solicitacao.status === 'EM_ANALISE' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border bg-amber-100 text-amber-700 border-amber-300">
                            <Clock size={10} /> Em Análise
                          </span>
                        )}
                        {solicitacao.status === 'APROVADO' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border bg-green-100 text-green-700 border-green-300">
                            <CheckCircle size={10} /> Aprovado
                          </span>
                        )}
                        {solicitacao.status === 'REJEITADO' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border bg-red-100 text-red-700 border-red-300">
                            <XCircle size={10} /> Rejeitado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-brand-ink/80 border-r border-brand-border text-xs">
                      {format(new Date(solicitacao.created_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {solicitacao.status === 'EM_ANALISE' ? (
                        <div className="flex justify-end gap-2">
                          <Link 
                            href={`/admin/filiados/atualizacoes/${solicitacao.id}`}
                            className="px-3 py-1 bg-brand-ink text-white text-xs font-semibold rounded hover:bg-brand-ink/90 transition-colors"
                          >
                            Revisar
                          </Link>
                          <AprovarRejeitarButtons solicitacaoId={solicitacao.id} />
                        </div>
                      ) : (
                        <Link 
                          href={`/admin/filiados/atualizacoes/${solicitacao.id}`}
                          className="text-xs font-medium text-brand-tinto hover:underline"
                        >
                          Ver Detalhes
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPageWrapper>
  )
}
