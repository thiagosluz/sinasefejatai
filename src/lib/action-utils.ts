export type ActionResponse<T = void> = 
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; data?: never; message?: never };

import { logAudit,logger } from './logger';

/**
 * Função utilitária para normalizar a captura de erros do Supabase/Prisma/Etc.
 */
export function handleError(error: unknown, fallbackMessage: string = 'Ocorreu um erro interno.'): { success: false; error: string } {
  // O Next.js usa exceções para fazer o redirect. Se não relançarmos esse erro, a página não redireciona!
  if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
    throw error;
  }

  if (error instanceof Error) {
    // Evita expor stack traces ou erros raw do banco para o usuário final
    // Pode-se registrar no log da infra e retornar string segura
    logger.error({ err: error }, '[Action Error]: ' + error.message);
    logAudit('SYSTEM_ERROR', 'action-utils', { error_message: error.message }, 'error');
    return { success: false, error: error.message };
  }
  logger.error({ err: error }, '[Unknown Error]');
  logAudit('SYSTEM_ERROR', 'action-utils', { raw_error: String(error) }, 'error');
  return { success: false, error: fallbackMessage };
}
