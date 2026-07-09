'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Download, RotateCcw, Save } from 'lucide-react'

import { getItensPorReq, ITENS, NIVEIS, REQS_ORDENADOS } from '../data/criterios-rsc'

import { GeradorMemorial } from './gerador-memorial'
import { ListaCriterios } from './lista-criterios'
import { SeletorNivel } from './seletor-nivel'

// ── Types ──

export interface OcorrenciaItem {
  descricao: string
  inicio?: string
  fim?: string
}

/** For "por ano" items: single period entry */
export interface PeriodoItem {
  inicio: string
  fim: string
  descricao: string
}

export interface CalculadoraState {
  nivelSelecionado: string | null
  /** qtds[itemIndex] = quantity */
  qtds: number[]
  /** detalhes[itemIndex][ocorrenciaIndex] = OcorrenciaItem */
  detalhes: OcorrenciaItem[][]
  /** periodos[itemIndex] = PeriodoItem (for "por ano" items) */
  periodos: PeriodoItem[]
  memorial: MemorialDados
}

export interface MemorialDados {
  nome: string
  siape: string
  cpf: string
  cargo: string
  ies: string
  setor: string
  nivel: string
  ingresso: string
  ultima: string
  saldo: string
  trajetoria: string
  consideracoes: string
  local: string
}

const STORAGE_KEY = 'sinasefe-rsc-calculadora'

function getDefaultState(): CalculadoraState {
  return {
    nivelSelecionado: null,
    qtds: new Array(ITENS.length).fill(0),
    detalhes: Array.from({ length: ITENS.length }, () => []),
    periodos: Array.from({ length: ITENS.length }, () => ({ inicio: '', fim: '', descricao: '' })),
    memorial: {
      nome: '', siape: '', cpf: '', cargo: '', ies: '', setor: '',
      nivel: '', ingresso: '', ultima: '', saldo: '',
      trajetoria: '', consideracoes: '', local: '',
    },
  }
}

function loadState(): CalculadoraState {
  if (typeof window === 'undefined') return getDefaultState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as CalculadoraState
      // Ensure arrays match current ITENS length
      if (parsed.qtds.length !== ITENS.length) return getDefaultState()
      return parsed
    }
  } catch { /* corrupt data */ }
  return getDefaultState()
}

function saveState(state: CalculadoraState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* quota exceeded */ }
}

/** Calcula anos/frações (>=6 meses conta como 1) */
export function calcFracoes(inicioStr: string, fimStr: string): number {
  if (!inicioStr || !fimStr) return 0
  const inicio = new Date(inicioStr)
  const fim = new Date(fimStr)
  if (isNaN(inicio.getTime()) || isNaN(fim.getTime()) || fim <= inicio) return 0

  let totalMeses = (fim.getFullYear() - inicio.getFullYear()) * 12 + (fim.getMonth() - inicio.getMonth())
  if (fim.getDate() < inicio.getDate()) totalMeses--

  const anosInteiros = Math.floor(totalMeses / 12)
  const mesesRestantes = totalMeses % 12
  return anosInteiros + (mesesRestantes > 6 ? 1 : 0)
}

// ── Component ──

