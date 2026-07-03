import { ShieldAlert } from 'lucide-react'

import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'
import { createClient } from '@/lib/supabase/server'

// Utilizar o mesmo date formater que usamos no painel
function formatData(isoString: string) {
  const data = new Date(isoString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  }).format(data)
}

export default async function AuditoriaPage() {
  const supabase = await createClient()

  // Buscar os últimos 100 logs
  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <AdminPageWrapper>
      <AdminPageHeader titulo="Auditoria do Sistema" subtitulo="Registro de Segurança e Atividades Recentes">
        <div className="bg-brand-ink text-brand-cream text-xs font-serif font-bold uppercase tracking-wider py-2.5 px-4 shadow-[2px_2px_0px_var(--brand-tinto)] flex items-center gap-2">
          <ShieldAlert size={15} />
          <span>Protegido por DAL</span>
        </div>
      </AdminPageHeader>

      {/* Tabela estilo Fichário Físico */}
      <div className="bg-brand-card border border-brand-border shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
            <thead className="bg-brand-cream border-b border-brand-border text-brand-ink/70 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 border-r border-zinc-350">Data / Hora</th>
                <th className="px-6 py-4 border-r border-zinc-350">Usuário Responsável</th>
                <th className="px-6 py-4 border-r border-zinc-350 text-center">Ação</th>
                <th className="px-6 py-4 border-r border-zinc-350 text-center">Módulo</th>
                <th className="px-6 py-4">Detalhes Técnicos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {!logs || logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-550 italic font-serif">
                    Nenhum registro de auditoria capturado.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-brand-ink/5 transition-colors">
                    <td className="px-6 py-4 font-semibold text-brand-ink border-r border-brand-border text-xs">
                      {log.created_at ? formatData(log.created_at) : '-'}
                    </td>
                    <td className="px-6 py-4 text-brand-ink/80 border-r border-brand-border text-xs font-medium">
                      {log.user_email || 'Sistema / Desconhecido'}
                    </td>
                    <td className="px-6 py-4 text-center border-r border-brand-border">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                        log.action.includes('ERROR') || log.action.includes('FAIL') || log.action === 'DELETE'
                          ? 'bg-brand-tinto/10 text-brand-tinto border-brand-tinto/30'
                          : log.action === 'UPDATE' || log.action === 'LOGOUT'
                            ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                            : 'bg-brand-olive/10 text-brand-olive border-brand-olive/30'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-r border-brand-border text-center">
                      <div className="text-brand-ink text-xs font-bold uppercase">{log.resource}</div>
                    </td>
                    <td className="px-6 py-4">
                      {log.details ? (
                        <details className="cursor-pointer">
                          <summary className="text-[11px] font-bold text-brand-ink/70 hover:text-brand-ink uppercase tracking-wider">
                            Ver JSON
                          </summary>
                          <pre className="mt-2 text-[10px] bg-brand-cream/50 p-2 border border-brand-border/50 rounded-sm overflow-x-auto max-w-[300px]">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-[11px] text-zinc-400 italic">Sem detalhes adicionais</span>
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
