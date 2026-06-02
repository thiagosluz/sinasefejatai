import React from 'react'

interface AdminPageHeaderProps {
  titulo: string
  subtitulo: string
  children?: React.ReactNode // Slot para botões de ação (ex: "Cadastrar Filiado")
}

export default function AdminPageHeader({ titulo, subtitulo, children }: AdminPageHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b-2 border-brand-ink pb-6 gap-4">
      <div>
        <h1 className="text-2xl font-serif font-bold text-brand-tinto tracking-tight">{titulo}</h1>
        <p className="text-zinc-600 text-xs mt-1 uppercase tracking-wider">{subtitulo}</p>
      </div>
      {children}
    </header>
  )
}
