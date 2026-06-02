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
    it('deve retornar erro se campos obrigatórios faltarem', async () => {
      const formData = new FormData();
      formData.append('tipo', 'Ordinária');
      // Faltam data, horario, local

      const result = await addAssembleia(formData);
      expect(result).toEqual({ success: false, error: 'Preencha os campos obrigatórios' });
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('deve inserir no banco e retornar sucesso', async () => {
      const formData = new FormData();
      formData.append('tipo', 'Ordinária');
      formData.append('data_realizacao', '2024-10-10');
      formData.append('horario_1a_convocacao', '14:00');
      formData.append('horario_2a_convocacao', '14:30');
      formData.append('local', 'Sede');
      formData.append('pautas', 'Pauta 1\nPauta 2');

      // Setup do mock para retornar sucesso
      mockInsert.mockResolvedValueOnce({ error: null });

      const result = await addAssembleia(formData);
      expect(result).toEqual({ success: true });
      
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

    it('deve retornar erro se o supabase falhar ao inserir', async () => {
      const formData = new FormData();
      formData.append('tipo', 'Ordinária');
      formData.append('data_realizacao', '2024-10-10');
      formData.append('horario_1a_convocacao', '14:00');
      formData.append('horario_2a_convocacao', '14:30');
      formData.append('local', 'Sede');

      // Supabase falhando
      mockInsert.mockResolvedValueOnce({ error: { message: 'DB Error' } });

      const result = await addAssembleia(formData);
      expect(result).toEqual({ success: false, error: 'Falha ao agendar assembleia no banco.' });
    });
  });

  describe('updateStatusAssembleia', () => {
    beforeEach(() => {
      mockUpdate.mockReturnValue({ eq: mockEq });
    });

    it('deve atualizar o status e revalidar o path', async () => {
      mockEq.mockResolvedValueOnce({ error: null });

      const result = await updateStatusAssembleia('123', 'CONCLUIDA');
      
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'CONCLUIDA' });
      expect(mockEq).toHaveBeenCalledWith('id', '123');
      expect(result).toEqual({ success: true });
    });

    it('deve retornar erro em caso de falha no banco', async () => {
      mockEq.mockResolvedValueOnce({ error: { message: 'Erro no DB' } });

      const result = await updateStatusAssembleia('123', 'CONCLUIDA');
      expect(result).toEqual({ success: false, error: 'Falha ao atualizar status no banco.' });
    });
  });

  describe('deleteAssembleia', () => {
    beforeEach(() => {
      mockDelete.mockReturnValue({ eq: mockEq });
    });

    it('deve deletar atas associadas e depois a assembleia', async () => {
      mockEq.mockResolvedValueOnce({ error: null }); // mockDelete atas
      mockEq.mockResolvedValueOnce({ error: null }); // mockDelete assembleia

      const result = await deleteAssembleia('123');

      expect(mockDelete).toHaveBeenCalledTimes(2);
      expect(mockEq).toHaveBeenCalledWith('assembleia_id', '123');
      expect(mockEq).toHaveBeenCalledWith('id', '123');
      expect(result).toEqual({ success: true });
    });

    it('deve retornar erro se falhar ao excluir a assembleia', async () => {
      mockEq.mockResolvedValueOnce({ error: null }); // mockDelete atas
      mockEq.mockResolvedValueOnce({ error: { message: 'Erro DB' } }); // falha na assembleia

      const result = await deleteAssembleia('123');
      expect(result).toEqual({ success: false, error: 'Falha ao excluir assembleia: Erro DB' });
    });
  });

  describe('editAssembleia', () => {
    beforeEach(() => {
      mockSelect.mockReturnValue({ eq: mockEqSelect });
      mockEqSelect.mockReturnValue({ single: mockSingle });
      mockUpdate.mockReturnValue({ eq: mockEq });
    });

    it('deve retornar erro se faltarem campos', async () => {
      const formData = new FormData();
      formData.append('tipo', 'Ordinária');
      
      const result = await editAssembleia('123', formData);
      expect(result).toEqual({ success: false, error: 'Preencha os campos obrigatórios' });
    });

    it('deve incrementar versão do edital se status continuar Agendada e houver motivo e retornar sucesso', async () => {
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

      const result = await editAssembleia('123', formData);
      expect(result).toEqual({ success: true });

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
    it('deve retornar erro se assembleiaId não for enviado', async () => {
      const formData = new FormData();
      const result = await saveAta(formData);
      expect(result).toEqual({ success: false, error: 'Assembleia não especificada' });
    });

    it('deve upsert no banco e retornar sucesso', async () => {
      const formData = new FormData();
      formData.append('assembleia_id', '123');
      formData.append('numero', '001');
      formData.append('redator', 'João');
      formData.append('conteudo_rich', '<p>Texto da ata</p>');

      mockUpsert.mockResolvedValueOnce({ error: null });

      const result = await saveAta(formData);
      expect(result).toEqual({ success: true });

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

    it('deve retornar erro caso o banco falhe', async () => {
      const formData = new FormData();
      formData.append('assembleia_id', '123');
      
      mockUpsert.mockResolvedValueOnce({ error: { message: 'Erro' } });

      const result = await saveAta(formData);
      expect(result).toEqual({ success: false, error: 'Falha ao salvar a ata no banco de dados.' });
    });
  });
});
