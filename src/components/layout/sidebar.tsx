'use client'

import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe,
  Home,
  Landmark,
  MapPin,
  Newspaper,
  ShieldCheck,
  Sliders,
  Users,
  UsersRound,
  X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  role?: string
}

export function Sidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed, role = 'operador' }: SidebarProps) {
  const pathname = usePathname()

  if (pathname === '/login') return null

  const navigation = [
    {
      group: 'Geral',
      items: [
        { href: '/admin/dashboard', label: 'Painel', icon: Home }
      ]
    },
    {
      group: 'Administrativo',
      items: [
        { href: '/admin/filiados', label: 'Filiados', icon: Users },
        { href: '/admin/diretoria', label: 'Diretoria', icon: UsersRound },
        { href: '/admin/conselho-fiscal', label: 'Conselho Fiscal', icon: ShieldCheck },
        { href: '/admin/usuarios', label: 'Usuários/Acessos', icon: ShieldCheck },
        { href: '/admin/locais', label: 'Locais de Reunião', icon: MapPin },
      ]
    },
    {
      group: 'Documental',
      items: [
        { href: '/admin/assembleias', label: 'Assembleias', icon: CalendarRange },
        { href: '/admin/boletins', label: 'Boletins', icon: Newspaper },
        { href: '/admin/documentos', label: 'Documentos', icon: FileText },
        { href: '/admin/publicacoes', label: 'Portal Público', icon: Globe },
        { href: '/admin/configuracoes', label: 'Cabeçalho/Timbre', icon: Sliders },
      ]
    },
    {
      group: 'Financeiro',
      items: [
        { href: '/admin/financeiro', label: 'Livro Caixa', icon: Landmark },
        { href: '/admin/parecer-fiscal', label: 'Parecer Fiscal', icon: ShieldCheck },
        { href: '/admin/auditoria', label: 'Auditoria', icon: ShieldCheck },
      ]
    }
  ]

  let filteredNavigation = navigation
  if (role === 'conselho_fiscal') {
    filteredNavigation = [
      {
        group: 'Geral',
        items: [
          { href: '/admin/dashboard', label: 'Painel', icon: Home }
        ]
      },
      {
        group: 'Financeiro',
        items: [
          { href: '/admin/parecer-fiscal', label: 'Parecer Fiscal', icon: ShieldCheck }
        ]
      }
    ]
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-brand-ink/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-brand-cream border-r-2 border-brand-ink flex flex-col
        transition-all duration-300 ease-in-out lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'w-64 lg:w-20' : 'w-64'}
      `}>

        {/* Header/Logo */}
        <div className={`h-14 flex items-center border-b-2 border-brand-ink flex-shrink-0 transition-all ${isCollapsed ? 'justify-center px-0 lg:px-0' : 'justify-between px-6'}`}>
          {!isCollapsed && (
            <Link href="/admin/dashboard" className="font-serif font-bold text-lg tracking-tight text-brand-tinto uppercase truncate">
              SINASEFE <span className="font-sans text-brand-ink text-sm">JATAÍ</span>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/admin/dashboard" className="font-serif font-bold text-xl tracking-tight text-brand-tinto uppercase hidden lg:block" title="SINASEFE JATAÍ">
              SJ
            </Link>
          )}
          <button
            className="lg:hidden text-brand-ink hover:text-brand-tinto absolute right-4"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar py-6">
          <div className={`space-y-8 ${isCollapsed ? 'px-2' : 'px-4'}`}>
            {filteredNavigation.map((section) => (
              <div key={section.group}>
                {!isCollapsed && (
                  <h3 className="px-2 text-[10px] font-bold uppercase tracking-widest text-brand-ink/50 mb-3 font-serif truncate">
                    {section.group}
                  </h3>
                )}
                {isCollapsed && (
                  <div className="h-[1px] w-8 mx-auto bg-brand-ink/20 mb-3 mt-4 hidden lg:block" />
                )}
                <nav className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname.startsWith(item.href) &&
                      (item.href === '/admin/dashboard' ? pathname === '/admin/dashboard' : true)

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={isCollapsed ? item.label : undefined}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center transition-colors ${isCollapsed
                          ? 'justify-start lg:justify-center px-3 py-3 lg:px-0 lg:mx-2 rounded-sm'
                          : 'gap-3 px-3 py-2'
                          } text-xs font-bold uppercase tracking-wider ${isActive
                            ? isCollapsed
                              ? 'bg-brand-ink text-brand-cream shadow-[2px_2px_0px_var(--brand-tinto)] lg:shadow-none lg:border-l-4 lg:border-brand-tinto lg:bg-brand-card lg:text-brand-ink'
                              : 'bg-brand-ink text-brand-cream shadow-[2px_2px_0px_var(--brand-tinto)]'
                            : 'text-brand-ink hover:bg-brand-card hover:translate-x-1'
                          }`}
                      >
                        <item.icon size={18} className={isActive ? 'text-brand-tinto flex-shrink-0' : 'text-brand-tinto flex-shrink-0'} />
                        <span className={`whitespace-nowrap ${isCollapsed ? 'inline lg:hidden ml-3' : ''}`}>
                          {item.label}
                        </span>
                      </Link>
                    )
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Footer with Toggle */}
        <div className="border-t border-brand-ink/20">
          {!isCollapsed && (
            <div className="p-4">
              <div className="text-[9px] text-center uppercase tracking-widest text-brand-ink/50 leading-relaxed">
                Seção Sindical<br />Retro-Editorial
              </div>
            </div>
          )}

          {/* Collapse Toggle Button (Desktop only) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden lg:flex w-full items-center ${isCollapsed ? 'justify-center py-4' : 'justify-between px-4 py-3'} text-brand-ink hover:bg-brand-card hover:text-brand-tinto transition-colors border-t border-brand-ink/10`}
            title={isCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            {!isCollapsed && <span className="text-[10px] font-bold uppercase tracking-widest">Recolher</span>}
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

      </aside>
    </>
  )
}
