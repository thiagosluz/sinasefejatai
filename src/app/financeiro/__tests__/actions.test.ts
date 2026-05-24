import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addTransacao, deleteTransacao } from '../actions';

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
const mockDelete = vi.fn();
const mockSelect = vi.fn();
const mockEqSelect = vi.fn();
const mockEqDelete = vi.fn();
const mockSingle = vi.fn();

// Mock Storage
const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();
const mockRemove = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'financeiro') {
        return {
          insert: mockInsert,
          delete: mockDelete,
          select: mockSelect,
        };
      }
      return {};
    }),
    storage: {
      from: vi.fn(() => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
        remove: mockRemove,
      }))
    }
  })),
}));

describe('Financeiro Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({ eq: mockEqSelect });
    mockEqSelect.mockReturnValue({ single: mockSingle });
    mockDelete.mockReturnValue({ eq: mockEqDelete });
  });

  describe('addTransacao', () => {
    it('deve redirecionar com erro se campos obrigatórios faltarem', async () => {
      const formData = new FormData();
      formData.append('tipo', 'Entrada');
      
      await expect(addTransacao(formData)).rejects.toThrow('Redirected to: /financeiro?error=Preencha todos os campos obrigatórios');
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('deve redirecionar com erro se valor for inválido (menor que zero)', async () => {
      const formData = new FormData();
      formData.append('tipo', 'Entrada');
      formData.append('data', '2026-10-10');
      formData.append('descricao', 'Teste');
      formData.append('categoria', 'Repasse');
      formData.append('valor', '-100,00');

      await expect(addTransacao(formData)).rejects.toThrow('Redirected to: /financeiro?error=O valor inserido deve ser maior que zero');
    });

    it('deve inserir transação com valor corretamente formatado sem comprovante', async () => {
      const formData = new FormData();
      formData.append('tipo', 'Saída');
      formData.append('data', '2026-10-10');
      formData.append('descricao', 'Compra material');
      formData.append('categoria', 'Material');
      formData.append('valor', '150,50');

      mockInsert.mockResolvedValueOnce({ error: null });

      await expect(addTransacao(formData)).rejects.toThrow('Redirected to: /financeiro?success=Lançamento registrado com sucesso!');
      
      expect(mockInsert).toHaveBeenCalledWith({
        tipo: 'Saída',
        data: '2026-10-10',
        descricao: 'Compra material',
        valor: 150.5,
        categoria: 'Material',
        comprovante_url: null,
      });
    });

    it('deve rejeitar arquivo maior que 5MB', async () => {
      const formData = new FormData();
      formData.append('tipo', 'Saída');
      formData.append('data', '2026-10-10');
      formData.append('descricao', 'Teste com anexo grande');
      formData.append('categoria', 'Material');
      formData.append('valor', '100');

      // Mock file > 5MB
      const mockFile = new File(['x'.repeat(6 * 1024 * 1024)], 'grande.pdf', { type: 'application/pdf' });
      formData.append('comprovante', mockFile);

      await expect(addTransacao(formData)).rejects.toThrow('Redirected to: /financeiro?error=Comprovante muito grande. O limite de tamanho é 5MB.');
    });
  });

  describe('deleteTransacao', () => {
    it('deve excluir transacao sem arquivo físico', async () => {
      // transação existe mas não tem comprovante
      mockSingle.mockResolvedValueOnce({ data: { comprovante_url: null }, error: null });
      mockEqDelete.mockResolvedValueOnce({ error: null }); // Mock delete success

      await deleteTransacao('id-123');

      expect(mockRemove).not.toHaveBeenCalled();
      expect(mockDelete).toHaveBeenCalled();
    });

    it('deve excluir o arquivo do storage e o registro do banco', async () => {
      // transação com arquivo
      mockSingle.mockResolvedValueOnce({ data: { comprovante_url: 'https://storage/comprovantes/meu-arquivo.pdf' }, error: null });
      mockEqDelete.mockResolvedValueOnce({ error: null });

      await deleteTransacao('id-123');

      expect(mockRemove).toHaveBeenCalledWith(['meu-arquivo.pdf']);
      expect(mockDelete).toHaveBeenCalled();
    });

    it('deve lançar erro se falhar ao excluir do banco', async () => {
      mockSingle.mockResolvedValueOnce({ data: { comprovante_url: null }, error: null });
      mockEqDelete.mockResolvedValueOnce({ error: { message: 'Erro Banco' } });

      await expect(deleteTransacao('id-123')).rejects.toThrow('Falha ao excluir o lançamento');
    });
  });
});
