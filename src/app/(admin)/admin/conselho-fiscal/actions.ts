'use server'

import { revalidatePath } from 'next/cache'

import { ActionResponse, handleError } from '@/lib/action-utils'
import { requireAdmin } from '@/lib/dal'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function getGestoes() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('conselho_fiscal_gestoes')
    .select('*')
    .order('is_atual', { ascending: false })
    .order('criado_em', { ascending: false })

  if (error) {
    console.error('Erro ao buscar gestões conselho fiscal:', error)
    return []
  }
  return data
}

export async function getGestaoAtualPublica() {
  const supabase = await createClient()
  const { data: gestao, error: gestaoError } = await supabase
    .from('conselho_fiscal_gestoes')
    .select('*')
    .eq('is_atual', true)
    .single()

  if (gestaoError || !gestao) return null

  const { data: membros, error: membrosError } = await supabase
    .from('conselho_fiscal_membros')
    .select('*')
    .eq('gestao_id', gestao.id)
    .order('ordem', { ascending: true })
    .order('criado_em', { ascending: true })

  if (membrosError) {
    console.error('Erro ao buscar membros:', membrosError)
    return { ...gestao, membros: [] }
  }

  return { ...gestao, membros }
}

export async function getGestoesHistorico() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('conselho_fiscal_gestoes')
    .select('*, conselho_fiscal_membros(*)')
    .eq('is_atual', false)
    .order('criado_em', { ascending: false })

  if (error) {
    console.error('Erro ao buscar histórico de gestões:', error)
    return []
  }
  
  const formatado = data.map(gestao => ({
    ...gestao,
    membros: gestao.conselho_fiscal_membros ? gestao.conselho_fiscal_membros.sort((a: { ordem: number }, b: { ordem: number }) => a.ordem - b.ordem) : []
  }))
  
  return formatado
}

export async function getGestaoById(id: string) {
  const supabase = await createClient()
  const { data: gestao, error: gestaoError } = await supabase
    .from('conselho_fiscal_gestoes')
    .select('*')
    .eq('id', id)
    .single()

  if (gestaoError) throw new Error('Gestão não encontrada')

  const { data: membros, error: membrosError } = await supabase
    .from('conselho_fiscal_membros')
    .select('*')
    .eq('gestao_id', id)
    .order('ordem', { ascending: true })
    .order('criado_em', { ascending: true })

  if (membrosError) throw new Error('Erro ao buscar membros')

  return { ...gestao, membros }
}

export async function criarGestao(nome: string): Promise<ActionResponse<string>> {
  try {
    const supabase = await createClient()
    
    const { data: gestao, error: gestaoError } = await supabase
      .from('conselho_fiscal_gestoes')
      .insert([{ nome, is_atual: false }])
      .select()
      .single()

    if (gestaoError) throw new Error('Erro ao criar gestão no banco de dados.')

    const cadeirasFixas = [
      { gestao_id: gestao.id, cadeira_referencia: 'titular_1', cargo_nome: 'Conselheiro Titular', is_cargo_fixo: true, ordem: 1 },
      { gestao_id: gestao.id, cadeira_referencia: 'titular_2', cargo_nome: 'Conselheiro Titular', is_cargo_fixo: true, ordem: 2 },
      { gestao_id: gestao.id, cadeira_referencia: 'titular_3', cargo_nome: 'Conselheiro Titular', is_cargo_fixo: true, ordem: 3 },
      { gestao_id: gestao.id, cadeira_referencia: 'suplente_1', cargo_nome: 'Conselheiro Suplente', is_cargo_fixo: true, ordem: 4 },
      { gestao_id: gestao.id, cadeira_referencia: 'suplente_2', cargo_nome: 'Conselheiro Suplente', is_cargo_fixo: true, ordem: 5 },
      { gestao_id: gestao.id, cadeira_referencia: 'suplente_3', cargo_nome: 'Conselheiro Suplente', is_cargo_fixo: true, ordem: 6 },
    ]

    const { error: membrosError } = await supabase
      .from('conselho_fiscal_membros')
      .insert(cadeirasFixas)

    if (membrosError) throw new Error('Erro ao criar cadeiras obrigatórias. A gestão pode estar corrompida.')

    revalidatePath('/admin/conselho-fiscal')
    return { success: true, data: gestao.id }
  } catch (err) {
    return handleError(err, 'Falha ao criar gestão.')
  }
}

