import { beforeEach,describe, expect, it, vi } from 'vitest';

import { assinarDocumento, getDocumentoVerificacao, removerAssinatura } from '@/lib/actions-assinaturas';
import { createClient } from '@/lib/supabase/server';

// Mock do supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn()
}));

describe('actions-assinaturas', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configura o mock base
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1', email: 'test@example.com' } } }),
        signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null })
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      maybeSingle: vi.fn(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis()
    };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (createClient as any).mockResolvedValue(mockSupabase);
  });

  describe('getDocumentoVerificacao', () => {
    it('deve retornar null se nao encontrar verificacao', async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: null });
      const result = await getDocumentoVerificacao('recibo', 'doc-1');
      expect(result).toBeNull();
    });

    it('deve retornar verificacao com assinaturas', async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: { id: 'verif-1', tipo_documento: 'recibo' } });
      mockSupabase.order.mockResolvedValueOnce({ data: [{ id: 'assinatura-1' }] });
      
      const result = await getDocumentoVerificacao('recibo', 'doc-1');
      expect(result).toEqual({
        id: 'verif-1',
        tipo_documento: 'recibo',
        assinaturas: [{ id: 'assinatura-1' }]
      });
    });
  });

  describe('assinarDocumento', () => {
    it('deve retornar erro se usuario nao autenticado', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } });
      const result = await assinarDocumento('recibo', 'doc-1', 'senha');
      expect(result.success).toBe(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result as any).error).toBe('Você precisa estar logado para assinar.');
    });

    it('deve retornar erro se senha incorreta', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({ error: { message: 'Invalid login' } });
      const result = await assinarDocumento('recibo', 'doc-1', 'senhaerrada');
      expect(result.success).toBe(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result as any).error).toContain('Senha incorreta');
    });
  });

  describe('removerAssinatura', () => {
    it('deve remover a assinatura', async () => {
      mockSupabase.delete.mockReturnThis();
      mockSupabase.eq.mockResolvedValueOnce({ error: null });
      
      const result = await removerAssinatura('assinatura-1');
      expect(result.success).toBe(true);
    });

    it('deve retornar erro se falhar no banco', async () => {
      mockSupabase.delete.mockReturnThis();
      mockSupabase.eq.mockResolvedValueOnce({ error: { message: 'Erro DB' } });
      
      const result = await removerAssinatura('assinatura-1');
      expect(result.success).toBe(false);
    });
  });
});
