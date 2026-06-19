'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface DemographicsChartsProps {
  categorias: { name: string; value: number }[]
  situacoes: { name: string; value: number }[]
}

const COLORS_CATEGORIA = ['#9b2c2c', '#c53030'] // Tons de tinto/vermelho
const COLORS_SITUACAO = ['#2d3748', '#a0aec0'] // Tons de cinza/chumbo

export function DemographicsCharts({ categorias, situacoes }: DemographicsChartsProps) {
  // Ignorar dados vazios
  const hasCategorias = categorias.some((c) => c.value > 0)
  const hasSituacoes = situacoes.some((s) => s.value > 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full h-full">
      {/* Gráfico 1: Categorias */}
      <div className="flex flex-col items-center justify-center h-full">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/60 mb-2 font-serif text-center">
          Distribuição por Categoria
        </h3>
        {hasCategorias ? (
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorias}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {categorias.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_CATEGORIA[index % COLORS_CATEGORIA.length]} />
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
        
        {/* Legenda Customizada */}
        {hasCategorias && (
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {categorias.map((entry, index) => (
              <div key={`legend-${index}`} className="flex items-center gap-1.5 text-xs text-brand-ink/80">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS_CATEGORIA[index % COLORS_CATEGORIA.length] }}></div>
                <span>{entry.name || 'Não informado'} ({entry.value})</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gráfico 2: Situação */}
      <div className="flex flex-col items-center justify-center h-full">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/60 mb-2 font-serif text-center">
          Status de Atividade
        </h3>
        {hasSituacoes ? (
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={situacoes}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {situacoes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_SITUACAO[index % COLORS_SITUACAO.length]} />
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
        
        {/* Legenda Customizada */}
        {hasSituacoes && (
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {situacoes.map((entry, index) => (
              <div key={`legend-${index}`} className="flex items-center gap-1.5 text-xs text-brand-ink/80">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS_SITUACAO[index % COLORS_SITUACAO.length] }}></div>
                <span>{entry.name || 'Não informado'} ({entry.value})</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
