'use server'

import { redirect } from 'next/navigation'

import { executeServerAction } from '@/lib/server-utils'

export async function addFiliado(formData: FormData) {
  const nome = formData.get('nome') as string
  const email = formData.get('email') as string
  const telefone = formData.get('telefone') as string
  const siape = formData.get('siape') as string
  const cargo = formData.get('cargo') as string

  if (!nome) {
    redirect('/admin/filiados/novo?error=O nome é obrigatório')
  }

  await executeServerAction(async (supabase) => {
    const { error } = await supabase.from('filiados').insert({
      nome,
      email: email || null,
      telefone: telefone || null,
      siape: siape || null,
      cargo: cargo || null,
    })
    if (error) throw error
  }, {
    redirectErrorPath: '/admin/filiados/novo',
    errorMessage: 'Falha ao cadastrar filiado',
    revalidatePaths: ['/admin/filiados'],
    redirectSuccessPath: '/admin/filiados'
  })
}

export async function editFiliado(id: string, formData: FormData) {
  const nome = formData.get('nome') as string
  const email = formData.get('email') as string
  const telefone = formData.get('telefone') as string
  const siape = formData.get('siape') as string
  const cargo = formData.get('cargo') as string
  const ativo = formData.get('ativo') === 'on'

  if (!nome) {
    redirect(`/admin/filiados/${id}/editar?error=O nome é obrigatório`)
  }

  await executeServerAction(async (supabase) => {
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
    if (error) throw error
  }, {
    redirectErrorPath: `/admin/filiados/${id}/editar`,
    errorMessage: 'Falha ao editar filiado',
    revalidatePaths: ['/admin/filiados'],
    redirectSuccessPath: '/admin/filiados'
  })
}

export async function toggleAtivo(id: string, currentStatus: boolean) {
  await executeServerAction(async (supabase) => {
    const { error } = await supabase
      .from('filiados')
      .update({ ativo: !currentStatus })
      .eq('id', id)
    if (error) throw new Error('Falha ao alterar status')
  }, {
    revalidatePaths: ['/admin/filiados']
  })
}
