import { LogOut } from 'lucide-react'

import { logout } from '@/app/login/actions'
import { AdminLayoutClient } from '@/components/layout/admin-layout-client'
import { ThemeToggle } from '@/components/theme-toggle'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const topbarRight = (
    <>
      <ThemeToggle />
      <div className="hidden sm:block text-right border-r-2 border-brand-ink pr-4 mr-1">
        <span className="text-[9px] font-bold uppercase tracking-wider text-brand-ink/60 block">Operador</span>
        <span className="text-xs font-semibold text-brand-ink">{user?.email || 'N/A'}</span>
      </div>
      <form action={logout}>
        <button className="px-3 py-1.5 border border-brand-ink bg-brand-cream hover:bg-brand-card transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 active:scale-98 shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[1px_1px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer">
          <LogOut size={13} />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </form>
    </>
  )

  return (
    <AdminLayoutClient topbarRight={topbarRight}>
      {children}
    </AdminLayoutClient>
  )
}
