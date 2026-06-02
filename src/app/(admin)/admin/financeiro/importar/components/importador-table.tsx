import { Calendar, Check, CheckCircle, HelpCircle } from 'lucide-react'

import { OFXTransaction } from '@/lib/ofx-parser'

export interface ExtendedTransaction extends OFXTransaction {
  selected: boolean;
  categoria: string;
  alreadyExists: boolean;
}

interface ImportadorTableProps {
  transacoes: ExtendedTransaction[]
  categoriasEntrada: string[]
  categoriasSaida: string[]
  onToggleAll: (val: boolean) => void
  onToggleSelect: (index: number) => void
  onCategoryChange: (index: number, cat: string) => void
}

export function ImportadorTable({
  transacoes,
  categoriasEntrada,
  categoriasSaida,
  onToggleAll,
  onToggleSelect,
  onCategoryChange
}: ImportadorTableProps) {
  const isAllSelected = transacoes.filter(t => !t.alreadyExists).length > 0 
    && transacoes.filter(t => !t.alreadyExists).every(t => t.selected)

  return (
    <div className="bg-brand-card border border-brand-border shadow-xl overflow-hidden">
      <div className="bg-brand-border/20 px-6 py-3 border-b border-brand-border flex items-center justify-between text-xs font-bold text-brand-ink/70 uppercase tracking-wider">
        <span>Conciliar Lançamentos</span>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onToggleAll(true)}
            className="hover:text-brand-tinto transition-colors cursor-pointer text-[10px]"
          >
            Selecionar Todos
          </button>
          <span className="text-brand-border">|</span>
          <button 
            onClick={() => onToggleAll(false)}
            className="hover:text-brand-tinto transition-colors cursor-pointer text-[10px]"
          >
            Limpar Seleções
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
          <thead className="bg-brand-border/40 border-b border-brand-border text-brand-ink/70 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="py-4 px-6 border-r border-brand-border w-12 text-center">
                <input 
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => onToggleAll(e.target.checked)}
                  className="cursor-pointer accent-brand-tinto rounded-none"
                />
              </th>
              <th className="py-4 px-6 border-r border-brand-border w-32">Data</th>
              <th className="py-4 px-6 border-r border-brand-border">Descrição Original</th>
              <th className="py-4 px-6 border-r border-brand-border w-48 text-center">Fluxo</th>
              <th className="py-4 px-6 border-r border-brand-border text-right w-40">Valor</th>
              <th className="py-4 px-6 border-r border-brand-border w-64">Categoria Sugerida</th>
              <th className="py-4 px-6 text-center w-36">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border bg-white font-mono">
            {transacoes.map((t, idx) => (
              <tr 
                key={t.id} 
                className={`hover:bg-brand-cream/20 transition-all ${
                  t.alreadyExists 
                    ? 'bg-zinc-100/70 text-zinc-400' 
                    : t.selected 
                      ? 'bg-white' 
                      : 'bg-zinc-50/50 text-zinc-500'
                }`}
              >
                <td className="py-4 px-6 border-r border-brand-border text-center">
                  <input 
                    type="checkbox" 
                    checked={t.selected}
                    disabled={t.alreadyExists}
                    onChange={() => onToggleSelect(idx)}
                    className="cursor-pointer accent-brand-tinto disabled:opacity-40 disabled:cursor-not-allowed rounded-none"
                  />
                </td>
                <td className="py-4 px-6 border-r border-brand-border font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="opacity-40" />
                    <span>
                      {new Date(t.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6 border-r border-brand-border max-w-xs truncate font-semibold" title={t.descricao}>
                  {t.descricao}
                </td>
                <td className="py-4 px-6 border-r border-brand-border text-center">
                  <span className={`inline-block px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider border rounded-none ${
                    t.tipo === 'Entrada' 
                      ? 'bg-brand-olive/10 border-brand-olive/20 text-brand-olive' 
                      : 'bg-brand-tinto/10 border-brand-tinto/20 text-brand-tinto'
                  }`}>
                    {t.tipo}
                  </span>
                </td>
                <td className={`py-4 px-6 border-r border-brand-border text-right font-bold ${
                  t.tipo === 'Entrada' ? 'text-brand-olive' : 'text-brand-tinto'
                }`}>
                  R$ {t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 border-r border-brand-border">
                  <select
                    value={t.categoria}
                    disabled={t.alreadyExists || !t.selected}
                    onChange={(e) => onCategoryChange(idx, e.target.value)}
                    className="w-full bg-brand-cream border border-brand-border text-xs px-2 py-1.5 focus:outline-none focus:border-brand-tinto cursor-pointer rounded-none disabled:opacity-50 disabled:cursor-not-allowed font-sans font-bold"
                  >
                    {t.tipo === 'Entrada' 
                      ? categoriasEntrada.map(c => <option key={c} value={c}>{c}</option>)
                      : categoriasSaida.map(c => <option key={c} value={c}>{c}</option>)
                    }
                  </select>
                </td>
                <td className="py-4 px-6 text-center text-[10px] font-bold uppercase tracking-wide">
                  {t.alreadyExists ? (
                    <span className="text-zinc-400 flex items-center justify-center gap-1">
                      <CheckCircle size={13} className="text-zinc-400 shrink-0" />
                      <span>Importado</span>
                    </span>
                  ) : t.selected ? (
                    <span className="text-brand-olive flex items-center justify-center gap-1">
                      <Check size={13} className="shrink-0" />
                      <span>Pronto</span>
                    </span>
                  ) : (
                    <span className="text-zinc-400 flex items-center justify-center gap-1">
                      <HelpCircle size={13} className="shrink-0 text-zinc-300" />
                      <span>Ignorado</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
