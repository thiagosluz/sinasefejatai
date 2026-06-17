import { requireAdmin } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'

import { UsersClient } from './components/users-client'
import { listarUsuarios } from './actions'

export const metadata = {
  title: 'Gestão de Usuários | SINASEFE JATAÍ',
}

export default async function UsuariosPage() {
  const currentUser = await requireAdmin()
  const usuarios = await listarUsuarios()

  const supabase = await createClient()

  // Buscar filiados para o dropdown do formulário
  const { data: filiados } = await supabase
    .from('filiados')
    .select('id, nome')
    .order('nome', { ascending: true })

  return (
    <main className="p-6">
      <UsersClient
        usuarios={usuarios}
        filiados={filiados || []}
        currentUserRole={currentUser.role}
        currentUserId={currentUser.id}
      />
    </main>
  )
}
