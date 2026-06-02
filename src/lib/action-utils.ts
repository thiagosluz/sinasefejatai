export type ActionResponse<T = void> = 
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; data?: never; message?: never };

/**
 * Função utilitária para normalizar a captura de erros do Supabase/Prisma/Etc.
 */
export function handleError(error: unknown, fallbackMessage: string = 'Ocorreu um erro interno.'): { success: false; error: string } {
  if (error instanceof Error) {
    // Evita expor stack traces ou erros raw do banco para o usuário final
    // Pode-se registrar no log da infra e retornar string segura
    console.error('[Action Error]:', error.message);
    return { success: false, error: error.message };
  }
  console.error('[Unknown Error]:', error);
  return { success: false, error: fallbackMessage };
}
