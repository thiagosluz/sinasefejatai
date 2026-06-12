'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { useModal } from '@/providers/modal-provider'

import { criarGestao } from './actions'

export function BtnNovaGestao() {
  const [loading, setLoading] = useState(false)
  const { prompt, alert } = useModal()

  const handleCriar = async () => {
    const nome = await prompt('Nova Gestão do Conselho Fiscal', 'Digite o nome da nova gestão (ex: Biênio 2024-2026):', 'Criar Gestão')
    if (!nome) return

    try {
      setLoading(true)
      const res = await criarGestao(nome)
      if (!res.success) {
        await alert(res.error || 'Erro ao criar gestão.')
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
      className="btn-primary"
    >
      <Plus size={20} />
      <span>{loading ? 'Criando...' : 'Nova Gestão'}</span>
    </button>
  )
}
