import { Resend } from 'resend'

// Instancia o cliente do Resend apenas se a chave da API existir
export const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null

// Usamos o subdomínio validado no Resend
const FROM_ADDRESS = 'SINASEFE Jataí <nao-responda@email.sinasefejatai.org.br>'
import { EMAIL_SINDICATO } from '@/lib/constants'

const DIRETORIA_EMAIL = EMAIL_SINDICATO

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

async function sendEmail({ to, subject, html, replyTo }: SendEmailOptions) {
  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY não está definida. O e-mail NÃO foi enviado.', { to, subject })
    return { id: 'simulated' }
  }

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    replyTo: replyTo || DIRETORIA_EMAIL, // Fallback automático para o email do sindicato
  })

  if (error) {
    console.error('[sendEmail] Erro ao enviar e-mail:', error)
    throw new Error(`Falha ao enviar e-mail: ${error.message}`)
  }

  return data
}

// Templates reutilizáveis

export async function notificarNovoContato({
  nome,
  email,
  assunto,
  mensagem,
}: {
  nome: string
  email: string
  assunto?: string | null
  mensagem: string
}) {
  return sendEmail({
    to: DIRETORIA_EMAIL,
    subject: `[Fale Conosco] ${assunto ?? 'Nova mensagem'} — ${nome}`,
    replyTo: email,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #991b1b; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">Nova mensagem — Fale Conosco</h1>
        </div>
        <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p><strong>De:</strong> ${nome} &lt;${email}&gt;</p>
          ${assunto ? `<p><strong>Assunto:</strong> ${assunto}</p>` : ''}
          <hr style="border-color: #e5e7eb; margin: 16px 0;" />
          <p style="white-space: pre-wrap; color: #374151;">${mensagem}</p>
          <hr style="border-color: #e5e7eb; margin: 16px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">Mensagem recebida via portal público do SINASEFE JATAÍ.</p>
        </div>
      </div>
    `,
  })
}

export async function notificarPedidoFiliacao({
  nome,
  email,
  siape,
  categoria,
  situacao,
}: {
  nome: string
  email: string
  siape: string
  categoria: string
  situacao: string
}) {
  return sendEmail({
    to: DIRETORIA_EMAIL,
    subject: `[Filiação] Novo pedido — ${nome}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #991b1b; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">Novo Pedido de Filiação</h1>
        </div>
        <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p><strong>Nome:</strong> ${nome}</p>
          <p><strong>SIAPE:</strong> ${siape}</p>
          <p><strong>E-mail:</strong> ${email}</p>
          <p><strong>Categoria:</strong> ${categoria}</p>
          <p><strong>Situação:</strong> ${situacao}</p>
          <hr style="border-color: #e5e7eb; margin: 16px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">Acesse o painel administrativo para aprovar ou rejeitar o pedido.</p>
        </div>
      </div>
    `,
  })
}
