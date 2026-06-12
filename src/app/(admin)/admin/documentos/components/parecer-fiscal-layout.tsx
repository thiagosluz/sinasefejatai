'use client'

import DocumentHeader, { DocumentHeaderConfig } from '@/components/document-header'
import { DocumentSignatureFooter } from '@/components/layout/document-signature-footer'
import { DocumentoVerificacao } from '@/lib/actions-assinaturas'

interface ParecerFiscalLayoutProps {
  dados: {
    conteudo_html?: string
  }
  numero?: string
  config?: DocumentHeaderConfig | null
  verificacao?: DocumentoVerificacao | null
  status?: string
}

export function ParecerFiscalLayout({ dados, config, verificacao, status = 'ativo' }: ParecerFiscalLayoutProps) {
  return (
    <div id="documento-print-area" className={`relative bg-white text-black p-8 sm:p-12 min-h-[29.7cm] w-full max-w-[21cm] mx-auto shadow-2xl print:shadow-none print:m-0 print:p-0 print:w-auto print:max-w-none print:min-h-0 font-serif flex flex-col overflow-hidden ${status === 'cancelado' ? 'grayscale opacity-75' : ''}`}>

      {/* Marca d'água de Cancelado */}
      {status === 'cancelado' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <div className="text-red-600/10 font-black text-[150px] tracking-widest rotate-[-45deg] select-none uppercase whitespace-nowrap">
            CANCELADO
          </div>
        </div>
      )}

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Cabeçalho Institucional */}
        <DocumentHeader config={config} />

        {/* Corpo do Parecer em HTML puro */}
        {dados.conteudo_html ? (
          <div 
            className="text-base leading-relaxed mb-12"
            dangerouslySetInnerHTML={{ __html: dados.conteudo_html }}
          />
        ) : (
          <div className="text-center italic text-zinc-400 my-12">
            Nenhum conteúdo disponível para este parecer.
          </div>
        )}

        <div className="flex-1 print:hidden"></div>

        {/* Footer de Assinatura Eletrônica */}
        {verificacao && verificacao.assinaturas.length > 0 && (
          <div className="mt-8">
            <DocumentSignatureFooter verificacao={verificacao} />
          </div>
        )}
      </div>

    </div>
  )
}
