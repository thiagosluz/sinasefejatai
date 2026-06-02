'use server'

import { revalidatePath } from 'next/cache'

import { ActionResponse, handleError } from '@/lib/action-utils'
import { createClient } from '@/lib/supabase/server'

/**
 * Retorna todas as gestões cadastradas
 */
export async function getGestoes() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gestoes')
    .select('*')
    .order('is_atual', { ascending: false }) // Atual aparece primeiro
    .order('criado_em', { ascending: false })

  if (error) {
    console.error('Erro ao buscar gestões:', error)
    return []
  }
  return data
}

/**
 * Retorna a gestão pública (is_atual = true) e seus membros
 */
export async function getGestaoAtualPublica() {
  const supabase = await createClient()
  const { data: gestao, error: gestaoError } = await supabase
    .from('gestoes')
    .select('*')
    .eq('is_atual', true)
    .single()

  if (gestaoError || !gestao) {
    return null
  }

  const { data: membros, error: membrosError } = await supabase
    .from('gestao_membros')
    .select('*')
    .eq('gestao_id', gestao.id)
    .order('ordem', { ascending: true })
    .order('criado_em', { ascending: true })

  if (membrosError) {
    console.error('Erro ao buscar membros da gestão:', membrosError)
    return { ...gestao, membros: [] }
  }

  return { ...gestao, membros }
}

/**
 * Retorna todo o histórico de gestões passadas
 */
export async function getGestoesHistorico() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gestoes')
    .select('*, gestao_membros(*)')
    .eq('is_atual', false)
    .order('criado_em', { ascending: false })

  if (error) {
    console.error('Erro ao buscar histórico de gestões:', error)
    return []
  }
  
  // Ordenar os membros dentro de cada gestão por ordem
  const formatado = data.map(gestao => ({
    ...gestao,
    membros: gestao.gestao_membros ? gestao.gestao_membros.sort((a: { ordem: number }, b: { ordem: number }) => a.ordem - b.ordem) : []
  }))
  
  return formatado
}

/**
 * Retorna uma gestão específica pelo ID para edição
 */
export async function getGestaoById(id: string) {
  const supabase = await createClient()
  const { data: gestao, error: gestaoError } = await supabase
    .from('gestoes')
    .select('*')
    .eq('id', id)
    .single()

  if (gestaoError) throw new Error('Gestão não encontrada')

  const { data: membros, error: membrosError } = await supabase
    .from('gestao_membros')
    .select('*')
    .eq('gestao_id', id)
    .order('ordem', { ascending: true })
    .order('criado_em', { ascending: true })

  if (membrosError) throw new Error('Erro ao buscar membros')

  return { ...gestao, membros }
}

/**
 * Cria uma nova gestão e gera as 6 cadeiras obrigatórias
 */
export async function criarGestao(nome: string): Promise<ActionResponse<string>> {
  try {
    const supabase = await createClient()
    
    // 1. Criar a gestão
    const { data: gestao, error: gestaoError } = await supabase
      .from('gestoes')
      .insert([{ nome, is_atual: false }])
      .select()
      .single()

    if (gestaoError) throw new Error('Erro ao criar gestão no banco de dados.')

    // 2. Criar as 6 cadeiras fixas obrigatórias
    const cadeirasFixas = [
      { gestao_id: gestao.id, cadeira_referencia: 'coord_1', cargo_nome: 'Coordenador(a) Geral', is_cargo_fixo: true, ordem: 1 },
      { gestao_id: gestao.id, cadeira_referencia: 'coord_2', cargo_nome: 'Coordenador(a) Geral', is_cargo_fixo: true, ordem: 2 },
      { gestao_id: gestao.id, cadeira_referencia: 'sec_geral', cargo_nome: 'Secretário(a) Geral', is_cargo_fixo: true, ordem: 3 },
      { gestao_id: gestao.id, cadeira_referencia: 'sec_adj', cargo_nome: 'Secretário(a) Adjunto(a)', is_cargo_fixo: true, ordem: 4 },
      { gestao_id: gestao.id, cadeira_referencia: 'tes_geral', cargo_nome: 'Tesoureiro(a) Geral', is_cargo_fixo: true, ordem: 5 },
      { gestao_id: gestao.id, cadeira_referencia: 'tes_adj', cargo_nome: 'Tesoureiro(a) Adjunto(a)', is_cargo_fixo: true, ordem: 6 },
    ]

    const { error: membrosError } = await supabase
      .from('gestao_membros')
      .insert(cadeirasFixas)

    if (membrosError) throw new Error('Erro ao criar cadeiras obrigatórias. A gestão pode estar corrompida.')

    revalidatePath('/admin/diretoria')
    return { success: true, data: gestao.id }
  } catch (err) {
    return handleError(err, 'Falha ao criar gestão.')
  }
}

