'use client'

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface AgeRangeChartProps {
  data: { faixa: string; quantidade: number }[]
}

const BAR_COLOR = '#9b2c2c'

export function AgeRangeChart({ data }: AgeRangeChartProps) {
  const hasData = data.some((d) => d.quantidade > 0)

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/60 mb-2 font-serif text-center">
        Distribuição por Faixa Etária
      </h3>
      {hasData ? (
        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <XAxis
                dataKey="faixa"
                tick={{ fontSize: 10, fill: '#2d3748' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: '#2d3748' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [`${value} Filiados`, 'Quantidade']}
                contentStyle={{ backgroundColor: '#faf8f5', borderColor: '#e4e4e7', fontSize: '12px' }}
              />
              <Bar dataKey="quantidade" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {data.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={BAR_COLOR} opacity={0.7 + (index * 0.05)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-56 flex items-center justify-center text-xs text-brand-ink/40 italic">Sem dados</div>
      )}
    </div>
  )
}
