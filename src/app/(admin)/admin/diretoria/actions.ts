'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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
export async function criarGestao(nome: string) {
  const supabase = await createClient()
  
  // 1. Criar a gestão
  const { data: gestao, error: gestaoError } = await supabase
    .from('gestoes')
    .insert([{ nome, is_atual: false }])
    .select()
    .single()

  if (gestaoError) {
    console.error('Erro ao criar gestão:', gestaoError)
    throw new Error('Erro ao criar gestão')
  }

  // 2. Criar as 6 cadeiras fixas obrigatórias (com nomes genéricos que podem ser editados depois)
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

  if (membrosError) {
    console.error('Erro ao criar cadeiras fixas:', membrosError)
    throw new Error('Erro ao criar cadeiras obrigatórias. A gestão pode estar corrompida.')
  }

  revalidatePath('/admin/diretoria')
  return gestao.id
}

/**
 * Exclui uma gestão inteira
 */
export async function deletarGestao(id: string) {
  const supabase = await createClient()
  
  // Primeiro, vamos garantir que se ela for "atual", não pode ser deletada facilmente
  // Ou podemos permitir e o portal fica sem diretoria atual até o admin definir outra.
  const { data: gestao } = await supabase.from('gestoes').select('is_atual').eq('id', id).single()
  if (gestao?.is_atual) {
    throw new Error('Não é possível excluir a gestão ativa. Defina outra como atual primeiro.')
  }

  const { error } = await supabase
    .from('gestoes')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao excluir gestão:', error)
    throw new Error('Erro ao excluir gestão')
  }

  revalidatePath('/admin/diretoria')
  revalidatePath('/diretoria/historico')
}

/**
 * Define qual é a gestão atual
 */
export async function definirGestaoAtual(id: string) {
  const supabase = await createClient()
  
  // Como temos um index unique em is_atual = true, precisamos primeiro 
  // desmarcar a atual e depois marcar a nova.
  
  // 1. Desmarcar as existentes
  const { error: errorUpdateAntigas } = await supabase
    .from('gestoes')
    .update({ is_atual: false })
    .eq('is_atual', true)

  if (errorUpdateAntigas) {
    console.error('Erro ao limpar gestões antigas:', errorUpdateAntigas)
    throw new Error('Erro interno ao atualizar gestões')
  }

  // 2. Marcar a nova
  const { error: errorMarcar } = await supabase
    .from('gestoes')
    .update({ is_atual: true })
    .eq('id', id)

  if (errorMarcar) {
    console.error('Erro ao marcar nova gestão atual:', errorMarcar)
    throw new Error('Erro ao definir gestão como atual')
  }

  revalidatePath('/admin/diretoria')
  revalidatePath('/diretoria')
  revalidatePath('/diretoria/historico')
}

/**
 * Atualiza os dados de uma cadeira (nome do cargo, nome da pessoa, foto)
 */
export async function salvarCadeira(
  membroId: string, 
  dados: { cargo_nome: string; nome: string; foto_url: string | null }
) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('gestao_membros')
    .update({
      cargo_nome: dados.cargo_nome,
      nome: dados.nome,
      foto_url: dados.foto_url
    })
    .eq('id', membroId)

  if (error) {
    console.error('Erro ao salvar cadeira:', error)
    throw new Error('Erro ao salvar dados do membro')
  }
  
  // Precisamos de um revalidate mais genérico porque não temos o ID da gestão facilmente aqui
  revalidatePath('/admin/diretoria/[id]', 'page')
  revalidatePath('/diretoria')
}

/**
 * Adiciona um cargo extra (não eleito/não obrigatório)
 */
export async function adicionarCargoExtra(gestaoId: string) {
  const supabase = await createClient()
  
  const novoCargo = {
    gestao_id: gestaoId,
    cadeira_referencia: 'extra',
    cargo_nome: 'Novo Cargo',
    nome: '',
    foto_url: null,
    is_cargo_fixo: false,
    ordem: 99 // Jogar pro final
  }

  const { data, error } = await supabase
    .from('gestao_membros')
    .insert([novoCargo])
    .select()
    .single()

  if (error) {
    console.error('Erro ao adicionar cargo extra:', error)
    throw new Error('Erro ao adicionar cargo extra')
  }

  revalidatePath(`/admin/diretoria/${gestaoId}`)
  return data
}

/**
 * Exclui um cargo extra (impede exclusão de cargos fixos)
 */
export async function excluirCargoExtra(membroId: string) {
  const supabase = await createClient()
  
  // Verificar se é cargo fixo
  const { data: membro } = await supabase
    .from('gestao_membros')
    .select('is_cargo_fixo, foto_url')
    .eq('id', membroId)
    .single()

  if (!membro) throw new Error('Membro não encontrado')
  if (membro.is_cargo_fixo) throw new Error('Cadeiras estatutárias não podem ser apagadas.')

  const { error } = await supabase
    .from('gestao_membros')
    .delete()
    .eq('id', membroId)

  if (error) {
    console.error('Erro ao excluir cargo:', error)
    throw new Error('Erro ao excluir cargo')
  }

  // Se houver foto e você quiser apagar do storage, precisa lidar com isso, 
  // mas como o Supabase Storage pode ser limpo por triggers ou mantido, vamos apenas deletar o registro
  revalidatePath('/admin/diretoria/[id]', 'page')
}
