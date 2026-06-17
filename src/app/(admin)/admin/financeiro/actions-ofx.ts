'use server'

import { revalidatePath } from 'next/cache'

import { ActionResponse, handleError } from '@/lib/action-utils'
import { createClient } from '@/lib/supabase/server'

export interface SaveTransaction {
  data: string;
  tipo: 'Entrada' | 'Saída';
  descricao: string;
  valor: number;
  categoria_id: string;
  banco_id: string;
}

/**
 * Consulta a tabela financeiro e retorna todos os banco_ids (FITIDs) que já estão cadastrados
 * dentre a lista fornecida, para evitar duplicidades na interface do usuário.
 */
export async function checkExistingTransactions(fitids: string[]): Promise<string[]> {
  if (!fitids || fitids.length === 0) return [];
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('financeiro')
    .select('banco_id')
    .in('banco_id', fitids);

  if (error) {
    console.error('Erro ao verificar transações existentes:', error);
    return [];
  }

  return (data?.map((item) => item.banco_id).filter(Boolean) as string[]) || [];
}

/**
 * Realiza a inserção em lote de transações bancárias conciliadas.
 */
export async function importTransactions(
  transactions: SaveTransaction[]
): Promise<ActionResponse<{ count: number }>> {
  try {
    if (!transactions || transactions.length === 0) {
      return { success: false, error: 'Nenhum lançamento selecionado para importação.' };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('financeiro')
      .insert(transactions);

    if (error) {
      return { success: false, error: 'Ocorreu um erro ao salvar os lançamentos no banco de dados. Verifique os dados.' };
    }

    revalidatePath('/financeiro');
    revalidatePath('/financeiro/prestacao');

    return { 
      success: true, 
      message: `${transactions.length} lançamentos importados com sucesso!`, 
      data: { count: transactions.length }
    };
  } catch (err) {
    return handleError(err, 'Ocorreu um erro inesperado ao importar lançamentos.');
  }
}
