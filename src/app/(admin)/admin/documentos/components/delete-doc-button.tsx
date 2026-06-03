'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'

import { useModal } from '@/providers/modal-provider'

import { excluirDocumentoAdministrativo } from '../actions'

export function DeleteDocButton({ id }: { id: string }) {
  const { confirm, alert } = useModal()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    const isConfirmed = await confirm('Tem certeza que deseja excluir este documento permanentemente?')
    if (!isConfirmed) return

    try {
      setIsDeleting(true)
      await excluirDocumentoAdministrativo(id)
    } catch (err) {
      console.error(err)
      await alert('Erro ao excluir documento.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="px-3 py-1.5 bg-brand-tinto hover:bg-brand-tinto-light border border-transparent text-white transition-colors text-[10px] font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px] disabled:opacity-50"
      title="Excluir Documento"
    >
      <Trash2 size={14} />
    </button>
  )
}
