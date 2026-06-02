import { describe, it, expect, vi, beforeEach } from 'vitest';
import { salvarDocumentoMetadata, excluirDocumento, getDocumentosPorAssembleia } from '../actions-documentos';

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

const mockInsert = vi.fn();
const mockDelete = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockRemove = vi.fn();
const mockOrder = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'assembleia_documentos') {
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
        remove: mockRemove,
      }))
    }
  })),
}));

describe('Assembleias Documentos Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDelete.mockReturnValue({ eq: mockEq });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder });
  });

  describe('salvarDocumentoMetadata', () => {
    it('deve inserir no banco de dados e retornar sucesso', async () => {
      mockInsert.mockResolvedValueOnce({ error: null });

      const result = await salvarDocumentoMetadata('123', 'ata', 'http://link.com', 'ata.pdf', 1024);

      expect(mockInsert).toHaveBeenCalledWith({
        assembleia_id: '123',
        tipo: 'ata',
        arquivo_url: 'http://link.com',
        nome_arquivo: 'ata.pdf',
        tamanho_bytes: 1024
      });
      expect(result).toEqual({ success: true });
    });

    it('deve retornar erro se a inserção falhar', async () => {
      mockInsert.mockResolvedValueOnce({ error: { message: 'DB Error' } });

      const result = await salvarDocumentoMetadata('123', 'edital', 'http://link.com', 'edital.pdf', 1024);
      expect(result).toEqual({ success: false, error: 'Erro ao registrar documento no banco de dados.' });
    });
  });

  describe('excluirDocumento', () => {
    it('deve deletar o documento do storage e do banco e retornar sucesso', async () => {
      mockRemove.mockResolvedValueOnce({ error: null });
      mockEq.mockResolvedValueOnce({ error: null });

      const result = await excluirDocumento('doc-123', 'http://link.com/file.pdf', 'assembleia-123');

      expect(mockRemove).toHaveBeenCalledWith(['file.pdf']);
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 'doc-123');
      expect(result).toEqual({ success: true });
    });

    it('deve retornar erro se a exclusão no banco falhar', async () => {
      mockRemove.mockResolvedValueOnce({ error: null });
      mockEq.mockResolvedValueOnce({ error: { message: 'Erro ao excluir' } });

      const result = await excluirDocumento('doc-123', 'http://link.com/file.pdf', 'assembleia-123');
      expect(result).toEqual({ success: false, error: 'Erro ao excluir documento do banco.' });
    });
  });

  describe('getDocumentosPorAssembleia', () => {
    it('deve buscar documentos filtrando por assembleia', async () => {
      const mockData = [{ id: '1', tipo: 'ata' }];
      mockOrder.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await getDocumentosPorAssembleia('123');

      expect(result).toEqual(mockData);
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('assembleia_id', '123');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('deve retornar array vazio se a busca falhar', async () => {
      mockOrder.mockResolvedValueOnce({ data: null, error: { message: 'Falha de busca' } });

      const result = await getDocumentosPorAssembleia('123');
      expect(result).toEqual([]);
    });
  });
});
