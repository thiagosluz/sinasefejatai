'use client'

import { useCallback, useState } from 'react'
import { ChevronDown, Minus, Plus } from 'lucide-react'

import { getItensPorReq, isPorAno, ITENS, NOMES_REQ, REQS_ORDENADOS } from '../data/criterios-rsc'

import type { OcorrenciaItem, PeriodoItem } from './calculadora-cliente'
import { calcFracoes } from './calculadora-cliente'

interface ListaCriteriosProps {
  qtds: number[]
  detalhes: OcorrenciaItem[][]
  periodos: PeriodoItem[]
  onQtdChange: (itemIdx: number, qty: number) => void
  onDetalheChange: (itemIdx: number, ocIdx: number, oc: OcorrenciaItem) => void
  onPeriodoChange: (itemIdx: number, field: 'inicio' | 'fim' | 'descricao', value: string) => void
  pontuacaoPorReq: Record<string, number>
}

export function ListaCriterios({ qtds, detalhes, periodos, onQtdChange, onDetalheChange, onPeriodoChange, pontuacaoPorReq }: ListaCriteriosProps) {
  const [abertos, setAbertos] = useState<Record<string, boolean>>({})

  const toggleReq = useCallback((req: string) => {
    setAbertos(prev => ({ ...prev, [req]: !prev[req] }))
  }, [])

  return (
    <div className="space-y-3">
      {REQS_ORDENADOS.map(req => {
        const isOpen = abertos[req] ?? false
        const pts = pontuacaoPorReq[req] ?? 0
        const itensReq = getItensPorReq(req)

        return (
          <div key={req} className="bg-white border border-brand-border-muted rounded-2xl overflow-hidden">
            {/* Header */}
            <button
              type="button"
              onClick={() => toggleReq(req)}
              className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-brand-cream/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#005B2F] text-white text-xs font-bold shrink-0">
                  {req}
                </span>
                <div className="text-left">
                  <p className="text-sm font-bold text-brand-ink">{NOMES_REQ[req]}</p>
                  <p className="text-[11px] text-zinc-400">{itensReq.length} itens</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {pts > 0 && (
                  <span className="text-sm font-bold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg">
                    {pts} pts
                  </span>
                )}
                <ChevronDown
                  size={18}
                  className={`text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {/* Items */}
            {isOpen && (
              <div className="border-t border-brand-border-muted px-5 pb-4">
                {itensReq.map(item => {
                  const globalIdx = ITENS.indexOf(item)
                  const qty = qtds[globalIdx]
                  const itemPts = qty * item.pts
                  const porAno = isPorAno(item)

                  return (
                    <div key={`${item.req}-${item.num}`} className="py-3.5 border-b border-brand-border-muted last:border-b-0">
                      <div className="flex items-start gap-3">
                        {/* Description */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-zinc-400 font-medium mb-0.5">
                            Item {item.num} · {item.unidade}
                          </p>
                          <p className="text-[13px] text-brand-ink leading-snug">{item.desc}</p>
                          <p className="text-[11px] text-zinc-400 mt-1 italic">{item.exemplo}</p>
                        </div>

                        {/* Points */}
                        <span className={`text-xs font-medium shrink-0 pt-1 ${qty > 0 ? 'text-green-600' : 'text-zinc-300'}`}>
                          {itemPts} pts
                        </span>

                        {/* Quantity controls (only for non-"por ano" items) */}
                        {!porAno && (
                          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                            <button
                              type="button"
                              onClick={() => qty > 0 && onQtdChange(globalIdx, qty - 1)}
                              disabled={qty <= 0}
                              className="w-7 h-7 rounded-full border border-brand-border flex items-center justify-center text-brand-ink hover:bg-brand-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-medium text-brand-ink min-w-[20px] text-center">{qty}</span>
                            <button
                              type="button"
                              onClick={() => onQtdChange(globalIdx, qty + 1)}
                              className="w-7 h-7 rounded-full border border-brand-border flex items-center justify-center text-brand-ink hover:bg-brand-cream transition-colors cursor-pointer"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Period card for "por ano" items */}
                      {porAno && (
                        <PeriodoCard
                          periodo={periodos[globalIdx]}
                          fracoes={qty}
                          ptsUnidade={item.pts}
                          onChange={(field, val) => onPeriodoChange(globalIdx, field, val)}
                        />
                      )}

                      {/* Ocorrência cards for regular items */}
                      {!porAno && detalhes[globalIdx]?.length > 0 && (
                        <div className="mt-3 space-y-2.5 ml-0 sm:ml-4">
                          {detalhes[globalIdx].map((oc, idx) => (
                            <div
                              key={idx}
                              className="rounded-xl border p-3 border-blue-200 bg-blue-50/50 border-l-4 border-l-blue-400"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-bold text-blue-700">Ocorrência {idx + 1}</span>
                                <span className="text-[11px] font-semibold text-green-600">+{item.pts} pts</span>
                              </div>
                              <label className="block text-[10px] font-semibold text-zinc-400 mb-1">Descrição / Comprovante</label>
                              <textarea
                                value={oc.descricao}
                                onChange={e => onDetalheChange(globalIdx, idx, { ...oc, descricao: e.target.value })}
                                placeholder="Descreva brevemente a atividade realizada e o documento comprobatório..."
                                rows={2}
                                className="w-full px-2.5 py-1.5 text-xs border border-brand-border rounded-lg bg-white text-brand-ink placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors resize-vertical"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Período Card (for "por ano" items) ──

function PeriodoCard({
  periodo,
  fracoes,
  ptsUnidade,
  onChange,
}: {
  periodo: PeriodoItem
  fracoes: number
  ptsUnidade: number
  onChange: (field: 'inicio' | 'fim' | 'descricao', val: string) => void
}) {
  const totalPts = fracoes * ptsUnidade

  return (
    <div className="mt-3 rounded-xl border p-3 border-purple-200 bg-purple-50/50 border-l-4 border-l-purple-400">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
        <span className="text-[11px] font-bold text-purple-700">Período de atuação</span>
        <span className="text-[11px] font-semibold text-green-600">
          {fracoes > 0 ? `${fracoes} ano(s) → ${totalPts} pts` : '—'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-2.5">
        <div>
          <label className="block text-[10px] font-semibold text-zinc-400 mb-1">Início</label>
          <input
            type="month"
            value={periodo.inicio}
            onChange={e => onChange('inicio', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-brand-border rounded-lg bg-white text-brand-ink focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-zinc-400 mb-1">Fim</label>
          <input
            type="month"
            value={periodo.fim}
            onChange={e => onChange('fim', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-brand-border rounded-lg bg-white text-brand-ink focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-colors"
          />
        </div>
      </div>

      {periodo.inicio && periodo.fim && (
        <p className="text-[11px] text-zinc-500 bg-white rounded-lg border border-brand-border-muted px-2.5 py-1.5 mb-2">
          <strong>Cálculo:</strong> {calcFracoes(periodo.inicio, periodo.fim)} fração(ões) de ano × {ptsUnidade} pts = <strong className="text-green-600">{totalPts} pts</strong>
        </p>
      )}

      <label className="block text-[10px] font-semibold text-zinc-400 mb-1">Descrição / Comprovante</label>
      <textarea
        value={periodo.descricao}
        onChange={e => onChange('descricao', e.target.value)}
        placeholder="Descreva a atividade e o documento comprobatório..."
        rows={2}
        className="w-full px-2.5 py-1.5 text-xs border border-brand-border rounded-lg bg-white text-brand-ink placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-colors resize-vertical"
      />
    </div>
  )
}
