import nodemailer from 'npm:nodemailer'
import { Buffer } from 'node:buffer'
import { corsHeaders } from '../_shared/cors.ts'
import { emailConfirmationBillets } from '../_shared/templates.ts'

const SMTP_HOST = Deno.env.get('SMTP_HOST')!
const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') ?? '465')
const SMTP_USER = Deno.env.get('SMTP_USER')!
const SMTP_PASS = Deno.env.get('SMTP_PASS')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FROM = 'Snow Wonder Festival <info@snow-wonder.be>'

const DATES_EDITIONS: Record<string, string> = {
  december: '6 décembre 2026',
  january:  '10 janvier 2027',
  february: '7 février 2027',
}

const LIEU = 'Lieu à confirmer — annonce prochainement'

function genererNumeroBillet(edition: string): string {
  const prefixe = edition.slice(0, 3).toUpperCase()
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `SWF-${prefixe}-${code}`
}

async function genererBilletPDF(
  numeroBillet: string,
  nomPorteur: string,
  edition: string,
  idCommande: string,
): Promise<Uint8Array> {
  const { PDFDocument, rgb, StandardFonts } = await import('npm:pdf-lib')

  const qrRes = await fetch(
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(numeroBillet)}&format=png`,
  )
  const qrBytes = new Uint8Array(await qrRes.arrayBuffer())

  const doc  = await PDFDocument.create()
  const page = doc.addPage([440, 620])
  const { width, height } = page.getSize()

  const gras       = await doc.embedFont(StandardFonts.HelveticaBold)
  const regular    = await doc.embedFont(StandardFonts.Helvetica)
  const qrImage    = await doc.embedPng(qrBytes)

  const marine     = rgb(0.10, 0.23, 0.42)
  const glace      = rgb(0.66, 0.77, 0.91)
  const blanc      = rgb(1, 1, 1)
  const discret    = rgb(0.45, 0.45, 0.45)
  const clair      = rgb(0.30, 0.30, 0.30)
  const separateur = rgb(0.88, 0.88, 0.88)

  const cx = (texte: string, fonte: typeof gras, taille: number, y: number, couleur: typeof blanc) => {
    const l = fonte.widthOfTextAtSize(texte, taille)
    page.drawText(texte, { x: (width - l) / 2, y, font: fonte, size: taille, color: couleur })
  }

  // En-tête marine
  page.drawRectangle({ x: 0, y: height - 130, width, height: 130, color: marine })
  page.drawRectangle({ x: 0, y: height - 132, width, height: 2, color: glace })

  cx('SNOW WONDER FESTIVAL', gras, 18, height - 52, blanc)
  cx("BILLET D'ENTRÉE", regular, 11, height - 76, glace)
  cx(DATES_EDITIONS[edition] ?? edition, gras, 12, height - 104, blanc)
  cx('Concours & Village Gastronomique', regular, 10, height - 122, glace)

  // QR code
  const tailleQR = 170
  page.drawImage(qrImage, { x: (width - tailleQR) / 2, y: 330, width: tailleQR, height: tailleQR })

  cx(numeroBillet, gras, 15, 308, marine)
  cx("À scanner à l'entrée", regular, 9, 292, discret)

  // Séparateur
  page.drawLine({ start: { x: 40, y: 272 }, end: { x: width - 40, y: 272 }, thickness: 0.5, color: separateur })

  // Porteur du billet
  page.drawText('TITULAIRE DU BILLET', { x: 40, y: 250, font: regular, size: 8, color: discret })
  page.drawText(nomPorteur, { x: 40, y: 233, font: gras, size: 14, color: marine })

  // Référence commande
  page.drawText('RÉFÉRENCE COMMANDE', { x: 40, y: 208, font: regular, size: 8, color: discret })
  page.drawText(idCommande.slice(0, 8).toUpperCase(), { x: 40, y: 191, font: regular, size: 11, color: clair })

  page.drawLine({ start: { x: 40, y: 174 }, end: { x: width - 40, y: 174 }, thickness: 0.5, color: separateur })

  // Lieu
  page.drawText('LIEU', { x: 40, y: 152, font: regular, size: 8, color: discret })
  page.drawText(LIEU, { x: 40, y: 135, font: regular, size: 10, color: clair })

  // Pied de page
  page.drawRectangle({ x: 0, y: 0, width, height: 58, color: rgb(0.96, 0.97, 1.0) })
  page.drawLine({ start: { x: 0, y: 58 }, end: { x: width, y: 58 }, thickness: 0.5, color: separateur })
  cx('Snow Wonder Festival · info@snow-wonder.be', regular, 9, 34, discret)
  cx('Ce billet est valable pour une personne', regular, 8, 18, discret)

  return doc.save()
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name: nom, email, edition, quantity: quantite, orderId: idCommande } = await req.json()
    console.log(`send-confirmation-billets: ${email} edition=${edition} qte=${quantite}`)

    const billets = Array.from({ length: quantite }, () => ({
      ticket_number: genererNumeroBillet(edition),
      order_id: idCommande,
      edition,
      holder_name: nom,
      holder_email: email,
    }))

    const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/tickets`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        apikey: SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(billets),
    })

    if (!dbRes.ok) {
      const err = await dbRes.text()
      throw new Error(`Échec insertion DB : ${err}`)
    }

    let piecesJointes: object[] = []
    try {
      piecesJointes = await Promise.all(
        billets.map(async (b) => {
          const pdfBytes = await genererBilletPDF(b.ticket_number, nom, edition, idCommande)
          return {
            filename: `billet-${b.ticket_number}.pdf`,
            content: Buffer.from(pdfBytes),
            contentType: 'application/pdf',
          }
        }),
      )
      console.log(`${piecesJointes.length} PDF(s) prêt(s)`)
    } catch (erreurPdf) {
      console.error('Échec PDF :', erreurPdf)
    }

    const html = emailConfirmationBillets({ nom, email, edition, quantite, idCommande })

    const transporteur = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })

    await transporteur.sendMail({
      from: FROM,
      to: email,
      subject: `Vos billets — Snow Wonder Festival ${edition}`,
      html,
      attachments: piecesJointes,
    })

    console.log('Email envoyé')

    return new Response(
      JSON.stringify({ success: true, billets: billets.map((b) => b.ticket_number) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('Erreur :', err)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})