'use client'

import { ArrowLeft, Check, FileSpreadsheet } from 'lucide-react'
import Link from 'next/link'

import { CategoriaFinanceira } from '../types'

import { ImportadorDropzone } from './components/importador-dropzone'
import { ImportadorTable } from './components/importador-table'
import { useImportador } from './hooks/use-importador'

interface ImportadorClienteProps {
  categorias: CategoriaFinanceira[]
}

export default function ImportadorCliente({ categorias }: ImportadorClienteProps) {
  const { state, actions } = useImportador(categorias)
  
  const { loading, transacoes, nomeArquivo, totalSelecionadas, totalValorSelecionadas } = state
  const { processarArquivo, handleToggleSelect, handleToggleAll, handleCategoryChange, handleImportSubmit, handleLimparExtrato } = actions

  return (
    <div className="space-y-6">
      {/* Botão Voltar */}
      <div className="print:hidden">
        <Link 
          href="/admin/financeiro" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-ink hover:text-brand-tinto transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar ao Livro Caixa
        </Link>
      </div>

      {transacoes.length === 0 ? (
        <ImportadorDropzone loading={loading} onFileSelected={processarArquivo} />
      ) : (
        <div className="space-y-6">
          {/* Informações Gerais do Arquivo */}
          <div className="bg-brand-card border border-brand-border p-4 shadow-md flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-brand-tinto/10 border border-brand-tinto/20 p-2.5 text-brand-tinto">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-brand-ink/50 uppercase tracking-wider">Arquivo Selecionado</p>
                <h4 className="text-sm font-bold text-brand-ink">{nomeArquivo}</h4>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
              <div>
                <span className="text-brand-ink/50 block text-[9px]">Lançamentos</span>
                <span>{transacoes.length} encontrados</span>
              </div>
              <div className="w-[1px] h-8 bg-brand-border"></div>
              <div>
                <span className="text-brand-ink/50 block text-[9px]">A Importar</span>
                <span className="text-brand-tinto">{totalSelecionadas} transações</span>
              </div>
              <div className="w-[1px] h-8 bg-brand-border"></div>
              <div>
                <span className="text-brand-ink/50 block text-[9px]">Resultado Líquido</span>
                <span className={totalValorSelecionadas >= 0 ? 'text-brand-olive' : 'text-brand-tinto'}>
                  R$ {totalValorSelecionadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <ImportadorTable
            transacoes={transacoes}
            categorias={categorias}
            onToggleAll={handleToggleAll}
            onToggleSelect={handleToggleSelect}
            onCategoryChange={handleCategoryChange}
          />

          {/* Botão e Ações de Finalização */}
          <div className="flex justify-between items-center bg-brand-card border border-brand-border p-4 shadow-md">
            <button
              onClick={handleLimparExtrato}
              className="border border-brand-tinto hover:bg-brand-cream text-brand-tinto py-2.5 px-4 text-xs font-serif font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-[1.5px_1.5px_0px_var(--brand-tinto)]"
            >
              Excluir Extrato Atual
            </button>

            <button
              onClick={handleImportSubmit}
              disabled={loading || totalSelecionadas === 0}
              className="bg-brand-tinto hover:bg-brand-tinto-light disabled:bg-zinc-300 text-white py-3 px-6 text-xs font-serif font-bold uppercase tracking-wider transition-all shadow-[2.5px_2.5px_0px_var(--brand-ink)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-[1.5px_1.5px_0px_var(--brand-ink)] disabled:shadow-none flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <Check size={16} />
                  <span>Importar {totalSelecionadas} Lançamentos</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
