import { SMTPClient } from 'https://deno.land/x/denomailer/mod.ts'
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1'
import { encodeBase64 } from 'https://deno.land/std@0.208.0/encoding/base64.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { ticketConfirmationEmail } from '../_shared/templates.ts'

const SMTP_HOST = Deno.env.get('SMTP_HOST')!
const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') ?? '465')
const SMTP_USER = Deno.env.get('SMTP_USER')!
const SMTP_PASS = Deno.env.get('SMTP_PASS')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FROM = 'Snow Wonder Festival <info@snow-wonder.be>'

const EDITION_DATES: Record<string, string> = {
  december: 'December 6, 2026',
  january: 'January 10, 2027',
  february: 'February 7, 2027',
}

const VENUE = 'Venue TBD — to be announced'

function generateTicketNumber(edition: string): string {
  const prefix = edition.slice(0, 3).toUpperCase()
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `SWF-${prefix}-${code}`
}

async function buildTicketPDF(
  ticketNumber: string,
  holderName: string,
  edition: string,
  orderId: string,
): Promise<Uint8Array> {
  const qrRes = await fetch(
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticketNumber)}&format=png`,
  )
  const qrBytes = new Uint8Array(await qrRes.arrayBuffer())

  const doc = await PDFDocument.create()
  const page = doc.addPage([440, 620])
  const { width, height } = page.getSize()

  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const regular = await doc.embedFont(StandardFonts.Helvetica)
  const qrImage = await doc.embedPng(qrBytes)

  const navy    = rgb(0.10, 0.23, 0.42)
  const iceBlue = rgb(0.66, 0.77, 0.91)
  const white   = rgb(1, 1, 1)
  const muted   = rgb(0.45, 0.45, 0.45)
  const light   = rgb(0.30, 0.30, 0.30)
  const divider = rgb(0.88, 0.88, 0.88)

  const cx = (text: string, font: typeof bold, size: number, y: number, color: typeof white) => {
    const w = font.widthOfTextAtSize(text, size)
    page.drawText(text, { x: (width - w) / 2, y, font, size, color })
  }

  // Header background
  page.drawRectangle({ x: 0, y: height - 130, width, height: 130, color: navy })

  // Snowflake accent line
  page.drawRectangle({ x: 0, y: height - 132, width, height: 2, color: iceBlue })

  cx('SNOW WONDER FESTIVAL', bold, 18, height - 52, white)
  cx('ENTRY TICKET', regular, 11, height - 76, iceBlue)
  cx(EDITION_DATES[edition] ?? edition, bold, 12, height - 104, white)
  cx('snowman contest & food village', regular, 10, height - 122, iceBlue)

  // QR code
  const qrSize = 170
  page.drawImage(qrImage, { x: (width - qrSize) / 2, y: 330, width: qrSize, height: qrSize })

  // Ticket number
  cx(ticketNumber, bold, 15, 308, navy)

  const scanNote = 'Scan this QR code at the entrance'
  cx(scanNote, regular, 9, 292, muted)

  // Divider
  page.drawLine({
    start: { x: 40, y: 272 },
    end: { x: width - 40, y: 272 },
    thickness: 0.5,
    color: divider,
  })

  // Holder
  page.drawText('TICKET HOLDER', { x: 40, y: 250, font: regular, size: 8, color: muted })
  page.drawText(holderName, { x: 40, y: 233, font: bold, size: 14, color: navy })

  // Order ref
  page.drawText('ORDER REFERENCE', { x: 40, y: 208, font: regular, size: 8, color: muted })
  page.drawText(orderId.slice(0, 8).toUpperCase(), { x: 40, y: 191, font: regular, size: 11, color: light })

  // Divider
  page.drawLine({
    start: { x: 40, y: 174 },
    end: { x: width - 40, y: 174 },
    thickness: 0.5,
    color: divider,
  })

  // Venue
  page.drawText('VENUE', { x: 40, y: 152, font: regular, size: 8, color: muted })
  page.drawText(VENUE, { x: 40, y: 135, font: regular, size: 10, color: light })

  // Footer
  page.drawRectangle({ x: 0, y: 0, width, height: 58, color: rgb(0.96, 0.97, 1.0) })
  page.drawLine({ start: { x: 0, y: 58 }, end: { x: width, y: 58 }, thickness: 0.5, color: divider })
  cx('Snow Wonder Festival · info@snow-wonder.be', regular, 9, 34, muted)
  cx('This ticket is valid for one person', regular, 8, 18, muted)

  return doc.save()
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, edition, quantity, orderId } = await req.json()

    // Generate one ticket record per ticket in the order
    const tickets = Array.from({ length: quantity }, () => ({
      ticket_number: generateTicketNumber(edition),
      order_id: orderId,
      edition,
      holder_name: name,
      holder_email: email,
    }))

    // Insert into tickets table using service role
    const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/tickets`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        apikey: SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(tickets),
    })

    if (!dbRes.ok) {
      const err = await dbRes.text()
      throw new Error(`DB insert failed: ${err}`)
    }

    // Build a PDF for each ticket
    const attachments = await Promise.all(
      tickets.map(async (t) => {
        const pdfBytes = await buildTicketPDF(t.ticket_number, name, edition, orderId)
        return {
          filename: `ticket-${t.ticket_number}.pdf`,
          content: encodeBase64(pdfBytes),
          contentType: 'application/pdf',
          encoding: 'base64',
        }
      }),
    )

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
      attachments,
    })

    await client.close()

    return new Response(
      JSON.stringify({ success: true, tickets: tickets.map((t) => t.ticket_number) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
