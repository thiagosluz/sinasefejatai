'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const links = [
  { href: '/', label: 'Início' },
  { href: '/diretoria', label: 'Diretoria' },
  { href: '/assembleias', label: 'Assembleias' },
  { href: '/filiacao', label: 'Filiação' },
  { href: '/contato', label: 'Contato' },
]

export function PublicNavbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-brand-tinto shadow-sm">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-brand-tinto flex items-center justify-center flex-shrink-0 group-hover:bg-brand-tinto-light transition-colors">
              <span className="text-white font-bold text-sm font-serif">S</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-brand-ink text-sm leading-tight font-serif">SINASEFE Jataí</p>
              <p className="text-xs text-zinc-500 leading-tight">Seção Sindical</p>
            </div>
          </Link>

          {/* Links Desktop */}
          <ul className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-tinto text-white'
                        : 'text-zinc-600 hover:text-brand-tinto hover:bg-red-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* CTA Desktop */}
          <div className="hidden md:block">
            <Link
              href="/filiacao"
              className="inline-flex items-center gap-2 bg-brand-tinto text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-brand-tinto-light transition-all shadow-sm hover:shadow-md"
            >
              Filiar-se
            </Link>
          </div>

          {/* Hamburger Mobile */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md text-zinc-600 hover:text-brand-tinto hover:bg-red-50 transition-colors"
            aria-label="Abrir menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Menu Mobile */}
        {isOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-zinc-100">
            <ul className="flex flex-col gap-1">
              {links.map((link) => {
                const isActive = pathname === link.href
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-brand-tinto text-white'
                          : 'text-zinc-600 hover:text-brand-tinto hover:bg-red-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
              <li className="mt-2 px-4">
                <Link
                  href="/filiacao"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-brand-tinto text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-brand-tinto-light transition-all"
                >
                  Filiar-se
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  )
}
