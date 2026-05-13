import { SMTPClient } from 'https://deno.land/x/denomailer/mod.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { ticketConfirmationEmail } from '../_shared/templates.ts'

const SMTP_HOST = Deno.env.get('SMTP_HOST')!
const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') ?? '465')
const SMTP_USER = Deno.env.get('SMTP_USER')!
const SMTP_PASS = Deno.env.get('SMTP_PASS')!
const FROM = 'Snow Wonder Festival <info@snow-wonder.be>'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { name, email, edition, quantity, orderId } = body

    const html = ticketConfirmationEmail({ name, email, edition, quantity, orderId })

    const client = new SMTPClient({
      connection: {
        hostname: SMTP_HOST,
        port: SMTP_PORT,
        tls: true,
        auth: { username: SMTP_USER, password: SMTP_PASS },
      },
    })

    await client.send({
      from: FROM,
      to: email,
      subject: `🎫 Your Tickets — Snow Wonder Festival ${edition}`,
      html,
    })

    await client.close()

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
