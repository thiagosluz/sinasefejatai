'use client'

import { useCallback, useEffect,useState } from 'react'
import { Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export function BoletinsFiltros() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Valores iniciais vindos da URL
  const initialQ = searchParams.get('q') || ''
  const initialStatus = searchParams.get('status') || ''
  const initialSort = searchParams.get('sort') || 'desc'

  const [busca, setBusca] = useState(initialQ)

  // Atualizar a query string na URL
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  // Debounce para a busca por texto
  useEffect(() => {
    const timer = setTimeout(() => {
      if (busca !== initialQ) {
        router.push(pathname + '?' + createQueryString('q', busca))
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [busca, initialQ, pathname, router, createQueryString])

  return (
    <div className="bg-white border border-brand-border shadow-sm p-4 mt-6 flex flex-col md:flex-row gap-4 items-center justify-between">
      {/* Busca */}
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
        <input 
          type="text" 
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar boletim pelo título..." 
          className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/20 focus:border-brand-tinto transition-colors"
        />
      </div>

      <div className="flex w-full md:w-auto gap-3 flex-col sm:flex-row">
        {/* Filtro de Status */}
        <select 
          className="w-full sm:w-auto border border-zinc-200 rounded px-3 py-2 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-tinto/20 focus:border-brand-tinto bg-white"
          value={initialStatus}
          onChange={(e) => {
            router.push(pathname + '?' + createQueryString('status', e.target.value))
          }}
        >
          <option value="">Todos os status</option>
          <option value="Publicado">Publicado</option>
          <option value="Rascunho">Rascunho</option>
        </select>

        {/* Ordenação */}
        <select 
          className="w-full sm:w-auto border border-zinc-200 rounded px-3 py-2 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-tinto/20 focus:border-brand-tinto bg-white"
          value={initialSort}
          onChange={(e) => {
            router.push(pathname + '?' + createQueryString('sort', e.target.value))
          }}
        >
          <option value="desc">Mais recentes primeiro</option>
          <option value="asc">Mais antigos primeiro</option>
        </select>
      </div>
    </div>
  )
}
