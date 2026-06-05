'use client'

import { useEffect,useState, useTransition } from 'react'
import { Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { TIPOS_DOCUMENTO } from '../lib/tipos-documento'

export function DocumentosFiltros() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const currentQ = searchParams.get('q') || ''
  const currentMes = searchParams.get('mes') || ''
  const currentAno = searchParams.get('ano') || ''
  const currentTipo = searchParams.get('tipo') || ''

  const [searchTerm, setSearchTerm] = useState(currentQ)

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', '1')
    if (value) params.set(key, value)
    else params.delete(key)
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  const handleSearch = (term: string) => updateParam('q', term)

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== currentQ) {
        handleSearch(searchTerm)
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, currentQ])

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar documento por título ou número..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-50 border border-brand-border px-10 py-2.5 text-sm outline-none focus:border-brand-ink focus:ring-1 focus:ring-brand-ink transition-all"
        />
        {isPending && <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-brand-tinto border-t-transparent rounded-full animate-spin"></span>}
      </div>

      <select
        value={currentTipo}
        onChange={(e) => updateParam('tipo', e.target.value)}
        className="bg-zinc-50 border border-brand-border px-4 py-2.5 text-sm outline-none focus:border-brand-ink focus:ring-1 focus:ring-brand-ink transition-all cursor-pointer"
      >
        <option value="">Todos os tipos</option>
        {Object.entries(TIPOS_DOCUMENTO).map(([key, config]) => (
          <option key={key} value={key}>{config.label}</option>
        ))}
      </select>

      <select 
        value={currentMes}
        onChange={(e) => updateParam('mes', e.target.value)}
        className="bg-zinc-50 border border-brand-border px-4 py-2.5 text-sm outline-none focus:border-brand-ink focus:ring-1 focus:ring-brand-ink transition-all cursor-pointer"
      >
        <option value="">Todos os meses</option>
        <option value="1">Janeiro</option>
        <option value="2">Fevereiro</option>
        <option value="3">Março</option>
        <option value="4">Abril</option>
        <option value="5">Maio</option>
        <option value="6">Junho</option>
        <option value="7">Julho</option>
        <option value="8">Agosto</option>
        <option value="9">Setembro</option>
        <option value="10">Outubro</option>
        <option value="11">Novembro</option>
        <option value="12">Dezembro</option>
      </select>

      <select 
        value={currentAno}
        onChange={(e) => updateParam('ano', e.target.value)}
        className="bg-zinc-50 border border-brand-border px-4 py-2.5 text-sm outline-none focus:border-brand-ink focus:ring-1 focus:ring-brand-ink transition-all cursor-pointer"
      >
        <option value="">Todos os anos</option>
        {years.map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  )
}
