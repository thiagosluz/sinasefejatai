'use client'

import DocumentHeader, { DocumentHeaderConfig } from '@/components/document-header'
import { DocumentSignatureFooter } from '@/components/layout/document-signature-footer'
import { DocumentoVerificacao } from '@/lib/actions-assinaturas'
import { numeroPorExtenso } from '@/lib/numero-por-extenso'

interface ReciboData {
  valor: number
  recebedor_nome: string
  recebedor_cpf: string
  referente_a: string
  data_emissao?: string // yyyy-mm-dd
}

interface ReciboLayoutProps {
  dados: ReciboData
  numero?: string
  config?: DocumentHeaderConfig | null
  verificacao?: DocumentoVerificacao | null
  status?: string // 'ativo' | 'cancelado'
}

export function ReciboLayout({ dados, numero, config, verificacao, status = 'ativo' }: ReciboLayoutProps) {
  const valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dados.valor || 0)
  const extenso = numeroPorExtenso(dados.valor || 0)

  // Tratamento da data
  let dataStr = ''
  if (dados.data_emissao) {
    const [ano, mes, dia] = dados.data_emissao.split('-')
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
    dataStr = `Jataí-GO, ${dia} de ${meses[parseInt(mes) - 1]} de ${ano}`
  } else {
    // Fallback pra data atual se não informada
    const hoje = new Date()
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
    dataStr = `Jataí-GO, ${hoje.getDate()} de ${meses[hoje.getMonth()]} de ${hoje.getFullYear()}`
  }

  const c = config || {
    titulo: 'SINDICATO NACIONAL DOS SERVIDORES FEDERAIS DA EDUCAÇÃO BÁSICA, PROFISSIONAL E TECNOLÓGICA',
    secao_sindical: 'SINASEFE - SEÇÃO SINDICAL JATAÍ',
    endereco: 'RUA RIACHUELO, 2090 – SETOR SAMUEL GRAHAM – JATAÍ/GO',
    cep: 'CEP: 75804-020',
    cnpj: 'CNPJ: 07.341.258/0001-90',
  }

  return (
    <div id="recibo-print-area" className={`relative bg-white text-black p-8 sm:p-12 min-h-[29.7cm] w-full max-w-[21cm] mx-auto shadow-2xl print:shadow-none print:m-0 print:p-0 print:w-auto print:max-w-none print:min-h-0 font-serif flex flex-col overflow-hidden ${status === 'cancelado' ? 'grayscale opacity-75' : ''}`}>

      {/* Marca d'água de Cancelado */}
      {status === 'cancelado' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <div className="text-red-600/10 font-black text-[150px] tracking-widest rotate-[-45deg] select-none uppercase whitespace-nowrap">
            CANCELADO
          </div>
        </div>
      )}

      {/* Conteúdo principal - Precisa de z-10 para ficar em cima da marca d'água */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Cabeçalho */}
        <DocumentHeader config={config} />

        {/* Título */}
        {/* <h1 className="font-bold text-lg mb-8">
          Recibo de pagamento em dinheiro
        </h1> */}

        <div className="flex flex-col items-center mb-12">
          <h2 className="text-xl font-bold tracking-[0.2em] uppercase mb-2">
            Recibo
          </h2>
          {numero && (
            <p className="text-sm font-semibold text-zinc-600">
              Nº {numero}
            </p>
          )}
        </div>

        <div className="text-right text-lg mb-12">
          Valor: <span className="font-bold">{valorFormatado}</span>
        </div>

        {/* Corpo do Texto */}
        <div className="text-justify text-base leading-relaxed mb-16">
          Recebi do <strong>{c.titulo}</strong> (<strong>{c.secao_sindical}</strong>),
          {c.cnpj ? ` ${c.cnpj},` : ''} localizado na {c.endereco}, {c.cep},
          o valor de {valorFormatado} (<strong>{extenso}</strong>),
          referente a: <u>{dados.referente_a || '_____________________________________'}</u>.
        </div>

        {/* Data */}
        <div className="text-right text-base mb-24">
          {dataStr}
        </div>

        {/* Assinatura */}
        <div className="flex flex-col items-center justify-center max-w-sm mx-auto mb-16 print:mb-0">
          <div className="w-full border-t border-black mb-1"></div>
          <p className="text-base text-center w-full truncate">{dados.recebedor_nome || '_________________________'}</p>
          <p className="text-base text-center w-full truncate">{dados.recebedor_cpf || '___.___.___-__'}</p>
        </div>

        <div className="flex-1 print:hidden"></div>

        {/* Footer de Assinatura Eletrônica (Sempre empurrado para baixo caso haja espaço, mas evita quebrar) */}
        {verificacao && verificacao.assinaturas.length > 0 && (
          <div className="mt-8">
            <DocumentSignatureFooter verificacao={verificacao} />
          </div>
        )}
      </div>

    </div>
  )
}
