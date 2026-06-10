'use client'

import DocumentHeader, { DocumentHeaderConfig } from '@/components/document-header'
import { DocumentSignatureFooter } from '@/components/layout/document-signature-footer'
import { DocumentoVerificacao } from '@/lib/actions-assinaturas'

import { formatarDataExtenso } from '../lib/formatar-data-extenso'

interface CertificadoData {
  nome_participante: string
  cpf_participante: string
  nome_evento: string
  carga_horaria: number
  data_inicio: string
  data_fim: string
  descricao_complementar?: string
  data_emissao?: string
}

interface CertificadoLayoutProps {
  dados: CertificadoData
  numero?: string
  config?: DocumentHeaderConfig | null
  verificacao?: DocumentoVerificacao | null
  status?: string
}

export function CertificadoLayout({ dados, numero, config, verificacao, status = 'ativo' }: CertificadoLayoutProps) {
  const dataStr = formatarDataExtenso(dados.data_emissao)

  const formatarPeriodo = () => {
    if (!dados.data_inicio || !dados.data_fim) return '___/___/______ a ___/___/______'
    const inicio = new Date(dados.data_inicio + 'T12:00:00')
    const fim = new Date(dados.data_fim + 'T12:00:00')
    const fmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    return `${fmt.format(inicio)} a ${fmt.format(fim)}`
  }

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
          <h2 className="text-xl font-bold tracking-[0.2em] uppercase mb-2">Certificado</h2>
          {numero && <p className="text-sm font-semibold text-zinc-600">Nº {numero}</p>}
        </div>

        {/* Corpo */}
        <div className="text-justify text-base leading-relaxed mb-12">
          <p className="indent-10 mb-4">
            Certificamos que <strong>{dados.nome_participante || '________________________'}</strong>
            {dados.cpf_participante && `, portador(a) do CPF ${dados.cpf_participante}`}, participou do(a){' '}
            <strong>{dados.nome_evento || '________________________'}</strong>, realizado(a) no período de{' '}
            {formatarPeriodo()}, com carga horária total de{' '}
            <strong>{dados.carga_horaria || '___'} horas</strong>.
          </p>
          {dados.descricao_complementar && (
            <p className="indent-10">{dados.descricao_complementar}</p>
          )}
        </div>

        {/* Data */}
        <div className="text-right text-base mb-24">{dataStr}</div>

        {/* Assinatura */}
        <div className="flex flex-col items-center justify-center max-w-sm mx-auto mb-16 print:mb-0">
          <div className="w-full border-t border-black mb-1"></div>
          <p className="text-base text-center font-bold">Coordenação Geral</p>
          <p className="text-sm text-center">SINASEFE - Seção Sindical Jataí</p>
        </div>

        <div className="flex-1 print:hidden"></div>

        {verificacao && verificacao.assinaturas.length > 0 && (
          <div className="mt-8">
            <DocumentSignatureFooter verificacao={verificacao} />
          </div>
        )}
      </div>

      
    </div>
  )
}
