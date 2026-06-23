import { SendRawEmailCommand,SESClient } from '@aws-sdk/client-ses'
import MailComposer from 'nodemailer/lib/mail-composer'

import { EMAIL_SINDICATO } from '@/lib/constants'

const DIRETORIA_EMAIL = EMAIL_SINDICATO
const FROM_ADDRESS = 'SINASEFE Jataí <nao-responda@notifica.sinasefejatai.org.br>'

let _sesClient: SESClient | null = null

function getSESClient() {
  if (_sesClient) return _sesClient

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return null
  }

  _sesClient = new SESClient({
    region: process.env.AWS_REGION || 'us-east-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  })

  return _sesClient
}

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailOptions) {
  const ses = getSESClient()
  if (!ses) {
    console.warn('⚠️ Credenciais AWS não definidas. O e-mail NÃO foi enviado.', { to, subject })
    return { id: 'simulated' }
  }

  try {
    const mailOptions = {
      from: FROM_ADDRESS,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo: replyTo || DIRETORIA_EMAIL,
    }

    const mail = new MailComposer(mailOptions)
    const messageBuffer = await mail.compile().build()

    const command = new SendRawEmailCommand({
      RawMessage: { Data: messageBuffer },
    })

    const response = await ses.send(command)

    return { id: response.MessageId }
  } catch (error: unknown) {
    console.error('[sendEmail] Erro ao enviar e-mail:', error)
    if (error instanceof Error) {
      throw new Error(`Falha ao enviar e-mail: ${error.message}`)
    }
    throw new Error('Falha ao enviar e-mail: Erro desconhecido')
  }
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
