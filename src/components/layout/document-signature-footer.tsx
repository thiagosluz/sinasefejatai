'use client'

import React, { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'

import { DocumentoVerificacao } from '@/lib/actions-assinaturas'

interface DocumentSignatureFooterProps {
  verificacao: DocumentoVerificacao | null
}

export function DocumentSignatureFooter({ verificacao }: DocumentSignatureFooterProps) {
  const [baseUrl, setBaseUrl] = useState('http://localhost:3000')

  useEffect(() => {
    // Pega a URL dinamicamente do browser
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBaseUrl(window.location.origin)
  }, [])

  if (!verificacao || verificacao.assinaturas.length === 0) {
    return null // Não renderiza nada se não houver lacre ou assinaturas
  }

  const authUrl = `${baseUrl}/autenticar-documento`

  const formatData = (iso: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(new Date(iso))
  }

  return (
    <div 
      className="mt-auto w-full border border-zinc-300 rounded-lg p-5 text-zinc-800 text-xs bg-white font-sans page-break-inside-avoid shadow-sm print:shadow-none"
      style={{ breakInside: 'avoid' }}
    >
      <div className="mb-4">
        <p className="font-bold mb-2">Documento assinado eletronicamente por:</p>
        <ul className="list-square pl-5 space-y-1">
          {verificacao.assinaturas.map(ass => (
            <li key={ass.id}>
              <strong>{ass.nome_assinante}</strong>, {ass.cargo_assinante}, em {formatData(ass.data_assinatura)}.
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-zinc-200 pt-4 flex gap-6 items-center justify-between">
        <div className="flex-1">
          <p className="mb-4 text-justify leading-relaxed">
            Este documento foi emitido pelo sistema integrado do SINASEFE JATAÍ. Para comprovar sua autenticidade, faça a leitura do QRCode ao lado ou acesse <a href={authUrl} className="text-blue-600 underline">{authUrl}</a> e forneça os dados abaixo:
          </p>
          <div className="flex flex-col gap-1">
            <p><strong>Código Verificador:</strong> {verificacao.codigo_verificador}</p>
            <p><strong>Código de Autenticação:</strong> {verificacao.codigo_autenticacao}</p>
          </div>
        </div>
        
        <div className="flex-shrink-0 bg-white p-2 border border-zinc-200 rounded">
          <QRCode 
            value={`${authUrl}?cv=${verificacao.codigo_verificador}&ca=${verificacao.codigo_autenticacao}`} 
            size={100}
            level="M"
          />
        </div>
      </div>
    </div>
  )
}
