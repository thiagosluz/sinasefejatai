'use client'

import { useCallback, useState } from 'react'
import { Check, Star, Trash2, Users } from 'lucide-react'
import Link from 'next/link'

import { useModal } from '@/providers/modal-provider'

import { definirGestaoAtual, deletarGestao } from './actions'
import { ConselhoFiscalGestao } from './types'

export default function ConselhoFiscalCliente({ gestoesIniciais }: { gestoesIniciais: ConselhoFiscalGestao[] }) {
  const { alert, confirm } = useModal()
  const [loading, setLoading] = useState(false)

  const handleExcluir = useCallback(async (id: string, is_atual: boolean) => {
    if (is_atual) {
      await alert('Você não pode excluir a gestão ativa publicamente. Defina outra gestão como ativa primeiro.')
      return
    }

    const isConfirmed = await confirm('Tem certeza que deseja excluir esta gestão e todos os seus membros? Esta ação não pode ser desfeita.')
    if (!isConfirmed) return

    try {
      setLoading(true)
      await deletarGestao(id)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir.'
      await alert(msg)
    } finally {
      setLoading(false)
    }
  }, [alert, confirm])

  const handleDefinirAtual = useCallback(async (id: string) => {
    const isConfirmed = await confirm('Tem certeza que deseja definir esta como a gestão ATUAL? Isso mudará a página pública imediatamente.')
    if (!isConfirmed) return

    try {
      setLoading(true)
      await definirGestaoAtual(id)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao alterar gestão atual.'
      await alert(msg)
    } finally {
      setLoading(false)
    }
  }, [confirm, alert])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-serif font-bold text-brand-ink uppercase tracking-wider">Gestões Cadastradas</h2>
          <p className="text-sm text-zinc-500">
            Apenas uma gestão pode estar ativa no portal público.
          </p>
        </div>
      </div>

      {gestoesIniciais.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-zinc-200 bg-zinc-50">
          <Users className="mx-auto h-12 w-12 text-zinc-300 mb-3" />
          <p className="text-sm text-zinc-500 font-medium">Nenhuma gestão cadastrada.</p>
          <p className="text-xs text-zinc-400 mt-1">Crie a primeira diretoria do conselho fiscal para começar.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {gestoesIniciais.map((gestao) => (
            <div 
              key={gestao.id} 
              className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border ${gestao.is_atual ? 'border-brand-tinto bg-brand-cream/30' : 'border-zinc-200 bg-white'} gap-4 transition-colors`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-brand-ink font-serif text-lg">{gestao.nome}</h3>
                  {gestao.is_atual && (
                    <span className="bg-brand-tinto text-white text-[10px] uppercase font-bold px-2 py-0.5 tracking-wider flex items-center gap-1">
                      <Star size={10} fill="currentColor" />
                      Atual
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Criada em {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(gestao.criado_em))}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <Link
                  href={`/admin/conselho-fiscal/${gestao.id}`}
                  className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-brand-ink text-brand-ink hover:bg-brand-cream transition-colors flex items-center gap-1.5 flex-1 sm:flex-none justify-center"
                >
                  <Users size={14} />
                  <span>Membros</span>
                </Link>
                
                {!gestao.is_atual && (
                  <button
                    onClick={() => handleDefinirAtual(gestao.id)}
                    disabled={loading}
                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-brand-olive text-brand-olive hover:bg-brand-olive/10 transition-colors flex items-center gap-1.5 flex-1 sm:flex-none justify-center"
                    title="Definir como gestão ativa"
                  >
                    <Check size={14} />
                    <span className="hidden sm:inline">Definir Atual</span>
                  </button>
                )}

                <button
                  onClick={() => handleExcluir(gestao.id, gestao.is_atual)}
                  disabled={loading || gestao.is_atual}
                  className="px-3 py-1.5 text-xs font-bold border border-brand-tinto text-brand-tinto hover:bg-brand-tinto/10 transition-colors flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Excluir Gestão"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
