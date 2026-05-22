import nodemailer from 'npm:nodemailer'
import { Buffer } from 'node:buffer'
import { corsHeaders } from '../_shared/cors.ts'
import { emailConfirmationConcours } from '../_shared/templates.ts'
import { checkRateLimit } from '../_shared/rateLimit.ts'

const SMTP_HOST = Deno.env.get('SMTP_HOST')!
const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') ?? '465')
const SMTP_USER = Deno.env.get('SMTP_USER')!
const SMTP_PASS = Deno.env.get('SMTP_PASS')!
const FROM = 'Snow Wonder Festival <info@snow-wonder.be>'

const LIEU = 'Tournai Parc Georges Brassens'

async function genererCartePDF(
  idInscription: string,
  nomParticipant: string,
  edition: string,
  categorie: string,
  editionLabelResolved: string,
  editionDate: string,
  editionTime: string,
): Promise<Uint8Array> {
  const { PDFDocument, rgb, StandardFonts } = await import('npm:pdf-lib')

  const qrRes = await fetch(
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(idInscription)}&format=png`,
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
  const or         = rgb(0.83, 0.69, 0.22)

  const cx = (texte: string, fonte: typeof gras, taille: number, y: number, couleur: typeof blanc) => {
    const l = fonte.widthOfTextAtSize(texte, taille)
    page.drawText(texte, { x: (width - l) / 2, y, font: fonte, size: taille, color: couleur })
  }

  // En-tête marine
  page.drawRectangle({ x: 0, y: height - 130, width, height: 130, color: marine })
  page.drawRectangle({ x: 0, y: height - 132, width, height: 2, color: glace })

  cx('SNOW WONDER FESTIVAL', gras, 18, height - 52, blanc)
  cx('CONCOURS DE BONHOMME DE NEIGE', regular, 11, height - 76, glace)
  cx(editionDate || editionLabelResolved, gras, 12, height - 104, blanc)
  cx('Inscription confirmée', regular, 10, height - 122, glace)

  // Badge catégorie
  const labelCategorie = categorie === 'professionnel' ? 'PROFESSIONNEL' : 'AMATEUR'
  const largeurBadge = gras.widthOfTextAtSize(labelCategorie, 13)
  const xBadge = (width - largeurBadge - 24) / 2
  page.drawRectangle({ x: xBadge, y: height - 178, width: largeurBadge + 24, height: 26, color: or })
  page.drawText(labelCategorie, { x: xBadge + 12, y: height - 167, font: gras, size: 13, color: marine })

  // QR code
  const tailleQR = 160
  page.drawImage(qrImage, { x: (width - tailleQR) / 2, y: 320, width: tailleQR, height: tailleQR })

  const shortId = idInscription.slice(0, 8).toUpperCase()
  cx(shortId, gras, 14, 298, marine)
  cx("À présenter au bureau d'accueil", regular, 9, 282, discret)

  // Séparateur
  page.drawLine({ start: { x: 40, y: 262 }, end: { x: width - 40, y: 262 }, thickness: 0.5, color: separateur })

  // Participant
  page.drawText('PARTICIPANT', { x: 40, y: 240, font: regular, size: 8, color: discret })
  page.drawText(nomParticipant, { x: 40, y: 223, font: gras, size: 14, color: marine })

  page.drawLine({ start: { x: 40, y: 206 }, end: { x: width - 40, y: 206 }, thickness: 0.5, color: separateur })

  // Lieu + Heure
  page.drawText('LIEU', { x: 40, y: 184, font: regular, size: 8,  color: discret })
  page.drawText(LIEU,   { x: 40, y: 167, font: regular, size: 10, color: clair   })
  if (editionTime) {
    page.drawText('HEURE',      { x: 240, y: 184, font: regular, size: 8,  color: discret })
    page.drawText(editionTime,  { x: 240, y: 167, font: gras,    size: 13, color: marine  })
  }

  // Pied de page
  page.drawRectangle({ x: 0, y: 0, width, height: 58, color: rgb(0.96, 0.97, 1.0) })
  page.drawLine({ start: { x: 0, y: 58 }, end: { x: width, y: 58 }, thickness: 0.5, color: separateur })
  cx('Snow Wonder Festival · info@snow-wonder.be', regular, 9, 34, discret)
  cx('Cette carte est personnelle et non transférable', regular, 8, 18, discret)

  return doc.save()
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name: nom, email, edition, editionLabel, editionDate = '', editionTime = '', category, registrationId: idInscription } = await req.json()
    const editionLabelResolved: string = editionLabel ?? edition
    const categorie = category === 'pro' ? 'professionnel' : 'amateur'
    console.log(`send-confirmation-concours: ${email} edition=${edition}`)

    // 5 e-mails de confirmation max par email par heure (protection anti-spam)
    const allowed = await checkRateLimit(`confirmation:${email.toLowerCase()}`, 5, 3600)
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Trop de requêtes.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let piecesJointes: object[] = []
    try {
      const pdfBytes = await genererCartePDF(idInscription, nom, edition, categorie, editionLabelResolved, editionDate, editionTime)
      piecesJointes = [{
        filename: `inscription-${idInscription.slice(0, 8).toUpperCase()}.pdf`,
        content: Buffer.from(pdfBytes),
        contentType: 'application/pdf',
      }]
      console.log('PDF prêt')
    } catch (erreurPdf) {
      console.error('Échec PDF :', erreurPdf)
    }

    const html = emailConfirmationConcours({ nom, email, edition, editionLabel: editionLabelResolved, editionDate, editionTime, categorie, idInscription })

    const transporteur = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })

    await transporteur.sendMail({
      from: FROM,
      to: email,
      subject: `Inscription au concours confirmée — Snow Wonder Festival ${edition}`,
      html,
      attachments: piecesJointes,
    })

    console.log('Email envoyé')

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Erreur :', err)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})