import { memo } from 'react'
import { Edit, FileText, Trash2 } from 'lucide-react'

import { Transacao } from '../types'

interface FinanceiroTableProps {
  transacoes: Transacao[]
  onEdit: (t: Transacao) => void
  onDelete: (id: string) => void
}

export const FinanceiroTable = memo(function FinanceiroTable({ transacoes, onEdit, onDelete }: FinanceiroTableProps) {
  return (
    <div className="bg-brand-card border border-brand-border shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
          <thead className="bg-brand-border/40 border-b border-brand-border text-brand-ink/70 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="py-4 px-6 border-r border-brand-border">Data</th>
              <th className="py-4 px-6 border-r border-brand-border">Descrição / Histórico</th>
              <th className="py-4 px-6 border-r border-brand-border">Categoria</th>
              <th className="py-4 px-6 border-r border-brand-border text-center">Fluxo</th>
              <th className="py-4 px-6 border-r border-brand-border text-right">Valor</th>
              <th className="py-4 px-6 border-r border-brand-border text-center">Recibo</th>
              <th className="py-4 px-6 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {transacoes.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-brand-ink/50 italic font-serif">
                  Nenhum lançamento contábil registrado para os filtros ativos.
                </td>
              </tr>
            ) : (
              transacoes.map((t) => (
                <tr key={t.id} className="hover:bg-brand-cream/40 transition-colors">
                  <td className="py-4 px-6 font-semibold text-brand-ink border-r border-brand-border">
                    {new Date(t.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-4 px-6 text-brand-ink border-r border-brand-border max-w-xs truncate" title={t.descricao}>
                    {t.descricao}
                  </td>
                  <td className="py-4 px-6 text-brand-ink/70 border-r border-brand-border text-xs font-bold uppercase tracking-wider">
                    {t.categoria}
                  </td>
                  <td className="py-4 px-6 text-center border-r border-brand-border">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                      t.tipo === 'Entrada' 
                        ? 'bg-brand-olive/10 text-brand-olive border-brand-olive/30' 
                        : 'bg-brand-tinto/10 text-brand-tinto border-brand-tinto/30'
                    }`}>
                      {t.tipo === 'Entrada' ? 'Entrada' : 'Saída'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-brand-ink border-r border-brand-border">
                    R$ {Number(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-6 text-center border-r border-brand-border">
                    {t.comprovante_url ? (
                      <a 
                        href={t.comprovante_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 border border-brand-tinto bg-brand-cream text-brand-tinto px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider hover:bg-brand-tinto hover:text-white transition-all shadow-[1px_1px_0px_var(--brand-tinto)] hover:shadow-none"
                      >
                        <FileText size={11} />
                        <span>Ver Recibo</span>
                      </a>
                    ) : (
                      <span className="text-brand-ink/40 text-xs font-medium">-</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => onEdit(t)}
                        className="p-1 hover:bg-brand-cream text-brand-ink/50 hover:text-brand-olive transition-colors cursor-pointer"
                        title="Editar Lançamento"
                      >
                        <Edit size={15} />
                      </button>
                      <button 
                        onClick={() => onDelete(t.id)}
                        className="p-1 hover:bg-brand-cream text-brand-ink/50 hover:text-brand-tinto transition-colors cursor-pointer"
                        title="Excluir Lançamento"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
})
