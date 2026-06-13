'use client'

import { useState } from 'react'
import { Ban } from 'lucide-react'

import { useModal } from '@/providers/modal-provider'

import { cancelarParecerFiscal } from '../../parecer-fiscal/actions'

export function CancelParecerButton({ id, withText = false }: { id: string; withText?: boolean }) {
  const { alert, prompt } = useModal()
  const [isCancelling, setIsCancelling] = useState(false)

  const handleCancel = async () => {
    try {
      setIsCancelling(true)

      const word = await prompt(
        'Este é um documento oficial de auditoria. Tem certeza que deseja CANCELAR este Parecer Fiscal? A prestação de contas voltará para o status "Aguardando Conselho". Digite "CANCELAR" para confirmar.',
        'Digite CANCELAR'
      )
      
      if (word !== 'CANCELAR') {
        return
      }

      const res = await cancelarParecerFiscal(id)
      if (!res.success) {
        throw new Error(res.error || 'Erro desconhecido.')
      }

      await alert('Parecer Fiscal cancelado com sucesso. A prestação de contas foi reaberta para o Conselho Fiscal.')
    } catch (err: unknown) {
      console.error(err)
      const message = err instanceof Error ? err.message : 'Erro ao cancelar parecer.'
      await alert(message)
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <button 
      onClick={handleCancel}
      disabled={isCancelling}
      className={`px-3 py-1.5 bg-red-600 hover:bg-red-700 border border-transparent text-white transition-colors text-[10px] font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px] disabled:opacity-50 flex items-center justify-center gap-2 ${withText ? 'w-full py-2 text-xs' : ''}`}
      title="Cancelar Parecer Fiscal"
    >
      <Ban size={14} /> {withText && 'Cancelar Parecer Oficial'}
    </button>
  )
}
