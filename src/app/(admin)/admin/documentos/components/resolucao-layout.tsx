'use client'

import DocumentHeader, { DocumentHeaderConfig } from '@/components/document-header'
import { DocumentSignatureFooter } from '@/components/layout/document-signature-footer'
import { DocumentoVerificacao } from '@/lib/actions-assinaturas'

import { formatarDataExtenso } from '../lib/formatar-data-extenso'

interface ResolucaoData {
  ementa?: string
  considerandos?: string
  artigos?: string
  data_emissao?: string
  revogado_por?: string
  revogado_por_titulo?: string
}

interface ResolucaoLayoutProps {
  dados: ResolucaoData
  numero?: string
  config?: DocumentHeaderConfig | null
  verificacao?: DocumentoVerificacao | null
  status?: string
}

export function ResolucaoLayout({ dados, numero, config, verificacao, status = 'ativo' }: ResolucaoLayoutProps) {
  const dataStr = formatarDataExtenso(dados.data_emissao)

  const considerandosParagrafos = (dados.considerandos || '').split('\n').filter(p => p.trim())
  const artigosParagrafos = (dados.artigos || '').split('\n').filter(p => p.trim())

  return (
    <div id="documento-print-area" className={`relative bg-white text-black p-8 sm:p-12 min-h-[29.7cm] w-full max-w-[21cm] mx-auto shadow-2xl print:shadow-none print:m-0 print:p-0 print:w-auto print:max-w-none print:min-h-0 font-serif flex flex-col overflow-hidden ${status === 'cancelado' ? 'grayscale opacity-75' : ''}`}>

      {status === 'cancelado' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <div className="text-red-600/10 font-black text-[150px] tracking-widest rotate-[-45deg] select-none uppercase whitespace-nowrap">CANCELADO</div>
        </div>
      )}

      {status === 'revogado' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <div className="text-orange-600/15 font-black text-[130px] tracking-widest rotate-[-45deg] select-none uppercase whitespace-nowrap">REVOGADA</div>
        </div>
      )}

      {status === 'ativo' && (!verificacao || verificacao.assinaturas.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <div className="text-zinc-300/40 font-black text-[150px] tracking-widest rotate-[-45deg] select-none uppercase whitespace-nowrap print:text-zinc-300/40">MINUTA</div>
        </div>
      )}

      <div className="relative z-10 flex-1 flex flex-col">
        {status === 'revogado' && (
          <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-800 p-4 mb-8 print:hidden rounded-r flex flex-col gap-1 shadow-sm">
            <strong className="text-sm uppercase tracking-wider font-bold">Atenção: Resolução Revogada</strong>
            <span className="text-sm">
              Esta resolução normativa foi substituída e não está mais em vigor.
              {dados.revogado_por_titulo && ` Ela foi revogada pela ${dados.revogado_por_titulo}.`}
            </span>
          </div>
        )}

        <DocumentHeader config={config} />

        {/* Título */}
        <div className="flex flex-col items-center mb-8 mt-4">
          <h2 className="text-xl font-bold tracking-[0.1em] uppercase mb-1">Resolução Normativa</h2>
          {numero && <p className="text-base font-semibold text-zinc-800">Nº {numero}</p>}
        </div>

        {/* Ementa */}
        {dados.ementa && (
          <div className="flex justify-end mb-10">
            <div className="w-[50%] text-sm text-justify italic font-serif leading-relaxed border-l-2 border-zinc-200 pl-4 py-1 text-zinc-800">
              {dados.ementa}
            </div>
          </div>
        )}

        {/* Cabeçalho Fixo */}
        <div className="text-justify text-base leading-relaxed mb-6">
          <p className="indent-10">
            A <strong>Coordenação Geral do SINASEFE - Seção Sindical Jataí</strong>, no uso de suas atribuições estatutárias e regimentais,
          </p>
        </div>

        {/* Considerandos */}
        {considerandosParagrafos.length > 0 && (
          <div className="text-justify text-base leading-relaxed mb-8 space-y-3">
            {considerandosParagrafos.map((p, i) => (
              <p key={i} className="indent-10">
                <strong>CONSIDERANDO</strong> {p}
              </p>
            ))}
          </div>
        )}

        {/* Resolve */}
        <div className="text-base leading-relaxed mb-12">
          <p className="font-bold text-center mb-6 tracking-wider">RESOLVE:</p>
          <div className="space-y-4">
            {artigosParagrafos.length > 0 ? (
              artigosParagrafos.map((p, i) => {
                // Negrita "Art.", "Parágrafo", etc., no começo do parágrafo se quiser
                // Aqui mantemos texto puro justificado
                return <p key={i} className="indent-10 text-justify">{p}</p>
              })
            ) : (
              <p className="indent-10 text-zinc-400">[Artigos da resolução serão exibidos aqui]</p>
            )}
          </div>
        </div>

        {/* Data */}
        <div className="text-right text-base mb-24">{dataStr}</div>

        {/* Assinatura */}
        <div className="flex flex-col items-center justify-center max-w-sm mx-auto mb-16">
          <div className="w-full border-t border-black mb-1"></div>
          <p className="text-base text-center font-bold">Coordenação Geral</p>
          <p className="text-sm text-center">SINASEFE - Seção Sindical Jataí</p>
        </div>

        <div className="flex-1"></div>

        {verificacao && verificacao.assinaturas.length > 0 && (
          <div className="mt-8 print:mt-auto">
            <DocumentSignatureFooter verificacao={verificacao} />
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #documento-print-area, #documento-print-area * { visibility: visible; }
          #documento-print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 2cm; }
          @page { size: A4; margin: 0; }
        }
      `}} />
    </div>
  )
}
