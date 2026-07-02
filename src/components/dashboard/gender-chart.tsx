'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface GenderChartProps {
  data: { name: string; value: number }[]
}

const COLORS: Record<string, string> = {
  Masculino: '#2d3748',
  Feminino: '#9b2c2c',
  Outro: '#718096',
  'Não informado': '#cbd5e0',
}

export function GenderChart({ data }: GenderChartProps) {
  const hasData = data.some((d) => d.value > 0)

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/60 mb-2 font-serif text-center">
        Distribuição por Gênero
      </h3>
      {hasData ? (
        <div className="w-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#a0aec0'} />
                ))}
              </Pie>
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [`${value} Filiados`, 'Quantidade']}
                contentStyle={{ backgroundColor: '#faf8f5', borderColor: '#e4e4e7', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center text-xs text-brand-ink/40 italic">Sem dados</div>
      )}

      {hasData && (
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          {data.map((entry, index) => (
            <div key={`legend-${index}`} className="flex items-center gap-1.5 text-xs text-brand-ink/80">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[entry.name] || '#a0aec0' }}></div>
              <span>{entry.name} ({entry.value})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
