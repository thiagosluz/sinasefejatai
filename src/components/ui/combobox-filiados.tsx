'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'

export interface ComboboxFiliadosProps {
  filiados: { id: string; nome: string }[]
  value: string
  onChange: (id: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function ComboboxFiliados({
  filiados,
  value,
  onChange,
  placeholder = 'Selecione ou busque...',
  className = '',
  disabled = false
}: ComboboxFiliadosProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // O filiado atualmente selecionado
  const selectedFiliado = filiados.find((f) => f.id === value)

  // Filtra os filiados com base na busca
  const filteredFiliados = search
    ? filiados.filter((f) => f.nome.toLowerCase().includes(search.toLowerCase()))
    : filiados

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (id: string) => {
    onChange(id)
    setIsOpen(false)
    setSearch('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setSearch('')
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Botão/Input que abre o combobox */}
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full border border-brand-border bg-white px-3 py-2 flex items-center justify-between text-sm transition-colors cursor-pointer min-h-[42px] ${disabled ? 'opacity-50 cursor-not-allowed bg-zinc-50' : 'hover:border-brand-tinto focus-within:ring-2 focus-within:ring-brand-tinto/20 focus-within:border-brand-tinto'}`}
      >
        <span className={selectedFiliado ? 'text-brand-ink font-medium truncate' : 'text-zinc-400 truncate'}>
          {selectedFiliado ? selectedFiliado.nome : placeholder}
        </span>
        <div className="flex items-center gap-1 text-zinc-400">
          {selectedFiliado && !disabled && (
            <div 
              role="button" 
              onClick={handleClear}
              className="p-1 hover:text-brand-tinto hover:bg-brand-tinto/10 rounded transition-colors"
            >
              <X size={14} />
            </div>
          )}
          <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Lista Suspensa (Dropdown) */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-brand-border shadow-xl max-h-60 flex flex-col">
          <div className="p-2 border-b border-zinc-100 flex items-center gap-2 text-zinc-500 bg-zinc-50/50">
            <Search size={14} />
            <input
              type="text"
              autoFocus
              className="w-full bg-transparent text-sm text-brand-ink focus:outline-none"
              placeholder="Digite para buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <ul className="overflow-y-auto flex-1">
            <li 
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-brand-tinto hover:text-white transition-colors ${!value ? 'bg-brand-cream font-bold' : ''}`}
              onClick={() => handleSelect('')}
            >
              Nenhum / Sem vínculo
            </li>
            
            {filteredFiliados.length === 0 ? (
              <li className="px-3 py-4 text-sm text-zinc-400 text-center italic">
                Nenhum membro encontrado.
              </li>
            ) : (
              filteredFiliados.map((filiado) => (
                <li
                  key={filiado.id}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-brand-tinto hover:text-white transition-colors border-t border-zinc-50 ${value === filiado.id ? 'bg-brand-tinto text-white font-bold' : 'text-brand-ink'}`}
                  onClick={() => handleSelect(filiado.id)}
                >
                  {filiado.nome}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
