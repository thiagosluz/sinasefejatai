import { beforeEach,describe, expect, it, vi } from 'vitest';

import { createClient } from '@/lib/supabase/server';

import { getGestaoAtualPublica, getGestaoById,getGestoes, getGestoesHistorico } from '../actions';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn()
}));

describe('diretoria actions', () => {
  let mockSupabase: Record<string, import('vitest').Mock | unknown>;
  let mockQuery: Record<string, import('vitest').Mock | unknown>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn()
    };
    mockQuery.then = (resolve: (val: unknown) => void) => resolve({ data: [], error: null });
    
    mockSupabase = {
      from: vi.fn().mockReturnValue(mockQuery)
    };
    (createClient as import('vitest').Mock).mockResolvedValue(mockSupabase);
  });

  describe('getGestoes', () => {
    it('deve retornar a lista de gestoes', async () => {
      mockQuery.then = (resolve: (val: unknown) => void) => resolve({ data: [{ id: 1 }], error: null });
      const result = await getGestoes();
      expect(result).toEqual([{ id: 1 }]);
    });

    it('deve retornar array vazio se houver erro', async () => {
      mockQuery.then = (resolve: (val: unknown) => void) => resolve({ data: null, error: { message: 'DB Error' } });
      const result = await getGestoes();
      expect(result).toEqual([]);
    });
  });

  describe('getGestaoAtualPublica', () => {
    it('deve retornar gestao atual e seus membros', async () => {
      (mockQuery.single as import('vitest').Mock).mockResolvedValueOnce({ data: { id: 'g1', is_atual: true } });
      mockQuery.then = (resolve: (val: unknown) => void) => resolve({ data: [{ id: 'm1' }], error: null });
      
      const result = await getGestaoAtualPublica();
      expect(result).toEqual({
        id: 'g1',
        is_atual: true,
        membros: [{ id: 'm1' }]
      });
    });

    it('deve retornar null se nao encontrar gestao atual', async () => {
      (mockQuery.single as import('vitest').Mock).mockResolvedValueOnce({ error: { message: 'Not found' } });
      const result = await getGestaoAtualPublica();
      expect(result).toBeNull();
    });
  });

  describe('getGestoesHistorico', () => {
    it('deve retornar historico ordenado', async () => {
      mockQuery.then = (resolve: (val: unknown) => void) => resolve({
        data: [{
          id: 'g2',
          gestao_membros: [{ ordem: 2, id: 'm2' }, { ordem: 1, id: 'm1' }]
        }],
        error: null
      });
      
      const result = await getGestoesHistorico();
      expect(result[0].membros[0].id).toBe('m1');
      expect(result[0].membros[1].id).toBe('m2');
    });
  });

  describe('getGestaoById', () => {
    it('deve retornar gestao e membros por ID', async () => {
      (mockQuery.single as import('vitest').Mock).mockResolvedValueOnce({ data: { id: 'g1' } });
      mockQuery.then = (resolve: (val: unknown) => void) => resolve({ data: [{ id: 'm1' }], error: null });
      
      const result = await getGestaoById('g1');
      expect(result).toEqual({ id: 'g1', membros: [{ id: 'm1' }] });
    });

    it('deve dar throw em caso de erro na gestao', async () => {
      (mockQuery.single as import('vitest').Mock).mockResolvedValueOnce({ error: { message: 'Not found' } });
      await expect(getGestaoById('g1')).rejects.toThrow('Gestão não encontrada');
    });
  });
});
