import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Printer, ArrowLeft } from 'lucide-react'
import DocumentHeader from '@/components/document-header'
import EditalRetificarBtn from './edital-retificar-btn'
import AnexoUploadBtn from '../../anexo-upload-btn'
export default async function EditalPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()

  // Buscar assembleia
  const { data: assembleia } = await supabase
    .from('assembleias')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!assembleia) {
    notFound()
  }

  // Buscar configuração do cabeçalho
  const { data: config } = await supabase
    .from('configuracoes')
    .select('*')
    .eq('id', 1)
    .single()

  // Buscar documento anexado (Edital)
  const { data: documentos } = await supabase
    .from('assembleia_documentos')
    .select('id, arquivo_url, nome_arquivo')
    .eq('assembleia_id', params.id)
    .eq('tipo', 'edital')
    
  const documentoEdital = documentos?.[0] || null

  const dataRealizacao = new Date(assembleia.data_realizacao).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })

  const dataHoje = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="min-h-screen bg-zinc-200 print:bg-white text-zinc-900 font-sans">
      {/* Botões de Ação (Escondidos na Impressão) */}
      <div className="print:hidden bg-brand-cream border-b border-brand-border p-4 sticky top-0 z-10 shadow-sm flex justify-between items-center text-brand-ink">
        <div className="flex items-center gap-4">
          <Link href="/admin/assembleias" className="flex items-center gap-2 hover:text-brand-tinto transition-colors text-xs font-bold uppercase tracking-wider">
            <ArrowLeft size={16} />
            Voltar
          </Link>
          <span className="text-brand-border">|</span>
          <span className="font-serif font-bold text-sm">Visualização de Impressão (Edital)</span>
        </div>
        <div className="flex items-center gap-3">
          <AnexoUploadBtn assembleiaId={assembleia.id} tipo="edital" documentoExistente={documentoEdital} label="Anexar PDF Assinado" />
          <EditalRetificarBtn id={assembleia.id} versaoAtual={assembleia.versao_edital || 1} status={assembleia.status} />
          <button 
            type="button"
            className="bg-brand-ink hover:bg-brand-ink/90 text-white rounded-none px-4 py-2 font-bold uppercase tracking-wider transition-colors flex items-center gap-2 text-[10px] shadow-[1.5px_1.5px_0px_var(--brand-tinto)]"
          >
            <Printer size={16} />
            <span dangerouslySetInnerHTML={{ __html: `<span onclick="window.print()">Imprimir Edital</span>` }} />
          </button>
        </div>
      </div>

      {/* Papel (A4 Simulação) */}
      <div className="max-w-[210mm] mx-auto bg-white print:w-full print:max-w-none print:shadow-none shadow-2xl p-[25mm] min-h-[297mm] text-justify leading-relaxed">
        {/* Cabeçalho Timbrado Dinâmico */}
        <DocumentHeader config={config} />

        {/* Título do Documento */}
        <div className="text-center mb-12 relative">
          <h2 className="text-xl font-bold uppercase underline">
            EDITAL DE CONVOCAÇÃO Nº {assembleia.numero || '___/____'}
            {assembleia.versao_edital > 1 && ` - RETIFICAÇÃO 0${assembleia.versao_edital - 1}`}
          </h2>
          <h3 className="text-lg font-bold uppercase mt-2">
            ASSEMBLEIA GERAL {assembleia.tipo.toUpperCase()}
          </h3>
          
          {assembleia.versao_edital > 1 && (
            <div className="mt-4 text-xs font-bold text-red-600 border border-red-600 p-2 inline-block rounded">
              ESTE DOCUMENTO RETIFICA E SUBSTITUI A VERSÃO ANTERIOR
            </div>
          )}
        </div>

        {/* Corpo do Edital */}
        <div className="space-y-6 text-base">
          <p>
            A Coordenação da Seção Sindical Jataí do SINASEFE, no uso de suas atribuições estatutárias,{' '}
            {assembleia.publico_alvo === 'servidores' 
              ? <strong>CONVOCA OS SERVIDORES DOCENTES E TÉCNICO-ADMINISTRATIVOS</strong>
              : <strong>CONVOCA OS SERVIDORES DOCENTES E TÉCNICO-ADMINISTRATIVOS FILIADOS</strong>
            }{' '}
            para participarem da <strong>Assembleia Geral {assembleia.tipo}</strong>, 
            que será realizada no dia <strong>{dataRealizacao}</strong>, no(a) <strong>{assembleia.local}</strong>.
          </p>

          <p>
            A Assembleia instalar-se-á em primeira convocação, com 1/3 (um terço) do número de sindicalizados, às <strong>{assembleia.horario_1a_convocacao.slice(0, 5)}</strong>, ou, em segunda convocação com qualquer quórum às <strong>{assembleia.horario_2a_convocacao.slice(0, 5)}</strong>, oportunidade em que {assembleia.pautas?.length === 1 ? 'será apreciado o seguinte ponto de pauta:' : 'serão apreciados os seguintes pontos de pauta:'}
          </p>

          <div className="pl-8 my-8">
            <ul className="list-decimal space-y-2 font-medium">
              {assembleia.pautas?.map((pauta: string, index: number) => (
                <li key={index}>{pauta}</li>
              ))}
            </ul>
          </div>

          <p>
            Contamos com a presença de todos para fortalecimento das nossas lutas e deliberações.
          </p>

          <div className="mt-24 text-center">
            <p className="mb-16">Jataí - GO, {dataHoje}.</p>
            
            <div className="w-64 mx-auto border-t border-zinc-900 pt-2">
              <p className="font-bold">Coordenação Colegiada</p>
              <p className="text-sm">SINASEFE Seção Jataí</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
