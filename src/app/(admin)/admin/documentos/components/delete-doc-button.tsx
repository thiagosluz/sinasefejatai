'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'

import { useModal } from '@/providers/modal-provider'

import { checkDocumentoAssinado, excluirDocumentoAdministrativo } from '../actions'

export function DeleteDocButton({ id }: { id: string }) {
  const { confirm, alert, prompt } = useModal()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const assinado = await checkDocumentoAssinado(id)

      if (assinado) {
        const word = await prompt(
          'Este documento já possui assinaturas eletrônicas. Legalmente, o ideal seria usar a opção de "Cancelar" ou "Revogar" para manter o histórico de auditoria. Tem certeza absoluta que deseja EXCLUIR DEFINITIVAMENTE este documento e suas assinaturas da base de dados? Digite "EXCLUIR" para confirmar.',
          'Digite EXCLUIR'
        )
        if (word !== 'EXCLUIR') {
          return // User cancelled or typed incorrectly
        }
      } else {
        const isConfirmed = await confirm('Tem certeza que deseja excluir este documento permanentemente?')
        if (!isConfirmed) return
      }

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
