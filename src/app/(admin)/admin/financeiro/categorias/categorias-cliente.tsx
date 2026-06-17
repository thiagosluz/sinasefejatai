'use client'

import { useState } from 'react'
import { ArrowLeft, Check, Edit, Plus, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

import { useModal } from '@/providers/modal-provider'

import { CategoriaFinanceira } from '../types'

import { addCategoria, toggleCategoriaAtivo, updateCategoria } from './actions'

interface CategoriasClienteProps {
  categorias: CategoriaFinanceira[]
}

export function CategoriasCliente({ categorias }: CategoriasClienteProps) {
  const { confirm } = useModal()
  
  const [aberto, setAberto] = useState(false)
  const [categoriaEmEdicao, setCategoriaEmEdicao] = useState<CategoriaFinanceira | null>(null)
  
  const [salvando, setSalvando] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'Saída' as 'Entrada' | 'Saída'
  })

  const openForm = (categoria?: CategoriaFinanceira) => {
    if (categoria) {
      setCategoriaEmEdicao(categoria)
      setFormData({
        nome: categoria.nome,
        tipo: categoria.tipo
      })
    } else {
      setCategoriaEmEdicao(null)
      setFormData({
        nome: '',
        tipo: 'Saída'
      })
    }
    setAberto(true)
  }

  const closeForm = () => {
    setAberto(false)
    setCategoriaEmEdicao(null)
  }

  const handleSubmit = async (data: FormData) => {
    setSalvando(true)
    const result = categoriaEmEdicao 
      ? await updateCategoria(categoriaEmEdicao.id, data)
      : await addCategoria(data)
    
    setSalvando(false)
    if (!result.success) {
      toast.error(result.error)
    } else {
      toast.success(categoriaEmEdicao ? 'Categoria atualizada!' : 'Categoria registrada!')
      closeForm()
    }
  }

  const handleToggleStatus = async (categoria: CategoriaFinanceira) => {
    const acao = categoria.ativo ? 'desativar' : 'ativar'
    if (await confirm(`Deseja realmente ${acao} a categoria "${categoria.nome}"?`)) {
      const result = await toggleCategoriaAtivo(categoria.id, !categoria.ativo)
      if (result.success) {
        toast.success(`Categoria ${categoria.ativo ? 'desativada' : 'ativada'} com sucesso!`)
        if (categoriaEmEdicao?.id === categoria.id) {
          setCategoriaEmEdicao({ ...categoriaEmEdicao, ativo: !categoria.ativo })
        }
      } else {
        toast.error(result.error)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between print:hidden">
        <Link 
          href="/admin/financeiro" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-ink hover:text-brand-tinto transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar ao Livro Caixa
        </Link>
        <button
          onClick={() => openForm()}
          className="bg-brand-tinto hover:bg-brand-tinto-light text-white py-2.5 px-6 text-xs font-serif font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[2px_2px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_var(--brand-ink)]"
        >
          <Plus size={16} />
          Nova Categoria
        </button>
      </div>

      <div className="bg-brand-card border border-brand-border shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
            <thead className="bg-brand-border/40 border-b border-brand-border text-brand-ink/70 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6 border-r border-brand-border">Nome da Categoria</th>
                <th className="py-4 px-6 border-r border-brand-border text-center w-32">Tipo</th>
                <th className="py-4 px-6 border-r border-brand-border text-center w-32">Status</th>
                <th className="py-4 px-6 text-center w-32">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border bg-white font-mono">
              {categorias.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-zinc-500 font-sans">
                    Nenhuma categoria encontrada.
                  </td>
                </tr>
              ) : (
                categorias.map((c) => (
                  <tr key={c.id} className="hover:bg-brand-cream/20 transition-all">
                    <td className="py-4 px-6 border-r border-brand-border font-medium">
                      {c.nome}
                    </td>
                    <td className="py-4 px-6 border-r border-brand-border text-center">
                      <span className={`inline-block px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider border rounded-none ${
                        c.tipo === 'Entrada' 
                          ? 'bg-brand-olive/10 border-brand-olive/20 text-brand-olive' 
                          : 'bg-brand-tinto/10 border-brand-tinto/20 text-brand-tinto'
                      }`}>
                        {c.tipo}
                      </span>
                    </td>
                    <td className="py-4 px-6 border-r border-brand-border text-center">
                      <span className={`inline-block px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider border rounded-none ${
                        c.ativo 
                          ? 'bg-brand-olive/10 border-brand-olive/20 text-brand-olive' 
                          : 'bg-zinc-100 border-zinc-200 text-zinc-500'
                      }`}>
                        {c.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openForm(c)}
                          className="p-1.5 text-brand-ink/60 hover:text-brand-tinto hover:bg-brand-tinto/10 transition-colors"
                          title="Editar Categoria"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(c)}
                          className={`p-1.5 transition-colors ${
                            c.ativo
                              ? 'text-brand-ink/60 hover:text-brand-tinto hover:bg-brand-tinto/10'
                              : 'text-brand-olive hover:text-brand-olive hover:bg-brand-olive/10'
                          }`}
                          title={c.ativo ? 'Desativar Categoria' : 'Ativar Categoria'}
                        >
                          {c.ativo ? <Trash2 size={16} /> : <Check size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {aberto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end print:hidden">
          <div className="flex-1" onClick={closeForm}></div>
          
          <div className="w-full max-w-md bg-brand-cream border-l-2 border-brand-ink p-6 flex flex-col justify-between shadow-2xl relative animate-slide-left overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b-2 border-brand-ink pb-4 mb-6">
                <h3 className="text-lg font-serif font-bold text-brand-tinto">
                  {categoriaEmEdicao ? 'Editar Categoria' : 'Nova Categoria'}
                </h3>
                <button 
                  onClick={closeForm}
                  className="p-1 hover:bg-brand-card text-brand-ink/50 hover:text-brand-ink transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form 
                action={handleSubmit} 
                className="space-y-4"
              >
                <div>
                  <label htmlFor="nome" className="block text-xs font-bold text-brand-ink/60 uppercase tracking-wider mb-2 font-serif">
                    Nome da Categoria
                  </label>
                  <input 
                    id="nome"
                    name="nome"
                    type="text" 
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Contribuição de Filiados"
                    required
                    className="w-full bg-brand-card border border-brand-border rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
                  />
                </div>

                <div>
                  <span className="block text-xs font-bold text-brand-ink/60 uppercase tracking-wider mb-2 font-serif">
                    Tipo de Fluxo Contábil
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tipo: 'Saída' })}
                      className={`py-3 text-center border font-bold text-xs tracking-wider uppercase transition-all cursor-pointer ${
                        formData.tipo === 'Saída'
                          ? 'border-brand-tinto bg-brand-tinto/10 text-brand-tinto shadow-inner'
                          : 'border-brand-border bg-brand-cream text-brand-ink/60 hover:text-brand-ink'
                      }`}
                    >
                      Saída (Despesa)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tipo: 'Entrada' })}
                      className={`py-3 text-center border font-bold text-xs tracking-wider uppercase transition-all cursor-pointer ${
                        formData.tipo === 'Entrada'
                          ? 'border-brand-olive bg-brand-olive/10 text-brand-olive shadow-inner'
                          : 'border-brand-border bg-brand-cream text-brand-ink/60 hover:text-brand-ink'
                      }`}
                    >
                      Entrada (Receita)
                    </button>
                  </div>
                  <input type="hidden" name="tipo" value={formData.tipo} />
                </div>

                {categoriaEmEdicao && (
                  <div>
                    <span className="block text-xs font-bold text-brand-ink/60 uppercase tracking-wider mb-2 font-serif mt-4">
                      Status da Categoria
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(categoriaEmEdicao)}
                        className={`py-3 text-center border font-bold text-xs tracking-wider uppercase transition-all cursor-pointer ${
                          categoriaEmEdicao.ativo
                            ? 'border-brand-olive bg-brand-olive/10 text-brand-olive shadow-inner'
                            : 'border-brand-border bg-brand-cream text-brand-ink/60 hover:text-brand-ink'
                        }`}
                      >
                        Ativo
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(categoriaEmEdicao)}
                        className={`py-3 text-center border font-bold text-xs tracking-wider uppercase transition-all cursor-pointer ${
                          !categoriaEmEdicao.ativo
                            ? 'border-zinc-400 bg-zinc-100 text-zinc-500 shadow-inner'
                            : 'border-brand-border bg-brand-cream text-brand-ink/60 hover:text-brand-ink'
                        }`}
                      >
                        Inativo
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-dashed border-brand-border flex gap-3 pb-6">
                  <button 
                    type="button" 
                    onClick={closeForm}
                    className="flex-1 border border-brand-ink hover:border-brand-ink bg-brand-cream text-brand-ink py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={salvando}
                    className="flex-1 bg-brand-tinto hover:bg-brand-tinto-light text-white py-3 text-xs font-serif font-bold uppercase tracking-wider transition-all shadow-[2px_2px_0px_var(--brand-ink)]"
                  >
                    {salvando ? 'Salvando...' : 'Confirmar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
