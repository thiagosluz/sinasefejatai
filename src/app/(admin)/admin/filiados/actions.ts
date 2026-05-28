'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addFiliado(formData: FormData) {
  const supabase = await createClient()

  const nome = formData.get('nome') as string
  const email = formData.get('email') as string
  const telefone = formData.get('telefone') as string
  const siape = formData.get('siape') as string
  const cargo = formData.get('cargo') as string

  if (!nome) {
    redirect('/admin/filiados/novo?error=O nome é obrigatório')
  }

  const { error } = await supabase.from('filiados').insert({
    nome,
    email: email || null,
    telefone: telefone || null,
    siape: siape || null,
    cargo: cargo || null,
  })

  if (error) {
    console.error(error)
    redirect('/admin/filiados/novo?error=Falha ao cadastrar filiado')
  }

  revalidatePath('/admin/filiados')
  redirect('/admin/filiados')
}

export async function editFiliado(id: string, formData: FormData) {
  const supabase = await createClient()

  const nome = formData.get('nome') as string
  const email = formData.get('email') as string
  const telefone = formData.get('telefone') as string
  const siape = formData.get('siape') as string
  const cargo = formData.get('cargo') as string
  const ativo = formData.get('ativo') === 'on'

  if (!nome) {
    redirect(`/admin/filiados/${id}/editar?error=O nome é obrigatório`)
  }

  const { error } = await supabase
    .from('filiados')
    .update({
      nome,
      email: email || null,
      telefone: telefone || null,
      siape: siape || null,
      cargo: cargo || null,
      ativo,
    })
    .eq('id', id)

  if (error) {
    console.error(error)
    redirect(`/admin/filiados/${id}/editar?error=Falha ao editar filiado`)
  }

  revalidatePath('/admin/filiados')
  redirect('/admin/filiados')
}

export async function toggleAtivo(id: string, currentStatus: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('filiados')
    .update({ ativo: !currentStatus })
    .eq('id', id)

  if (error) {
    console.error(error)
    throw new Error('Falha ao alterar status')
  }

  revalidatePath('/admin/filiados')
}
