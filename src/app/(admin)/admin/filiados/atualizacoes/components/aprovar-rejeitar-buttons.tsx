'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { toast } from 'sonner'

import { aprovarAtualizacao, rejeitarAtualizacao } from '../actions'

export function AprovarRejeitarButtons({ solicitacaoId }: { solicitacaoId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAprovar = async () => {
    if (confirm('Tem certeza que deseja aprovar as alterações? Os dados do filiado serão sobrescritos imediatamente.')) {
      setIsSubmitting(true)
      const res = await aprovarAtualizacao(solicitacaoId)
      setIsSubmitting(false)
      if (res?.success) {
        toast.success('Atualização aprovada com sucesso!')
      } else {
        toast.error(res?.error || 'Erro ao aprovar.')
      }
    }
  }

  const handleRejeitar = async () => {
    if (confirm('Tem certeza que deseja rejeitar essa atualização? O filiado terá que solicitar um novo link.')) {
      setIsSubmitting(true)
      const res = await rejeitarAtualizacao(solicitacaoId)
      setIsSubmitting(false)
      if (res?.success) {
        toast.success('Atualização rejeitada.')
      } else {
        toast.error(res?.error || 'Erro ao rejeitar.')
      }
    }
  }

  return (
    <>
      <button 
        onClick={handleAprovar}
        disabled={isSubmitting}
        title="Aprovar"
        className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
      >
        <Check size={18} />
      </button>
      <button 
        onClick={handleRejeitar}
        disabled={isSubmitting}
        title="Rejeitar"
        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
      >
        <X size={18} />
      </button>
    </>
  )
}
