'use client'

import DocumentHeader, { DocumentHeaderConfig } from '@/components/document-header'
import { DocumentSignatureFooter } from '@/components/layout/document-signature-footer'
import { DocumentoVerificacao } from '@/lib/actions-assinaturas'

import { formatarDataExtenso } from '../lib/formatar-data-extenso'

interface DeclaracaoData {
  nome_declarado: string
  cpf_declarado: string
  corpo: string
  finalidade: string
  data_emissao?: string
}

interface DeclaracaoLayoutProps {
  dados: DeclaracaoData
  numero?: string
  config?: DocumentHeaderConfig | null
  verificacao?: DocumentoVerificacao | null
  status?: string
}

export function DeclaracaoLayout({ dados, numero, config, verificacao, status = 'ativo' }: DeclaracaoLayoutProps) {
  const dataStr = formatarDataExtenso(dados.data_emissao)

  return (
    <div id="documento-print-area" className={`relative bg-white text-black p-8 sm:p-12 min-h-[29.7cm] w-full max-w-[21cm] mx-auto shadow-2xl print:shadow-none print:m-0 print:p-0 print:w-auto print:max-w-none print:min-h-0 font-serif flex flex-col overflow-hidden ${status === 'cancelado' ? 'grayscale opacity-75' : ''}`}>

      {status === 'cancelado' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <div className="text-red-600/10 font-black text-[150px] tracking-widest rotate-[-45deg] select-none uppercase whitespace-nowrap">CANCELADO</div>
        </div>
      )}

      <div className="relative z-10 flex-1 flex flex-col">
        <DocumentHeader config={config} />

        {/* Título */}
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-xl font-bold tracking-[0.2em] uppercase mb-2">Declaração</h2>
          {numero && <p className="text-sm font-semibold text-zinc-600">Nº {numero}</p>}
        </div>

        {/* Corpo */}
        <div className="text-justify text-base leading-relaxed mb-12">
          <p className="indent-10 mb-4">
            {dados.corpo || 'Declaramos para os devidos fins que...'}
          </p>
          {dados.finalidade && (
            <p className="indent-10">
              A presente declaração é expedida {dados.finalidade}.
            </p>
          )}
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
