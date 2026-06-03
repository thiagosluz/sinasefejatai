'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { ThemeToggle } from '../theme-toggle'

export function TopMenu() {
  const pathname = usePathname()

  // Ocultar Menu Global na tela de login
  if (pathname === '/login') return null

  const links = [
    { href: '/admin/dashboard', label: 'Painel' },
    { href: '/admin/diretoria', label: 'Diretoria' },
    { href: '/admin/filiados', label: 'Filiados' },
    { href: '/admin/assembleias', label: 'Assembleias' },
    { href: '/admin/documentos', label: 'Documentos' },
    { href: '/admin/financeiro', label: 'Livro Caixa' },
    { href: '/admin/auditoria', label: 'Auditoria' },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full bg-brand-cream border-b-2 border-brand-ink text-brand-ink print:hidden">
      <div className="flex flex-col md:flex-row h-auto md:h-14">
        {/* Barra Superior Mobile (Logo + Toggle) */}
        <div className="flex h-14 items-center justify-between px-4 md:px-8 border-b-2 md:border-b-0 border-brand-ink md:flex-none md:w-[250px]">
          <Link href="/admin/dashboard" className="font-serif font-bold text-lg tracking-tight text-brand-tinto uppercase">
            SINASEFE <span className="font-sans text-brand-ink text-sm">JATAÍ</span>
          </Link>
          <div className="flex md:hidden">
            <ThemeToggle />
          </div>
        </div>
        
        {/* Divisória Desktop */}
        <div className="hidden md:block w-[2px] h-14 bg-brand-ink" />

        {/* Links de Navegação */}
        <div className="flex items-center overflow-x-auto overflow-y-hidden h-12 md:h-14 md:flex-1 no-scrollbar">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-center h-full px-5 md:px-6 text-xs font-bold uppercase tracking-wider border-r-2 border-brand-ink transition-colors whitespace-nowrap ${
                  isActive 
                    ? 'bg-brand-ink text-brand-cream' 
                    : 'hover:bg-brand-card'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Divisória Desktop */}
        <div className="hidden md:block w-[2px] h-14 bg-brand-ink" />

        {/* Toggle Desktop */}
        <div className="hidden md:flex items-center justify-center px-4 w-[80px]">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
