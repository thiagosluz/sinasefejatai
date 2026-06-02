'use client'

import React, { useCallback,useState, useTransition } from 'react'
import { Edit2, Save, Trash2, X } from 'lucide-react'

import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'
import { useModal } from '@/providers/modal-provider'

import { addLocal, deleteLocal,updateLocal } from './actions'
import { Local } from './types'

export default function LocaisCliente({ locais }: { locais: Local[] }) {
  const { confirm } = useModal()
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // States para o formulário
  const [nomeCurto, setNomeCurto] = useState('')
  const [textoCompleto, setTextoCompleto] = useState('')

  const handleEdit = useCallback((local: Local) => {
    setEditingId(local.id)
    setNomeCurto(local.nome_curto)
    setTextoCompleto(local.texto_completo)
  }, [])

  const handleCancel = useCallback(() => {
    setEditingId(null)
    setNomeCurto('')
    setTextoCompleto('')
  }, [])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const formData = new FormData()
      formData.append('nome_curto', nomeCurto)
      formData.append('texto_completo', textoCompleto)

      if (editingId) {
        await updateLocal(editingId, formData)
      } else {
        await addLocal(formData)
      }

      setEditingId(null)
      setNomeCurto('')
      setTextoCompleto('')
    })
  }, [editingId, nomeCurto, textoCompleto])

  const handleDelete = useCallback(async (id: string) => {
    if (await confirm('Tem certeza que deseja excluir este local? As atas passadas não serão afetadas, mas ele não aparecerá mais para novos agendamentos.')) {
      startTransition(async () => {
        await deleteLocal(id)
      })
    }
  }, [confirm])

  return (
    <AdminPageWrapper>
      <AdminPageHeader titulo="Locais de Encontro" subtitulo="Gerencie os locais padronizados para as atas de assembleia" />

      <main className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Formulário - 4 Colunas */}
        <div className="xl:col-span-4 bg-brand-card border border-zinc-350 p-6 shadow-lg">
          <h2 className="text-base font-serif font-bold text-brand-ink border-b border-zinc-300 pb-3 mb-5">
            {editingId ? 'Editar Local' : 'Novo Local'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nome_curto" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Nome Curto (Menu de Escolha) *
              </label>
              <input
                id="nome_curto"
                type="text"
                value={nomeCurto}
                onChange={(e) => setNomeCurto(e.target.value)}
                required
                className="w-full bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-brand-tinto"
                placeholder="Ex: Miniauditório 1 (Flamboyant)"
              />
            </div>

            <div>
              <label htmlFor="texto_completo" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Texto Completo Jurídico (Para a Ata) *
              </label>
              <textarea
                id="texto_completo"
                value={textoCompleto}
                onChange={(e) => setTextoCompleto(e.target.value)}
                required
                rows={5}
                className="w-full bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-brand-tinto resize-none leading-relaxed"
                placeholder="Ex: no Miniauditório 1 da unidade Flamboyant do Campus Jataí..."
              />
            </div>

            <div className="pt-4 border-t border-zinc-300 flex gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold uppercase tracking-wider py-3 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <X size={15} />
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={isPending}
                className="flex-[2] bg-brand-tinto hover:bg-brand-tinto-light disabled:bg-zinc-300 text-white text-xs font-serif font-bold uppercase tracking-wider py-3 shadow-[2px_2px_0px_#121214] hover:shadow-[1px_1px_0px_#121214] hover:translate-x-[1px] hover:translate-y-[1px] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isPending ? 'Salvando...' : <><Save size={15} /> Salvar</>}
              </button>
            </div>
          </form>
        </div>

        {/* Listagem - 8 Colunas */}
        <div className="xl:col-span-8">
          <div className="bg-brand-card border border-zinc-350 shadow-md">
            <div className="p-4 border-b border-zinc-350 bg-zinc-50/50 flex justify-between items-center">
              <h2 className="text-sm font-serif font-bold text-brand-ink uppercase tracking-wide">Locais Cadastrados</h2>
              <span className="text-xs font-bold text-zinc-500 bg-zinc-200 px-2 py-0.5 rounded-full">{locais.length}</span>
            </div>

            <div className="divide-y divide-zinc-200">
              {locais.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-sm font-medium">
                  Nenhum local cadastrado ainda. Use o formulário ao lado para adicionar o primeiro.
                </div>
              ) : (
                locais.map((local) => (
                  <div key={local.id} className="p-4 hover:bg-brand-cream transition-colors flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div className="flex-1">
                      <h3 className="font-bold text-brand-ink text-sm flex items-center gap-2">
                        {local.nome_curto}
                      </h3>
                      <p className="text-xs text-zinc-600 mt-1 line-clamp-2 italic leading-relaxed">
                        &quot;{local.texto_completo}&quot;
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleEdit(local)}
                        className="p-2 text-zinc-600 hover:text-brand-ink hover:bg-zinc-200 rounded-sm transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(local.id)}
                        disabled={isPending}
                        className="p-2 text-zinc-600 hover:text-red-700 hover:bg-red-50 rounded-sm transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </AdminPageWrapper>
  )
}
