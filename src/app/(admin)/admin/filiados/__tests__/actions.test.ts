import { beforeEach,describe, expect, it, vi } from 'vitest';

import { addFiliado, editFiliado, toggleAtivo } from '../actions';

// 1. Mock Next.js Navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`Redirected to: ${url}`);
  }),
}));

// 2. Mock Next.js Cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// 3. Mock Supabase Server Client
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'filiados') {
        return {
          insert: mockInsert,
          update: mockUpdate,
        };
      }
      return {};
    }),
  })),
}));

describe('Filiados Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdate.mockReturnValue({ eq: mockEq });
  });

  describe('addFiliado', () => {
    it('deve retornar erro se o nome estiver ausente', async () => {
      const formData = new FormData();
      formData.append('email', 'teste@teste.com');

      const result = await addFiliado(formData);
      expect(result).toEqual({ success: false, error: 'O nome é obrigatório' });
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('deve inserir no banco e retornar sucesso', async () => {
      const formData = new FormData();
      formData.append('nome', 'João Teste');
      formData.append('email', 'joao@teste.com');

      mockInsert.mockResolvedValueOnce({ error: null });

      const result = await addFiliado(formData);
      expect(result).toEqual({ success: true });
      
      expect(mockInsert).toHaveBeenCalledWith({
        nome: 'João Teste',
        email: 'joao@teste.com',
        telefone: null,
        siape: null,
        cargo: null,
      });
    });

    it('deve retornar erro se o supabase falhar ao cadastrar', async () => {
      const formData = new FormData();
      formData.append('nome', 'João');

      mockInsert.mockResolvedValueOnce({ error: { message: 'DB Error' } });

      const result = await addFiliado(formData);
      expect(result).toEqual({ success: false, error: 'Falha ao cadastrar filiado no banco.' });
    });
  });

  describe('editFiliado', () => {
    it('deve retornar erro se o nome estiver ausente na edição', async () => {
      const formData = new FormData();
      const result = await editFiliado('123', formData);
      expect(result).toEqual({ success: false, error: 'O nome é obrigatório' });
    });

    it('deve atualizar os dados corretamente no banco', async () => {
      const formData = new FormData();
      formData.append('nome', 'Maria Atualizada');
      formData.append('ativo', 'on');

      mockEq.mockResolvedValueOnce({ error: null });

      const result = await editFiliado('123', formData);
      expect(result).toEqual({ success: true });
      
      expect(mockUpdate).toHaveBeenCalledWith({
        nome: 'Maria Atualizada',
        email: null,
        telefone: null,
        siape: null,
        cargo: null,
        ativo: true,
      });
      expect(mockEq).toHaveBeenCalledWith('id', '123');
    });

    it('deve retornar erro em caso de falha no banco', async () => {
      const formData = new FormData();
      formData.append('nome', 'Erro DB');

      mockEq.mockResolvedValueOnce({ error: { message: 'Erro DB' } });

      const result = await editFiliado('123', formData);
      expect(result).toEqual({ success: false, error: 'Falha ao editar filiado no banco.' });
    });
  });

  describe('toggleAtivo', () => {
    it('deve alterar o status e revalidar o path', async () => {
      mockEq.mockResolvedValueOnce({ error: null });

      // Passando true para simular a mudança para false (ativo: !currentStatus)
      const result = await toggleAtivo('456', true);
      
      expect(mockUpdate).toHaveBeenCalledWith({ ativo: false });
      expect(mockEq).toHaveBeenCalledWith('id', '456');
      expect(result).toEqual({ success: true });
    });

    it('deve retornar erro em caso de falha ao alterar status', async () => {
      mockEq.mockResolvedValueOnce({ error: { message: 'DB Error' } });

      const result = await toggleAtivo('456', true);
      expect(result).toEqual({ success: false, error: 'Falha ao alterar status no banco.' });
    });
  });
});
