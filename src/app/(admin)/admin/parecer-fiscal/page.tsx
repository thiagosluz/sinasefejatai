import { FileSearch } from 'lucide-react'
import Link from 'next/link'

import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata = {
  title: 'Parecer Fiscal | SINASEFE JATAÍ',
}

export const dynamic = 'force-dynamic'

export default async function ParecerFiscalPage() {
  const supabase = createAdminClient()

  // Buscar todas as prestações que já foram enviadas
  const { data: prestacoes, error } = await supabase
    .from('financeiro_prestacoes_mensais')
    .select('*')
    .order('mes_ano', { ascending: false })

  if (error) {
    console.error('Erro buscando prestações:', error)
  }

  return (
    <AdminPageWrapper>
      <AdminPageHeader titulo="Parecer Fiscal" subtitulo="Análise e aprovação de prestações de contas pelo Conselho Fiscal">
      </AdminPageHeader>
      
      <div className="bg-white border border-zinc-200 shadow-sm p-6">
        {(!prestacoes || prestacoes.length === 0) ? (
          <div className="text-center py-12 text-zinc-500">
            Nenhuma prestação de contas foi enviada ao conselho ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="px-4 py-3 font-semibold text-zinc-700">Mês / Ano</th>
                  <th className="px-4 py-3 font-semibold text-zinc-700">Status</th>
                  <th className="px-4 py-3 font-semibold text-zinc-700">Enviado em</th>
                  <th className="px-4 py-3 font-semibold text-zinc-700 w-24">Ações</th>
                </tr>
              </thead>
              <tbody>
                {prestacoes.map(p => (
                  <tr key={p.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-brand-ink">{p.mes_ano}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-sm
                        ${p.status === 'APROVADO' ? 'bg-green-100 text-green-800' : 
                          p.status === 'REJEITADO' ? 'bg-red-100 text-red-800' : 
                          p.status === 'COM_RESSALVAS' ? 'bg-orange-100 text-orange-800' : 
                          'bg-blue-100 text-blue-800'}`}
                      >
                        {p.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {new Intl.DateTimeFormat('pt-BR').format(new Date(p.created_at))}
                    </td>
                    <td className="px-4 py-3">
                      <Link 
                        href={`/admin/parecer-fiscal/${p.mes_ano}`}
                        className="text-brand-tinto hover:text-brand-tinto-light hover:underline flex items-center gap-1 font-semibold"
                      >
                        <FileSearch size={16} /> Analisar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminPageWrapper>
  )
}
