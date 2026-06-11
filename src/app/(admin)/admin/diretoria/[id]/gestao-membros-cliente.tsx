'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { useModal } from '@/providers/modal-provider'

import { adicionarCargoExtra } from '../actions'

import MembroCard from './membro-card'

type Membro = {
  id: string
  nome: string | null
  cargo_nome: string
  is_cargo_fixo: boolean
  foto_url: string | null
}

type Gestao = {
  id: string
  nome: string
  is_atual: boolean
  membros: Membro[]
}

export default function GestaoMembrosCliente({ gestao, filiados }: { gestao: Gestao, filiados: {id: string, nome: string}[] }) {
  const { alert } = useModal()
  const [loading, setLoading] = useState(false)

  const cadeirasFixas = gestao.membros.filter(m => m.is_cargo_fixo)
  const cargosExtras = gestao.membros.filter(m => !m.is_cargo_fixo)

  const handleAddExtra = async () => {
    try {
      setLoading(true)
      await adicionarCargoExtra(gestao.id)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao adicionar cargo extra.'
      await alert(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-10">
      
      {/* Cadeiras Fixas (Estatutárias) */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-serif font-bold text-brand-ink uppercase tracking-wider flex items-center gap-2">
            Cadeiras Obrigatórias
          </h3>
          <p className="text-sm text-zinc-500">
            Os 6 cargos que garantem a paridade de gênero. Edite os nomes conforme a eleição (ex: &quot;Secretário&quot; ou &quot;Secretária&quot;).
          </p>
        </div>
        
        <div className="grid gap-4">
          {cadeirasFixas.map(membro => (
            <MembroCard key={membro.id} membro={membro} filiados={filiados} />
          ))}
        </div>
      </section>

      {/* Cargos Extras */}
      <section className="space-y-4 pt-6 border-t-2 border-dashed border-zinc-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-serif font-bold text-brand-ink uppercase tracking-wider flex items-center gap-2">
              Cargos Extras
            </h3>
            <p className="text-sm text-zinc-500">
              Diretorias de pasta (ex: Comunicação, Assuntos Jurídicos) que não compõem as 6 cadeiras obrigatórias.
            </p>
          </div>
          
          <button
            onClick={handleAddExtra}
            disabled={loading}
            className="bg-brand-ink text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-zinc-800 transition-colors shadow-[2px_2px_0px_var(--brand-tinto)]"
          >
            <Plus size={16} />
            <span>Adicionar Cargo Extra</span>
          </button>
        </div>

        {cargosExtras.length === 0 ? (
          <div className="text-center py-8 bg-zinc-50 border border-zinc-200">
            <p className="text-sm text-zinc-400 font-medium">Nenhum cargo extra adicionado a esta gestão.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {cargosExtras.map(membro => (
              <MembroCard key={membro.id} membro={membro} filiados={filiados} />
            ))}
          </div>
        )}
      </section>
      
    </div>
  )
}
