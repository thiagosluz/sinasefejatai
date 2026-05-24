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
  Check, 
  AlertCircle
} from 'lucide-react'
import { saveAta } from '../../actions-ata'
import DocumentHeader, { DocumentHeaderConfig } from '@/components/document-header'

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
}

interface AtaEditorClienteProps {
  assembleia: Assembleia
  ataInicial?: Ata
  config?: DocumentHeaderConfig | null
}

export default function AtaEditorCliente({ assembleia, ataInicial, config }: AtaEditorClienteProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  
  const [numero, setNumero] = useState(ataInicial?.numero || '')
  const [redator, setRedator] = useState(ataInicial?.redator || '')
  const [conteudoRich, setConteudoRich] = useState(ataInicial?.conteudo_rich || '')
  const [copiado, setCopiado] = useState(false)
  const [salvando, setSalvando] = useState(false)

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

  // Monitorar input de digitação para atualizar o estado do formulário oculto
  const handleEditorInput = () => {
    if (editorRef.current) {
      setConteudoRich(editorRef.current.innerHTML)
    }
  }

  // Copiar o texto limpo ou o HTML da ata
  const handleCopyText = () => {
    if (editorRef.current) {
      navigator.clipboard.writeText(editorRef.current.innerText)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    }
  }

  // Disparar o diálogo de impressão do navegador
  const handlePrint = () => {
    window.print()
  }

  // Função para converter número cardinal básico para extenso (Dias e Ano)
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

  // Gerar o esboço oficial baseado nas melhores práticas jurídicas e administrativas de sindicatos federais
  const handleGerarEsboço = () => {
    const dataExtenso = obterDataExtenso(assembleia.data_realizacao)
    const pautasFormatadas = assembleia.pautas && assembleia.pautas.length > 0
      ? assembleia.pautas.map((p, index) => `${index + 1}) ${p}`).join('; ')
      : 'pauta não definida'

    const template = `
      <div><strong>ATA DA ASSEMBLEIA GERAL ${assembleia.tipo.toUpperCase()} DA SEÇÃO SINDICAL JATAÍ DO SINASEFE</strong></div>
      <div><br></div>
      <div style="text-align: justify; line-height: 1.6;">
        Aos <strong>${dataExtenso}</strong>, às <strong>${assembleia.horario_1a_convocacao.slice(0, 5)}</strong> horas em primeira convocação, e às <strong>${assembleia.horario_2a_convocacao.slice(0, 5)}</strong> horas em segunda convocação, reuniu-se no(a) <strong>${assembleia.local}</strong>, a Assembleia Geral <strong>${assembleia.tipo}</strong> dos filiados da Seção Sindical de Jataí do SINASEFE, sob convocação formal expedida pelo Edital número <strong>${assembleia.numero || '_____'}</strong>, com a presença dos servidores técnico-administrativos e docentes constantes da respectiva lista de presença. Para dirigir os trabalhos desta assembleia, foi aclamado(a) como presidente da mesa o(a) filiado(a) <strong>${redator || '____________________'}</strong>, que convidou para secretariar os trabalhos o(a) filiado(a) <strong>____________________</strong>. Dando início à reunião, o presidente declarou aberta a assembleia e procedeu-se à leitura da pauta de deliberações, constante dos seguintes pontos: <strong>${pautasFormatadas}</strong>. Passando-se à ordem do dia, no <strong>primeiro ponto da pauta</strong>, debateu-se que... Após amplos debates e deliberações, o ponto foi colocado em votação, resultando em... No <strong>segundo ponto da pauta</strong>, passou-se a discutir sobre... Deliberando que... E nada mais havendo a tratar, a sessão foi encerrada pelo presidente, da qual eu, na qualidade de secretário(a) dos trabalhos, lavrei a presente ata que, após lida e considerada em conformidade por todos os presentes, será assinada pela coordenação, pela mesa diretora dos trabalhos e pelos demais presentes interessados.
      </div>
    `

    if (editorRef.current) {
      if (editorRef.current.innerText.trim() !== '' && !confirm('A geração de esboço substituirá todo o conteúdo atual do editor. Deseja continuar?')) {
        return
      }
      editorRef.current.innerHTML = template
      setConteudoRich(template)
    }
  }

  // Limpar todo o editor
  const handleLimpar = () => {
    if (confirm('Tem certeza de que deseja limpar todo o conteúdo do editor?')) {
      if (editorRef.current) {
        editorRef.current.innerHTML = ''
        setConteudoRich('')
      }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* 1. Painel de Controle Lateral (Configurações da Ata) - 4 Colunas */}
      <div className="lg:col-span-4 bg-brand-card border border-zinc-350 p-6 rounded-none space-y-6 print:hidden shadow-lg">
        <h2 className="text-lg font-serif font-bold text-brand-ink border-b border-zinc-300 pb-3 flex items-center gap-2">
          <span>Configuração da Ata</span>
        </h2>

        <form action={saveAta} onSubmit={() => setSalvando(true)} className="space-y-4">
          <input type="hidden" name="assembleia_id" value={assembleia.id} />
          <input type="hidden" name="conteudo_rich" value={conteudoRich} />

          <div>
            <label htmlFor="numero" className="block text-xs font-bold text-zinc-550 uppercase tracking-wider mb-2 font-serif">
              Número da Ata (Opcional)
            </label>
            <input 
              id="numero"
              name="numero"
              type="text" 
              placeholder="Ex: 03/2026"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="w-full bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
            />
          </div>

          <div>
            <label htmlFor="redator" className="block text-xs font-bold text-zinc-550 uppercase tracking-wider mb-2 font-serif">
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
              className="w-full bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              disabled={salvando}
              className="w-full bg-brand-tinto hover:bg-brand-tinto-light disabled:bg-zinc-300 text-white text-xs font-serif font-bold uppercase tracking-wider py-3.5 transition-all shadow-[2px_2px_0px_#121214] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save size={15} />
              <span>{salvando ? 'Salvando...' : 'Salvar Ata'}</span>
            </button>
          </div>
        </form>

        <div className="border-t border-zinc-300 pt-6 space-y-3">
          <button 
            onClick={handleGerarEsboço}
            className="w-full border border-brand-ink hover:border-zinc-700 bg-brand-cream hover:bg-brand-card text-brand-ink py-2.5 px-4 text-xs font-serif font-bold uppercase tracking-wider transition-all shadow-[2px_2px_0px_#121214] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles size={14} className="text-amber-600" />
            <span>Gerar Esboço Oficial</span>
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handleCopyText}
              className="flex-1 border border-brand-ink bg-brand-cream hover:bg-brand-card text-brand-ink py-2 px-3 text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-[1.5px_1.5px_0px_#121214] cursor-pointer"
            >
              {copiado ? <Check size={12} className="text-brand-olive" /> : <Copy size={12} />}
              <span>{copiado ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>
            
            <button 
              onClick={handlePrint}
              className="flex-1 border border-brand-ink bg-brand-cream hover:bg-brand-card text-brand-ink py-2 px-3 text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-[1.5px_1.5px_0px_#121214] cursor-pointer"
            >
              <Printer size={12} />
              <span>Imprimir</span>
            </button>
          </div>

          <button 
            onClick={handleLimpar}
            className="w-full border border-brand-tinto hover:bg-brand-cream text-brand-tinto py-2 px-4 text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-[1.5px_1.5px_0px_#991b1b] cursor-pointer"
          >
            <Trash2 size={12} />
            <span>Excluir Rascunho</span>
          </button>
        </div>

        <div className="bg-[#f5f2eb]/60 border border-zinc-300 p-4 text-[11px] text-zinc-650 leading-relaxed flex items-start gap-2.5">
          <AlertCircle size={15} className="text-brand-tinto shrink-0 mt-0.5" />
          <p>
            <strong>Ata Administrativa:</strong> Em conformidade com os padrões formais de sindicatos federais, a ata final gerada na visualização de impressão não possui divisões de parágrafos em branco ou saltos de linha desnecessários, evitando rasuras e garantindo integridade documental.
          </p>
        </div>
      </div>

      {/* 2. Editor WYSIWYG - 8 Colunas */}
      <div className="lg:col-span-8 space-y-4 print:hidden shadow-lg">
        {/* Barra de Ferramentas Rica */}
        <div className="bg-brand-card border border-zinc-350 p-2.5 rounded-none flex flex-wrap items-center gap-1">
          <button
            onClick={() => formatDoc('bold')}
            title="Negrito"
            className="p-2 hover:bg-brand-cream text-brand-ink rounded-none transition-colors"
          >
            <Bold size={15} />
          </button>
          <button
            onClick={() => formatDoc('italic')}
            title="Itálico"
            className="p-2 hover:bg-brand-cream text-brand-ink rounded-none transition-colors"
          >
            <Italic size={15} />
          </button>
          
          <div className="w-[1px] h-6 bg-zinc-300 mx-1"></div>

          <button
            onClick={() => formatDoc('insertUnorderedList')}
            title="Lista com Marcadores"
            className="p-2 hover:bg-brand-cream text-brand-ink rounded-none transition-colors"
          >
            <List size={15} />
          </button>
          <button
            onClick={() => formatDoc('insertOrderedList')}
            title="Lista Numerada"
            className="p-2 hover:bg-brand-cream text-brand-ink rounded-none transition-colors"
          >
            <ListOrdered size={15} />
          </button>

          <div className="w-[1px] h-6 bg-zinc-300 mx-1"></div>

          <button
            onClick={() => formatDoc('justifyFull')}
            title="Justificado (Recomendado para atas)"
            className="p-2 hover:bg-brand-cream text-brand-ink rounded-none transition-colors"
          >
            <AlignJustify size={15} />
          </button>

          <button
            onClick={() => formatDoc('formatBlock', '<h2>')}
            title="Subtítulo"
            className="p-2 hover:bg-brand-cream text-brand-ink rounded-none transition-colors flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider"
          >
            <Heading2 size={15} />
          </button>

          <div className="w-[1px] h-6 bg-zinc-300 mx-1"></div>

          <button
            onClick={() => formatDoc('removeFormat')}
            title="Limpar Formatação"
            className="p-2 hover:bg-brand-cream text-brand-tinto rounded-none transition-colors text-[10px] font-bold uppercase tracking-wider"
          >
            Limpar
          </button>
        </div>

        {/* Corpo do Editor */}
        <div className="bg-[#fcfbf9] border border-zinc-350 rounded-none overflow-hidden shadow-md min-h-[580px] flex flex-col">
          <div className="bg-[#e9e6de] px-6 py-3 border-b border-zinc-350 flex items-center justify-between text-xs font-bold text-zinc-650 uppercase tracking-wider">
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

      {/* 3. Layout de Impressão Oficial A4 (Escondido na tela normal, exibido no Ctrl+P) */}
      <div className="hidden print:block font-serif text-black p-12 bg-white max-w-[800px] mx-auto text-justify text-sm leading-relaxed">
        {/* Cabeçalho da Seção Sindical Dinâmico */}
        <DocumentHeader config={config} />

        {/* Título Oficial do Documento */}
        <div className="text-center font-bold text-base uppercase mb-6 tracking-wide">
          ATA DA ASSEMBLEIA GERAL {assembleia.tipo.toUpperCase()} {numero ? `Nº ${numero}` : ''}
        </div>

        {/* Corpo da Ata Impressa em formato Contínuo de Papel Oficial */}
        <div 
          className="print-document-content text-justify"
          dangerouslySetInnerHTML={{ __html: conteudoRich }}
          style={{ 
            textAlign: 'justify', 
            textJustify: 'inter-word',
            lineHeight: '1.8',
            fontSize: '13px'
          }}
        />

        {/* Seção de Assinaturas */}
        <div className="mt-20 grid grid-cols-2 gap-12 text-center text-xs">
          <div className="flex flex-col items-center">
            <div className="w-[220px] border-b border-black mb-2"></div>
            <div className="font-semibold uppercase">{redator || 'Secretário(a) / Redator(a)'}</div>
            <div className="text-gray-600">Secretário(a) da Assembleia</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-[220px] border-b border-black mb-2"></div>
            <div className="font-semibold uppercase">Presidente da Assembleia</div>
            <div className="text-gray-600">Mesa Coordenadora</div>
          </div>
        </div>
      </div>
    </div>
  )
}
