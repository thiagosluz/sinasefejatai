'use client'

import { useTransition } from 'react'
import { Loader2, Mail } from 'lucide-react'
import { toast } from 'sonner'

import { useModal } from '@/providers/modal-provider'

import { dispararEditalEmLote } from '../../actions'

interface EditalDisparoBtnProps {
  assembleiaId: string
}

export default function EditalDisparoBtn({ assembleiaId }: EditalDisparoBtnProps) {
  const [isPending, startTransition] = useTransition()
  const { confirm } = useModal()

  const handleDisparo = async () => {
    // Usamos o modal customizado para não usar window.confirm nativo
    const desejaContinuar = await confirm(
      'Atenção: Você está prestes a disparar este edital por E-MAIL para TODOS os filiados ativos do sistema.\n\nTem certeza que deseja continuar?'
    )

    if (!desejaContinuar) return

    startTransition(async () => {
      const res = await dispararEditalEmLote(assembleiaId)
      
      if (res?.success) {
        toast.success(res.message || 'E-mails enviados com sucesso!')
      } else {
        toast.error(res?.error || 'Ocorreu um erro ao disparar os e-mails.')
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleDisparo}
      disabled={isPending}
      className="bg-brand-tinto hover:bg-brand-tinto-light text-white rounded-none px-4 py-2 font-bold uppercase tracking-wider transition-colors flex items-center gap-2 text-[10px] shadow-[1.5px_1.5px_0px_var(--brand-ink)] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
      <span>{isPending ? 'Enviando...' : 'Disparar para Filiados'}</span>
    </button>
  )
}
