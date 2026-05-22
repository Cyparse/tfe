import nodemailer from 'npm:nodemailer'
import { corsHeaders } from '../_shared/cors.ts'
import { checkRateLimit } from '../_shared/rateLimit.ts'

const SMTP_HOST = Deno.env.get('SMTP_HOST')!
const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') ?? '465')
const SMTP_USER = Deno.env.get('SMTP_USER')!
const SMTP_PASS = Deno.env.get('SMTP_PASS')!
const TO = 'info@snow-wonder.be'
const FROM = 'Snow Wonder Festival <info@snow-wonder.be>'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { nom, email, sujet, message } = await req.json()

    if (!nom || !email || !sujet || !message) {
      return new Response(JSON.stringify({ error: 'Champs manquants' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3 messages max par email par heure
    const allowed = await checkRateLimit(`contact:${email.toLowerCase()}`, 3, 3600)
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Trop de messages envoyés. Réessayez dans une heure.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const transporteur = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })

    const safeNom = escapeHtml(nom)
    const safeEmail = escapeHtml(email)
    const safeSujet = escapeHtml(sujet)
    const safeMessage = escapeHtml(message)

    await transporteur.sendMail({
      from: FROM,
      to: TO,
      replyTo: `${safeNom} <${safeEmail}>`,
      subject: `[Contact] ${safeSujet}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #002442; color: #cae9ff; border-radius: 12px;">
          <h2 style="color: #e8a94e; margin-top: 0;">Nouveau message de contact</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 8px 0; color: #cae9ff99; font-size: 13px; width: 80px;">Nom</td>
              <td style="padding: 8px 0; color: #fff; font-weight: bold;">${safeNom}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #cae9ff99; font-size: 13px;">Email</td>
              <td style="padding: 8px 0; color: #fff;"><a href="mailto:${safeEmail}" style="color: #e8a94e;">${safeEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #cae9ff99; font-size: 13px;">Sujet</td>
              <td style="padding: 8px 0; color: #fff;">${safeSujet}</td>
            </tr>
          </table>
          <div style="background: rgba(255,255,255,0.06); border-radius: 8px; padding: 20px; white-space: pre-wrap; color: #cae9ff; line-height: 1.6;">${safeMessage}</div>
          <p style="margin-top: 24px; font-size: 11px; color: #cae9ff40;">Snow Wonder Festival — formulaire de contact</p>
        </div>
      `,
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Erreur send-contact :', err)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
