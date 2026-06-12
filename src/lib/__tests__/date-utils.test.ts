import { describe, expect,it } from 'vitest';

import { formatarDataComDiaParenteses, formatarDataExtenso, formatarDataPtBR, formatarHora } from '@/lib/date-utils';

describe('date-utils', () => {
  describe('formatarDataPtBR', () => {
    it('deve retornar vazio se não receber data', () => {
      expect(formatarDataPtBR('')).toBe('');
    });

    it('deve formatar data ISO corretamente no fuso UTC', () => {
      expect(formatarDataPtBR('2026-06-03')).toBe('03/06/2026');
    });
  });

  describe('formatarDataExtenso', () => {
    it('deve formatar data por extenso', () => {
      expect(formatarDataExtenso('2026-06-03')).toMatch(/quarta-feira, 3 de junho de 2026/);
    });
  });

  describe('formatarDataComDiaParenteses', () => {
    it('deve formatar no padrão 3 de junho de 2026 (quarta-feira)', () => {
      expect(formatarDataComDiaParenteses('2026-06-03')).toBe('3 de junho de 2026 (quarta-feira)');
    });
  });

  describe('formatarHora', () => {
    it('deve retornar vazio se sem hora', () => {
      expect(formatarHora('')).toBe('');
    });

    it('deve manter hora inteira no padrão Xh', () => {
      expect(formatarHora('09:00:00')).toBe('09h');
    });

    it('deve formatar com minutos no padrão XhYY', () => {
      expect(formatarHora('09:30:00')).toBe('09h30');
    });

    it('deve fazer fallback se o formato estiver incompleto', () => {
      expect(formatarHora('09')).toBe('09');
    });
  });
});
