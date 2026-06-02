import { beforeEach,describe, expect, it, vi } from 'vitest';

import { addTransacao, deleteTransacao, updateTransacao } from '../actions';

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
const mockUpdate = vi.fn();
const mockEqSelect = vi.fn();
const mockEqDelete = vi.fn();
const mockEqUpdate = vi.fn();
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
          update: mockUpdate,
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
    mockUpdate.mockReturnValue({ eq: mockEqUpdate });
  });

  describe('addTransacao', () => {
    it('deve retornar erro se campos obrigatórios faltarem', async () => {
      const formData = new FormData();
      formData.append('tipo', 'Entrada');
      
      const result = await addTransacao(formData);
      expect(result).toEqual({ success: false, error: 'Preencha todos os campos obrigatórios' });
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('deve retornar erro se valor for inválido (menor que zero)', async () => {
      const formData = new FormData();
      formData.append('tipo', 'Entrada');
      formData.append('data', '2026-10-10');
      formData.append('descricao', 'Teste');
      formData.append('categoria', 'Repasse');
      formData.append('valor', '-100,00');

      const result = await addTransacao(formData);
      expect(result).toEqual({ success: false, error: 'O valor inserido deve ser maior que zero' });
    });

    it('deve inserir transação com valor corretamente formatado sem comprovante e retornar success', async () => {
      const formData = new FormData();
      formData.append('tipo', 'Saída');
      formData.append('data', '2026-10-10');
      formData.append('descricao', 'Compra material');
      formData.append('categoria', 'Material');
      formData.append('valor', '150,50');

      mockInsert.mockResolvedValueOnce({ error: null });

      const result = await addTransacao(formData);
      expect(result).toEqual({ success: true });
      
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

      const result = await addTransacao(formData);
      expect(result).toEqual({ success: false, error: 'Comprovante muito grande. O limite de tamanho é 5MB.' });
    });
  });

  describe('deleteTransacao', () => {
    it('deve excluir transacao sem arquivo físico', async () => {
      // transação existe mas não tem comprovante
      mockSingle.mockResolvedValueOnce({ data: { comprovante_url: null }, error: null });
      mockEqDelete.mockResolvedValueOnce({ error: null }); // Mock delete success

      const result = await deleteTransacao('id-123');

      expect(mockRemove).not.toHaveBeenCalled();
      expect(mockDelete).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('deve excluir o arquivo do storage e o registro do banco', async () => {
      // transação com arquivo
      mockSingle.mockResolvedValueOnce({ data: { comprovante_url: 'https://storage/comprovantes/meu-arquivo.pdf' }, error: null });
      mockEqDelete.mockResolvedValueOnce({ error: null });

      const result = await deleteTransacao('id-123');

      expect(mockRemove).toHaveBeenCalledWith(['meu-arquivo.pdf']);
      expect(mockDelete).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('deve retornar erro se falhar ao excluir do banco', async () => {
      mockSingle.mockResolvedValueOnce({ data: { comprovante_url: null }, error: null });
      mockEqDelete.mockResolvedValueOnce({ error: { message: 'Erro Banco' } });

      const result = await deleteTransacao('id-123');
      expect(result).toEqual({ success: false, error: 'Falha ao excluir o lançamento' });
    });
  });

  describe('updateTransacao', () => {
    it('deve retornar erro se campos obrigatórios faltarem', async () => {
      const formData = new FormData();
      formData.append('tipo', 'Entrada');
      
      const result = await updateTransacao('id-123', formData);
      expect(result).toEqual({ success: false, error: 'Preencha todos os campos obrigatórios' });
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('deve retornar erro se o valor for inválido', async () => {
      const formData = new FormData();
      formData.append('tipo', 'Entrada');
      formData.append('data', '2026-10-10');
      formData.append('descricao', 'Material');
      formData.append('categoria', 'Material');
      formData.append('valor', '-10.00');

      const result = await updateTransacao('id-123', formData);
      expect(result).toEqual({ success: false, error: 'O valor inserido deve ser maior que zero' });
    });

    it('deve atualizar transação com sucesso e manter comprovante se solicitado', async () => {
      const formData = new FormData();
      formData.append('tipo', 'Saída');
      formData.append('data', '2026-10-10');
      formData.append('descricao', 'Material editado');
      formData.append('categoria', 'Material de Consumo');
      formData.append('valor', '250.00');
      formData.append('manterComprovante', 'true');

      // Mock obter transação atual
      mockSingle.mockResolvedValueOnce({ data: { comprovante_url: 'https://storage/comprovantes/atual.pdf' }, error: null });
      // Mock update banco
      mockEqUpdate.mockResolvedValueOnce({ error: null });

      const result = await updateTransacao('id-123', formData);
      expect(result).toEqual({ success: true });
      
      expect(mockRemove).not.toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalledWith({
        tipo: 'Saída',
        data: '2026-10-10',
        descricao: 'Material editado',
        valor: 250.00,
        categoria: 'Material de Consumo',
        comprovante_url: 'https://storage/comprovantes/atual.pdf',
      });
    });

    it('deve remover comprovante antigo se manterComprovante for false', async () => {
      const formData = new FormData();
      formData.append('tipo', 'Saída');
      formData.append('data', '2026-10-10');
      formData.append('descricao', 'Material editado');
      formData.append('categoria', 'Material de Consumo');
      formData.append('valor', '250.00');
      formData.append('manterComprovante', 'false');

      mockSingle.mockResolvedValueOnce({ data: { comprovante_url: 'https://storage/comprovantes/atual.pdf' }, error: null });
      mockEqUpdate.mockResolvedValueOnce({ error: null });

      const result = await updateTransacao('id-123', formData);
      expect(result).toEqual({ success: true });
      
      expect(mockRemove).toHaveBeenCalledWith(['atual.pdf']);
      expect(mockUpdate).toHaveBeenCalledWith({
        tipo: 'Saída',
        data: '2026-10-10',
        descricao: 'Material editado',
        valor: 250.00,
        categoria: 'Material de Consumo',
        comprovante_url: null,
      });
    });
  });
});
