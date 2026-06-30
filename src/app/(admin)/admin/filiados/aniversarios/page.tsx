import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'

import ConfigAniversarioForm from './components/config-aniversario-form'
import { getAniversariosConfig, getHistoricoAniversarios } from './actions'

export default async function AniversariosPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const resolvedParams = await searchParams
  const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1
  
  const [config, historicoData] = await Promise.all([
    getAniversariosConfig(),
    getHistoricoAniversarios(page)
  ])

  return (
    <AdminPageWrapper>
      <AdminPageHeader 
        titulo="Automação de Aniversários" 
        subtitulo="Envio automático de felicitações aos filiados"
      />

      <ConfigAniversarioForm initialConfig={config} />

      <h3 className="text-xl font-bold text-brand-ink mb-4 font-serif">Histórico de Envios</h3>

      {/* Tabela estilo Fichário Físico */}
      <div className="bg-brand-card border border-brand-border shadow-xl overflow-hidden mb-8">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
            <thead className="bg-brand-cream border-b border-brand-border text-brand-ink/70 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 border-r border-zinc-350">Data / Hora do Envio</th>
                <th className="px-6 py-4 border-r border-zinc-350">Filiado</th>
                <th className="px-6 py-4 border-r border-zinc-350">E-mail de Destino</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {historicoData.historico.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-550 italic font-serif">
                    Nenhum envio de e-mail de aniversário registrado no histórico até o momento.
                  </td>
                </tr>
              ) : (
                historicoData.historico.map((item) => (
                  <tr key={item.id} className="hover:bg-brand-ink/5 transition-colors">
                    <td className="px-6 py-4 text-brand-ink font-medium text-xs border-r border-brand-border">
                      {new Date(item.enviado_em).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 font-semibold text-brand-ink border-r border-brand-border">
                      {item.filiado_nome}
                    </td>
                    <td className="px-6 py-4 text-brand-ink/80 border-r border-brand-border text-xs">
                      {item.filiado_email}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.status === 'sucesso' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-brand-olive/10 text-brand-olive border border-brand-olive/30">
                          Sucesso
                        </span>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-brand-tinto/10 text-brand-tinto border border-brand-tinto/30">
                            Falha
                          </span>
                          {item.erro_msg && (
                            <span className="text-[10px] text-zinc-500 truncate max-w-[150px]" title={item.erro_msg}>
                              {item.erro_msg}
                            </span>
                          )}
                        </div>
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
