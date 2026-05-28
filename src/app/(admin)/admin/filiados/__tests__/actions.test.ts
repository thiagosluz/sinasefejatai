import { describe, it, expect, vi, beforeEach } from 'vitest';
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
    it('deve redirecionar com erro se o nome estiver ausente', async () => {
      const formData = new FormData();
      formData.append('email', 'teste@teste.com');

      await expect(addFiliado(formData)).rejects.toThrow('Redirected to: /admin/filiados/novo?error=O nome é obrigatório');
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('deve inserir no banco, revalidar e redirecionar em caso de sucesso', async () => {
      const formData = new FormData();
      formData.append('nome', 'João Teste');
      formData.append('email', 'joao@teste.com');

      mockInsert.mockResolvedValueOnce({ error: null });

      await expect(addFiliado(formData)).rejects.toThrow('Redirected to: /admin/filiados');
      
      expect(mockInsert).toHaveBeenCalledWith({
        nome: 'João Teste',
        email: 'joao@teste.com',
        telefone: null,
        siape: null,
        cargo: null,
      });
    });

    it('deve redirecionar com erro se o supabase falhar ao cadastrar', async () => {
      const formData = new FormData();
      formData.append('nome', 'João');

      mockInsert.mockResolvedValueOnce({ error: { message: 'DB Error' } });

      await expect(addFiliado(formData)).rejects.toThrow('Redirected to: /admin/filiados/novo?error=Falha ao cadastrar filiado');
    });
  });

  describe('editFiliado', () => {
    it('deve redirecionar com erro se o nome estiver ausente na edição', async () => {
      const formData = new FormData();
      await expect(editFiliado('123', formData)).rejects.toThrow('Redirected to: /admin/filiados/123/editar?error=O nome é obrigatório');
    });

    it('deve atualizar os dados corretamente no banco', async () => {
      const formData = new FormData();
      formData.append('nome', 'Maria Atualizada');
      formData.append('ativo', 'on');

      mockEq.mockResolvedValueOnce({ error: null });

      await expect(editFiliado('123', formData)).rejects.toThrow('Redirected to: /admin/filiados');
      
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

    it('deve redirecionar com erro em caso de falha no banco', async () => {
      const formData = new FormData();
      formData.append('nome', 'Erro DB');

      mockEq.mockResolvedValueOnce({ error: { message: 'Erro DB' } });

      await expect(editFiliado('123', formData)).rejects.toThrow('Redirected to: /admin/filiados/123/editar?error=Falha ao editar filiado');
    });
  });

  describe('toggleAtivo', () => {
    it('deve alterar o status e revalidar o path', async () => {
      mockEq.mockResolvedValueOnce({ error: null });

      // Passando true para simular a mudança para false (ativo: !currentStatus)
      await toggleAtivo('456', true);
      
      expect(mockUpdate).toHaveBeenCalledWith({ ativo: false });
      expect(mockEq).toHaveBeenCalledWith('id', '456');
    });

    it('deve lançar erro em caso de falha ao alterar status', async () => {
      mockEq.mockResolvedValueOnce({ error: { message: 'DB Error' } });

      await expect(toggleAtivo('456', true)).rejects.toThrow('Falha ao alterar status');
    });
  });
});
