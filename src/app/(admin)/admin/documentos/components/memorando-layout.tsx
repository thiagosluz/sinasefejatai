'use client'

import DocumentHeader, { DocumentHeaderConfig } from '@/components/document-header'
import { DocumentSignatureFooter } from '@/components/layout/document-signature-footer'
import { DocumentoVerificacao } from '@/lib/actions-assinaturas'

import { formatarDataExtenso } from '../lib/formatar-data-extenso'

interface MemorandoData {
  de: string
  para: string
  assunto: string
  corpo: string
  data_emissao?: string
}

interface MemorandoLayoutProps {
  dados: MemorandoData
  numero?: string
  config?: DocumentHeaderConfig | null
  verificacao?: DocumentoVerificacao | null
  status?: string
}

export function MemorandoLayout({ dados, numero, config, verificacao, status = 'ativo' }: MemorandoLayoutProps) {
  const dataStr = formatarDataExtenso(dados.data_emissao)
  const paragrafos = (dados.corpo || '').split('\n').filter(p => p.trim())

  return (
    <div id="documento-print-area" className={`relative bg-white text-black p-8 sm:p-12 min-h-[29.7cm] w-full max-w-[21cm] mx-auto shadow-2xl print:shadow-none print:m-0 print:p-0 print:w-auto print:max-w-none print:min-h-0 font-serif flex flex-col overflow-hidden ${status === 'cancelado' ? 'grayscale opacity-75' : ''}`}>

      {status === 'cancelado' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <div className="text-red-600/10 font-black text-[150px] tracking-widest rotate-[-45deg] select-none uppercase whitespace-nowrap">CANCELADO</div>
        </div>
      )}

      <div className="relative z-10 flex-1 flex flex-col">
        <DocumentHeader config={config} />

        {/* Identificação e Data */}
        <div className="flex justify-between items-start mb-8">
          <p className="font-bold text-base">Memorando Nº {numero || '___/____'}/SINASEFE-JATAÍ</p>
          <div className="text-right text-base">{dataStr}</div>
        </div>

        {/* De / Para / Assunto */}
        <div className="mb-8 text-base space-y-1">
          <p><strong>De:</strong> {dados.de || '________________________'}</p>
          <p><strong>Para:</strong> {dados.para || '________________________'}</p>
          <p><strong>Assunto:</strong> {dados.assunto || '________________________________________'}</p>
        </div>

        {/* Corpo */}
        <div className="text-justify text-base leading-relaxed mb-12 space-y-4">
          {paragrafos.length > 0 ? (
            paragrafos.map((p, i) => <p key={i} className="indent-10">{p}</p>)
          ) : (
            <p className="indent-10 text-zinc-400">[Corpo do memorando será exibido aqui]</p>
          )}
        </div>

        {/* Fecho */}
        <div className="mb-16 text-base indent-10">
          <p>Atenciosamente,</p>
        </div>

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
