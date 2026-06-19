'use client'

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface FinancialLineChartProps {
  data: {
    mes: string
    Entradas: number
    Saidas: number
  }[]
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    compactDisplay: 'short'
  }).format(value)
}

const formatTooltipCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function FinancialLineChart({ data }: FinancialLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-brand-ink/40 italic">
        Dados financeiros insuficientes para os últimos meses.
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/60 mb-6 font-serif text-center">
        Evolução Caixa (Últimos 6 meses)
      </h3>
      
      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#48bb78" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#48bb78" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e53e3e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#e53e3e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
            <XAxis 
              dataKey="mes" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#71717a' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#71717a' }}
              tickFormatter={formatCurrency}
              width={60}
            />
            <Tooltip 
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [formatTooltipCurrency(Number(value)), '']}
              labelStyle={{ color: '#18181b', fontWeight: 'bold', marginBottom: '4px' }}
              contentStyle={{ backgroundColor: '#faf8f5', borderColor: '#e4e4e7', fontSize: '12px' }}
            />
            <Area 
              type="monotone" 
              dataKey="Entradas" 
              stroke="#48bb78" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorEntradas)" 
              activeDot={{ r: 4 }}
            />
            <Area 
              type="monotone" 
              dataKey="Saidas" 
              stroke="#e53e3e" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorSaidas)" 
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-1.5 text-xs text-brand-ink/80">
          <div className="w-2.5 h-2.5 rounded-full bg-[#48bb78]"></div>
          <span>Entradas</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-brand-ink/80">
          <div className="w-2.5 h-2.5 rounded-full bg-[#e53e3e]"></div>
          <span>Saídas</span>
        </div>
      </div>
    </div>
  )
}
