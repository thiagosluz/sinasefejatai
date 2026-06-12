import { describe, expect,it } from 'vitest';

import { handleError } from '@/lib/action-utils';

describe('action-utils', () => {
  describe('handleError', () => {
    it('deve formatar erro de objeto Error e retornar success: false', () => {
      const error = new Error('Erro de banco de dados ficticio');
      const result = handleError(error);
      expect(result).toEqual({ success: false, error: 'Erro de banco de dados ficticio' });
    });

    it('deve usar fallbackMessage para erros desconhecidos (string)', () => {
      const result = handleError('String error');
      expect(result).toEqual({ success: false, error: 'Ocorreu um erro interno.' });
    });

    it('deve permitir sobrescrever a fallbackMessage padrao', () => {
      const result = handleError(12345, 'Erro customizado de fallback');
      expect(result).toEqual({ success: false, error: 'Erro customizado de fallback' });
    });
  });
});
