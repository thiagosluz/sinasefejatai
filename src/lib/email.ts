import nodemailer from 'nodemailer'

import { EMAIL_SINDICATO } from '@/lib/constants'

const DIRETORIA_EMAIL = EMAIL_SINDICATO
const FROM_ADDRESS = 'SINASEFE Jataí <nao-responda@notifica.sinasefejatai.org.br>'

let _transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (_transporter) return _transporter

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null
  }

  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  return _transporter
}

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
  tag?: string // Tag para as estatísticas do Brevo
}

export async function sendEmail({ to, subject, html, replyTo, tag }: SendEmailOptions) {
  const transporter = getTransporter()
  if (!transporter) {
    console.warn('⚠️ Credenciais SMTP não definidas. O e-mail NÃO foi enviado.', { to, subject })
    return { id: 'simulated' }
  }

  try {
    const mailOptions = {
      from: FROM_ADDRESS,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo: replyTo || DIRETORIA_EMAIL,
      headers: tag ? { 'X-Mailin-Tag': tag } : undefined,
    }

    const info = await transporter.sendMail(mailOptions)

    return { id: info.messageId }
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
    tag: 'Fale Conosco',
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
    tag: 'Filiacao',
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

export async function enviarBoletim({
  to,
  titulo,
  conteudoHtml,
}: {
  to: string | string[]
  titulo: string
  conteudoHtml: string
}) {
  return sendEmail({
    to,
    subject: titulo,
    tag: 'Boletim',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #991b1b; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">SINASEFE Jataí</h1>
          <p style="color: #fca5a5; margin: 8px 0 0 0; font-size: 14px;">Boletim Informativo</p>
        </div>
        <div style="background: #ffffff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #1f2937; margin-top: 0;">${titulo}</h2>
          <div style="color: #374151; line-height: 1.6;">
            ${conteudoHtml}
          </div>
        </div>
        <div style="background: #f9fafb; padding: 24px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Você está recebendo este e-mail pois é filiado(a) ao SINASEFE Seção Sindical Jataí.
          </p>
        </div>
      </div>
    `,
  })
}

export async function enviarEditalAssembleia({
  to,
  titulo,
  data,
  horario,
  local,
  pautas,
}: {
  to: string | string[]
  titulo: string
  data: string
  horario: string
  local: string
  pautas: string[]
}) {
  const pautasHtml = pautas.map(p => `<li style="margin-bottom: 8px;">${p}</li>`).join('')

  return sendEmail({
    to,
    subject: `[CONVOCAÇÃO] ${titulo}`,
    tag: 'Assembleia',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #991b1b; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 20px;">CONVOCAÇÃO DE ASSEMBLEIA</h1>
        </div>
        <div style="background: #ffffff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #1f2937; margin-top: 0; text-align: center;">${titulo}</h2>
          
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0;">
            <p style="margin: 0 0 8px 0;">📅 <strong>Data:</strong> ${data}</p>
            <p style="margin: 0 0 8px 0;">⏰ <strong>Horário:</strong> ${horario}</p>
            <p style="margin: 0;">📍 <strong>Local:</strong> ${local}</p>
          </div>

          <h3 style="color: #374151; margin-top: 32px;">Pautas da Assembleia:</h3>
          <ul style="color: #4b5563; line-height: 1.5; padding-left: 20px;">
            ${pautasHtml}
          </ul>

          <p style="color: #374151; margin-top: 32px; font-weight: bold; text-align: center;">
            Sua presença é fundamental para as decisões da nossa categoria!
          </p>
        </div>
        <div style="background: #f9fafb; padding: 24px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Sindicato Nacional dos Servidores Federais da Educação Básica, Profissional e Tecnológica - Seção Sindical Jataí.
          </p>
        </div>
      </div>
    `,
  })
}

export async function enviarEmailAniversario({
  to,
  nome,
}: {
  to: string | string[]
  nome: string
}) {
  const primeiroNome = nome.split(' ')[0]
  
  return sendEmail({
    to,
    subject: `Feliz Aniversário, ${primeiroNome}! 🎉`,
    tag: 'Aniversario',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #991b1b; padding: 40px 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Feliz Aniversário! 🎂</h1>
        </div>
        <div style="background: #ffffff; padding: 40px 32px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Olá, <strong>${primeiroNome}</strong>!
          </p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Neste dia tão especial, a Seção Sindical Jataí do SINASEFE vem lhe desejar muitas felicidades, saúde e sucesso.
          </p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Que seu novo ciclo seja repleto de realizações e que possamos continuar juntos na luta por uma educação pública, gratuita e de qualidade!
          </p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-top: 32px;">
            Um grande abraço,<br/>
            <strong>Diretoria do SINASEFE Jataí</strong>
          </p>
        </div>
        <div style="background: #f9fafb; padding: 24px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Mensagem automática de felicitações enviada pelo sistema do sindicato.
          </p>
        </div>
      </div>
    `,
  })
}
