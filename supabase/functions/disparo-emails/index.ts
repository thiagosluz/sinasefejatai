import * as aws from "npm:@aws-sdk/client-ses"
const { SESClient } = aws
import nodemailer from "npm:nodemailer"

import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailPayload {
  filiados: Array<{ nome: string; email: string }>
  subject: string
  html: string
  attachment?: {
    filename: string
    url: string
  }
  replyTo: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Validar secret compartilhado
    const authHeader = req.headers.get('Authorization')
    const expectedToken = Deno.env.get('EDGE_FUNCTION_SECRET')

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Receber payload
    const payload: EmailPayload = await req.json()
    const { filiados, subject, html, attachment, replyTo } = payload

    if (!filiados || filiados.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nenhum filiado para enviar' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const AWS_ACCESS_KEY_ID = Deno.env.get('AWS_ACCESS_KEY_ID')
    const AWS_SECRET_ACCESS_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY')
    const AWS_REGION = Deno.env.get('AWS_REGION') || 'us-east-2'

    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      return new Response(
        JSON.stringify({ error: 'Credenciais da AWS não configuradas' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Responder imediatamente que o processamento iniciou
    // O EdgeRuntime.waitUntil() permite continuar o processamento após a resposta
    const responsePromise = processarEnvios(filiados, subject, html, attachment, replyTo, {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
      region: AWS_REGION
    })

    // Usar waitUntil para continuar processando após enviar a resposta
    // @ts-expect-error - EdgeRuntime is available in Supabase Edge Functions
    if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
      EdgeRuntime.waitUntil(responsePromise)

      return new Response(
        JSON.stringify({ 
          message: `Processamento iniciado para ${filiados.length} filiados.`,
          total: filiados.length 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fallback: aguardar o processamento se waitUntil não estiver disponível
    const resultado = await responsePromise
    return new Response(
      JSON.stringify(resultado),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('[enviar-edital] Erro geral:', err)
    return new Response(
      JSON.stringify({ error: 'Erro interno na Edge Function' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function processarEnvios(
  filiados: Array<{ nome: string; email: string }>,
  subject: string,
  html: string,
  attachment: { filename: string; url: string } | undefined,
  replyTo: string,
  awsConfig: { accessKeyId: string; secretAccessKey: string; region: string }
) {
  let enviados = 0
  const erros: string[] = []

  const sesClient = new SESClient({
    region: awsConfig.region,
    credentials: {
      accessKeyId: awsConfig.accessKeyId,
      secretAccessKey: awsConfig.secretAccessKey,
    },
  })

  const transporter = nodemailer.createTransport({
    SES: { ses: sesClient, aws },
  })

  // Montar attachments para o Nodemailer
  const attachments = attachment
    ? [{ filename: attachment.filename, href: attachment.url }]
    : undefined

  for (let i = 0; i < filiados.length; i++) {
    const filiado = filiados[i]

    try {
      await transporter.sendMail({
        from: 'SINASEFE Jataí <nao-responda@notifica.sinasefejatai.org.br>',
        to: filiado.email,
        subject,
        html,
        attachments,
        replyTo,
      })

      enviados++
      console.log(`[${i + 1}/${filiados.length}] ✅ Enviado para ${filiado.email}`)
    } catch (err) {
      console.error(`[${i + 1}/${filiados.length}] ❌ Erro para ${filiado.email}:`, err)
      erros.push(filiado.email)
    }

    // Rate limit AWS SES costuma ser de 14 req/s na Sandbox ou maior na produção.
    // Vamos manter 100ms (10 req/s) para segurança.
    if (i < filiados.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  console.log(`\n📊 Resultado: ${enviados}/${filiados.length} enviados. ${erros.length} erros.`)
  if (erros.length > 0) {
    console.log('Emails com erro:', erros.join(', '))
  }

  return { enviados, erros, total: filiados.length }
}
