'use client'

import { useEffect, useReducer, useRef } from 'react'
import DOMPurify from 'isomorphic-dompurify'
import {
  Bold,
  Check,
  Copy,
  Italic,
  Printer,
  Save,
  Sparkles,
  Trash2} from 'lucide-react'
import { toast } from 'sonner'

import { AssinaturasWidget } from '@/components/assinaturas-widget'
import { DocumentHeaderConfig } from '@/components/document-header'
import { DocumentoVerificacao } from '@/lib/actions-assinaturas'
import { useModal } from '@/providers/modal-provider'

import { saveAta } from '../../actions-ata'
import AnexoUploadBtn from '../../anexo-upload-btn'

import { AtaPrintLayout } from './components/ata-print-layout'
import { useAtaBuilder } from './hooks/use-ata-builder'
import { ataEditorReducer, AtaEditorState, PautaExtra, Voto } from './hooks/use-ata-editor-reducer'

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
  verificacaoInicial?: DocumentoVerificacao | null
  currentUserId?: string
}


export default function AtaEditorCliente({ assembleia, ataInicial, config, documentoExistente, verificacaoInicial, currentUserId }: AtaEditorClienteProps) {
  const { confirm } = useModal()
  const editorRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const initVotos = { ... (ataInicial?.votos_pautas || {}) } as Record<string, unknown>
  const initPautasExtras = (initVotos._pautasExtras as PautaExtra[] | undefined) || []
  delete initVotos._presidente
  delete initVotos._pautasExtras

  const initialState: AtaEditorState = {
    presidente: (ataInicial?.votos_pautas?._presidente as string) || '',
    redator: ataInicial?.redator || '',
    conteudoRich: ataInicial?.conteudo_rich || '',
    votos: initVotos as Record<number, Voto>,
    pautasExtras: initPautasExtras,
    copiado: false,
    salvando: false,
    ataSalva: !!ataInicial
  }

  const [state, dispatch] = useReducer(ataEditorReducer, initialState)
  const { presidente, redator, conteudoRich, votos, pautasExtras, copiado, salvando, ataSalva } = state

  // Custom hook para centralizar a lógica de esboço da Ata
  const { gerarEsbocoHTML } = useAtaBuilder({
    assembleia,
    votos,
    pautasExtras,
    presidente,
    redator
  })

  // Sincronizar o editor físico com o estado inicial ou rascunhos salvos
  useEffect(() => {
    if (editorRef.current && ataInicial?.conteudo_rich) {
      editorRef.current.innerHTML = DOMPurify.sanitize(ataInicial.conteudo_rich)
    }
  }, [ataInicial])

  const formatDoc = (cmd: string, value: string = '') => {
    document.execCommand(cmd, false, value)
    document.execCommand(cmd, false, value)
    if (editorRef.current) {
      dispatch({ type: 'SET_CONTEUDO_RICH', payload: editorRef.current.innerHTML })
    }
  }

  const handleEditorInput = () => {
    if (editorRef.current) {
      dispatch({ type: 'SET_CONTEUDO_RICH', payload: editorRef.current.innerHTML })
    }
  }

  const handleCopyText = () => {
    if (editorRef.current) {
      navigator.clipboard.writeText(editorRef.current.innerText)
      dispatch({ type: 'SET_COPIADO', payload: true })
      setTimeout(() => dispatch({ type: 'SET_COPIADO', payload: false }), 2000)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleVoto = (index: number, field: keyof Voto, value: string) => {
    dispatch({ type: 'UPDATE_VOTO', payload: { index, field, value } })
  }

  const handlePautaExtraAdd = () => {
    dispatch({ type: 'ADD_PAUTA_EXTRA' })
  }

  const handlePautaExtraChange = (index: number, field: keyof PautaExtra, value: string) => {
    dispatch({ type: 'UPDATE_PAUTA_EXTRA', payload: { index, field, value } })
  }

  const handlePautaExtraRemove = (index: number) => {
    dispatch({ type: 'REMOVE_PAUTA_EXTRA', payload: { index } })
  }

  const handleGerarEsboço = async (e: React.MouseEvent) => {
    e.preventDefault()
    const template = gerarEsbocoHTML()

    if (editorRef.current) {
      if (editorRef.current.innerText.trim() !== '') {
        const confirmado = await confirm('A geração de esboço substituirá todo o conteúdo atual do editor. Deseja continuar?')
        if (!confirmado) return
      }
      editorRef.current.innerHTML = DOMPurify.sanitize(template)
      dispatch({ type: 'SET_CONTEUDO_RICH', payload: template })
    }
  }

  const handleLimpar = async () => {
    if (await confirm('Tem certeza de que deseja limpar todo o conteúdo do editor?')) {
      if (editorRef.current) {
        editorRef.current.innerHTML = ''
        dispatch({ type: 'SET_CONTEUDO_RICH', payload: '' })
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

        <form
          ref={formRef}
          onSubmit={async (e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            dispatch({ type: 'SET_SALVANDO', payload: true })

            const result = await saveAta(formData)

            if (result.success) {
              dispatch({ type: 'SET_ATA_SALVA', payload: true })
              toast.success('Ata salva com sucesso')
            } else {
              toast.error(result.error || 'Ocorreu um erro')
            }
            dispatch({ type: 'SET_SALVANDO', payload: false })
          }}
          className="space-y-4 flex flex-col min-h-[calc(100%-60px)]"
        >
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
                onChange={(e) => dispatch({ type: 'SET_PRESIDENTE', payload: e.target.value })}
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
                onChange={(e) => dispatch({ type: 'SET_REDATOR', payload: e.target.value })}
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

            {/* Bloco de Assinaturas (Option A) */}
            <AssinaturasWidget 
              tipoDocumento="ata"
              documentoId={ataInicial?.id || ''}
              verificacaoInicial={verificacaoInicial}
              currentUserId={currentUserId}
              variant="sidebar-list"
            />
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
              
              <AssinaturasWidget 
                tipoDocumento="ata"
                documentoId={ataInicial?.id || ''}
                verificacaoInicial={verificacaoInicial}
                currentUserId={currentUserId}
                variant="button"
                disabled={!ataInicial}
              />
              
              <AnexoUploadBtn assembleiaId={assembleia.id} tipo="ata" documentoExistente={documentoExistente} label="ANEXAR PDF ASSINADO" />
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

      {/* 3. Layout de Impressão Oficial A4 isolado em Componente */}
      <AtaPrintLayout
        config={config}
        assembleia={assembleia}
        conteudoRich={conteudoRich}
        presidente={presidente}
        redator={redator}
        verificacao={verificacaoInicial}
      />
    </div>
  )
}
