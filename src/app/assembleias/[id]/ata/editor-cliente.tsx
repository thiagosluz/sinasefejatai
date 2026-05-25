'use client'

import { useRef, useState, useEffect } from 'react'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  AlignJustify, 
  Trash2, 
  Copy, 
  Save, 
  Printer, 
  Sparkles, 
  Heading2, 
  Check
} from 'lucide-react'
import { saveAta } from '../../actions-ata'
import DocumentHeader, { DocumentHeaderConfig } from '@/components/document-header'
import { useModal } from '@/providers/modal-provider'
import { createClient } from '@/lib/supabase/client'

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
}

type Voto = { aFavor: string, contra: string, abstencoes: string }

export default function AtaEditorCliente({ assembleia, ataInicial, config }: AtaEditorClienteProps) {
  const { confirm } = useModal()
  const editorRef = useRef<HTMLDivElement>(null)
  
  const [presidente, setPresidente] = useState<string>((ataInicial?.votos_pautas?._presidente as string) || '')
  const [redator, setRedator] = useState(ataInicial?.redator || '')
  const [conteudoRich, setConteudoRich] = useState(ataInicial?.conteudo_rich || '')
  const [copiado, setCopiado] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Omitimos o _presidente do estado de votos para os inputs do placar funcionarem bem
  const initVotos = { ... (ataInicial?.votos_pautas || {}) } as Record<number, Voto> & { _presidente?: unknown }
  delete initVotos._presidente
  const [votos, setVotos] = useState<Record<number, Voto>>(initVotos as Record<number, Voto>)
  
  const [arquivoUrl, setArquivoUrl] = useState(ataInicial?.arquivo_pdf_url || '')

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
        ...(prev[index] || { aFavor: '', contra: '', abstencoes: '' }),
        [field]: value
      }
    }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    try {
      setUploading(true)
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `ata-${assembleia.id}-${Date.now()}.${fileExt}`
      
      const { error } = await supabase.storage
        .from('documentos')
        .upload(fileName, file)
        
      if (error) throw error
      
      const { data: publicUrlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(fileName)
        
      setArquivoUrl(publicUrlData.publicUrl)
    } catch (err) {
      console.error(err)
      alert('Erro ao fazer upload da ata. Verifique se o bucket "documentos" existe e tem permissão.')
    } finally {
      setUploading(false)
    }
  }

  const handleGerarEsboço = async (e: React.MouseEvent) => {
    e.preventDefault()
    const dataExtenso = obterDataExtenso(assembleia.data_realizacao)
    const pautasResumo = assembleia.pautas && assembleia.pautas.length > 0
      ? assembleia.pautas.map((p, index) => `${index + 1}) ${p}`).join('; ')
      : 'pauta não definida'

    let pautasDetalhes = ''
    if (assembleia.pautas && assembleia.pautas.length > 0) {
      pautasDetalhes = assembleia.pautas.map((p, index) => {
        const v = votos[index]
        const temVotacao = v && (v.aFavor || v.contra || v.abstencoes)
        let texto = `No <strong>${index + 1}º ponto da pauta (${p})</strong>, debateu-se amplamente sobre o tema. `
        
        if (temVotacao) {
          texto += `Colocado em regime de votação, a pauta resultou em: <strong>${v.aFavor || 0} votos a favor, ${v.contra || 0} contra e ${v.abstencoes || 0} abstenções.</strong>`
        } else {
          texto += `Após esclarecimentos, o ponto foi superado e encaminhado consensualmente pelos presentes.`
        }
        return texto
      }).join('<br><br>')
    } else {
      pautasDetalhes = 'Não houve pautas definidas para esta reunião.'
    }

    const template = `
      <div><strong>ATA DA ASSEMBLEIA GERAL ${assembleia.tipo.toUpperCase()} DA SEÇÃO SINDICAL JATAÍ DO SINASEFE</strong></div>
      <div><br></div>
      <div style="text-align: justify; line-height: 1.6;">
        Aos <strong>${dataExtenso}</strong>, às <strong>${assembleia.horario_1a_convocacao.slice(0, 5)}</strong> horas em primeira convocação, e às <strong>${assembleia.horario_2a_convocacao.slice(0, 5)}</strong> horas em segunda convocação, reuniu-se no(a) <strong>${assembleia.local}</strong>, a Assembleia Geral <strong>${assembleia.tipo}</strong> dos filiados da Seção Sindical de Jataí do SINASEFE, sob convocação formal expedida pelo Edital número <strong>${assembleia.numero || '_____'}</strong>, com a presença dos servidores técnico-administrativos e docentes constantes da respectiva lista de presença. Para dirigir os trabalhos desta assembleia, foi aclamado(a) como presidente da mesa o(a) filiado(a) <strong>${presidente || '____________________'}</strong>, que convidou para secretariar os trabalhos o(a) filiado(a) <strong>${redator || '____________________'}</strong>. Dando início à reunião, o presidente declarou aberta a assembleia e procedeu-se à leitura da pauta de deliberações, constante dos seguintes pontos: <strong>${pautasResumo}</strong>. <br><br>
        Passando-se à ordem do dia:<br><br>
        ${pautasDetalhes}
        <br><br>
        E nada mais havendo a tratar, a sessão foi encerrada pelo presidente, da qual eu, na qualidade de secretário(a) dos trabalhos, lavrei a presente ata que, após lida e considerada em conformidade por todos os presentes, será assinada pela coordenação, pela mesa diretora dos trabalhos e pelos demais presentes interessados.
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

        <form action={saveAta} onSubmit={() => setSalvando(true)} className="space-y-4 flex flex-col min-h-[calc(100%-60px)]">
          <div className="flex-1 space-y-4">
            <input type="hidden" name="assembleia_id" value={assembleia.id} />
            <input type="hidden" name="conteudo_rich" value={conteudoRich} />
            <input type="hidden" name="votos_pautas" value={JSON.stringify({ ...votos, _presidente: presidente })} />
            <input type="hidden" name="arquivo_pdf_url" value={arquivoUrl} />

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

            {/* Votações */}
            {assembleia.pautas && assembleia.pautas.length > 0 && (
              <div className="border-t border-brand-border pt-4">
                <h3 className="text-xs font-bold text-brand-ink/60 uppercase tracking-wider mb-3 font-serif">Placar de Votações (Opcional)</h3>
                {assembleia.pautas.map((pauta, idx) => (
                  <div key={idx} className="mb-4 bg-brand-cream p-3 border border-brand-border">
                    <p className="text-[11px] font-semibold text-brand-ink mb-2 truncate" title={pauta}>{idx + 1}. {pauta}</p>
                    <div className="flex gap-2">
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
                  </div>
                ))}
                
                <button 
                  type="button"
                  onClick={handleGerarEsboço}
                  className="mt-3 w-full border border-brand-ink hover:bg-brand-cream bg-white text-brand-ink py-2 px-4 text-[10px] font-bold uppercase tracking-wider transition-all shadow-[1.5px_1.5px_0px_var(--brand-ink)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles size={14} className="text-amber-600" />
                  <span>Gerar Esboço c/ Votos</span>
                </button>
              </div>
            )}

            {/* Upload PDF */}
            <div className="border-t border-brand-border pt-4 mt-4">
              <h3 className="text-xs font-bold text-brand-ink/60 uppercase tracking-wider mb-2 font-serif">Ata Assinada (Nuvem)</h3>
              <div className="bg-brand-cream border border-brand-ink/30 p-4 border-dashed relative">
                {arquivoUrl ? (
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="bg-brand-olive/10 text-brand-olive p-2 rounded-full">
                      <Check size={20} />
                    </div>
                    <span className="text-[11px] text-brand-ink font-bold uppercase text-center">PDF Anexado com Sucesso</span>
                    <div className="flex gap-4 mt-1">
                      <a href={arquivoUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-600 uppercase hover:underline">Visualizar Arquivo</a>
                      <button type="button" onClick={() => setArquivoUrl('')} className="text-[10px] font-bold text-brand-tinto uppercase hover:underline">Substituir / Remover</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-brand-ink/50">Nenhum arquivo enviado</span>
                    <label className="cursor-pointer bg-brand-ink text-white px-4 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-brand-ink/80 transition-colors shadow-[1.5px_1.5px_0px_var(--brand-tinto)]">
                      Selecionar Arquivo PDF
                      <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                    </label>
                    {uploading && <p className="text-[10px] text-brand-tinto mt-2 font-bold animate-pulse">Enviando PDF para a nuvem...</p>}
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t border-brand-border pt-6 space-y-3 mt-4">
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={handleCopyText}
                  className="flex-1 border border-brand-ink bg-brand-cream hover:bg-brand-card text-brand-ink py-2 px-3 text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-[1.5px_1.5px_0px_var(--brand-ink)] cursor-pointer"
                >
                  {copiado ? <Check size={12} className="text-brand-olive" /> : <Copy size={12} />}
                  <span>{copiado ? 'Copiado!' : 'Copiar Texto'}</span>
                </button>
                
                <button 
                  type="button"
                  onClick={handlePrint}
                  className="flex-1 border border-brand-ink bg-brand-cream hover:bg-brand-card text-brand-ink py-2 px-3 text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-[1.5px_1.5px_0px_var(--brand-ink)] cursor-pointer"
                >
                  <Printer size={12} />
                  <span>Imprimir</span>
                </button>
              </div>

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

          <div className="pt-4 border-t border-brand-border mt-auto">
            <button 
              type="submit"
              disabled={salvando}
              className="w-full bg-brand-tinto hover:bg-brand-tinto-light disabled:bg-zinc-300 text-white text-xs font-serif font-bold uppercase tracking-wider py-4 transition-all shadow-[3px_3px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1.5px_1.5px_0px_var(--brand-ink)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save size={16} />
              <span>{salvando ? 'Salvando Ata...' : 'Salvar Progressos da Ata'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Editor WYSIWYG - 8 Colunas */}
      <div className="lg:col-span-8 space-y-4 print:hidden shadow-lg">
        {/* Barra de Ferramentas Rica */}
        <div className="bg-brand-card border border-brand-border p-2.5 rounded-none flex flex-wrap items-center gap-1">
          <button onClick={() => formatDoc('bold')} title="Negrito" className="p-2 hover:bg-brand-cream text-brand-ink rounded-none transition-colors"><Bold size={15} /></button>
          <button onClick={() => formatDoc('italic')} title="Itálico" className="p-2 hover:bg-brand-cream text-brand-ink rounded-none transition-colors"><Italic size={15} /></button>
          <div className="w-[1px] h-6 bg-brand-border mx-1"></div>
          <button onClick={() => formatDoc('insertUnorderedList')} title="Lista" className="p-2 hover:bg-brand-cream text-brand-ink rounded-none transition-colors"><List size={15} /></button>
          <button onClick={() => formatDoc('insertOrderedList')} title="Numerada" className="p-2 hover:bg-brand-cream text-brand-ink rounded-none transition-colors"><ListOrdered size={15} /></button>
          <div className="w-[1px] h-6 bg-brand-border mx-1"></div>
          <button onClick={() => formatDoc('justifyFull')} title="Justificado" className="p-2 hover:bg-brand-cream text-brand-ink rounded-none transition-colors"><AlignJustify size={15} /></button>
          <button onClick={() => formatDoc('formatBlock', '<h2>')} title="Subtítulo" className="p-2 hover:bg-brand-cream text-brand-ink rounded-none transition-colors"><Heading2 size={15} /></button>
          <div className="w-[1px] h-6 bg-brand-border mx-1"></div>
          <button onClick={() => formatDoc('removeFormat')} title="Limpar" className="p-2 hover:bg-brand-cream text-brand-tinto rounded-none transition-colors text-[10px] font-bold uppercase tracking-wider">Limpar</button>
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
        <div className="mt-20 grid grid-cols-2 gap-12 text-center text-xs">
          <div className="flex flex-col items-center">
            <div className="w-[220px] border-b border-black mb-2"></div>
            <div className="font-semibold uppercase">{redator || 'Secretário(a) / Redator(a)'}</div>
            <div className="text-gray-600">Secretário(a) da Assembleia</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-[220px] border-b border-black mb-2"></div>
            <div className="font-semibold uppercase">{presidente || 'Presidente da Assembleia'}</div>
            <div className="text-gray-600">Mesa Coordenadora</div>
          </div>
        </div>
      </div>
    </div>
  )
}
