'use client'

import { useState } from 'react'
import { ArrowLeft, Printer } from 'lucide-react'
import Link from 'next/link'

import { AssinaturasWidget } from '@/components/assinaturas-widget'
import DocumentHeader, { DocumentHeaderConfig } from '@/components/document-header'
import { DocumentSignatureFooter } from '@/components/layout/document-signature-footer'
import { DocumentoVerificacao } from '@/lib/actions-assinaturas'
import { formatarHora } from '@/lib/date-utils'

import AnexoUploadBtn from '../../anexo-upload-btn'

type Filiado = {
  nome: string
  siape: string | null
  cpf?: string | null
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
  config: DocumentHeaderConfig | null
  filiados: Filiado[]
  documentoExistente?: {
    id: string
    arquivo_url: string
    nome_arquivo: string
  } | null
  verificacaoInicial?: DocumentoVerificacao | null
  currentUserId?: string
}

export default function PresencaCliente({ assembleia, config, filiados, documentoExistente, verificacaoInicial, currentUserId }: PresencaClienteProps) {
  const [modo, setModo] = useState<'hibrida' | 'filiados' | 'branca'>('hibrida')
  const [identificador, setIdentificador] = useState<'siape' | 'cpf' | 'nenhum'>('siape')
  const [linhasExtras, setLinhasExtras] = useState(20)
  const [paisagem, setPaisagem] = useState(false)

  const dataRealizacao = new Date(assembleia.data_realizacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
  const linhasManuais = Array.from({ length: linhasExtras }, (_, i) => i + 1)

  return (
    <div className="min-h-screen bg-zinc-200 print:bg-white text-zinc-900 font-sans">
      {/* Botões de Ação e Controles (Escondidos na Impressão) */}
      <div className="print:hidden bg-brand-cream border-b border-brand-border p-4 sticky top-0 z-10 shadow-sm flex flex-wrap gap-4 justify-between items-center text-brand-ink">
        <div className="flex items-center gap-4">
          <Link href="/admin/assembleias" className="flex items-center gap-2 hover:text-brand-tinto transition-colors text-xs font-bold uppercase tracking-wider">
            <ArrowLeft size={16} />
            Voltar
          </Link>
          <span className="text-brand-border/50 hidden sm:inline">|</span>
          <span className="font-serif font-bold text-sm hidden sm:inline">Controles de Impressão</span>
        </div>

        {/* Painel de Controle */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-wider">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-brand-border shadow-[1px_1px_0px_var(--brand-ink)]">
            <label htmlFor="modo" className="text-brand-ink/70">Modo:</label>
            <select
              id="modo"
              value={modo}
              onChange={(e) => setModo(e.target.value as 'hibrida' | 'filiados' | 'branca')}
              className="bg-transparent text-brand-ink border-none outline-none focus:ring-0 cursor-pointer"
            >
              <option value="hibrida">Híbrida</option>
              <option value="filiados">Apenas Filiados</option>
              <option value="branca">Branca</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-brand-border shadow-[1px_1px_0px_var(--brand-ink)]">
            <label htmlFor="identificador" className="text-brand-ink/70">Identificador:</label>
            <select
              id="identificador"
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value as 'siape' | 'cpf' | 'nenhum')}
              className="bg-transparent text-brand-ink border-none outline-none focus:ring-0 cursor-pointer"
            >
              <option value="siape">SIAPE</option>
              <option value="cpf">CPF</option>
              <option value="nenhum">Nenhum (Ocultar)</option>
            </select>
          </div>

          {(modo === 'hibrida' || modo === 'branca') && (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-brand-border shadow-[1px_1px_0px_var(--brand-ink)]">
              <label htmlFor="linhas" className="text-brand-ink/70">Linhas:</label>
              <input
                id="linhas"
                type="number"
                min="0"
                max="200"
                value={linhasExtras}
                onChange={(e) => setLinhasExtras(Number(e.target.value) || 0)}
                className="bg-transparent text-brand-ink border-none outline-none w-12 focus:ring-0 p-0"
              />
            </div>
          )}

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-brand-border shadow-[1px_1px_0px_var(--brand-ink)] cursor-pointer">
            <input
              id="paisagem"
              type="checkbox"
              checked={paisagem}
              onChange={(e) => setPaisagem(e.target.checked)}
              className="accent-brand-tinto w-4 h-4 cursor-pointer"
            />
            <label htmlFor="paisagem" className="cursor-pointer">Modo Paisagem</label>
          </div>

          <AnexoUploadBtn assembleiaId={assembleia.id} tipo="presenca" documentoExistente={documentoExistente} label="ANEXAR PDF ASSINADO" />

          <AssinaturasWidget
            tipoDocumento="presenca"
            documentoId={assembleia.id}
            verificacaoInicial={verificacaoInicial}
            currentUserId={currentUserId}
            variant="toolbar"
          />

          <button
            type="button"
            onClick={() => window.print()}
            className="bg-brand-ink hover:bg-brand-ink/90 text-white rounded-none px-4 py-2 font-bold uppercase tracking-wider transition-colors flex items-center gap-2 text-[10px] shadow-[1.5px_1.5px_0px_var(--brand-tinto)] ml-auto"
          >
            <Printer size={16} />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Estilos para impressão de Paisagem */}
      {paisagem && (
        <style dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page { size: A4 landscape; }
          }
        `}} />
      )}

      {/* Papel (A4 Simulação) */}
      <div className={`mx-auto bg-white print:w-full print:max-w-none print:shadow-none shadow-2xl p-[20mm] print:p-0 ${paisagem ? 'max-w-[297mm] min-h-[210mm]' : 'max-w-[210mm] min-h-[297mm]'}`}>
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
            <strong>Local:</strong> {assembleia.local}
          </p>
          <p>
            <strong>1ª Convocação:</strong> {formatarHora(assembleia.horario_1a_convocacao)} &nbsp;|&nbsp;
            <strong>2ª Convocação:</strong> {formatarHora(assembleia.horario_2a_convocacao)}
          </p>
        </div>

        {/* Renderiza a tabela de Filiados se o modo permitir */}
        {(modo === 'hibrida' || modo === 'filiados') && (
          <table className="w-full text-sm border-collapse mb-8 border border-zinc-400">
            <thead>
              <tr className="bg-zinc-100 print:bg-zinc-100">
                <th className="border border-zinc-400 p-2 text-center w-10">Nº</th>
                <th className="border border-zinc-400 p-2 text-left">Nome do Filiado</th>
                {identificador !== 'nenhum' && (
                  <th className="border border-zinc-400 p-2 text-left w-24">
                    {identificador === 'cpf' ? 'CPF' : 'SIAPE'}
                  </th>
                )}
                <th className="border border-zinc-400 p-2 text-center w-48">Assinatura</th>
              </tr>
            </thead>
            <tbody>
              {filiados.length > 0 ? (
                filiados.map((filiado, index) => (
                  <tr key={index} className="break-inside-avoid">
                    <td className="border border-zinc-400 p-2 text-center text-zinc-600">{index + 1}</td>
                    <td className="border border-zinc-400 p-2 font-medium">{filiado.nome}</td>
                    {identificador !== 'nenhum' && (
                      <td className="border border-zinc-400 p-2 text-zinc-700">
                        {identificador === 'cpf' ? (filiado.cpf || '') : (filiado.siape || '')}
                      </td>
                    )}
                    <td className="border border-zinc-400 p-6"></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={identificador === 'nenhum' ? 3 : 4} className="border border-zinc-400 p-4 text-center text-zinc-500 italic">
                    Nenhum filiado ativo cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="print:table-footer-group">
              <tr>
                <td colSpan={identificador === 'nenhum' ? 3 : 4} className="pt-6 pb-2 text-center text-xs text-zinc-600 font-medium border-none bg-white">
                  Documento integrante da Assembleia {assembleia.tipo} - Ref. Edital Nº {assembleia.numero} &nbsp;|&nbsp; Rubrica da Mesa Diretora:
                </td>
              </tr>
            </tfoot>
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
                  {identificador !== 'nenhum' && (
                    <th className="border border-zinc-400 p-2 text-left w-24">
                      {identificador === 'cpf' ? 'CPF' : 'SIAPE / RG'}
                    </th>
                  )}
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
                    {identificador !== 'nenhum' && (
                      <td className="border border-zinc-400 p-6"></td>
                    )}
                    <td className="border border-zinc-400 p-6"></td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="print:table-footer-group">
                <tr>
                  <td colSpan={identificador === 'nenhum' ? 3 : 4} className="pt-6 pb-2 text-center text-xs text-zinc-600 font-medium border-none bg-white">
                    Documento integrante da Assembleia {assembleia.tipo} - Ref. Edital Nº {assembleia.numero} &nbsp;|&nbsp; Rubrica da Mesa Diretora:
                  </td>
                </tr>
              </tfoot>
            </table>
          </>
        )}

        {/* Footer de Assinatura Eletrônica na impressão */}
        <div className="mt-16 print:block hidden">
          <DocumentSignatureFooter verificacao={verificacaoInicial || null} />
        </div>
      </div>
    </div>
  )
}
