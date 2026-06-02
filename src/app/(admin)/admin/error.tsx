'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Render Error (Admin):', error)
  }, [error])

  return (
    <AdminPageWrapper>
      <AdminPageHeader 
        titulo="Erro de Sistema" 
        subtitulo="Encontramos um problema interno ao carregar o módulo administrativo."
      />
      <div className="bg-brand-card border border-brand-tinto/30 p-8 flex flex-col items-center justify-center min-h-[400px] text-center shadow-md">
        <div className="bg-brand-tinto/10 p-4 rounded-full text-brand-tinto mb-4">
          <AlertTriangle size={48} />
        </div>
        <h3 className="text-xl font-serif font-bold text-brand-ink mb-2">Falha na Comunicação</h3>
        <p className="text-sm text-brand-ink/70 max-w-md mb-8">
          Não foi possível concluir a operação de leitura deste módulo. Verifique sua conexão com a internet ou tente recarregar os dados.
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 w-full max-w-2xl bg-zinc-100 p-4 border border-zinc-300 text-left text-xs font-mono overflow-auto max-h-40">
            <span className="font-bold text-brand-tinto">Stack trace (Apenas Dev):</span><br/>
            {error.message}
          </div>
        )}

        <button
          onClick={() => reset()}
          className="bg-brand-tinto hover:bg-brand-tinto-light text-white py-2.5 px-6 font-serif font-bold text-sm uppercase tracking-wider flex items-center gap-2 shadow-[2.5px_2.5px_0px_var(--brand-ink)] transition-all hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-[1.5px_1.5px_0px_var(--brand-ink)]"
        >
          <RefreshCcw size={16} />
          Recarregar Módulo
        </button>
      </div>
    </AdminPageWrapper>
  )
}
