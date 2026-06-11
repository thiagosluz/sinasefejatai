'use server'

import { revalidatePath } from 'next/cache'

import { requireAdmin } from '@/lib/dal'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export interface UsuarioDTO {
  id: string
  email: string
  role: string
  created_at: string
  filiado?: {
    id: string
    nome: string
  } | null
}

export async function listarUsuarios(): Promise<UsuarioDTO[]> {
  await requireAdmin()
  const supabase = await createClient()

  // Precisamos buscar os perfis e fazer join com filiados.
  // Como e-mail não fica em `perfis`, precisaremos juntar os dados na mão
  // chamando adminClient para pegar auth.users, já que a API pública não expõe.
  
  const adminAuth = createAdminClient()
  
  const { data: authUsers, error: errAuth } = await adminAuth.auth.admin.listUsers()
  if (errAuth) throw new Error('Erro ao buscar usuários do sistema.')

  const { data: perfis, error: errPerfis } = await supabase
    .from('perfis')
    .select(`
      id,
      role,
      filiado_id,
      created_at,
      filiados(id, nome)
    `)
    .order('created_at', { ascending: false })

  if (errPerfis) throw new Error('Erro ao buscar perfis.')

  // Merge Data
  const usuarios = perfis.map((p) => {
    const au = authUsers.users.find(u => u.id === p.id)
    return {
      id: p.id,
      email: au?.email || 'Email não encontrado',
      role: p.role,
      created_at: p.created_at,
      filiado: p.filiados ? {
        // @ts-expect-error - Supabase typing based on relation
        id: Array.isArray(p.filiados) ? p.filiados[0]?.id : p.filiados?.id,
        // @ts-expect-error - Supabase typing based on relation
        nome: Array.isArray(p.filiados) ? p.filiados[0]?.nome : p.filiados?.nome,
      } : null
    }
  })

  return usuarios
}

export async function convidarUsuario(formData: FormData) {
  const currentUser = await requireAdmin()
  if (currentUser.role !== 'superadmin') {
    throw new Error('Apenas superadministradores podem convidar novos usuários.')
  }

  const email = formData.get('email') as string
  const role = formData.get('role') as string
  const filiadoId = formData.get('filiado_id') as string

  if (!email || !role) {
    throw new Error('Email e Nível de Acesso são obrigatórios.')
  }

  const adminClient = createAdminClient()

  // 1. Invita o usuário
  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email)
  if (inviteError) {
    console.error(inviteError)
    throw new Error(`Falha ao convidar: ${inviteError.message}`)
  }

  const newUserId = inviteData.user.id

  // 2. Cria o Perfil via Admin Client (porque bypass RLS é melhor nesse fluxo crítico)
  const { error: profileError } = await adminClient
    .from('perfis')
    .insert([
      {
        id: newUserId,
        role: role,
        filiado_id: filiadoId || null
      }
    ])

  if (profileError) {
    // Tenta reverter o usuário se o perfil falhar
    await adminClient.auth.admin.deleteUser(newUserId)
    throw new Error(`Falha ao criar o perfil: ${profileError.message}`)
  }

  revalidatePath('/admin/usuarios')
  return { success: true }
}

export async function removerAcesso(id: string) {
  const currentUser = await requireAdmin()
  if (currentUser.role !== 'superadmin') {
    throw new Error('Acesso negado. Apenas superadmins podem remover usuários.')
  }

  if (currentUser.id === id) {
    throw new Error('Você não pode remover seu próprio acesso.')
  }

  const adminClient = createAdminClient()

  // Deletar o usuário no auth (Isso deletará em cascata na tabela perfis)
  const { error } = await adminClient.auth.admin.deleteUser(id)
  
  if (error) {
    throw new Error(`Falha ao remover acesso: ${error.message}`)
  }

  revalidatePath('/admin/usuarios')
  return { success: true }
}
