'use client'

import { Ban, Copy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { useModal } from '@/providers/modal-provider'

import { cancelarDocumentoAdministrativo } from '../../actions'

interface ReciboActionsProps {
  id: string
  status: string
  dadosOriginais: Record<string, unknown>
}

export function ReciboActions({ id, status, dadosOriginais }: ReciboActionsProps) {
  const router = useRouter()
  const { confirm } = useModal()

  const handleCancelar = async () => {
    if (await confirm('Tem certeza que deseja cancelar este recibo? Essa ação não pode ser desfeita e uma marca d\'água será aplicada.')) {
      const loading = toast.loading('Cancelando recibo...')
      try {
        await cancelarDocumentoAdministrativo(id)
        toast.success('Recibo cancelado com sucesso.', { id: loading })
        router.refresh()
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro ao cancelar recibo'
        toast.error(message, { id: loading })
      }
    }
  }

  const handleGerarNovo = () => {
    // Vamos codificar os dados originais na URL para pré-preencher o form
    const searchParams = new URLSearchParams()
    if (dadosOriginais) {
      searchParams.set('duplicar', JSON.stringify(dadosOriginais))
    }
    router.push(`/admin/documentos/recibos/novo?${searchParams.toString()}`)
  }

  return (
    <div className="flex items-center gap-1">
      {status !== 'cancelado' && (
        <button
          type="button"
          onClick={handleCancelar}
          className="p-2 hover:bg-red-50 text-red-700 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase"
          title="Cancelar Recibo"
        >
          <Ban size={14} />
          <span className="hidden lg:inline">Cancelar</span>
        </button>
      )}

      {status === 'cancelado' && (
        <button
          type="button"
          onClick={handleGerarNovo}
          className="p-2 hover:bg-brand-cream text-brand-ink transition-colors flex items-center gap-1 text-[10px] font-bold uppercase"
          title="Gerar um novo recibo com os mesmos dados"
        >
          <Copy size={14} className="text-brand-tinto" />
          <span className="hidden lg:inline">Gerar Novo (Retificar)</span>
        </button>
      )}
    </div>
  )
}
