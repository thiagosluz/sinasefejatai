'use client'

import { useTransition } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface PaginacaoProps {
  totalPages: number
}

export function Paginacao({ totalPages }: PaginacaoProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentPage = Number(searchParams.get('page')) || 1

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  if (totalPages <= 1) return null

  return (
    <div className="mt-6 flex items-center justify-between border-t border-brand-border pt-4">
      <span className="text-xs font-bold uppercase tracking-wider text-brand-ink/70">
        Página {currentPage} de {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => startTransition(() => router.push(createPageURL(currentPage - 1)))}
          disabled={currentPage <= 1 || isPending}
          className="flex items-center justify-center w-8 h-8 bg-brand-cream border border-brand-ink text-brand-ink shadow-[1.5px_1.5px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[0px_0px_0px_var(--brand-ink)] disabled:opacity-50 disabled:pointer-events-none transition-all"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => startTransition(() => router.push(createPageURL(currentPage + 1)))}
          disabled={currentPage >= totalPages || isPending}
          className="flex items-center justify-center w-8 h-8 bg-brand-cream border border-brand-ink text-brand-ink shadow-[1.5px_1.5px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[0px_0px_0px_var(--brand-ink)] disabled:opacity-50 disabled:pointer-events-none transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
