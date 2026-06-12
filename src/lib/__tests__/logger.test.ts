import { beforeEach,describe, expect, it, vi } from 'vitest';

import { logAudit, logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn()
}));

describe('logger', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any;
  let pinoInfoSpy: import('vitest').MockInstance;
  let pinoErrorSpy: import('vitest').MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    pinoInfoSpy = vi.spyOn(logger, 'info').mockImplementation(() => {});
    pinoErrorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1', email: 'a@a.com' } } })
      },
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: null })
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (createClient as any).mockResolvedValue(mockSupabase);
  });

  describe('logAudit', () => {
    it('deve registrar no logger e no supabase', async () => {
      await logAudit('CREATE', 'user', { id: 1 }, 'info');
      expect(pinoInfoSpy).toHaveBeenCalledWith(
        { action: 'CREATE', resource: 'user', details: { id: 1 } },
        '[AUDIT] CREATE on user'
      );
      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
      expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
        action: 'CREATE',
        resource: 'user',
        user_id: 'u1'
      }));
    });

    it('deve fazer fallback no logger.error se banco cair', async () => {
      const error = new Error('DB Error');
      mockSupabase.from.mockImplementationOnce(() => { throw error; });
      await logAudit('DELETE', 'post');
      expect(pinoErrorSpy).toHaveBeenCalledWith(
        { err: error, action: 'DELETE', resource: 'post' },
        'Failed to write audit log to database'
      );
    });
  });
});