export function CalculadoraCliente() {
  const [state, setState] = useState<CalculadoraState>(loadState)
  const [showMemorial, setShowMemorial] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const isInitialRender = useRef(true)

  // Auto-save on changes (skip initial render)
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }
    saveState(state)
  }, [state])

  const toast = useCallback((msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }, [])

  // ── Handlers ──

  const setNivel = useCallback((nivelId: string) => {
    setState(prev => ({ ...prev, nivelSelecionado: nivelId }))
  }, [])

  const setQtd = useCallback((itemIdx: number, qty: number) => {
    setState(prev => {
      const newQtds = [...prev.qtds]
      newQtds[itemIdx] = qty
      const newDetalhes = [...prev.detalhes]
      if (qty > prev.detalhes[itemIdx].length) {
        newDetalhes[itemIdx] = [...prev.detalhes[itemIdx], ...Array.from({ length: qty - prev.detalhes[itemIdx].length }, () => ({ descricao: '' }))]
      } else {
        newDetalhes[itemIdx] = prev.detalhes[itemIdx].slice(0, qty)
      }
      return { ...prev, qtds: newQtds, detalhes: newDetalhes }
    })
  }, [])

  const setDetalhe = useCallback((itemIdx: number, ocIdx: number, oc: OcorrenciaItem) => {
    setState(prev => {
      const newDetalhes = [...prev.detalhes]
      newDetalhes[itemIdx] = [...prev.detalhes[itemIdx]]
      newDetalhes[itemIdx][ocIdx] = oc
      return { ...prev, detalhes: newDetalhes }
    })
  }, [])

  const setPeriodo = useCallback((itemIdx: number, field: 'inicio' | 'fim' | 'descricao', value: string) => {
    setState(prev => {
      const newPeriodos = [...prev.periodos]
      newPeriodos[itemIdx] = { ...prev.periodos[itemIdx], [field]: value }
      // Auto-calculate qty for "por ano" items
      if (field === 'inicio' || field === 'fim') {
        const fracoes = calcFracoes(
          field === 'inicio' ? value : prev.periodos[itemIdx].inicio,
          field === 'fim' ? value : prev.periodos[itemIdx].fim,
        )
        const newQtds = [...prev.qtds]
        newQtds[itemIdx] = fracoes
        return { ...prev, periodos: newPeriodos, qtds: newQtds }
      }
      return { ...prev, periodos: newPeriodos }
    })
  }, [])

  const setMemorialDados = useCallback((dados: MemorialDados) => {
    setState(prev => ({ ...prev, memorial: dados }))
  }, [])

  const resetAll = useCallback(() => {
    const fresh = getDefaultState()
    setState(fresh)
    saveState(fresh)
    toast('Calculadora resetada')
  }, [toast])

  const handleSave = useCallback(() => {
    saveState(state)
    toast('Sessão salva com sucesso!')
  }, [state, toast])

  // ── Calculations ──

  const pontuacaoPorReq = useMemo(() => {
    const result: Record<string, number> = {}
    for (const req of REQS_ORDENADOS) {
      let total = 0
      const itensReq = getItensPorReq(req)
      for (const item of itensReq) {
        const globalIdx = ITENS.indexOf(item)
        total += state.qtds[globalIdx] * item.pts
      }
      result[req] = total
    }
    return result
  }, [state.qtds])

  const pontuacaoTotal = useMemo(() => {
    return Object.values(pontuacaoPorReq).reduce((a, b) => a + b, 0)
  }, [pontuacaoPorReq])

  /** Count how many distinct requisitos have at least 1 item with qty > 0 */
  const criteriosAtingidos = useMemo(() => {
    let count = 0
    for (const req of REQS_ORDENADOS) {
      const itensReq = getItensPorReq(req)
      const hasItem = itensReq.some(item => state.qtds[ITENS.indexOf(item)] > 0)
      if (hasItem) count++
    }
    return count
  }, [state.qtds])

  const reqsComPontos = useMemo(() => {
    return REQS_ORDENADOS.filter(req => {
      const itensReq = getItensPorReq(req)
      return itensReq.some(item => state.qtds[ITENS.indexOf(item)] > 0)
    })
  }, [state.qtds])

  const nivelAtual = useMemo(() => {
    return NIVEIS.find(n => n.id === state.nivelSelecionado)
  }, [state.nivelSelecionado])

  const validacaoNivel = useMemo(() => {
    if (!nivelAtual) return { atingiuPontos: false, atingiuCriterios: false, atingiuObrigatorios: false, aprovado: false }

    const atingiuPontos = pontuacaoTotal >= nivelAtual.pontos
    const atingiuCriterios = criteriosAtingidos >= nivelAtual.criterios

    let atingiuObrigatorios = true
    if (nivelAtual.qualit) {
      atingiuObrigatorios = nivelAtual.qualit.some(q => (reqsComPontos as readonly string[]).includes(q))
    }

    return {
      atingiuPontos,
      atingiuCriterios,
      atingiuObrigatorios,
      aprovado: atingiuPontos && atingiuCriterios && atingiuObrigatorios,
    }
  }, [nivelAtual, pontuacaoTotal, criteriosAtingidos, reqsComPontos])

  return (
    <section className="flex-1 py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* ── Action Buttons ── */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 flex-1 min-w-[160px] px-4 py-3 rounded-xl border-2 border-brand-olive bg-green-50 text-green-800 font-medium text-sm hover:bg-green-100 transition-colors cursor-pointer"
          >
            <Save size={16} />
            Salvar Sessão
          </button>
          <button
            type="button"
            onClick={() => setShowMemorial(true)}
            className="flex items-center gap-2 flex-1 min-w-[180px] px-4 py-3 rounded-xl border-2 border-blue-600 bg-blue-50 text-blue-800 font-medium text-sm hover:bg-blue-100 transition-colors cursor-pointer"
          >
            <Download size={16} />
            Gerar Memorial (PDF)
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-brand-border bg-brand-card text-brand-ink/60 font-medium text-sm hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            <RotateCcw size={14} />
            Resetar
          </button>
        </div>

        {/* ── Seletor de Nível ── */}
        <SeletorNivel
          nivelSelecionado={state.nivelSelecionado}
          onSelectNivel={setNivel}
          pontuacaoTotal={pontuacaoTotal}
        />

        {/* ── Status Bar ── */}
        {nivelAtual && (
          <div className="space-y-3">
            <div className="h-3 rounded-full bg-brand-border-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${validacaoNivel.aprovado ? 'bg-green-500' : pontuacaoTotal > 0 ? 'bg-brand-tinto' : 'bg-zinc-300'}`}
                style={{ width: `${Math.min((pontuacaoTotal / nivelAtual.pontos) * 100, 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white border border-brand-border-muted rounded-xl p-3">
                <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">Pontuação</p>
                <p className={`text-2xl font-bold ${validacaoNivel.atingiuPontos ? 'text-green-600' : 'text-brand-tinto'}`}>
                  {pontuacaoTotal}
                </p>
                <p className="text-[11px] text-zinc-400">de {nivelAtual.pontos} mín.</p>
              </div>
              <div className="bg-white border border-brand-border-muted rounded-xl p-3">
                <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">Critérios</p>
                <p className={`text-2xl font-bold ${validacaoNivel.atingiuCriterios ? 'text-green-600' : 'text-brand-tinto'}`}>
                  {criteriosAtingidos}
                </p>
                <p className="text-[11px] text-zinc-400">de {nivelAtual.criterios} mín.</p>
              </div>
              <div className="bg-white border border-brand-border-muted rounded-xl p-3">
                <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">Obrigatórios</p>
                <p className={`text-2xl font-bold ${validacaoNivel.atingiuObrigatorios ? 'text-green-600' : 'text-brand-tinto'}`}>
                  {validacaoNivel.atingiuObrigatorios ? '✓' : '✗'}
                </p>
                <p className="text-[11px] text-zinc-400">{nivelAtual.qualitDesc || 'N/A'}</p>
              </div>
              <div className="bg-white border border-brand-border-muted rounded-xl p-3">
                <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">Resultado</p>
                <p className={`text-2xl font-bold ${validacaoNivel.aprovado ? 'text-green-600' : 'text-brand-tinto'}`}>
                  {validacaoNivel.aprovado ? '✓' : '—'}
                </p>
                <p className="text-[11px] text-zinc-400">{validacaoNivel.aprovado ? 'Aprovado' : 'Pendente'}</p>
              </div>
            </div>

            <div className={`px-4 py-3 rounded-xl text-sm font-medium ${validacaoNivel.aprovado ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {validacaoNivel.aprovado
                ? `✅ Parabéns! Você atinge os requisitos para o ${nivelAtual.nome}.`
                : `⚠️ ${nivelAtual.desc}`
              }
            </div>
          </div>
        )}

        {/* ── Lista de Critérios ── */}
        <ListaCriterios
          qtds={state.qtds}
          detalhes={state.detalhes}
          periodos={state.periodos}
          onQtdChange={setQtd}
          onDetalheChange={setDetalhe}
          onPeriodoChange={setPeriodo}
          pontuacaoPorReq={pontuacaoPorReq}
        />

        <p className="text-[11px] text-zinc-400 pt-4 border-t border-brand-border-muted leading-relaxed">
          Esta calculadora é uma ferramenta de apoio e simulação. A pontuação final e a validação dos documentos comprobatórios são de responsabilidade da Comissão Avaliadora do RSC, conforme o Decreto nº 13.048/2026.
        </p>
      </div>

      {showMemorial && (
        <GeradorMemorial
          dados={state.memorial}
          onDadosChange={setMemorialDados}
          qtds={state.qtds}
          periodos={state.periodos}
          detalhes={state.detalhes}
          pontuacaoTotal={pontuacaoTotal}
          pontuacaoPorReq={pontuacaoPorReq}
          nivelSelecionado={nivelAtual}
          onClose={() => setShowMemorial(false)}
        />
      )}

      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-5 py-2.5 rounded-full text-sm font-medium z-[200] transition-all duration-300 ${toastMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        {toastMsg}
      </div>
    </section>
  )
}