export async function deletarGestao(id: string): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    
    const { data: gestao } = await supabase.from('conselho_fiscal_gestoes').select('is_atual').eq('id', id).single()
    if (gestao?.is_atual) {
      return { success: false, error: 'Não é possível excluir a gestão ativa. Defina outra como atual primeiro.' }
    }

    const { error } = await supabase
      .from('conselho_fiscal_gestoes')
      .delete()
      .eq('id', id)

    if (error) throw new Error('Erro ao excluir gestão no banco.')

    revalidatePath('/admin/conselho-fiscal')
    revalidatePath('/conselho-fiscal/historico')
    return { success: true }
  } catch (err) {
    return handleError(err, 'Falha ao deletar gestão.')
  }
}

export async function definirGestaoAtual(id: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    
    const { error: errorUpdateAntigas } = await supabase
      .from('conselho_fiscal_gestoes')
      .update({ is_atual: false })
      .eq('is_atual', true)

    if (errorUpdateAntigas) throw new Error('Erro interno ao limpar gestões antigas')

    const { error: errorMarcar } = await supabase
      .from('conselho_fiscal_gestoes')
      .update({ is_atual: true })
      .eq('id', id)

    if (errorMarcar) throw new Error('Erro ao marcar nova gestão atual')

    revalidatePath('/admin/conselho-fiscal')
    revalidatePath('/conselho-fiscal')
    revalidatePath('/conselho-fiscal/historico')
    
    return { success: true }
  } catch (err) {
    return handleError(err, 'Falha ao definir gestão atual.')
  }
}

export async function salvarCadeira(
  membroId: string, 
  dados: { cargo_nome: string; nome: string; foto_url: string | null; filiado_id?: string | null; email_convite?: string }
): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    
    if (dados.email_convite && dados.filiado_id) {
      const adminClient = createAdminClient()
      
      const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(dados.email_convite)
      if (inviteError) {
        throw new Error(`Falha ao convidar o usuário: ${inviteError.message}`)
      }
      
      const newUserId = inviteData.user.id
      
      const { error: profileError } = await adminClient
        .from('perfis')
        .insert([{
          id: newUserId,
          role: 'conselho_fiscal',
          filiado_id: dados.filiado_id
        }])
        
      if (profileError) {
        await adminClient.auth.admin.deleteUser(newUserId)
        throw new Error(`Falha ao criar o perfil do usuário: ${profileError.message}`)
      }
    }
    
    const { error } = await supabase
      .from('conselho_fiscal_membros')
      .update({
        cargo_nome: dados.cargo_nome,
        nome: dados.nome,
        foto_url: dados.foto_url,
        filiado_id: dados.filiado_id
      })
      .eq('id', membroId)

    if (error) throw new Error('Erro ao salvar dados do membro no banco.')
    
    revalidatePath('/admin/conselho-fiscal/[id]', 'page')
    revalidatePath('/conselho-fiscal')
    
    return { success: true }
  } catch (err) {
    return handleError(err, 'Falha ao salvar a cadeira.')
  }
}

export async function adicionarCargoExtra(gestaoId: string): Promise<ActionResponse<Record<string, unknown>>> {
  try {
    const supabase = await createClient()
    
    const novoCargo = {
      gestao_id: gestaoId,
      cadeira_referencia: 'extra',
      cargo_nome: 'Novo Cargo',
      nome: '',
      foto_url: null,
      is_cargo_fixo: false,
      ordem: 99
    }

    const { data, error } = await supabase
      .from('conselho_fiscal_membros')
      .insert([novoCargo])
      .select()
      .single()

    if (error) throw new Error('Erro ao adicionar cargo extra no banco.')

    revalidatePath(`/admin/conselho-fiscal/${gestaoId}`)
    return { success: true, data }
  } catch (err) {
    return handleError(err, 'Falha ao adicionar cargo extra.')
  }
}

export async function excluirCargoExtra(membroId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    
    const { data: membro } = await supabase
      .from('conselho_fiscal_membros')
      .select('is_cargo_fixo')
      .eq('id', membroId)
      .single()

    if (!membro) return { success: false, error: 'Membro não encontrado' }
    if (membro.is_cargo_fixo) return { success: false, error: 'Cadeiras estatutárias não podem ser apagadas.' }

    const { error } = await supabase
      .from('conselho_fiscal_membros')
      .delete()
      .eq('id', membroId)

    if (error) throw new Error('Erro ao excluir cargo no banco.')

    revalidatePath('/admin/conselho-fiscal/[id]', 'page')
    return { success: true }
  } catch (err) {
    return handleError(err, 'Falha ao excluir cargo extra.')
  }
}
