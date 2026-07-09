'use client'

import { NIVEIS } from '../data/criterios-rsc'

interface SeletorNivelProps {
  nivelSelecionado: string | null
  onSelectNivel: (nivelId: string) => void
  pontuacaoTotal: number
}

export function SeletorNivel({ nivelSelecionado, onSelectNivel, pontuacaoTotal }: SeletorNivelProps) {
  return (
    <div className="bg-white border border-brand-border-muted rounded-2xl p-5">
      <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
        Selecione o nível desejado
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {NIVEIS.map(nivel => {
          const isActive = nivelSelecionado === nivel.id
          const progresso = Math.min((pontuacaoTotal / nivel.pontos) * 100, 100)
          const atingiu = pontuacaoTotal >= nivel.pontos

          return (
            <button
              key={nivel.id}
              type="button"
              onClick={() => onSelectNivel(nivel.id)}
              className={`text-left rounded-xl p-3.5 border-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-brand-tinto bg-red-50'
                  : 'border-brand-border-muted bg-white hover:bg-brand-cream'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-bold ${isActive ? 'text-brand-tinto' : 'text-brand-ink'}`}>
                  {nivel.nome}
                </span>
                {pontuacaoTotal > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${atingiu ? 'bg-green-500 text-white' : 'bg-zinc-200 text-zinc-500'}`}>
                    {atingiu ? '✓ OK' : `${pontuacaoTotal}/${nivel.pontos}`}
                  </span>
                )}
              </div>

              <p className={`text-[11px] ${isActive ? 'text-brand-tinto/70' : 'text-zinc-400'}`}>
                ≡ {nivel.eq}
              </p>

              <div className="mt-2 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${atingiu ? 'bg-green-500' : pontuacaoTotal > 0 ? 'bg-amber-400' : 'bg-zinc-200'}`}
                  style={{ width: `${progresso}%` }}
                />
              </div>

              <div className="flex justify-between items-center mt-1.5">
                <span className="text-[10px] text-zinc-400 font-medium">
                  {pontuacaoTotal} / {nivel.pontos} pts
                </span>
                <span className="text-[10px] text-zinc-400">
                  mín. {nivel.criterios} critério{nivel.criterios !== 1 ? 's' : ''}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
