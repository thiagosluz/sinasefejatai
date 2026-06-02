'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Render Error (Global):', error)
  }, [error])

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-4">
      <div className="bg-brand-card p-8 border-2 border-brand-tinto/20 max-w-md w-full shadow-[8px_8px_0px_#991b1b] text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-brand-tinto/10 text-brand-tinto rounded-full flex items-center justify-center">
          <AlertTriangle size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-bold text-brand-ink">Oops! Algo deu errado</h2>
          <p className="text-sm font-sans text-brand-ink/70">
            Nossos servidores encontraram um problema ao tentar carregar esta página. Pode ser uma instabilidade temporária.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-xs text-red-800 text-left overflow-auto max-h-32">
              <span className="font-bold block mb-1">Stack trace (Apenas Dev):</span>
              <code>{error.message}</code>
            </div>
          )}
        </div>
        <button
          onClick={() => reset()}
          className="w-full bg-brand-tinto text-white py-3 px-6 text-sm font-serif font-bold uppercase tracking-wider hover:bg-brand-tinto-light transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCcw size={16} />
          Tentar Novamente
        </button>
      </div>
    </div>
  )
}
