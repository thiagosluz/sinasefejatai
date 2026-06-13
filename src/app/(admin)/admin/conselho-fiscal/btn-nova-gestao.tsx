'use client'

import { useState } from 'react'
import { PlusCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { useModal } from '@/providers/modal-provider'

import { criarGestao } from './actions'

export function BtnNovaGestao() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { prompt, alert } = useModal()

  const handleCriar = async () => {
    const nome = await prompt('Nova Gestão do Conselho Fiscal', 'Digite o nome da nova gestão (ex: Biênio 2024-2026):')
    if (!nome) return

    try {
      setLoading(true)
      const res = await criarGestao(nome)
      if (!res.success) {
        await alert(res.error || 'Erro ao criar gestão.')
      } else if (res.data) {
        router.push(`/admin/conselho-fiscal/${res.data}`)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar gestão.'
      await alert(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleCriar}
      disabled={loading}
      className="bg-brand-tinto hover:bg-brand-tinto-light text-white text-xs font-serif font-bold uppercase tracking-wider py-2.5 px-4 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center gap-2 cursor-pointer disabled:opacity-50"
    >
      <PlusCircle size={15} />
      <span>{loading ? 'Criando...' : 'Iniciar Nova Gestão'}</span>
    </button>
  )
}