/**
 * Exclui uma gestão inteira
 */
export async function deletarGestao(id: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    
    const { data: gestao } = await supabase.from('gestoes').select('is_atual').eq('id', id).single()
    if (gestao?.is_atual) {
      return { success: false, error: 'Não é possível excluir a gestão ativa. Defina outra como atual primeiro.' }
    }

    const { error } = await supabase
      .from('gestoes')
      .delete()
      .eq('id', id)

    if (error) throw new Error('Erro ao excluir gestão no banco.')

    revalidatePath('/admin/diretoria')
    revalidatePath('/diretoria/historico')
    return { success: true }
  } catch (err) {
    return handleError(err, 'Falha ao deletar gestão.')
  }
}

/**
 * Define qual é a gestão atual
 */
export async function definirGestaoAtual(id: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    
    const { error: errorUpdateAntigas } = await supabase
      .from('gestoes')
      .update({ is_atual: false })
      .eq('is_atual', true)

    if (errorUpdateAntigas) throw new Error('Erro interno ao limpar gestões antigas')

    const { error: errorMarcar } = await supabase
      .from('gestoes')
      .update({ is_atual: true })
      .eq('id', id)

    if (errorMarcar) throw new Error('Erro ao marcar nova gestão atual')

    revalidatePath('/admin/diretoria')
    revalidatePath('/diretoria')
    revalidatePath('/diretoria/historico')
    
    return { success: true }
  } catch (err) {
    return handleError(err, 'Falha ao definir gestão atual.')
  }
}

/**
 * Atualiza os dados de uma cadeira (nome do cargo, nome da pessoa, foto)
 */
export async function salvarCadeira(
  membroId: string, 
  dados: { cargo_nome: string; nome: string; foto_url: string | null }
): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('gestao_membros')
      .update({
        cargo_nome: dados.cargo_nome,
        nome: dados.nome,
        foto_url: dados.foto_url
      })
      .eq('id', membroId)

    if (error) throw new Error('Erro ao salvar dados do membro no banco.')
    
    revalidatePath('/admin/diretoria/[id]', 'page')
    revalidatePath('/diretoria')
    
    return { success: true }
  } catch (err) {
    return handleError(err, 'Falha ao salvar a cadeira.')
  }
}

/**
 * Adiciona um cargo extra (não eleito/não obrigatório)
 */
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
      .from('gestao_membros')
      .insert([novoCargo])
      .select()
      .single()

    if (error) throw new Error('Erro ao adicionar cargo extra no banco.')

    revalidatePath(`/admin/diretoria/${gestaoId}`)
    return { success: true, data }
  } catch (err) {
    return handleError(err, 'Falha ao adicionar cargo extra.')
  }
}

/**
 * Exclui um cargo extra (impede exclusão de cargos fixos)
 */
export async function excluirCargoExtra(membroId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    
    const { data: membro } = await supabase
      .from('gestao_membros')
      .select('is_cargo_fixo')
      .eq('id', membroId)
      .single()

    if (!membro) return { success: false, error: 'Membro não encontrado' }
    if (membro.is_cargo_fixo) return { success: false, error: 'Cadeiras estatutárias não podem ser apagadas.' }

    const { error } = await supabase
      .from('gestao_membros')
      .delete()
      .eq('id', membroId)

    if (error) throw new Error('Erro ao excluir cargo no banco.')

    revalidatePath('/admin/diretoria/[id]', 'page')
    return { success: true }
  } catch (err) {
    return handleError(err, 'Falha ao excluir cargo extra.')
  }
}
