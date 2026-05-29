import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addAssembleia, updateStatusAssembleia, deleteAssembleia, editAssembleia } from '../actions';
import { saveAta } from '../actions-ata';

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
const mockUpsert = vi.fn();
const mockDelete = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockEqSelect = vi.fn();
const mockSingle = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'assembleias') {
        return {
          insert: mockInsert,
          update: mockUpdate,
          delete: mockDelete,
          select: mockSelect,
        };
      }
      if (table === 'atas') {
        return {
          upsert: mockUpsert,
          delete: mockDelete,
        };
      }
      return {};
    }),
  })),
}));

describe('Assembleias Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addAssembleia', () => {
    it('deve redirecionar com erro se campos obrigatórios faltarem', async () => {
      const formData = new FormData();
      formData.append('tipo', 'Ordinária');
      // Faltam data, horario, local

      await expect(addAssembleia(formData)).rejects.toThrow('Redirected to: /admin/assembleias/nova?error=Preencha os campos obrigatórios');
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('deve inserir no banco, revalidar e redirecionar em caso de sucesso', async () => {
      const formData = new FormData();
      formData.append('tipo', 'Ordinária');
      formData.append('data_realizacao', '2024-10-10');
      formData.append('horario_1a_convocacao', '14:00');
      formData.append('horario_2a_convocacao', '14:30');
      formData.append('local', 'Sede');
      formData.append('pautas', 'Pauta 1\nPauta 2');

      // Setup do mock para retornar sucesso
      mockInsert.mockResolvedValueOnce({ error: null });

      await expect(addAssembleia(formData)).rejects.toThrow('Redirected to: /admin/assembleias');
      
      expect(mockInsert).toHaveBeenCalledWith({
        numero: null,
        tipo: 'Ordinária',
        data_realizacao: '2024-10-10',
        horario_1a_convocacao: '14:00',
        horario_2a_convocacao: '14:30',
        local: 'Sede',
        publico_alvo: 'filiados',
        pautas: ['Pauta 1', 'Pauta 2'],
        status: 'Agendada',
      });
    });

    it('deve redirecionar com erro se o supabase falhar ao inserir', async () => {
      const formData = new FormData();
      formData.append('tipo', 'Ordinária');
      formData.append('data_realizacao', '2024-10-10');
      formData.append('horario_1a_convocacao', '14:00');
      formData.append('horario_2a_convocacao', '14:30');
      formData.append('local', 'Sede');

      // Supabase falhando
      mockInsert.mockResolvedValueOnce({ error: { message: 'DB Error' } });

      await expect(addAssembleia(formData)).rejects.toThrow('Redirected to: /admin/assembleias/nova?error=Falha ao agendar assembleia');
    });
  });

  describe('updateStatusAssembleia', () => {
    beforeEach(() => {
      mockUpdate.mockReturnValue({ eq: mockEq });
    });

    it('deve atualizar o status e revalidar o path', async () => {
      mockEq.mockResolvedValueOnce({ error: null });

      await updateStatusAssembleia('123', 'CONCLUIDA');
      
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'CONCLUIDA' });
      expect(mockEq).toHaveBeenCalledWith('id', '123');
    });

    it('deve lançar erro em caso de falha no banco', async () => {
      mockEq.mockResolvedValueOnce({ error: { message: 'Erro no DB' } });

      await expect(updateStatusAssembleia('123', 'CONCLUIDA')).rejects.toThrow('Falha ao atualizar status');
    });
  });

  describe('deleteAssembleia', () => {
    beforeEach(() => {
      mockDelete.mockReturnValue({ eq: mockEq });
    });

    it('deve deletar atas associadas e depois a assembleia', async () => {
      mockEq.mockResolvedValueOnce({ error: null }); // mockDelete atas
      mockEq.mockResolvedValueOnce({ error: null }); // mockDelete assembleia

      await deleteAssembleia('123');

      expect(mockDelete).toHaveBeenCalledTimes(2);
      expect(mockEq).toHaveBeenCalledWith('assembleia_id', '123');
      expect(mockEq).toHaveBeenCalledWith('id', '123');
    });

    it('deve lançar erro se falhar ao excluir a assembleia', async () => {
      mockEq.mockResolvedValueOnce({ error: null }); // mockDelete atas
      mockEq.mockResolvedValueOnce({ error: { message: 'Erro DB' } }); // falha na assembleia

      await expect(deleteAssembleia('123')).rejects.toThrow('Falha ao excluir assembleia: Erro DB');
    });
  });

  describe('editAssembleia', () => {
    beforeEach(() => {
      mockSelect.mockReturnValue({ eq: mockEqSelect });
      mockEqSelect.mockReturnValue({ single: mockSingle });
      mockUpdate.mockReturnValue({ eq: mockEq });
    });

    it('deve redirecionar com erro se faltarem campos', async () => {
      const formData = new FormData();
      formData.append('tipo', 'Ordinária');
      await expect(editAssembleia('123', formData)).rejects.toThrow('Redirected to: /assembleias/123/editar?error=Preencha os campos obrigatórios');
    });

    it('deve incrementar versão do edital se status continuar Agendada e houver motivo', async () => {
      const formData = new FormData();
      formData.append('tipo', 'Ordinária');
      formData.append('data_realizacao', '2024-10-10');
      formData.append('horario_1a_convocacao', '14:00');
      formData.append('horario_2a_convocacao', '14:30');
      formData.append('local', 'Sede');
      formData.append('status', 'Agendada');
      formData.append('motivo_retificacao', 'Mudança de horário');

      mockSingle.mockResolvedValueOnce({
        data: { status: 'Agendada', versao_edital: 1, historico_retificacoes: [] },
        error: null
      });

      mockEq.mockResolvedValueOnce({ error: null });

      await expect(editAssembleia('123', formData)).rejects.toThrow('Redirected to: /admin/assembleias');

      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        versao_edital: 2,
        historico_retificacoes: [
          expect.objectContaining({
            versao_anterior: 1,
            motivo: 'Mudança de horário'
          })
        ]
      }));
    });
  });

  describe('saveAta', () => {
    it('deve redirecionar com erro se assembleiaId não for enviado', async () => {
      const formData = new FormData();
      await expect(saveAta(formData)).rejects.toThrow('Redirected to: /admin/assembleias?error=Assembleia não especificada');
    });

    it('deve upsert no banco e redirecionar com sucesso', async () => {
      const formData = new FormData();
      formData.append('assembleia_id', '123');
      formData.append('numero', '001');
      formData.append('redator', 'João');
      formData.append('conteudo_rich', '<p>Texto da ata</p>');

      mockUpsert.mockResolvedValueOnce({ error: null });

      await expect(saveAta(formData)).rejects.toThrow('Redirected to: /admin/assembleias/123/ata?success=Ata salva com sucesso');

      expect(mockUpsert).toHaveBeenCalledWith({
        assembleia_id: '123',
        numero: '001',
        redator: 'João',
        conteudo_rich: '<p>Texto da ata</p>',
        votos_pautas: {},
      }, {
        onConflict: 'assembleia_id'
      });
    });

    it('deve redirecionar para a própria página com erro caso o banco falhe', async () => {
      const formData = new FormData();
      formData.append('assembleia_id', '123');
      
      mockUpsert.mockResolvedValueOnce({ error: { message: 'Erro' } });

      await expect(saveAta(formData)).rejects.toThrow('Redirected to: /admin/assembleias/123/ata?error=Falha ao salvar a ata');
    });
  });
});
