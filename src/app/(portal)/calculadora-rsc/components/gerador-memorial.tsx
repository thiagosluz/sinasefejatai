'use client'

import { useCallback, useRef } from 'react'
import { X } from 'lucide-react'

import type { NivelRSC } from '../data/criterios-rsc'
import { getItensPorReq, isPorAno, ITENS, NOMES_REQ_CURTO, REQS_ORDENADOS } from '../data/criterios-rsc'

import type { MemorialDados, OcorrenciaItem, PeriodoItem } from './calculadora-cliente'
import { calcFracoes } from './calculadora-cliente'

interface GeradorMemorialProps {
  dados: MemorialDados
  onDadosChange: (dados: MemorialDados) => void
  qtds: number[]
  periodos: PeriodoItem[]
  detalhes: OcorrenciaItem[][]
  pontuacaoTotal: number
  pontuacaoPorReq: Record<string, number>
  nivelSelecionado: NivelRSC | undefined
  onClose: () => void
}

export function GeradorMemorial({
  dados, onDadosChange, qtds, periodos, detalhes,
  pontuacaoTotal, pontuacaoPorReq, nivelSelecionado, onClose,
}: GeradorMemorialProps) {
  const previewRef = useRef<HTMLDivElement>(null)

  const update = useCallback((field: keyof MemorialDados, value: string) => {
    onDadosChange({ ...dados, [field]: value })
  }, [dados, onDadosChange])

  const gerarPDF = useCallback(async () => {
    const el = previewRef.current
    if (!el) return

    const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
      import('jspdf'),
      import('html2canvas-pro'),
    ])

    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
    const imgData = canvas.toDataURL('image/png')

    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 10
    const contentWidth = pageWidth - margin * 2
    const imgHeight = (canvas.height * contentWidth) / canvas.width

    let yOffset = 0
    let pageNum = 0

    while (yOffset < imgHeight) {
      if (pageNum > 0) pdf.addPage()

      pdf.addImage(
        imgData, 'PNG',
        margin, margin - yOffset,
        contentWidth, imgHeight,
      )

      yOffset += pageHeight - margin * 2
      pageNum++
    }

    const nomeArquivo = dados.nome
      ? `memorial-rsc-${dados.nome.split(' ')[0].toLowerCase()}.pdf`
      : 'memorial-rsc.pdf'

    pdf.save(nomeArquivo)
  }, [dados.nome])

  // ── Build memorial content ──
  const buildReqSection = () => {
    const sections: { titulo: string; itens: string[] }[] = []

    for (const req of REQS_ORDENADOS) {
      const itensReq = getItensPorReq(req)
      const linhas: string[] = []

      for (const item of itensReq) {
        const globalIdx = ITENS.indexOf(item)
        const qty = qtds[globalIdx]
        if (qty <= 0) continue

        const pts = qty * item.pts
        const porAno = isPorAno(item)

        if (porAno) {
          const p = periodos[globalIdx]
          const frac = calcFracoes(p.inicio, p.fim)
          linhas.push(`• Item ${item.num}: ${item.desc} — ${frac} fração(ões) de ano → ${pts} pts${p.descricao ? ` | ${p.descricao}` : ''}`)
        } else {
          const descs = detalhes[globalIdx]
            ?.filter(d => d.descricao)
            .map(d => d.descricao)
            .join('; ')
          linhas.push(`• Item ${item.num}: ${item.desc} — ${qty}× → ${pts} pts${descs ? ` | ${descs}` : ''}`)
        }
      }

      if (linhas.length > 0) {
        sections.push({
          titulo: NOMES_REQ_CURTO[req],
          itens: linhas,
        })
      }
    }
    return sections
  }

  const reqSections = buildReqSection()

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-start justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border-muted">
          <h2 className="text-base font-semibold text-brand-ink">📋 Dados para o Memorial — Art. 13 do Decreto</h2>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-brand-ink transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-zinc-500">Preencha os dados funcionais. O memorial será gerado com base nos critérios lançados.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-500 mb-1">Nome completo *</label>
              <input value={dados.nome} onChange={e => update('nome', e.target.value)} placeholder="João da Silva Santos"
                className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg bg-white text-brand-ink focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Matrícula SIAPE *</label>
              <input value={dados.siape} onChange={e => update('siape', e.target.value)} placeholder="1234567"
                className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg bg-white text-brand-ink focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">CPF</label>
              <input value={dados.cpf} onChange={e => update('cpf', e.target.value)} placeholder="000.000.000-00"
                className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg bg-white text-brand-ink focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-500 mb-1">Cargo *</label>
              <input value={dados.cargo} onChange={e => update('cargo', e.target.value)} placeholder="Assistente em Administração"
                className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg bg-white text-brand-ink focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-500 mb-1">Instituição Federal de Ensino *</label>
              <input value={dados.ies} onChange={e => update('ies', e.target.value)} placeholder="Instituto Federal Goiano — Campus Jataí"
                className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg bg-white text-brand-ink focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Setor de lotação</label>
              <input value={dados.setor} onChange={e => update('setor', e.target.value)} placeholder="Coordenação de Administração"
                className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg bg-white text-brand-ink focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Nível de classificação</label>
              <input value={dados.nivel} onChange={e => update('nivel', e.target.value)} placeholder="Nível D – Classe C – Padrão IV"
                className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg bg-white text-brand-ink focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Data de ingresso</label>
              <input value={dados.ingresso} onChange={e => update('ingresso', e.target.value)} placeholder="15/03/2010"
                className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg bg-white text-brand-ink focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Última concessão RSC</label>
              <input value={dados.ultima} onChange={e => update('ultima', e.target.value)} placeholder="RSC-II em 10/05/2021"
                className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg bg-white text-brand-ink focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Saldo de pontos anterior</label>
              <input value={dados.saldo} onChange={e => update('saldo', e.target.value)} placeholder="8,5 pontos"
                className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg bg-white text-brand-ink focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-500 mb-1">Trajetória profissional *</label>
              <textarea value={dados.trajetoria} onChange={e => update('trajetoria', e.target.value)} rows={3}
                placeholder="Descreva brevemente sua trajetória profissional..."
                className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg bg-white text-brand-ink placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors resize-vertical" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-500 mb-1">Considerações finais (opcional)</label>
              <textarea value={dados.consideracoes} onChange={e => update('consideracoes', e.target.value)} rows={2}
                placeholder="Texto adicional para encerramento do memorial..."
                className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg bg-white text-brand-ink placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors resize-vertical" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Local e data</label>
              <input value={dados.local} onChange={e => update('local', e.target.value)} placeholder="Jataí (GO), julho de 2026"
                className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg bg-white text-brand-ink focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors" />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="border-t border-brand-border-muted">
          <div className="px-6 py-3 bg-brand-cream flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500">Pré-visualização do Memorial</span>
            <button
              type="button"
              onClick={gerarPDF}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Baixar PDF
            </button>
          </div>

          <div ref={previewRef} className="p-8 text-[13px] leading-[1.8] font-serif text-brand-ink max-h-[500px] overflow-y-auto"
            style={{ fontFamily: 'Georgia, serif', background: '#fff' }}>
            <h2 className="text-[15px] text-center font-bold mb-1">MEMORIAL DESCRITIVO</h2>
            <h3 className="text-[13px] text-center mb-4">Reconhecimento de Saberes e Competências — RSC-PCCTAE</h3>
            <p className="text-center text-[12px] text-zinc-400 mb-1">Decreto nº 13.048, de 3 de julho de 2026</p>
            <hr className="my-4 border-zinc-200" />

            <h3 className="text-[13px] font-bold mt-5 mb-2">1. IDENTIFICAÇÃO DO SERVIDOR</h3>
            <p><strong>Nome:</strong> {dados.nome || '___'}</p>
            <p><strong>SIAPE:</strong> {dados.siape || '___'} {dados.cpf && `| CPF: ${dados.cpf}`}</p>
            <p><strong>Cargo:</strong> {dados.cargo || '___'}</p>
            <p><strong>Instituição:</strong> {dados.ies || '___'}</p>
            {dados.setor && <p><strong>Setor:</strong> {dados.setor}</p>}
            {dados.nivel && <p><strong>Nível/Classe:</strong> {dados.nivel}</p>}
            {dados.ingresso && <p><strong>Ingresso:</strong> {dados.ingresso}</p>}
            {dados.ultima && <p><strong>Última concessão RSC:</strong> {dados.ultima}</p>}
            {dados.saldo && <p><strong>Saldo anterior:</strong> {dados.saldo}</p>}

            {nivelSelecionado && (
              <p className="mt-2"><strong>Nível pleiteado:</strong> {nivelSelecionado.nome} (≡ {nivelSelecionado.eq})</p>
            )}

            <h3 className="text-[13px] font-bold mt-5 mb-2">2. APRESENTAÇÃO</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{dados.trajetoria || 'Não informado.'}</p>

            <h3 className="text-[13px] font-bold mt-5 mb-2">3. DETALHAMENTO DOS CRITÉRIOS</h3>

            {reqSections.length > 0 ? reqSections.map((sec, i) => (
              <div key={i} className="mb-3">
                <h4 className="text-[13px] font-bold mt-3 mb-1">{sec.titulo} — {pontuacaoPorReq[REQS_ORDENADOS[i]] ?? 0} pts</h4>
                {sec.itens.map((line, j) => (
                  <p key={j} className="text-[12px] leading-[1.7]">{line}</p>
                ))}
              </div>
            )) : (
              <p className="text-zinc-400 italic">Nenhum critério lançado ainda.</p>
            )}

            <hr className="my-4 border-zinc-200" />
            <h3 className="text-[13px] font-bold mt-3 mb-2">PONTUAÇÃO TOTAL: {pontuacaoTotal} pontos</h3>

            <h3 className="text-[13px] font-bold mt-5 mb-2">4. CONSIDERAÇÕES FINAIS</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>
              {dados.consideracoes || `Diante do exposto, solicito a concessão do ${nivelSelecionado?.nome || 'RSC'}, conforme os critérios e pontuações demonstrados neste memorial, em conformidade com o Decreto nº 13.048/2026.`}
            </p>

            {dados.local && (
              <p className="mt-6 text-center">{dados.local}</p>
            )}

            <div className="mt-10 text-center">
              <div className="border-t border-zinc-400 w-64 mx-auto pt-1">
                <p>{dados.nome || 'Nome do servidor'}</p>
                <p className="text-[11px] text-zinc-400">{dados.cargo && `${dados.cargo} — `}SIAPE {dados.siape || '___'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-brand-border-muted">
          <button type="button" onClick={onClose}
            className="px-5 py-2 text-sm text-zinc-500 border border-brand-border rounded-lg hover:bg-brand-cream transition-colors cursor-pointer">
            Fechar
          </button>
          <button type="button" onClick={gerarPDF}
            className="px-5 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
            Baixar PDF
          </button>
        </div>
      </div>
    </div>
  )
}
