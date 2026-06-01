import { ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react'

interface FinanceiroStatsProps {
  totalEntradas: number
  totalSaidas: number
  saldoTotal: number
}

export function FinanceiroStats({ totalEntradas, totalSaidas, saldoTotal }: FinanceiroStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Card Entradas */}
      <div className="bg-brand-card border border-brand-border p-6 rounded-none flex items-center justify-between shadow-lg">
        <div>
          <span className="text-xs font-bold text-brand-ink/60 uppercase tracking-wider block mb-1">Total Entradas</span>
          <span className="text-2xl font-bold text-brand-olive">
            R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="bg-brand-olive/10 border border-brand-olive/20 p-3 text-brand-olive">
          <ArrowUpRight size={24} />
        </div>
      </div>

      {/* Card Saídas */}
      <div className="bg-brand-card border border-brand-border p-6 rounded-none flex items-center justify-between shadow-lg">
        <div>
          <span className="text-xs font-bold text-brand-ink/60 uppercase tracking-wider block mb-1">Total Saídas</span>
          <span className="text-2xl font-bold text-brand-tinto">
            R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="bg-brand-tinto/10 border border-brand-tinto/20 p-3 text-brand-tinto">
          <ArrowDownRight size={24} />
        </div>
      </div>

      {/* Card Saldo Consolidado */}
      <div className="bg-brand-card border border-brand-border p-6 rounded-none flex items-center justify-between shadow-lg">
        <div>
          <span className="text-xs font-bold text-brand-ink/60 uppercase tracking-wider block mb-1">Saldo Líquido</span>
          <span className={`text-2xl font-bold ${saldoTotal >= 0 ? 'text-brand-olive' : 'text-brand-tinto'}`}>
            R$ {saldoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className={`p-3 border ${
          saldoTotal >= 0 
            ? 'bg-brand-olive/10 border-brand-olive/20 text-brand-olive' 
            : 'bg-brand-tinto/10 border-brand-tinto/20 text-brand-tinto'
        }`}>
          <DollarSign size={24} />
        </div>
      </div>
    </div>
  )
}
