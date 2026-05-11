import { corsHeaders } from '../_shared/cors.ts'
import { contestConfirmationEmail } from '../_shared/templates.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM = 'Snow Festival <noreply@yourfestival.com>'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { name, email, edition, category, registrationId } = body

    const html = contestConfirmationEmail({ name, email, edition, category, registrationId })

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        subject: `✅ Contest Registration — Snow Festival ${edition}`,
        html,
      }),
    })

    const data = await res.json()

    if (!res.ok) throw new Error(data.message ?? 'Resend error')

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})