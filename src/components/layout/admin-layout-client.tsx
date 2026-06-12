'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { Sidebar } from './sidebar'

export function AdminLayoutClient({ 
  children, 
  topbarRight,
  role = 'operador'
}: { 
  children: React.ReactNode
  topbarRight: React.ReactNode 
  role?: string
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  if (pathname === '/login') {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden bg-brand-cream print:h-auto print:block print:overflow-visible">
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        role={role}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden relative print:block print:h-auto print:overflow-visible">
        {/* Topbar */}
        <header className="h-14 bg-brand-cream border-b-2 border-brand-ink flex items-center justify-between px-4 lg:px-8 flex-shrink-0 z-30 print:hidden">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 -ml-2 text-brand-ink hover:text-brand-tinto"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="lg:hidden font-serif font-bold text-sm tracking-tight text-brand-tinto uppercase">
              SINASEFE <span className="font-sans text-brand-ink text-xs">JATAÍ</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
            {topbarRight}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar relative print:block print:h-auto print:overflow-visible print:overflow-y-visible">
          {children}
        </main>
      </div>
    </div>
  )
}
