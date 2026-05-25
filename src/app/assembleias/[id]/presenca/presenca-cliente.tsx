'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Printer, ArrowLeft } from 'lucide-react'
import DocumentHeader from '@/components/document-header'

type Filiado = {
  nome: string
  siape: string | null
}

type Assembleia = {
  id: string
  tipo: string
  numero: string
  local: string
  data_realizacao: string
  horario_1a_convocacao: string
  horario_2a_convocacao: string
}

type PresencaClienteProps = {
  assembleia: Assembleia
  config: any
  filiados: Filiado[]
}

export default function PresencaCliente({ assembleia, config, filiados }: PresencaClienteProps) {
  const [modo, setModo] = useState<'hibrida' | 'filiados' | 'branca'>('hibrida')
  const [linhasExtras, setLinhasExtras] = useState(20)
  const [paisagem, setPaisagem] = useState(false)

  const dataRealizacao = new Date(assembleia.data_realizacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
  const linhasManuais = Array.from({ length: linhasExtras }, (_, i) => i + 1)

  return (
    <div className="min-h-screen bg-zinc-200 print:bg-white text-zinc-900 font-sans">
      {/* Botões de Ação e Controles (Escondidos na Impressão) */}
      <div className="print:hidden bg-zinc-950 p-4 sticky top-0 z-10 shadow-md flex flex-wrap gap-4 justify-between items-center text-zinc-100">
        <div className="flex items-center gap-4">
          <Link href="/assembleias" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
            <ArrowLeft size={18} />
            Voltar
          </Link>
          <span className="text-zinc-600 hidden sm:inline">|</span>
          <span className="font-medium hidden sm:inline">Controles de Impressão</span>
        </div>
        
        {/* Painel de Controle */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
            <label htmlFor="modo" className="text-zinc-400 font-medium">Modo da Lista:</label>
            <select 
              id="modo"
              value={modo}
              onChange={(e) => setModo(e.target.value as any)}
              className="bg-zinc-800 text-zinc-100 border-none rounded outline-none py-1 px-2 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="hibrida">Híbrida (Filiados + Brancas)</option>
              <option value="filiados">Apenas Filiados</option>
              <option value="branca">Totalmente em Branco</option>
            </select>
          </div>

          {(modo === 'hibrida' || modo === 'branca') && (
            <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
              <label htmlFor="linhas" className="text-zinc-400 font-medium">Linhas Extras:</label>
              <input 
                id="linhas"
                type="number"
                min="0"
                max="200"
                value={linhasExtras}
                onChange={(e) => setLinhasExtras(Number(e.target.value) || 0)}
                className="bg-zinc-800 text-zinc-100 border-none rounded outline-none py-1 px-2 w-16 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}

          <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
            <input 
              id="paisagem"
              type="checkbox"
              checked={paisagem}
              onChange={(e) => setPaisagem(e.target.checked)}
              className="accent-emerald-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="paisagem" className="text-zinc-300 font-medium cursor-pointer">Modo Paisagem</label>
          </div>

          <button 
            type="button"
            onClick={() => window.print()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-4 py-2 font-medium transition-colors flex items-center gap-2 ml-auto"
          >
            <Printer size={18} />
            <span>Imprimir Lista</span>
          </button>
        </div>
      </div>

      {/* Estilos para impressão de Paisagem */}
      {paisagem && (
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page { size: A4 landscape; }
          }
        `}} />
      )}

      {/* Papel (A4 Simulação) */}
      <div className={`mx-auto bg-white print:w-full print:max-w-none print:shadow-none shadow-2xl p-[20mm] ${paisagem ? 'max-w-[297mm] min-h-[210mm]' : 'max-w-[210mm] min-h-[297mm]'}`}>
        {/* Cabeçalho Timbrado Dinâmico */}
        <DocumentHeader config={config} />

        {/* Título do Documento */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold uppercase underline mb-2">Lista de Presença</h2>
          <h3 className="text-lg font-semibold text-zinc-800 uppercase">
            Assembleia {assembleia.tipo}
          </h3>
          <p className="text-md font-medium text-zinc-700 mt-1 uppercase">
            Ref. Edital Nº {assembleia.numero}
          </p>
          <p className="text-sm text-zinc-600 mt-2">
            <strong>Data:</strong> {dataRealizacao} &nbsp;|&nbsp; 
            <strong>Local:</strong> {assembleia.local} &nbsp;|&nbsp;
            <strong>1ª Convocação:</strong> {assembleia.horario_1a_convocacao.slice(0, 5)} &nbsp;|&nbsp;
            <strong>2ª Convocação:</strong> {assembleia.horario_2a_convocacao.slice(0, 5)}
          </p>
        </div>

        {/* Renderiza a tabela de Filiados se o modo permitir */}
        {(modo === 'hibrida' || modo === 'filiados') && (
          <table className="w-full text-sm border-collapse mb-8 border border-zinc-400">
            <thead>
              <tr className="bg-zinc-100 print:bg-zinc-100">
                <th className="border border-zinc-400 p-2 text-center w-10">Nº</th>
                <th className="border border-zinc-400 p-2 text-left">Nome do Filiado</th>
                <th className="border border-zinc-400 p-2 text-left w-24">SIAPE</th>
                <th className="border border-zinc-400 p-2 text-center w-48">Assinatura</th>
              </tr>
            </thead>
            <tbody>
              {filiados.length > 0 ? (
                filiados.map((filiado, index) => (
                  <tr key={index} className="break-inside-avoid">
                    <td className="border border-zinc-400 p-2 text-center text-zinc-600">{index + 1}</td>
                    <td className="border border-zinc-400 p-2 font-medium">{filiado.nome}</td>
                    <td className="border border-zinc-400 p-2 text-zinc-700">{filiado.siape || ''}</td>
                    <td className="border border-zinc-400 p-6"></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="border border-zinc-400 p-4 text-center text-zinc-500 italic">
                    Nenhum filiado ativo cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Renderiza as Linhas Manuais se o modo permitir */}
        {(modo === 'hibrida' || modo === 'branca') && linhasManuais.length > 0 && (
          <>
            {modo === 'hibrida' && (
              <h3 className="text-base font-bold uppercase mb-4 mt-12 break-before-page">Inclusões Manuais / Visitantes</h3>
            )}
            <table className="w-full text-sm border-collapse border border-zinc-400">
              <thead>
                <tr className="bg-zinc-100 print:bg-zinc-100">
                  {modo === 'branca' && (
                    <th className="border border-zinc-400 p-2 text-center w-10">Nº</th>
                  )}
                  <th className="border border-zinc-400 p-2 text-left">Nome</th>
                  <th className="border border-zinc-400 p-2 text-left w-24">SIAPE / RG</th>
                  <th className="border border-zinc-400 p-2 text-center w-48">Assinatura</th>
                </tr>
              </thead>
              <tbody>
                {linhasManuais.map((linha, index) => (
                  <tr key={`manual-${linha}`} className="break-inside-avoid">
                    {modo === 'branca' && (
                      <td className="border border-zinc-400 p-2 text-center text-zinc-600">{index + 1}</td>
                    )}
                    <td className="border border-zinc-400 p-6"></td>
                    <td className="border border-zinc-400 p-6"></td>
                    <td className="border border-zinc-400 p-6"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  )
}
