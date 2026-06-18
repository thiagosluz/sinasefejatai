'use server'

import { revalidatePath } from 'next/cache'
import * as xlsx from 'xlsx'

import { ActionResponse, handleError } from '@/lib/action-utils'
import { requireAdmin } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'

export async function addFiliado(formData: FormData): Promise<ActionResponse> {
  const nome = formData.get('nome') as string
  const email = formData.get('email') as string
  const telefone = formData.get('telefone') as string
  const siape = formData.get('siape') as string
  const cargo = formData.get('cargo') as string
  const data_nascimento = formData.get('data_nascimento') as string
  const nome_pai = formData.get('nome_pai') as string
  const nome_mae = formData.get('nome_mae') as string
  const cpf = formData.get('cpf') as string
  const rg = formData.get('rg') as string
  const sexo = formData.get('sexo') as string
  const endereco_rua = formData.get('endereco_rua') as string
  const endereco_bairro = formData.get('endereco_bairro') as string
  const endereco_cep = formData.get('endereco_cep') as string
  const endereco_cidade = formData.get('endereco_cidade') as string
  const endereco_estado = formData.get('endereco_estado') as string
  const unidade_lotacao = formData.get('unidade_lotacao') as string
  const campus = formData.get('campus') as string
  const categoria = formData.get('categoria') as string
  const situacao = formData.get('situacao') as string

  if (!nome) {
    return { success: false, error: 'O nome é obrigatório' }
  }

  try {
    await requireAdmin()
    const supabase = await createClient()
    const { error } = await supabase.from('filiados').insert({
      nome,
      email: email || null,
      telefone: telefone || null,
      siape: siape || null,
      cargo: cargo || null,
      data_nascimento: data_nascimento || null,
      nome_pai: nome_pai || null,
      nome_mae: nome_mae || null,
      cpf: cpf || null,
      rg: rg || null,
      sexo: sexo || null,
      endereco_rua: endereco_rua || null,
      endereco_bairro: endereco_bairro || null,
      endereco_cep: endereco_cep || null,
      endereco_cidade: endereco_cidade || null,
      endereco_estado: endereco_estado || null,
      unidade_lotacao: unidade_lotacao || null,
      campus: campus || null,
      categoria: categoria || null,
      situacao: situacao || null,
    })

    if (error) {
      return { success: false, error: 'Falha ao cadastrar filiado no banco.' }
    }

    revalidatePath('/admin/filiados')
    return { success: true }
  } catch (err) {
    return handleError(err, 'Ocorreu um erro inesperado ao cadastrar.')
  }
}

export async function editFiliado(id: string, formData: FormData): Promise<ActionResponse> {
  const nome = formData.get('nome') as string
  const email = formData.get('email') as string
  const telefone = formData.get('telefone') as string
  const siape = formData.get('siape') as string
  const cargo = formData.get('cargo') as string
  const data_nascimento = formData.get('data_nascimento') as string
  const nome_pai = formData.get('nome_pai') as string
  const nome_mae = formData.get('nome_mae') as string
  const cpf = formData.get('cpf') as string
  const rg = formData.get('rg') as string
  const sexo = formData.get('sexo') as string
  const endereco_rua = formData.get('endereco_rua') as string
  const endereco_bairro = formData.get('endereco_bairro') as string
  const endereco_cep = formData.get('endereco_cep') as string
  const endereco_cidade = formData.get('endereco_cidade') as string
  const endereco_estado = formData.get('endereco_estado') as string
  const unidade_lotacao = formData.get('unidade_lotacao') as string
  const campus = formData.get('campus') as string
  const categoria = formData.get('categoria') as string
  const situacao = formData.get('situacao') as string
  const ativo = formData.get('ativo') === 'on'

  if (!nome) {
    return { success: false, error: 'O nome é obrigatório' }
  }

  try {
    await requireAdmin()
    const supabase = await createClient()
    const { error } = await supabase
      .from('filiados')
      .update({
        nome,
        email: email || null,
        telefone: telefone || null,
        siape: siape || null,
        cargo: cargo || null,
        data_nascimento: data_nascimento || null,
        nome_pai: nome_pai || null,
        nome_mae: nome_mae || null,
        cpf: cpf || null,
        rg: rg || null,
        sexo: sexo || null,
        endereco_rua: endereco_rua || null,
        endereco_bairro: endereco_bairro || null,
        endereco_cep: endereco_cep || null,
        endereco_cidade: endereco_cidade || null,
        endereco_estado: endereco_estado || null,
        unidade_lotacao: unidade_lotacao || null,
        campus: campus || null,
        categoria: categoria || null,
        situacao: situacao || null,
        ativo,
      })
      .eq('id', id)

    if (error) {
      return { success: false, error: 'Falha ao editar filiado no banco.' }
    }

    revalidatePath('/admin/filiados')
    return { success: true }
  } catch (err) {
    return handleError(err, 'Ocorreu um erro inesperado ao editar.')
  }
}

