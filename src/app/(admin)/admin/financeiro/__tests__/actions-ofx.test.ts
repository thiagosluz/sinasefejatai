import { beforeEach,describe, expect, it, vi } from 'vitest'

import { checkExistingTransactions, importTransactions, SaveTransaction } from '../actions-ofx'

// 1. Mock Supabase Server Client
const mockInsert = vi.fn()
const mockSelect = vi.fn()
const mockIn = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'financeiro') {
        return {
          insert: mockInsert,
          select: mockSelect,
        }
      }
      return {}
    }),
  })),
}))

// 2. Mock Next.js Cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Financeiro OFX Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSelect.mockReturnValue({ in: mockIn })
  })

  describe('checkExistingTransactions', () => {
    it('deve retornar array vazio se a lista de fitids for vazia', async () => {
      const result = await checkExistingTransactions([])
      expect(result).toEqual([])
      expect(mockSelect).not.toHaveBeenCalled()
    })

    it('deve consultar o banco e retornar a lista de banco_ids encontrados', async () => {
      mockIn.mockResolvedValueOnce({
        data: [{ banco_id: 'fit-1' }, { banco_id: 'fit-2' }],
        error: null,
      })

      const result = await checkExistingTransactions(['fit-1', 'fit-2', 'fit-3'])
      expect(mockSelect).toHaveBeenCalledWith('banco_id')
      expect(mockIn).toHaveBeenCalledWith('banco_id', ['fit-1', 'fit-2', 'fit-3'])
      expect(result).toEqual(['fit-1', 'fit-2'])
    })

    it('deve retornar array vazio em caso de erro na consulta', async () => {
      mockIn.mockResolvedValueOnce({
        data: null,
        error: { message: 'Erro no Banco' },
      })

      const result = await checkExistingTransactions(['fit-1'])
      expect(result).toEqual([])
    })
  })

  describe('importTransactions', () => {
    it('deve retornar erro se nenhuma transação for passada', async () => {
      const result = await importTransactions([])
      expect(result).toEqual({
        success: false,
        error: 'Nenhum lançamento selecionado para importação.',
      })
      expect(mockInsert).not.toHaveBeenCalled()
    })

    it('deve inserir as transações em lote no banco com sucesso', async () => {
      mockInsert.mockResolvedValueOnce({ error: null })

      const txs: SaveTransaction[] = [
        {
          data: '2026-05-26',
          tipo: 'Entrada',
          descricao: 'Pix Recebido',
          valor: 100,
          categoria: 'Contribuições',
          banco_id: 'fit-1',
        },
      ]

      const result = await importTransactions(txs)
      expect(mockInsert).toHaveBeenCalledWith(txs)
      expect(result).toEqual({
        success: true,
        message: '1 lançamentos importados com sucesso!',
        data: { count: 1 },
      })
    })

    it('deve retornar erro em caso de falha no insert do banco', async () => {
      mockInsert.mockResolvedValueOnce({ error: { message: 'Erro no Banco' } })

      const txs: SaveTransaction[] = [
        {
          data: '2026-05-26',
          tipo: 'Entrada',
          descricao: 'Pix Recebido',
          valor: 100,
          categoria: 'Contribuições',
          banco_id: 'fit-1',
        },
      ]

      const result = await importTransactions(txs)
      expect(result).toEqual({
        success: false,
        error: 'Ocorreu um erro ao salvar os lançamentos no banco de dados. Verifique os dados.',
      })
    })
  })
})
