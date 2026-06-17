'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { useModal } from '@/providers/modal-provider'

import { excluirBoletim } from '../actions'

export default function DeleteBoletimButton({ id, titulo }: { id: string; titulo: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { confirm } = useModal()

  const handleDelete = async () => {
    const isConfirmed = await confirm(`Tem certeza que deseja excluir o boletim "${titulo}"? Esta ação não pode ser desfeita.`)
    
    if (isConfirmed) {
      setIsDeleting(true)
      try {
        const result = await excluirBoletim(id)
        if (result.success) {
            toast.success('Boletim excluído com sucesso!')
          } else {
            toast.error(result.error || 'Erro ao excluir o boletim.')
          }
        } catch (err) {
          console.error(err)
          toast.error('Ocorreu um erro inesperado.')
        } finally {
          setIsDeleting(false)
        }
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-1.5 text-brand-ink/40 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
      title="Excluir Boletim"
    >
      <Trash2 size={16} />
    </button>
  )
}
