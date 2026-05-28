'use client'

import { useRef, useState, useEffect } from 'react'
import {
  Bold,
  Italic,
  Trash2,
  Copy,
  Save,
  Printer,
  Sparkles,
  Check
} from 'lucide-react'
import { saveAta } from '../../actions-ata'
import DocumentHeader, { DocumentHeaderConfig } from '@/components/document-header'
import { useModal } from '@/providers/modal-provider'
import AnexoUploadBtn from '../../anexo-upload-btn'

interface Assembleia {
  id: string
  numero: string | null
  tipo: string
  data_realizacao: string
  horario_1a_convocacao: string
  horario_2a_convocacao: string
  local: string
  pautas: string[]
  status: string
}

interface Ata {
  id: string
  assembleia_id: string
  numero: string | null
  conteudo_rich: string | null
  redator: string | null
  votos_pautas?: Record<string, unknown>
  arquivo_pdf_url?: string | null
}

interface AtaEditorClienteProps {
  assembleia: Assembleia
  ataInicial?: Ata
  config?: DocumentHeaderConfig | null
  documentoExistente?: {
    id: string
    arquivo_url: string
    nome_arquivo: string
  } | null
}

type Voto = { aFavor: string, contra: string, abstencoes: string, encaminhamento?: string }
type PautaExtra = { titulo: string, solicitante: string, status: 'aprovada' | 'rejeitada', motivoRecusa?: string }

