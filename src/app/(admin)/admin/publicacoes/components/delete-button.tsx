'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { useModal } from '@/providers/modal-provider'

import { deletePublicacao } from '../actions'

interface DeletePublicacaoButtonProps {
  id: string
  titulo: string
}

export default function DeletePublicacaoButton({ id, titulo }: DeletePublicacaoButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { confirm, alert } = useModal()

  const handleDelete = async () => {
    const isConfirmed = await confirm(`Tem certeza que deseja excluir o documento público "${titulo}"? Esta ação removerá o arquivo definitivamente.`)
    if (!isConfirmed) return

    try {
      setIsDeleting(true)
      const result = await deletePublicacao(id)

      if (result.success) {
        toast.success('Publicação excluída com sucesso.')
      } else {
        await alert(result.error || 'Ocorreu um erro desconhecido ao excluir.')
      }
    } catch (error) {
      console.error(error)
      await alert('Ocorreu um erro ao processar a solicitação.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 rounded transition-colors disabled:opacity-50"
      title="Excluir Publicação"
    >
      <Trash2 size={16} />
    </button>
  )
}
