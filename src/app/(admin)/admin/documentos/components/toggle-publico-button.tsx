'use client'

import { useState } from 'react'
import { Globe, GlobeLock } from 'lucide-react'
import { toast } from 'sonner'

import { useModal } from '@/providers/modal-provider'

import { toggleDocumentoPublico } from '../actions'

interface TogglePublicoButtonProps {
  id: string
  isPublico: boolean
}

export function TogglePublicoButton({ id, isPublico }: TogglePublicoButtonProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const { confirm, alert } = useModal()

  const handleToggle = async () => {
    const acao = isPublico ? 'ocultar' : 'tornar pública'
    const isConfirmed = await confirm(`Deseja ${acao} esta resolução no portal da transparência?`)
    if (!isConfirmed) return

    try {
      setIsUpdating(true)
      await toggleDocumentoPublico(id, !isPublico)
      toast.success(isPublico ? 'Resolução removida do portal público.' : 'Resolução publicada no portal público.')
    } catch (error) {
      console.error(error)
      await alert('Ocorreu um erro ao atualizar a visibilidade.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isUpdating}
      className={`px-3 py-1.5 transition-colors text-[10px] font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px] flex items-center gap-1 border border-brand-ink ${
        isPublico 
          ? 'bg-blue-50 hover:bg-blue-100 text-blue-700' 
          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
      }`}
      title={isPublico ? 'Ocultar do Público' : 'Tornar Público'}
    >
      {isPublico ? <Globe size={14} /> : <GlobeLock size={14} />}
      {isPublico ? 'Público' : 'Privado'}
    </button>
  )
}
