import { revalidatePath } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { cancelarDocumentoAdministrativo,excluirDocumentoAdministrativo, salvarDocumentoAdministrativo } from '../actions'
import * as TiposDocumento from '../lib/tipos-documento'

// Mocks
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/dal', () => ({
  requireAdmin: vi.fn().mockResolvedValue({ id: 'user-id-123' }),
}))

vi.spyOn(TiposDocumento, 'getSlugByTipo').mockReturnValue('slug-mock')

// Cria um mock do supabase builder para conseguirmos encadear chamadas (select, insert, etc)
const { mockSupabaseBuilder, mockFrom } = vi.hoisted(() => {
  const builder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { id: 'doc-123' }, error: null }),
  }
  return {
    mockSupabaseBuilder: builder,
    mockFrom: vi.fn(() => builder),
  }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: mockFrom,
  }),
}))

describe('Documentos Administrativos Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock results for 'from' chains
    mockSupabaseBuilder.limit.mockResolvedValue({
      data: [{ numero: '005/2026' }, { numero: '002/2026' }],
      error: null,
    } as never)
    
    mockSupabaseBuilder.single.mockResolvedValue({
      data: { id: 'doc-123' },
      error: null,
    } as never)
  })

  describe('salvarDocumentoAdministrativo', () => {
    it('deve gerar a numeração correta e salvar um novo recibo', async () => {
      const input = {
        tipo: 'recibo_pagamento',
        titulo: 'Recibo Teste',
        dados: { valor: 100 },
      }

      const result = await salvarDocumentoAdministrativo(input)

      // Se havia 005/2026, o próximo deve ser 006/2026
      expect(mockSupabaseBuilder.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            numero: expect.stringMatching(/006\/\d{4}/),
            tipo: 'recibo_pagamento',
            autor_id: 'user-id-123',
          })
        ])
      )
      expect(result).toEqual({ id: 'doc-123' })
      expect(revalidatePath).toHaveBeenCalledWith('/admin/documentos')
    })

    it('deve utilizar a numeração passada no input, caso exista', async () => {
      const input = {
        tipo: 'recibo_pagamento',
        titulo: 'Recibo Fixo',
        numero: '999/2025',
        dados: { valor: 100 },
      }

      await salvarDocumentoAdministrativo(input)

      expect(mockSupabaseBuilder.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            numero: '999/2025',
          })
        ])
      )
    })

    it('deve retornar erro se a inserção falhar no Supabase', async () => {
      mockSupabaseBuilder.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Erro ao inserir' },
      } as never)

      const input = {
        tipo: 'outro_doc',
        titulo: 'Documento Invalido',
        dados: {},
      }

      await expect(salvarDocumentoAdministrativo(input)).rejects.toThrow('Falha ao registrar o documento no sistema.')
    })
  })

  describe('excluirDocumentoAdministrativo', () => {
    it('deve deletar o documento com o ID fornecido', async () => {
      await excluirDocumentoAdministrativo('doc-excluir')

      expect(mockSupabaseBuilder.delete).toHaveBeenCalled()
      expect(mockSupabaseBuilder.eq).toHaveBeenCalledWith('id', 'doc-excluir')
      expect(revalidatePath).toHaveBeenCalledWith('/admin/documentos')
    })

    it('deve lançar erro se o delete falhar', async () => {
      // Ignora a exclusão em cascata retornando null no single
      mockSupabaseBuilder.single.mockResolvedValueOnce({ data: null, error: null })
      
      // O primeiro eq() (do select de verificações) deve continuar o chain
      mockSupabaseBuilder.eq.mockImplementationOnce(() => mockSupabaseBuilder)
      
      // O segundo eq() (do delete do documento principal) deve retornar o erro
      mockSupabaseBuilder.eq.mockResolvedValueOnce({
        error: { message: 'Erro ao deletar' },
      } as never)

      await expect(excluirDocumentoAdministrativo('doc-erro')).rejects.toThrow('Erro ao excluir documento.')
    })
  })

  describe('cancelarDocumentoAdministrativo', () => {
    it('deve alterar o status para cancelado', async () => {
      await cancelarDocumentoAdministrativo('doc-cancelar')

      expect(mockSupabaseBuilder.update).toHaveBeenCalledWith({ status: 'cancelado' })
      expect(mockSupabaseBuilder.eq).toHaveBeenCalledWith('id', 'doc-cancelar')
      expect(revalidatePath).toHaveBeenCalledWith('/admin/documentos')
    })

    it('deve lançar erro se o update falhar', async () => {
      // Primeiro eq é do select (retorna builder), segundo eq é do update (retorna o erro mockado)
      mockSupabaseBuilder.eq.mockReturnValueOnce(mockSupabaseBuilder)
      mockSupabaseBuilder.eq.mockResolvedValueOnce({
        error: { message: 'Erro ao cancelar' },
      } as never)

      await expect(cancelarDocumentoAdministrativo('doc-erro')).rejects.toThrow('Erro ao cancelar documento: Erro ao cancelar')
    })
  })
})
