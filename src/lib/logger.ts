import pino from 'pino'

import { createClient } from './supabase/server'

// Configuração do logger estruturado com redação automática de PII e senhas
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'password',
      'token',
      'cpf',
      'rg',
      'senha',
      'headers.cookie',
      'data.password',
      'data.senha'
    ],
    censor: '***REDACTED***'
  },
  // Usar formatação pretty no ambiente de desenvolvimento
  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard'
      }
    }
  })
})

type AuditAction = 
  | 'LOGIN_SUCCESS' 
  | 'LOGIN_FAILED' 
  | 'LOGOUT'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'SYSTEM_ERROR'

/**
 * Função para registrar no console estruturado E na tabela de auditoria (se aplicável).
 */
export async function logAudit(
  action: AuditAction, 
  resource: string, 
  details?: Record<string, unknown>,
  level: 'info' | 'warn' | 'error' = 'info'
) {
  try {
    // 1. Gravar no console/Pino para observabilidade infraestrutural
    logger[level]({ action, resource, details }, `[AUDIT] ${action} on ${resource}`)

    // 2. Gravar no Supabase (apenas para eventos info ou warn, se quisermos auditar)
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    // Fire and forget insert na tabela de auditoria
    await supabase.from('audit_logs').insert({
      user_id: user?.id || null,
      user_email: user?.email || details?.email || null,
      action,
      resource,
      details,
      // ip e user_agent podem ser extraídos de headers em server actions futuras se for necessário.
    })
  } catch (err) {
    // Fallback absoluto se o banco cair, garante que não perdemos o log na Vercel
    logger.error({ err, action, resource }, 'Failed to write audit log to database')
  }
}
