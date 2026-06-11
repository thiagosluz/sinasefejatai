'use server'

import crypto from 'crypto'

import { ActionResponse } from '@/lib/action-utils'
import { createClient } from '@/lib/supabase/server'

export interface Assinatura {
  id: string
  usuario_id: string
  nome_assinante: string
  cargo_assinante: string
  data_assinatura: string
}

export interface DocumentoVerificacao {
  id: string
  tipo_documento: string
  documento_id: string
  codigo_verificador: string
  codigo_autenticacao: string
  created_at: string
  assinaturas: Assinatura[]
}

// Retorna os dados do lacre se ele existir
export async function getDocumentoVerificacao(tipo_documento: string, documento_id: string): Promise<DocumentoVerificacao | null> {
  const supabase = await createClient()

  // 1. Busca o lacre
  const { data: verificacao } = await supabase
    .from('documento_verificacoes')
    .select('*')
    .eq('tipo_documento', tipo_documento)
    .eq('documento_id', documento_id)
    .single()

  if (!verificacao) return null

  // 2. Busca as assinaturas vinculadas
  const { data: assinaturas } = await supabase
    .from('documento_assinaturas')
    .select('*')
    .eq('verificacao_id', verificacao.id)
    .order('data_assinatura', { ascending: true })

  return {
    ...verificacao,
    assinaturas: assinaturas || []
  }
}

// Busca os dados do usuário para a assinatura baseando-se no vínculo de perfil e gestão atual
export async function getAssinanteInfo(): Promise<ActionResponse<{ nome: string, cargo: string }>> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Usuário não autenticado.' }

  // Busca o perfil
  const { data: perfil } = await supabase
    .from('perfis')
    .select('filiado_id')
    .eq('id', user.id)
    .single()
    
  if (!perfil?.filiado_id) return { success: false, error: 'Seu usuário não possui um perfil de filiado vinculado.' }

  // Busca o nome do filiado
  const { data: filiado } = await supabase
    .from('filiados')
    .select('nome')
    .eq('id', perfil.filiado_id)
    .single()
    
  if (!filiado?.nome) return { success: false, error: 'Nome do filiado não encontrado.' }

  // Busca o cargo atual (apenas em gestões ativas)
  // Como `gestoes` tem is_atual, fazemos um join. 
  // No Supabase, gestao_membros tem gestao_id.
  const { data: cargo, error: cargoError } = await supabase
    .from('gestao_membros')
    .select('cargo_nome, gestoes!inner(is_atual)')
    .eq('filiado_id', perfil.filiado_id)
    .eq('gestoes.is_atual', true)
    .order('criado_em', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (cargoError) {
    console.error('Erro ao buscar cargo do assinante:', cargoError)
  }

  if (!cargo || !cargo.cargo_nome) {
    return { success: false, error: 'Você não possui um cargo ativo na diretoria atual para assinar este documento.' }
  }

  return { success: true, data: { nome: filiado.nome, cargo: cargo.cargo_nome } }
}

// Função para o botão de "Assinar"
export async function assinarDocumento(
  tipo_documento: string, 
  documento_id: string, 
  senha_usuario: string
): Promise<ActionResponse> {
  const supabase = await createClient()
  
  // 1. Pega usuário atual e verifica a senha
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) {
    return { success: false, error: 'Você precisa estar logado para assinar.' }
  }

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: senha_usuario
  })

  if (authError) {
    return { success: false, error: 'Senha incorreta. Não foi possível validar a assinatura.' }
  }

  // Busca nome e cargo garantidos do banco
  const infoResponse = await getAssinanteInfo()
  if (!infoResponse.success) {
    return { success: false, error: infoResponse.error || 'Não foi possível confirmar seu cargo.' }
  }
  if (!infoResponse.data) {
    return { success: false, error: 'Dados do assinante não encontrados.' }
  }
  
  const nome_assinante = infoResponse.data.nome
  const cargo_assinante = infoResponse.data.cargo

  // 2. Verifica se o documento já tem um "Lacre" (documento_verificacoes). Se não, cria um.
  let verificacaoId: string

  const { data: verificacaoAtual } = await supabase
    .from('documento_verificacoes')
    .select('id')
    .eq('tipo_documento', tipo_documento)
    .eq('documento_id', documento_id)
    .single()

  if (verificacaoAtual) {
    verificacaoId = verificacaoAtual.id
  } else {
    // Gerar o Hash de Autenticação (10 chars hex) que é garantidamente único
    const codigo_autenticacao = crypto.randomBytes(5).toString('hex')

    // Gerar Código Verificador de 6 dígitos garantindo unicidade
    let codigo_verificador = ''
    let codigoUnicoEncontrado = false
    let tentativas = 0

    while (!codigoUnicoEncontrado && tentativas < 10) {
      codigo_verificador = Math.floor(100000 + Math.random() * 900000).toString() // 6 digitos
      
      const { data: verifExistente } = await supabase
        .from('documento_verificacoes')
        .select('id')
        .eq('codigo_verificador', codigo_verificador)
        .maybeSingle()

      if (!verifExistente) {
        codigoUnicoEncontrado = true
      }
      tentativas++
    }

    if (!codigoUnicoEncontrado) {
      return { success: false, error: 'Erro ao gerar número de verificação único. Tente novamente.' }
    }

    const { data: novaVerificacao, error: verifError } = await supabase
      .from('documento_verificacoes')
      .insert({
        tipo_documento,
        documento_id,
        codigo_verificador,
        codigo_autenticacao
      })
      .select('id')
      .single()

    if (verifError) {
      return { success: false, error: 'Erro ao criar lacre de autenticidade no banco.' }
    }
    verificacaoId = novaVerificacao.id
  }

  // 3. Insere a assinatura do usuário (falha silenciosamente se a restrição de unicidade "verificacao_id + usuario_id" bater)
  const { error: signError } = await supabase
    .from('documento_assinaturas')
    .insert({
      verificacao_id: verificacaoId,
      usuario_id: user.id,
      nome_assinante,
      cargo_assinante
    })

  if (signError) {
    if (signError.code === '23505') { // Postgres Unique Violation
      return { success: false, error: 'Você já assinou este documento.' }
    }
    return { success: false, error: 'Falha ao gravar assinatura.' }
  }

  return { success: true }
}

// Função para deletar uma assinatura específica
export async function removerAssinatura(assinatura_id: string): Promise<ActionResponse> {
  const supabase = await createClient()
  
  // Verifica o usuário (DAL básico)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Não autorizado.' }
  }

  const { error } = await supabase
    .from('documento_assinaturas')
    .delete()
    .eq('id', assinatura_id)

  if (error) {
    return { success: false, error: 'Erro ao remover a assinatura.' }
  }

  return { success: true }
}
