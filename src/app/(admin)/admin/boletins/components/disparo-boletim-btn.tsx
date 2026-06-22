'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { toast } from 'sonner'

import { useModal } from '@/providers/modal-provider'

import { dispararBoletimEmLote } from '../actions'

interface DisparoBoletimBtnProps {
  id: string
  titulo: string
}

export default function DisparoBoletimBtn({ id, titulo }: DisparoBoletimBtnProps) {
  const { confirm } = useModal()
  const [isSending, setIsSending] = useState(false)

  const handleDisparo = async () => {
    const isConfirmed = await confirm(`Tem certeza que deseja enviar o boletim "${titulo}" para TODOS os filiados ativos da base? Esta ação não pode ser desfeita.`)
    
    if (!isConfirmed) return

    try {
      setIsSending(true)
      const res = await dispararBoletimEmLote(id)
      
      if (res.success) {
        toast.success(res.message || `Processamento iniciado para ${res.data?.enviados || 0} filiados.`, {
          description: 'O envio está sendo processado em background.'
        })
      } else {
        toast.error(res.error || 'Falha ao iniciar o disparo.')
      }
    } catch (err) {
      toast.error('Ocorreu um erro inesperado ao disparar e-mails.')
      console.error(err)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <button
      onClick={handleDisparo}
      disabled={isSending}
      title="Disparar por E-mail"
      className="p-1.5 text-brand-ink/40 hover:text-brand-tinto hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Send size={16} />
    </button>
  )
}