export async function toggleAtivo(id: string, currentStatus: boolean): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { error } = await supabase
      .from('filiados')
      .update({ ativo: !currentStatus })
      .eq('id', id)

    if (error) {
      return { success: false, error: 'Falha ao alterar status no banco.' }
    }

    revalidatePath('/admin/filiados')
    return { success: true }
  } catch (err) {
    return handleError(err, 'Falha ao alterar status')
  }
}

export async function aprovarPedido(id: string): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { error } = await supabase
      .from('filiados')
      .update({ status_filiacao: 'aprovado', ativo: true })
      .eq('id', id)

    if (error) {
      return { success: false, error: 'Falha ao aprovar pedido.' }
    }

    revalidatePath('/admin/filiados')
    return { success: true }
  } catch (err) {
    return handleError(err, 'Ocorreu um erro ao aprovar o pedido.')
  }
}

export async function desfiliar(id: string): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { error } = await supabase
      .from('filiados')
      .update({ status_filiacao: 'desfiliado', ativo: false })
      .eq('id', id)

    if (error) {
      return { success: false, error: 'Falha ao processar desfiliação.' }
    }

    revalidatePath('/admin/filiados')
    return { success: true }
  } catch (err) {
    return handleError(err, 'Ocorreu um erro ao processar desfiliação.')
  }
}

export async function uploadFicha(id: string, formData: FormData): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const file = formData.get('file') as File
    const tipo = formData.get('tipo') as 'filiacao' | 'desfiliacao'

    if (!file || file.size === 0) {
      return { success: false, error: 'Nenhum arquivo enviado.' }
    }

    const supabase = await createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${tipo}_${id}_${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documentos_filiados')
      .upload(fileName, file)

    if (uploadError) {
      console.error(uploadError)
      return { success: false, error: 'Falha ao enviar arquivo para o Storage.' }
    }

    const { data: publicUrlData } = supabase.storage
      .from('documentos_filiados')
      .getPublicUrl(uploadData.path)

    const updatePayload = tipo === 'filiacao' 
      ? { arquivo_ficha_filiacao: publicUrlData.publicUrl }
      : { arquivo_ficha_desfiliacao: publicUrlData.publicUrl }

    const { error: dbError } = await supabase
      .from('filiados')
      .update(updatePayload)
      .eq('id', id)

    if (dbError) {
      return { success: false, error: 'Arquivo enviado, mas falha ao salvar URL no cadastro.' }
    }

    revalidatePath('/admin/filiados')
    return { success: true }
  } catch (err) {
    return handleError(err, 'Erro inesperado ao realizar upload.')
  }
}

export async function deleteFicha(id: string, tipo: 'filiacao' | 'desfiliacao'): Promise<ActionResponse> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const updatePayload = tipo === 'filiacao'
      ? { arquivo_ficha_filiacao: null }
      : { arquivo_ficha_desfiliacao: null }

    const { error: dbError } = await supabase
      .from('filiados')
      .update(updatePayload)
      .eq('id', id)

    if (dbError) {
      return { success: false, error: 'Falha ao remover arquivo do cadastro.' }
    }

    revalidatePath('/admin/filiados')
    return { success: true }
  } catch (err) {
    return handleError(err, 'Erro inesperado ao remover arquivo.')
  }
}

