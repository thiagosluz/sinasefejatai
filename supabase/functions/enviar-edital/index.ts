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

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Responder imediatamente que o processamento iniciou
    // O EdgeRuntime.waitUntil() permite continuar o processamento após a resposta
    const responsePromise = processarEnvios(filiados, subject, html, attachment, replyTo, RESEND_API_KEY)

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
  apiKey: string
) {
  let enviados = 0
  const erros: string[] = []

  // Montar attachments para o Resend REST API
  const attachments = attachment
    ? [{ filename: attachment.filename, path: attachment.url }]
    : undefined

  for (let i = 0; i < filiados.length; i++) {
    const filiado = filiados[i]

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: 'SINASEFE Jataí <nao-responda@email.sinasefejatai.org.br>',
          to: [filiado.email],
          subject,
          html,
          attachments,
          reply_to: replyTo,
        }),
      })

      if (res.ok) {
        enviados++
        console.log(`[${i + 1}/${filiados.length}] ✅ Enviado para ${filiado.email}`)
      } else {
        const errorBody = await res.text()
        console.error(`[${i + 1}/${filiados.length}] ❌ Falha para ${filiado.email}: ${res.status} - ${errorBody}`)
        erros.push(filiado.email)
      }
    } catch (err) {
      console.error(`[${i + 1}/${filiados.length}] ❌ Erro para ${filiado.email}:`, err)
      erros.push(filiado.email)
    }

    // Rate limit: 250ms entre envios (4 req/s, dentro do limite de 5 do Resend)
    if (i < filiados.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 250))
    }
  }

  console.log(`\n📊 Resultado: ${enviados}/${filiados.length} enviados. ${erros.length} erros.`)
  if (erros.length > 0) {
    console.log('Emails com erro:', erros.join(', '))
  }

  return { enviados, erros, total: filiados.length }
}
