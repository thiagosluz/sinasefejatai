import { redirect } from 'next/navigation'

import AdminPageHeader from '@/components/layout/admin-page-header'
import { MfaSetup } from '@/components/perfil/mfa-setup'
import { ProfileAvatarUpload } from '@/components/perfil/profile-avatar-upload'
import { ProfileBasicForm, ProfilePasswordForm } from '@/components/perfil/profile-forms'
import { createClient } from '@/lib/supabase/server'

import { getMfaStatus } from './actions'

export const metadata = {
  title: 'Meu Perfil | Admin',
}

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const mfaStatus = await getMfaStatus()
  
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário'
  const avatarUrl = user.user_metadata?.avatar_url

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <AdminPageHeader 
        titulo="Meu Perfil" 
        subtitulo="Gerencie seus dados e a segurança da sua conta" 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Coluna da Esquerda: Avatar */}
        <div className="lg:col-span-1 space-y-8">
          <ProfileAvatarUpload 
            currentAvatarUrl={avatarUrl}
            userName={userName}
          />
        </div>

        {/* Coluna da Direita: Formulários */}
        <div className="lg:col-span-2 space-y-8">
          <ProfileBasicForm 
            initialName={userName}
            initialEmail={user.email || ''}
          />

          <ProfilePasswordForm />
          
          <MfaSetup 
            enrolled={mfaStatus.enrolled} 
            factorId={mfaStatus.factorId}
          />
        </div>
      </div>
    </div>
  )
}