export async function importarPlanilha(formData: FormData): Promise<ActionResponse & { criados?: number, ignorados?: number }> {
  try {
    await requireAdmin()
    const file = formData.get('file') as File
    if (!file || file.size === 0) return { success: false, error: 'Nenhum arquivo enviado.' }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const workbook = xlsx.read(buffer, { type: 'buffer', cellDates: true })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const rows = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet)

    if (!rows || rows.length === 0) return { success: false, error: 'Planilha vazia ou em formato inválido.' }

    const supabase = await createClient()

    const { data: existentes, error } = await supabase.from('filiados').select('cpf, siape')
    if (error) return { success: false, error: 'Erro ao buscar filiados existentes.' }

    const cpfsExistentes = new Set(existentes?.map(f => f.cpf).filter(Boolean))
    const siapesExistentes = new Set(existentes?.map(f => f.siape).filter(Boolean))

    const novosCadastros: Record<string, unknown>[] = []
    let ignorados = 0

    for (const row of rows) {
      const rawCpf = row['CPF']?.toString() || ''
      const cpfLimpo = rawCpf.replace(/[^\d]/g, '')
      const matricula = row['Matricula']?.toString() || ''

      if (
        (cpfLimpo && cpfsExistentes.has(rawCpf)) || 
        (cpfLimpo && cpfsExistentes.has(cpfLimpo)) ||
        (matricula && siapesExistentes.has(matricula))
      ) {
        ignorados++
        continue
      }

      if (!row['Nome']) {
        ignorados++
        continue
      }

      const numStr = row['Número'] ? `, ${row['Número']}` : ''
      const compStr = row['Complemento'] ? ` - ${row['Complemento']}` : ''
      const endereco = row['Endereço'] ? `${row['Endereço']}${numStr}${compStr}` : null
      
      const isAssociado = row['Associado'] === 'Sim' || row['Associado'] === 'SIM' || row['Associado'] === 'sim'

      let dataNascimento = null
      if (row['Data de Nascimento'] instanceof Date) {
        dataNascimento = row['Data de Nascimento'].toISOString().split('T')[0]
      } else if (typeof row['Data de Nascimento'] === 'string') {
        dataNascimento = row['Data de Nascimento']
      }

      novosCadastros.push({
        nome: row['Nome'],
        cpf: rawCpf || null,
        rg: row['Identidade-RG']?.toString() || null,
        siape: matricula || null,
        sexo: row['Sexo'] || null,
        email: row['Email'] || null,
        telefone: row['Celular']?.toString() || row['Fone Comercial']?.toString() || null,
        endereco_rua: endereco,
        endereco_bairro: row['Bairro'] || null,
        endereco_cidade: row['Cidade'] || null,
        endereco_estado: row['Estado'] || null,
        endereco_cep: row['CEP']?.toString() || null,
        campus: row['Lotação'] || null,
        unidade_lotacao: row['Lotação'] || null,
        categoria: row['Função/Categoria'] || null,
        cargo: row['Cargo na Empresa'] || null,
        situacao: row['Situação Empresa'] || null,
        data_nascimento: dataNascimento,
        nome_pai: row['Nome do Pai'] || null,
        nome_mae: row['Nome da Mãe'] || null,
        ativo: isAssociado,
        status_filiacao: isAssociado ? 'aprovado' : 'pendente'
      })
      
      if (cpfLimpo) cpfsExistentes.add(cpfLimpo)
      if (rawCpf) cpfsExistentes.add(rawCpf)
      if (matricula) siapesExistentes.add(matricula)
    }

    if (novosCadastros.length > 0) {
      // Chunking by 500 records to be safe with Supabase limits
      const chunkSize = 500
      for (let i = 0; i < novosCadastros.length; i += chunkSize) {
        const chunk = novosCadastros.slice(i, i + chunkSize)
        const { error: insertError } = await supabase.from('filiados').insert(chunk)
        if (insertError) {
          console.error(insertError)
          return { success: false, error: 'Erro ao inserir novos filiados no banco.' }
        }
      }
    }

    revalidatePath('/admin/filiados')
    return { success: true, criados: novosCadastros.length, ignorados }
  } catch (err) {
    console.error(err)
    return handleError(err, 'Erro inesperado ao processar planilha.')
  }
}
