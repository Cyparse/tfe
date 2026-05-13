import { SMTPClient } from 'https://deno.land/x/denomailer/mod.ts'
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1'
import { encodeBase64 } from 'https://deno.land/std@0.208.0/encoding/base64.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { contestConfirmationEmail } from '../_shared/templates.ts'

const SMTP_HOST = Deno.env.get('SMTP_HOST')!
const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') ?? '465')
const SMTP_USER = Deno.env.get('SMTP_USER')!
const SMTP_PASS = Deno.env.get('SMTP_PASS')!
const FROM = 'Snow Wonder Festival <info@snow-wonder.be>'

const EDITION_DATES: Record<string, string> = {
  december: 'December 6, 2026',
  january: 'January 10, 2027',
  february: 'February 7, 2027',
}

const VENUE = 'Venue TBD — to be announced'

async function buildRegistrationPDF(
  registrationId: string,
  holderName: string,
  edition: string,
  category: string,
): Promise<Uint8Array> {
  const qrRes = await fetch(
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(registrationId)}&format=png`,
  )
  const qrBytes = new Uint8Array(await qrRes.arrayBuffer())

  const doc = await PDFDocument.create()
  const page = doc.addPage([440, 620])
  const { width, height } = page.getSize()

  const bold    = await doc.embedFont(StandardFonts.HelveticaBold)
  const regular = await doc.embedFont(StandardFonts.Helvetica)
  const qrImage = await doc.embedPng(qrBytes)

  const navy    = rgb(0.10, 0.23, 0.42)
  const iceBlue = rgb(0.66, 0.77, 0.91)
  const white   = rgb(1, 1, 1)
  const muted   = rgb(0.45, 0.45, 0.45)
  const light   = rgb(0.30, 0.30, 0.30)
  const divider = rgb(0.88, 0.88, 0.88)
  const gold    = rgb(0.98, 0.82, 0.25)

  const cx = (text: string, font: typeof bold, size: number, y: number, color: typeof white) => {
    const w = font.widthOfTextAtSize(text, size)
    page.drawText(text, { x: (width - w) / 2, y, font, size, color })
  }

  // Header background
  page.drawRectangle({ x: 0, y: height - 130, width, height: 130, color: navy })
  page.drawRectangle({ x: 0, y: height - 132, width, height: 2, color: iceBlue })

  cx('SNOW WONDER FESTIVAL', bold, 18, height - 52, white)
  cx('SNOWMAN CONTEST', regular, 11, height - 76, iceBlue)
  cx(EDITION_DATES[edition] ?? edition, bold, 12, height - 104, white)
  cx('Registration Confirmed', regular, 10, height - 122, iceBlue)

  // Category badge
  const categoryLabel = category === 'pro' ? '🏆 PROFESSIONAL' : '🌟 AMATEUR'
  const badgeW = bold.widthOfTextAtSize(categoryLabel, 13)
  const badgeX = (width - badgeW - 24) / 2
  page.drawRectangle({ x: badgeX, y: height - 178, width: badgeW + 24, height: 28, color: gold, borderRadius: 4 })
  page.drawText(categoryLabel, { x: badgeX + 12, y: height - 167, font: bold, size: 13, color: navy })

  // QR code
  const qrSize = 160
  page.drawImage(qrImage, { x: (width - qrSize) / 2, y: 320, width: qrSize, height: qrSize })

  // Registration ID below QR
  const shortId = registrationId.slice(0, 8).toUpperCase()
  cx(shortId, bold, 14, 298, navy)
  cx('Scan at the contest desk', regular, 9, 282, muted)

  // Divider
  page.drawLine({ start: { x: 40, y: 262 }, end: { x: width - 40, y: 262 }, thickness: 0.5, color: divider })

  // Holder info
  page.drawText('REGISTRANT', { x: 40, y: 240, font: regular, size: 8, color: muted })
  page.drawText(holderName, { x: 40, y: 223, font: bold, size: 14, color: navy })

  // Divider
  page.drawLine({ start: { x: 40, y: 206 }, end: { x: width - 40, y: 206 }, thickness: 0.5, color: divider })

  // Venue
  page.drawText('VENUE', { x: 40, y: 184, font: regular, size: 8, color: muted })
  page.drawText(VENUE, { x: 40, y: 167, font: regular, size: 10, color: light })

  // Footer
  page.drawRectangle({ x: 0, y: 0, width, height: 58, color: rgb(0.96, 0.97, 1.0) })
  page.drawLine({ start: { x: 0, y: 58 }, end: { x: width, y: 58 }, thickness: 0.5, color: divider })
  cx('Snow Wonder Festival · info@snow-wonder.be', regular, 9, 34, muted)
  cx('This card is personal and non-transferable', regular, 8, 18, muted)

  return doc.save()
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, edition, category, registrationId } = await req.json()

    const pdfBytes = await buildRegistrationPDF(registrationId, name, edition, category)

    const html = contestConfirmationEmail({ name, email, edition, category, registrationId })

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
      subject: `✅ Contest Registration — Snow Wonder Festival ${edition}`,
      html,
      attachments: [
        {
          filename: `registration-${registrationId.slice(0, 8).toUpperCase()}.pdf`,
          content: encodeBase64(pdfBytes),
          contentType: 'application/pdf',
          encoding: 'base64',
        },
      ],
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