export default function AtaEditorCliente({ assembleia, ataInicial, config, documentoExistente }: AtaEditorClienteProps) {
  const { confirm } = useModal()
  const editorRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const [presidente, setPresidente] = useState<string>((ataInicial?.votos_pautas?._presidente as string) || '')
  const [redator, setRedator] = useState(ataInicial?.redator || '')
  const [conteudoRich, setConteudoRich] = useState(ataInicial?.conteudo_rich || '')
  const [copiado, setCopiado] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [ataSalva, setAtaSalva] = useState(!!ataInicial)

  // Omitimos o _presidente e _pautasExtras do estado de votos para os inputs do placar funcionarem bem
  const initVotos = { ... (ataInicial?.votos_pautas || {}) } as Record<string, unknown>
  const initPautasExtras = (initVotos._pautasExtras as PautaExtra[] | undefined) || []
  delete initVotos._presidente
  delete initVotos._pautasExtras
  const [votos, setVotos] = useState<Record<number, Voto>>(initVotos as Record<number, Voto>)
  const [pautasExtras, setPautasExtras] = useState<PautaExtra[]>(initPautasExtras)

  // Sincronizar o editor físico com o estado inicial ou rascunhos salvos
  useEffect(() => {
    if (editorRef.current && ataInicial?.conteudo_rich) {
      editorRef.current.innerHTML = ataInicial.conteudo_rich
    }
  }, [ataInicial])

  // Executar comandos de formatação de texto rico do navegador
  const formatDoc = (cmd: string, value: string = '') => {
    document.execCommand(cmd, false, value)
    if (editorRef.current) {
      setConteudoRich(editorRef.current.innerHTML)
    }
  }

  const handleEditorInput = () => {
    if (editorRef.current) {
      setConteudoRich(editorRef.current.innerHTML)
    }
  }

  const handleCopyText = () => {
    if (editorRef.current) {
      navigator.clipboard.writeText(editorRef.current.innerText)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const obterDataExtenso = (dataStr: string) => {
    const data = new Date(dataStr + 'T12:00:00')
    const meses = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ]
    const diaMes = data.getDate()
    const mes = meses[data.getMonth()]
    const ano = data.getFullYear()
    return `${diaMes} dias do mês de ${mes} de ${ano}`
  }

  const handleVoto = (index: number, field: keyof Voto, value: string) => {
    setVotos(prev => ({
      ...prev,
      [index]: {
        ...(prev[index] || { aFavor: '', contra: '', abstencoes: '', encaminhamento: '' }),
        [field]: value
      }
    }))
  }

  const handlePautaExtraAdd = () => {
    setPautasExtras([...pautasExtras, { titulo: '', solicitante: '', status: 'aprovada' }])
  }

  const handlePautaExtraChange = (index: number, field: keyof PautaExtra, value: string) => {
    const newPautas = [...pautasExtras]
    newPautas[index] = { ...newPautas[index], [field]: value } as PautaExtra
    setPautasExtras(newPautas)
  }

  const handlePautaExtraRemove = (index: number) => {
    const newPautas = [...pautasExtras]
    newPautas.splice(index, 1)
    setPautasExtras(newPautas)
  }



  const handleGerarEsboço = async (e: React.MouseEvent) => {
    e.preventDefault()
    const dataExtenso = obterDataExtenso(assembleia.data_realizacao)
    
    const pautasOficiais = assembleia.pautas || []
    const pautasExtrasAprovadas = pautasExtras.filter(pe => pe.status === 'aprovada')
    const pautasExtrasRejeitadas = pautasExtras.filter(pe => pe.status === 'rejeitada')
    const todasPautasParaDiscussao = [
      ...pautasOficiais,
      ...pautasExtrasAprovadas.map(pe => pe.titulo || 'Pauta não especificada')
    ]

    const pautasResumo = todasPautasParaDiscussao.length > 0
      ? todasPautasParaDiscussao.map((p, index) => `${index + 1}) ${p}`).join('; ')
      : 'pauta não definida'

    // Texto de menção às inclusões na abertura da sessão
    let textoInclusoes = ''
    if (pautasExtrasAprovadas.length > 0 || pautasExtrasRejeitadas.length > 0) {
      const partesInclusao: string[] = []
      pautasExtrasAprovadas.forEach(pe => {
        const solicitante = pe.solicitante || 'a plenária'
        partesInclusao.push(`o(a) filiado(a) <strong>${solicitante}</strong> solicitou ao(à) presidente da mesa a inclusão do ponto de pauta <strong>"${pe.titulo || 'não especificada'}"</strong> na Ordem do Dia, sendo o pedido submetido à apreciação dos presentes e <strong>aprovado</strong>`)
      })
      pautasExtrasRejeitadas.forEach(pe => {
        const solicitante = pe.solicitante || 'a plenária'
        const motivo = pe.motivoRecusa?.trim() ? `, tendo como justificativa: <strong>${pe.motivoRecusa.trim()}</strong>` : ''
        partesInclusao.push(`o(a) filiado(a) <strong>${solicitante}</strong> solicitou ao(à) presidente da mesa a inclusão do ponto de pauta <strong>"${pe.titulo || 'não especificada'}"</strong> na Ordem do Dia, sendo o pedido submetido à apreciação dos presentes e <strong>rejeitado</strong>${motivo}`)
      })
      textoInclusoes = ' Antes de se passar à Ordem do Dia, ' + partesInclusao.join('; ') + '.'
    }

    // Detalhes de discussão de cada pauta (oficiais + extras aprovadas)
    let pautasDetalhes = ''
    if (todasPautasParaDiscussao.length > 0) {
      pautasDetalhes = todasPautasParaDiscussao.map((p, index) => {
        const isExtra = index >= pautasOficiais.length
        const v = votos[index]
        const temVotacao = v && (v.aFavor || v.contra || v.abstencoes)
        let texto = `No <strong>${index + 1}º ponto da pauta (${p})</strong>, `
        if (isExtra) {
          texto += `ponto incluído a pedido da plenária conforme registrado na abertura, `
        }
        texto += `debateu-se amplamente sobre o tema. `

        if (temVotacao) {
          const numFavor = parseInt(v.aFavor) || 0
          const numContra = parseInt(v.contra) || 0
          const numAbsten = parseInt(v.abstencoes) || 0

          if (numFavor > 0 && numContra === 0 && numAbsten === 0) {
            texto += `Colocado em regime de votação, o ponto de pauta foi <strong>aprovado por unanimidade</strong> por todos(as) os(as) presentes.`
          } else if (numContra > 0 && numFavor === 0 && numAbsten === 0) {
            texto += `Colocado em regime de votação, o ponto de pauta foi <strong>rejeitado por unanimidade</strong> por todos(as) os(as) presentes.`
          } else {
            texto += `Colocado em regime de votação, a pauta resultou em: <strong>${numFavor} votos a favor, ${numContra} contra e ${numAbsten} abstenções.</strong>`
          }
        } else {
          texto += `Após esclarecimentos, o ponto foi superado e encaminhado consensualmente pelos(as) presentes.`
        }

        if (v?.encaminhamento && v.encaminhamento.trim() !== '') {
          texto += ` Como encaminhamento, a plenária decidiu: <strong>${v.encaminhamento.trim()}</strong>.`
        }

        return texto
      }).join(' ')
    } else {
      pautasDetalhes = 'Não houve pautas definidas para esta reunião.'
    }

    let textoDirecao = ''
    if (presidente && redator && presidente !== redator) {
      textoDirecao = `foi aclamado(a) como presidente da mesa o(a) filiado(a) <strong>${presidente}</strong>, que convidou para secretariar os trabalhos o(a) filiado(a) <strong>${redator}</strong>`
    } else if (presidente && (!redator || presidente === redator)) {
      textoDirecao = `foi aclamado(a) como presidente da mesa o(a) filiado(a) <strong>${presidente}</strong>, que também assumiu a função de secretariar os trabalhos`
    } else if (!presidente && redator) {
      textoDirecao = `foi aclamado(a) como presidente da mesa o(a) filiado(a) <strong>${redator}</strong>, que também assumiu a função de secretariar os trabalhos`
    } else {
      textoDirecao = `foi aclamado(a) como presidente da mesa o(a) filiado(a) <strong>____________________</strong>, que convidou para secretariar os trabalhos o(a) filiado(a) <strong>____________________</strong>`
    }

    const template = `
      <div style="text-align: justify; line-height: 1.6; text-indent: 40px;">
        Aos <strong>${dataExtenso}</strong>, às <strong>${assembleia.horario_1a_convocacao.slice(0, 5)}</strong> horas em primeira convocação, e às <strong>${assembleia.horario_2a_convocacao.slice(0, 5)}</strong> horas em segunda convocação, reuniu-se no(a) <strong>${assembleia.local}</strong>, a Assembleia Geral <strong>${assembleia.tipo}</strong> dos(as) filiados(as) da Seção Sindical de Jataí do SINASEFE, sob convocação formal expedida pelo Edital número <strong>${assembleia.numero || '_____'}</strong>, com a presença dos(as) servidores(as) técnico-administrativos(as) e docentes constantes da respectiva lista de presença. Para dirigir os trabalhos desta assembleia, ${textoDirecao}. Dando início à reunião, o(a) presidente declarou aberta a assembleia e procedeu-se à leitura da pauta de deliberações, constante dos seguintes pontos: <strong>${pautasResumo}</strong>.${textoInclusoes} Passando-se à ordem do dia: ${pautasDetalhes} E nada mais havendo a tratar, a sessão foi encerrada pelo(a) presidente, da qual eu, na qualidade de secretário(a) dos trabalhos, lavrei a presente ata que, após lida e considerada em conformidade por todos(as) os(as) presentes, será assinada pela coordenação, pela mesa diretora dos trabalhos e pelos(as) demais presentes interessados(as).
      </div>
    `

    if (editorRef.current) {
      if (editorRef.current.innerText.trim() !== '') {
        const confirmado = await confirm('A geração de esboço substituirá todo o conteúdo atual do editor. Deseja continuar?')
        if (!confirmado) return
      }
      editorRef.current.innerHTML = template
      setConteudoRich(template)
    }
  }

  const handleLimpar = async () => {
    if (await confirm('Tem certeza de que deseja limpar todo o conteúdo do editor?')) {
      if (editorRef.current) {
        editorRef.current.innerHTML = ''
        setConteudoRich('')
      }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* 1. Painel de Controle Lateral (Configurações da Ata) */}
      <div className="lg:col-span-4 bg-brand-card border border-brand-border p-6 rounded-none space-y-6 print:hidden shadow-lg h-full overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
        <h2 className="text-lg font-serif font-bold text-brand-ink border-b border-brand-border pb-3 flex items-center gap-2">
          <span>Configuração da Ata</span>
        </h2>

        <form ref={formRef} action={saveAta} onSubmit={() => { setSalvando(true); setAtaSalva(true) }} className="space-y-4 flex flex-col min-h-[calc(100%-60px)]">
          <div className="flex-1 space-y-4">
            <input type="hidden" name="assembleia_id" value={assembleia.id} />
            <input type="hidden" name="conteudo_rich" value={conteudoRich} />
            <input type="hidden" name="votos_pautas" value={JSON.stringify({ ...votos, _presidente: presidente, _pautasExtras: pautasExtras })} />

            {/* --- FASE 1: ELABORAÇÃO --- */}
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-brand-ink text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">Fase 1</span>
              <h3 className="text-xs font-bold text-brand-ink/80 uppercase tracking-wider font-serif">Elaboração</h3>
            </div>

            <div>
              <label htmlFor="presidente" className="block text-xs font-bold text-brand-ink/60 uppercase tracking-wider mb-2 font-serif">
                Presidente da Mesa
              </label>
              <input
                id="presidente"
                name="presidente"
                type="text"
                placeholder="Ex: Nome do Presidente"
                value={presidente}
                onChange={(e) => setPresidente(e.target.value)}
                required
                className="w-full bg-brand-cream border border-brand-border rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
              />
            </div>

            <div>
              <label htmlFor="redator" className="block text-xs font-bold text-brand-ink/60 uppercase tracking-wider mb-2 font-serif">
                Secretário / Redator da Ata
              </label>
              <input
                id="redator"
                name="redator"
                type="text"
                placeholder="Ex: Nome do Secretário"
                value={redator}
                onChange={(e) => setRedator(e.target.value)}
                required
                className="w-full bg-brand-cream border border-brand-border rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
              />
            </div>

            {/* Votações e Encaminhamentos */}
            <div className="border-t border-brand-border pt-4 mt-4">
              <h3 className="text-xs font-bold text-brand-ink/60 uppercase tracking-wider mb-3 font-serif">Placar de Votações & Encaminhamentos</h3>
              
              {assembleia.pautas?.map((pauta, idx) => (
                <div key={idx} className="mb-4 bg-brand-cream p-3 border border-brand-border">
                  <p className="text-[11px] font-semibold text-brand-ink mb-2 truncate" title={pauta}>{idx + 1}. {pauta}</p>
                  <div className="flex gap-2 mb-2">
                    <div className="flex-1">
                      <label className="text-[9px] uppercase font-bold text-brand-olive block mb-1">A favor</label>
                      <input type="number" min="0" value={votos[idx]?.aFavor || ''} onChange={(e) => handleVoto(idx, 'aFavor', e.target.value)} className="w-full text-xs p-1 border border-brand-border focus:outline-none" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[9px] uppercase font-bold text-brand-tinto block mb-1">Contra</label>
                      <input type="number" min="0" value={votos[idx]?.contra || ''} onChange={(e) => handleVoto(idx, 'contra', e.target.value)} className="w-full text-xs p-1 border border-brand-border focus:outline-none" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Absten.</label>
                      <input type="number" min="0" value={votos[idx]?.abstencoes || ''} onChange={(e) => handleVoto(idx, 'abstencoes', e.target.value)} className="w-full text-xs p-1 border border-brand-border focus:outline-none" />
                    </div>
                  </div>
                  <textarea 
                    placeholder="Encaminhamento ou Resumo (Opcional)"
                    value={votos[idx]?.encaminhamento || ''}
                    onChange={(e) => handleVoto(idx, 'encaminhamento', e.target.value)}
                    className="w-full text-xs p-2 border border-brand-border focus:outline-none focus:border-brand-tinto min-h-[40px] resize-y bg-white"
                  />
                </div>
              ))}

              {/* Pautas Extras */}
              {pautasExtras.map((pe, idx) => {
                const absoluteIdx = (assembleia.pautas?.length || 0) + idx
                const isRejeitada = pe.status === 'rejeitada'
                return (
                  <div key={`extra-${idx}`} className={`mb-4 p-3 border relative ${isRejeitada ? 'bg-red-50/50 border-red-200' : 'bg-amber-50/50 border-amber-200'}`}>
                    <button type="button" onClick={() => handlePautaExtraRemove(idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><Trash2 size={12} /></button>
                    <p className={`text-[11px] font-bold mb-2 uppercase flex items-center gap-1 ${isRejeitada ? 'text-red-900' : 'text-amber-900'}`}><Sparkles size={10} /> Pauta Extra {idx + 1}</p>

                    <div className="space-y-2 mb-2">
                      <input type="text" placeholder="Título da Pauta (Ex: Moção de Repúdio)" value={pe.titulo} onChange={(e) => handlePautaExtraChange(idx, 'titulo', e.target.value)} className="w-full text-xs p-1.5 border border-amber-200 focus:outline-none focus:border-amber-400 bg-white" />
                      <input type="text" placeholder="Solicitante (Ex: Maria Silva)" value={pe.solicitante} onChange={(e) => handlePautaExtraChange(idx, 'solicitante', e.target.value)} className="w-full text-xs p-1.5 border border-amber-200 focus:outline-none focus:border-amber-400 bg-white" />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handlePautaExtraChange(idx, 'status', 'aprovada')}
                          className={`flex-1 text-[9px] font-bold uppercase py-1.5 border transition-colors cursor-pointer ${pe.status === 'aprovada' ? 'bg-brand-olive text-white border-brand-olive' : 'bg-white text-brand-olive border-brand-olive/30 hover:bg-brand-olive/10'}`}
                        >
                          ✓ Inclusão Aprovada
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePautaExtraChange(idx, 'status', 'rejeitada')}
                          className={`flex-1 text-[9px] font-bold uppercase py-1.5 border transition-colors cursor-pointer ${pe.status === 'rejeitada' ? 'bg-brand-tinto text-white border-brand-tinto' : 'bg-white text-brand-tinto border-brand-tinto/30 hover:bg-brand-tinto/10'}`}
                        >
                          ✗ Inclusão Rejeitada
                        </button>
                      </div>
                      {isRejeitada && (
                        <textarea
                          placeholder="Motivo da recusa (Ex: matéria não pertinente ao escopo da assembleia)"
                          value={pe.motivoRecusa || ''}
                          onChange={(e) => handlePautaExtraChange(idx, 'motivoRecusa', e.target.value)}
                          className="w-full text-xs p-2 border border-red-200 focus:outline-none focus:border-red-400 min-h-[36px] resize-y bg-white"
                        />
                      )}
                    </div>

                    {!isRejeitada && (
                      <>
                        <div className="flex gap-2 mb-2">
                          <div className="flex-1">
                            <label className="text-[9px] uppercase font-bold text-brand-olive block mb-1">A favor</label>
                            <input type="number" min="0" value={votos[absoluteIdx]?.aFavor || ''} onChange={(e) => handleVoto(absoluteIdx, 'aFavor', e.target.value)} className="w-full text-xs p-1 border border-brand-border focus:outline-none" />
                          </div>
                          <div className="flex-1">
                            <label className="text-[9px] uppercase font-bold text-brand-tinto block mb-1">Contra</label>
                            <input type="number" min="0" value={votos[absoluteIdx]?.contra || ''} onChange={(e) => handleVoto(absoluteIdx, 'contra', e.target.value)} className="w-full text-xs p-1 border border-brand-border focus:outline-none" />
                          </div>
                          <div className="flex-1">
                            <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Absten.</label>
                            <input type="number" min="0" value={votos[absoluteIdx]?.abstencoes || ''} onChange={(e) => handleVoto(absoluteIdx, 'abstencoes', e.target.value)} className="w-full text-xs p-1 border border-brand-border focus:outline-none" />
                          </div>
                        </div>
                        <textarea
                          placeholder="Encaminhamento ou Resumo (Opcional)"
                          value={votos[absoluteIdx]?.encaminhamento || ''}
                          onChange={(e) => handleVoto(absoluteIdx, 'encaminhamento', e.target.value)}
                          className="w-full text-xs p-2 border border-brand-border focus:outline-none focus:border-brand-tinto min-h-[40px] resize-y bg-white"
                        />
                      </>
                    )}
                  </div>
                )
              })}

              <button 
                type="button"
                onClick={handlePautaExtraAdd}
                className="mb-4 w-full border border-amber-600/50 hover:bg-amber-50 text-amber-700 py-1.5 px-4 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer border-dashed"
              >
                <span>+ Incluir Pauta de Plenária</span>
              </button>

              <button 
                type="button"
                onClick={handleGerarEsboço}
                className="w-full border border-brand-ink hover:bg-brand-cream bg-white text-brand-ink py-2 px-4 text-[10px] font-bold uppercase tracking-wider transition-all shadow-[1.5px_1.5px_0px_var(--brand-ink)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles size={14} className="text-amber-600" />
                <span>Gerar Esboço Completo</span>
              </button>
            </div>

            <div className="pt-2 pb-4">
              <button
                type="submit"
                disabled={salvando}
                className="w-full bg-brand-tinto hover:bg-brand-tinto-light disabled:bg-zinc-300 text-white text-xs font-serif font-bold uppercase tracking-wider py-4 transition-all shadow-[3px_3px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1.5px_1.5px_0px_var(--brand-ink)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save size={16} />
                <span>{salvando ? 'Salvando Ata...' : 'Salvar Progressos da Ata'}</span>
              </button>
            </div>

            <div className="pt-4 border-t border-brand-border mt-4">
              <button
                type="button"
                onClick={handleLimpar}
                className="w-full border border-brand-tinto hover:bg-brand-cream text-brand-tinto py-2 px-4 text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-[1.5px_1.5px_0px_var(--brand-tinto)] cursor-pointer"
              >
                <Trash2 size={12} />
                <span>Excluir Rascunho do Editor</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 2. Editor WYSIWYG - 8 Colunas */}
      <div className="lg:col-span-8 space-y-4 print:hidden shadow-lg">
        {/* Barra de Ferramentas Rica */}
        <div className="bg-brand-card border border-brand-border p-2.5 rounded-none flex flex-wrap items-center gap-1 justify-between">
          <div className="flex items-center gap-1">
            <button onClick={() => formatDoc('bold')} title="Negrito" className="p-2 hover:bg-brand-cream text-brand-ink rounded-none transition-colors"><Bold size={15} /></button>
            <button onClick={() => formatDoc('italic')} title="Itálico" className="p-2 hover:bg-brand-cream text-brand-ink rounded-none transition-colors"><Italic size={15} /></button>
            <div className="w-[1px] h-6 bg-brand-border mx-1"></div>
            <button onClick={() => formatDoc('removeFormat')} title="Limpar" className="p-2 hover:bg-brand-cream text-brand-tinto rounded-none transition-colors text-[10px] font-bold uppercase tracking-wider">Limpar Formatação</button>
          </div>

          {ataSalva && (
            <div className="flex items-center gap-1">
              <div className="w-[1px] h-6 bg-brand-border mx-1"></div>
              <button
                type="button"
                onClick={handleCopyText}
                title="Copiar Texto"
                className="p-2 hover:bg-brand-cream text-brand-ink rounded-none transition-colors flex items-center gap-1 text-[10px] font-bold uppercase"
              >
                {copiado ? <Check size={14} className="text-brand-olive" /> : <Copy size={14} />}
                <span className="hidden lg:inline">{copiado ? 'Copiado!' : 'Copiar'}</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                title="Imprimir"
                className="p-2 hover:bg-brand-cream text-brand-ink rounded-none transition-colors flex items-center gap-1 text-[10px] font-bold uppercase"
              >
                <Printer size={14} />
                <span className="hidden lg:inline">Imprimir</span>
              </button>
              <AnexoUploadBtn assembleiaId={assembleia.id} tipo="ata" documentoExistente={documentoExistente} label="Ata Assinada" />
            </div>
          )}
        </div>



        {/* Corpo do Editor */}
        <div className="bg-brand-cream border border-brand-border rounded-none overflow-hidden shadow-md min-h-[580px] flex flex-col">
          <div className="bg-brand-border/30 px-6 py-3 border-b border-brand-border flex items-center justify-between text-xs font-bold text-brand-ink/70 uppercase tracking-wider">
            <span>Editor Documental</span>
            <span>Estilo Papel Contínuo</span>
          </div>

          <div
            ref={editorRef}
            contentEditable={true}
            suppressContentEditableWarning={true}
            onInput={handleEditorInput}
            className="flex-1 p-8 outline-none text-brand-ink font-serif overflow-y-auto leading-relaxed max-w-none text-justify prose prose-sm"
            style={{ minHeight: '520px' }}
          />
        </div>
      </div>

      {/* 3. Layout de Impressão Oficial A4 */}
      <div className="hidden print:block font-serif text-black p-12 bg-white max-w-[800px] mx-auto text-justify text-sm leading-relaxed">
        <DocumentHeader config={config} />
        <div className="text-center font-bold text-base uppercase mb-6 tracking-wide">
          ATA DA ASSEMBLEIA GERAL {assembleia.tipo.toUpperCase()} {assembleia.numero ? `Nº ${assembleia.numero}` : ''}
        </div>
        <div
          className="print-document-content text-justify"
          dangerouslySetInnerHTML={{ __html: conteudoRich }}
          style={{ textAlign: 'justify', textJustify: 'inter-word', lineHeight: '1.8', fontSize: '13px' }}
        />
        {presidente && redator && presidente !== redator ? (
          <div className="mt-20 grid grid-cols-2 gap-12 text-center text-xs">
            <div className="flex flex-col items-center">
              <div className="w-[220px] border-b border-black mb-2"></div>
              <div className="font-semibold uppercase">{redator}</div>
              <div className="text-gray-600">Secretário(a) da Assembleia</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-[220px] border-b border-black mb-2"></div>
              <div className="font-semibold uppercase">{presidente}</div>
              <div className="text-gray-600">Presidente da Mesa / Coordenador(a)</div>
            </div>
          </div>
        ) : (
          <div className="mt-20 flex justify-center text-center text-xs">
            <div className="flex flex-col items-center">
              <div className="w-[280px] border-b border-black mb-2"></div>
              <div className="font-semibold uppercase">{presidente || redator || 'Presidente / Secretário(a)'}</div>
              <div className="text-gray-600">Presidente da Mesa e Secretário(a) da Assembleia</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
