'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface FinancialBarChartProps {
  data: {
    categoria: string
    valor: number
  }[]
}

const formatTooltipCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { value: number; payload: { categoria: string } }[] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#faf8f5] border border-[#e4e4e7] p-2 text-xs shadow-sm">
        <p className="font-bold text-brand-ink mb-1">{payload[0].payload.categoria}</p>
        <p className="text-brand-tinto">{formatTooltipCurrency(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export function FinancialBarChart({ data }: FinancialBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-brand-ink/40 italic">
        Nenhuma despesa registrada no mês atual.
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/60 mb-4 font-serif text-center">
        Top 5 Despesas (Mês Atual)
      </h3>
      
      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e4e4e7" />
            <XAxis type="number" hide />
            <YAxis 
              type="category" 
              dataKey="categoria" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#71717a' }}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f4f4f5' }} />
            <Bar 
              dataKey="valor" 
              fill="#9b2c2c" 
              radius={[0, 4, 4, 0]} 
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
