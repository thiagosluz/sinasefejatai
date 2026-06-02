'use client'

import { useState } from 'react'
import { CheckCircle, PenTool, Trash2, Users, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { assinarDocumento, DocumentoVerificacao,removerAssinatura } from '@/lib/actions-assinaturas'
import { useModal } from '@/providers/modal-provider'

interface AssinaturasWidgetProps {
  tipoDocumento: 'ata' | 'edital' | 'presenca'
  documentoId: string
  verificacaoInicial?: DocumentoVerificacao | null
  currentUserId?: string
  variant: 'button' | 'sidebar-list' | 'toolbar'
  disabled?: boolean // Caso o documento precise ser salvo antes de assinar (ex: Ata)
}

export function AssinaturasWidget({
  tipoDocumento,
  documentoId,
  verificacaoInicial,
  currentUserId,
  variant,
  disabled = false
}: AssinaturasWidgetProps) {
  const { confirm, prompt } = useModal()
  const router = useRouter()
  const [modalAberto, setModalAberto] = useState(false)

  const assinaturas = verificacaoInicial?.assinaturas || []
  const jaAssinou = assinaturas.some(a => a.usuario_id === currentUserId)

  const handleAssinarEletronicamente = async () => {
    if (disabled) {
      toast.error('Você precisa salvar o documento antes de assinar.')
      return
    }

    const nome = await prompt('Confirme seu NOME COMPLETO para a assinatura digital:', 'Ex: João da Silva')
    if (!nome) return

    const cargo = await prompt('Confirme seu CARGO:', 'Ex: Coordenador Geral')
    if (!cargo) return

    const loadingToast = toast.loading('Registrando assinatura eletrônica...')
    const result = await assinarDocumento(tipoDocumento, documentoId, nome, cargo)
    
    if (!result.success) {
      toast.error(result.error || 'Erro desconhecido', { id: loadingToast })
    } else {
      toast.success('Documento assinado com sucesso!', { id: loadingToast })
      router.refresh()
    }
  }

  const handleRemoverAssinatura = async (assinaturaId: string) => {
    if (await confirm('Tem certeza que deseja excluir esta assinatura?')) {
      const loadingToast = toast.loading('Removendo assinatura...')
      const result = await removerAssinatura(assinaturaId)
      if (!result.success) {
        toast.error(result.error || 'Erro ao remover', { id: loadingToast })
      } else {
        toast.success('Assinatura removida', { id: loadingToast })
        router.refresh()
      }
    }
  }

  const renderBotaoAssinar = () => (
    <button
      type="button"
      onClick={handleAssinarEletronicamente}
      title={jaAssinou ? "Você já assinou este documento" : "Assinar Eletronicamente"}
      disabled={jaAssinou || disabled}
      className={`p-2 rounded-none transition-colors flex items-center gap-1 text-[10px] font-bold uppercase ${
        jaAssinou 
          ? "bg-brand-cream/50 text-brand-ink/40 cursor-not-allowed opacity-80" 
          : "hover:bg-brand-cream text-brand-ink cursor-pointer"
      }`}
    >
      {jaAssinou ? (
        <>
          <CheckCircle size={14} className="text-green-600/70" />
          <span className="hidden lg:inline text-green-700/80">Assinado</span>
        </>
      ) : (
        <>
          <PenTool size={14} className="text-brand-tinto" />
          <span className="hidden lg:inline">Assinar Eletronicamente</span>
        </>
      )}
    </button>
  )

  const renderListaAssinaturas = () => (
    <div className="space-y-2">
      {assinaturas.map(ass => (
        <div key={ass.id} className="bg-white border border-brand-border p-2 flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-brand-ink truncate">{ass.nome_assinante}</p>
            <p className="text-[9px] text-zinc-500 uppercase truncate">{ass.cargo_assinante}</p>
          </div>
          <button 
            type="button" 
            onClick={() => handleRemoverAssinatura(ass.id)}
            className="text-brand-tinto hover:text-red-700 p-1 bg-red-50 hover:bg-red-100 rounded-none transition-colors flex-shrink-0 mt-0.5"
            title="Remover assinatura"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      {assinaturas.length === 0 && (
        <p className="text-[11px] text-zinc-500 italic p-2">Nenhuma assinatura ainda.</p>
      )}
    </div>
  )

  if (variant === 'button') {
    return renderBotaoAssinar()
  }

  if (variant === 'sidebar-list') {
    if (!verificacaoInicial || assinaturas.length === 0) return null
    return (
      <div className="pt-4 border-t border-brand-border mt-4">
        <h3 className="text-xs font-bold text-brand-ink/60 uppercase tracking-wider mb-3 font-serif flex items-center justify-between">
          <span>Assinaturas ({assinaturas.length})</span>
        </h3>
        {renderListaAssinaturas()}
      </div>
    )
  }

  // variant === 'toolbar'
  return (
    <div className="flex items-center gap-1">
      {renderBotaoAssinar()}
      
      {assinaturas.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setModalAberto(true)}
            className="p-2 hover:bg-brand-cream text-brand-ink rounded-none transition-colors flex items-center gap-1 text-[10px] font-bold uppercase"
          >
            <Users size={14} className="text-brand-tinto" />
            <span className="hidden lg:inline">Ver Assinaturas ({assinaturas.length})</span>
          </button>

          {modalAberto && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-brand-cream w-full max-w-md border-2 border-brand-ink shadow-[4px_4px_0px_var(--brand-ink)]">
                <div className="flex items-center justify-between p-3 border-b-2 border-brand-ink bg-brand-tinto text-white">
                  <h3 className="font-serif font-bold text-sm tracking-wider">Assinaturas do Documento</h3>
                  <button onClick={() => setModalAberto(false)} className="hover:bg-white/20 p-1 transition-colors">
                    <X size={16} />
                  </button>
                </div>
                <div className="p-4 max-h-[60vh] overflow-y-auto">
                  {renderListaAssinaturas()}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
