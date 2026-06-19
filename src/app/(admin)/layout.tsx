import { LogOut } from 'lucide-react'
import Link from 'next/link'

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

  let role = 'operador'
  if (user) {
    const { data: perfil } = await supabase.from('perfis').select('role').eq('id', user.id).single()
    if (perfil) {
      role = perfil.role
    }
  }

  const roleDisplay = role === 'superadmin' ? 'Super Admin' : role === 'diretoria' ? 'Diretoria' : role === 'conselho_fiscal' ? 'Conselho Fiscal' : 'Operador'

  const topbarRight = (
    <div className="flex items-center gap-4">
      <ThemeToggle />
      
      {/* Informações do Usuário e Avatar (Link para o Perfil) */}
      <Link href="/admin/perfil" className="hidden sm:flex items-center gap-3 border-r-2 border-brand-ink pr-4 mr-1 hover:opacity-80 transition-opacity">
        <div className="text-right">
          <span className="text-[9px] font-bold uppercase tracking-wider text-brand-ink/60 block">{roleDisplay}</span>
          <span className="text-xs font-semibold text-brand-ink">{user?.email || 'N/A'}</span>
        </div>
        
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-brand-card border-2 border-brand-ink flex items-center justify-center overflow-hidden">
          {user?.user_metadata?.avatar_url ? (
            <img 
              src={user.user_metadata.avatar_url} 
              alt="Avatar" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <span className="font-serif font-bold text-sm text-brand-tinto">
              {(user?.user_metadata?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </Link>

      {/* Botão de Logout */}
      <form action={logout}>
        <button className="px-3 py-1.5 border border-brand-ink bg-brand-cream hover:bg-brand-card transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 active:scale-98 shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[1px_1px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer">
          <LogOut size={13} />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </form>
    </div>
  )

  return (
    <AdminLayoutClient topbarRight={topbarRight} role={role}>
      {children}
    </AdminLayoutClient>
  )
}
