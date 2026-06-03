'use client'

import { Image as ImageIcon, RotateCcw, Save, Trash2 } from 'lucide-react'

import DocumentHeader, { DocumentHeaderConfig } from '@/components/document-header'
import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'

import { useConfiguracoesForm } from './hooks/use-configuracoes-form'

interface ConfiguracoesClienteProps {
  initialConfig: DocumentHeaderConfig | null
}

export default function ConfiguracoesCliente({ initialConfig }: ConfiguracoesClienteProps) {
  const { isPending, fileInputRef, previewConfig, formData, actions } = useConfiguracoesForm(initialConfig)

  return (
    <AdminPageWrapper>
      <AdminPageHeader titulo="Configuração de Cabeçalhos" subtitulo="Ajuste os dados timbrados oficiais impressos nos documentos do sistema" />

      {/* Main Grid: Form à esquerda, Preview Interativo à direita */}
      <main className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Formulário de Edição - 5 Colunas */}
        <div className="xl:col-span-5 bg-brand-card border border-zinc-350 p-6 shadow-lg space-y-6">
          <div className="border-b border-zinc-300 pb-3 flex justify-between items-center">
            <h2 className="text-base font-serif font-bold text-brand-ink">Formulário Oficial</h2>
            <button
              type="button"
              onClick={actions.handleResetToDefault}
              className="text-xs font-serif font-bold text-brand-tinto hover:text-brand-tinto-light flex items-center gap-1 cursor-pointer transition-colors"
              title="Restaurar padrões oficiais da Seção Jataí"
            >
              <RotateCcw size={13} />
              <span>Restaurar Padrões</span>
            </button>
          </div>

          <form onSubmit={actions.handleSubmit} className="space-y-4">
            {/* Título Institucional */}
            <div>
              <label htmlFor="titulo" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Título Geral da Entidade (Linha 1)
              </label>
              <textarea
                id="titulo"
                value={formData.titulo}
                onChange={(e) => formData.setTitulo(e.target.value)}
                required
                rows={2}
                className="w-full bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-brand-tinto leading-normal font-sans"
                placeholder="Ex: SINDICATO NACIONAL DOS SERVIDORES FEDERAIS DA EDUCAÇÃO BÁSICA..."
              />
            </div>

            {/* Nome da Seção Sindical */}
            <div>
              <label htmlFor="secao_sindical" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Nome da Seção Sindical (Linha 2 - Destaque)
              </label>
              <input
                id="secao_sindical"
                type="text"
                value={formData.secaoSindical}
                onChange={(e) => formData.setSecaoSindical(e.target.value)}
                required
                className="w-full bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-brand-tinto font-sans"
                placeholder="Ex: SINASEFE - SEÇÃO SINDICAL JATAÍ"
              />
            </div>

            {/* Endereço */}
            <div>
              <label htmlFor="endereco" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Endereço Físico da Seção (Rodapé de Linha)
              </label>
              <input
                id="endereco"
                type="text"
                value={formData.endereco}
                onChange={(e) => formData.setEndereco(e.target.value)}
                required
                className="w-full bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-brand-tinto font-sans"
                placeholder="Ex: RUA RIACHUELO, 2090 – SETOR SAMUEL GRAHAM – JATAÍ/GO"
              />
            </div>

            {/* CEP e CNPJ */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="cep" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  CEP Oficial
                </label>
                <input
                  id="cep"
                  type="text"
                  value={formData.cep}
                  onChange={(e) => formData.setCep(e.target.value)}
                  required
                  className="w-full bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-brand-tinto font-sans"
                  placeholder="Ex: CEP: 75804-020"
                />
              </div>

              <div>
                <label htmlFor="cnpj" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  CNPJ (Opcional)
                </label>
                <input
                  id="cnpj"
                  type="text"
                  value={formData.cnpj || ''}
                  onChange={(e) => formData.setCnpj(e.target.value)}
                  className="w-full bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-brand-tinto font-sans"
                  placeholder="Ex: CNPJ: 07.341.258/0001-90"
                />
              </div>
            </div>

            {/* Upload de Logotipo */}
            <div className="bg-brand-cream border border-dashed border-zinc-350 p-4 flex flex-col gap-3">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider select-none">
                Logotipo da Entidade (Imagem)
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-brand-card hover:bg-brand-cream border border-brand-ink text-brand-ink px-3 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_#121214] hover:shadow-none hover:translate-x-[0.5px] hover:translate-y-[0.5px] cursor-pointer"
                >
                  <ImageIcon size={12} />
                  <span>Selecionar Imagem</span>
                </button>
                <input
                  ref={fileInputRef}
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={actions.handleLogoChange}
                  className="hidden"
                />

                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={actions.handleRemoveLogo}
                    className="border border-red-800 text-brand-tinto hover:bg-red-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_#991b1b] hover:shadow-none hover:translate-x-[0.5px] hover:translate-y-[0.5px] cursor-pointer"
                  >
                    <Trash2 size={12} />
                    <span>Remover</span>
                  </button>
                )}
              </div>
              <p className="text-[9px] text-zinc-500 uppercase tracking-wider mt-1 select-none">Formatos recomendados: PNG ou SVG transparentes (Máx. 2MB)</p>
            </div>

            {/* Linha Divisória - Rodapé */}
            <div className="grid grid-cols-2 gap-4 border-t border-zinc-200 pt-4">
              {/* Filiação */}
              <div>
                <label htmlFor="filiacao" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Filiação Sindical (Esquerda)
                </label>
                <input
                  id="filiacao"
                  type="text"
                  value={formData.filiacao}
                  onChange={(e) => formData.setFiliacao(e.target.value)}
                  required
                  className="w-full bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-brand-tinto font-sans"
                  placeholder="Ex: FILIADO À CEA"
                />
              </div>

              {/* Fundação */}
              <div>
                <label htmlFor="fundacao" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Histórico / Fundação (Direita)
                </label>
                <input
                  id="fundacao"
                  type="text"
                  value={formData.fundacao}
                  onChange={(e) => formData.setFundacao(e.target.value)}
                  required
                  className="w-full bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-brand-tinto font-sans"
                  placeholder="Ex: FUNDADO EM 16/05/2005"
                />
              </div>
            </div>

            {/* Botão de Submissão */}
            <div className="pt-4 border-t border-zinc-300">
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-brand-tinto hover:bg-brand-tinto-light disabled:bg-zinc-300 text-white text-xs font-serif font-bold uppercase tracking-wider py-4 transition-all shadow-[3px_3px_0px_#121214] hover:shadow-[1.5px_1.5px_0px_#121214] hover:translate-x-[1.5px] hover:translate-y-[1.5px] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save size={15} />
                <span>{isPending ? 'Salvando Configurações...' : 'Salvar Alterações'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Prévia Reativa do Cabeçalho - 7 Colunas */}
        <div className="xl:col-span-7 space-y-4">
          <div className="bg-brand-card border border-zinc-350 p-4 flex justify-between items-center shadow-md">
            <div>
              <h2 className="text-sm font-serif font-bold text-brand-ink uppercase tracking-wide">Visualização Reativa Instantânea</h2>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">Assim ficará o cabeçalho timbrado impresso nos relatórios e documentos</p>
            </div>
            <div className="bg-brand-cream px-3 py-1 border border-zinc-300 text-[9px] font-bold text-zinc-650 uppercase tracking-widest select-none">
              A4 Real-Time Preview
            </div>
          </div>

          {/* Simulador de Papel Oficial */}
          <div className="bg-white border border-zinc-400 p-8 shadow-2xl min-h-[360px] flex flex-col justify-start relative select-none">
            {/* Componente de Prévia com os Estados do Formulário */}
            <DocumentHeader config={previewConfig} />

            {/* Corpo Simulado do Documento para Dar Contexto ao Usuário */}
            <div className="mt-8 border-2 border-dashed border-zinc-200 rounded p-6 flex flex-col gap-3 flex-1 select-none">
              <div className="h-4 bg-zinc-100 rounded w-1/3 mx-auto mb-4" />
              <div className="space-y-2">
                <div className="h-2 bg-zinc-100 rounded w-full" />
                <div className="h-2 bg-zinc-100 rounded w-5/6" />
                <div className="h-2 bg-zinc-100 rounded w-11/12" />
                <div className="h-2 bg-zinc-100 rounded w-4/5" />
              </div>
              <div className="h-32 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-zinc-400 border border-dashed border-zinc-200 mt-6 bg-zinc-50/50">
                Corpo Oficial do Relatório
              </div>
            </div>
          </div>
        </div>
      </main>
    </AdminPageWrapper>
  )
}
