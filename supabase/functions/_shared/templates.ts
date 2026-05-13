type Edition = 'december' | 'january' | 'february'
type CategorieParticipant = 'amateur' | 'professionnel'

const datesEditions: Record<Edition, string> = {
  december: '6 décembre 2026',
  january:  '10 janvier 2027',
  february: '7 février 2027',
}

export function emailConfirmationConcours(donnees: {
  nom: string
  email: string
  edition: Edition
  categorie: CategorieParticipant
  idInscription: string
}) {
  const dateEdition = datesEditions[donnees.edition] ?? donnees.edition
  const labelCategorie = donnees.categorie === 'professionnel' ? 'Professionnel' : 'Amateur'
  const shortId = donnees.idInscription.slice(0, 8).toUpperCase()

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inscription confirmée — Snow Wonder Festival</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4ff;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f4ff;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e0e8f0;">

          <!-- En-tête -->
          <tr>
            <td style="background-color:#0d2a5e;padding:40px 36px 32px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom:20px;text-align:center;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                      <tr>
                        <td width="60" style="height:1px;background:linear-gradient(to right,transparent,rgba(212,175,55,0.6));font-size:1px;">&nbsp;</td>
                        <td width="10" style="text-align:center;padding:0 6px;">
                          <div style="width:6px;height:6px;background:#d4af37;display:inline-block;transform:rotate(45deg);"></div>
                        </td>
                        <td width="60" style="height:1px;background:linear-gradient(to left,transparent,rgba(212,175,55,0.6));font-size:1px;">&nbsp;</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:18px;text-align:center;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;width:72px;height:72px;border-radius:50%;border:1px solid rgba(212,175,55,0.35);">
                      <tr>
                        <td align="center" valign="middle" style="font-size:28px;color:#d4af37;">&#x2605;</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:8px;">
                    <p style="margin:0;font-size:10px;font-weight:bold;letter-spacing:0.18em;text-transform:uppercase;color:rgba(212,175,55,0.8);text-align:center;">Snow Wonder Festival</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:6px;">
                    <h1 style="margin:0;font-size:24px;font-weight:600;color:#ffffff;text-align:center;line-height:1.2;">Concours de bonhomme de neige</h1>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="margin:0;font-size:11px;font-weight:300;letter-spacing:0.12em;text-transform:uppercase;color:rgba(168,196,232,0.9);text-align:center;">Inscription confirmée</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td style="padding:32px 36px;">
              <p style="margin:0 0 6px;font-size:15px;color:#1a1a2e;">Cher(e) <strong>${donnees.nom}</strong>,</p>
              <p style="margin:0 0 24px;font-size:14px;color:#666666;font-weight:300;">Votre inscription au concours a bien été enregistrée. Retrouvez ci-dessous le récapitulatif de votre participation.</p>

              <!-- Tableau détails -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:11px 0;font-size:13px;color:#888888;font-weight:300;width:45%;border-bottom:1px solid #f0f0f0;">Catégorie</td>
                  <td style="padding:11px 0;font-size:13px;text-align:right;border-bottom:1px solid #f0f0f0;">
                    <span style="display:inline-block;background:#e8f0fe;color:#1a3f7a;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:500;">${labelCategorie}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:11px 0;font-size:13px;color:#888888;font-weight:300;width:45%;border-bottom:1px solid #f0f0f0;">Édition</td>
                  <td style="padding:11px 0;font-size:13px;text-align:right;font-weight:500;color:#1a1a2e;border-bottom:1px solid #f0f0f0;">${dateEdition}</td>
                </tr>
                <tr>
                  <td style="padding:11px 0;font-size:13px;color:#888888;font-weight:300;width:45%;">Numéro d'inscription</td>
                  <td style="padding:11px 0;font-size:12px;text-align:right;font-family:'Courier New',monospace;color:#888888;letter-spacing:0.08em;">${shortId}</td>
                </tr>
              </table>

              <!-- Avis pièce jointe -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#f0f4ff;border-left:3px solid #1a3a6b;padding:14px 16px;">
                    <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#1a3a6b;">Votre carte d'inscription est jointe à cet email.</p>
                    <p style="margin:0;font-size:12px;color:#666666;font-weight:300;">Elle contient un code QR — présentez-la au bureau d'accueil à votre arrivée.</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#888888;font-weight:300;font-style:italic;">Apportez votre créativité et vos gants les plus chauds. Bonne chance !</p>
            </td>
          </tr>

          <!-- Pied de page -->
          <tr>
            <td style="padding:16px 36px;background:#f8f9ff;border-top:1px solid #eef0f8;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size:13px;font-style:italic;color:#888888;">Snow Wonder Festival</td>
                  <td style="font-size:11px;color:#aaaaaa;font-weight:300;text-align:right;">Envoyé à ${donnees.email}</td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function emailConfirmationBillets(donnees: {
  nom: string
  email: string
  edition: Edition
  quantite: number
  idCommande: string
}) {
  const pluriel = donnees.quantite > 1
  const dateEdition = datesEditions[donnees.edition] ?? donnees.edition
  const shortId = donnees.idCommande.slice(0, 8).toUpperCase()

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Billets — Snow Wonder Festival</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4ff;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f4ff;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e0e8f0;">

          <!-- En-tête -->
          <tr>
            <td style="background-color:#0d2a5e;padding:40px 36px 32px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom:20px;text-align:center;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                      <tr>
                        <td width="60" style="height:1px;background:linear-gradient(to right,transparent,rgba(212,175,55,0.6));font-size:1px;">&nbsp;</td>
                        <td width="10" style="text-align:center;padding:0 6px;">
                          <div style="width:6px;height:6px;background:#d4af37;display:inline-block;transform:rotate(45deg);"></div>
                        </td>
                        <td width="60" style="height:1px;background:linear-gradient(to left,transparent,rgba(212,175,55,0.6));font-size:1px;">&nbsp;</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:18px;text-align:center;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;width:72px;height:72px;border-radius:50%;border:1px solid rgba(212,175,55,0.35);">
                      <tr>
                        <td align="center" valign="middle" style="font-size:28px;color:#d4af37;">&#x2756;</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:8px;">
                    <p style="margin:0;font-size:10px;font-weight:bold;letter-spacing:0.18em;text-transform:uppercase;color:rgba(212,175,55,0.8);text-align:center;">Snow Wonder Festival</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:6px;">
                    <h1 style="margin:0;font-size:24px;font-weight:600;color:#ffffff;text-align:center;line-height:1.2;">${pluriel ? 'Billets' : 'Billet'} d'entrée</h1>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="margin:0;font-size:11px;font-weight:300;letter-spacing:0.12em;text-transform:uppercase;color:rgba(168,196,232,0.9);text-align:center;">Réservation confirmée</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td style="padding:32px 36px;">
              <p style="margin:0 0 6px;font-size:15px;color:#1a1a2e;">Cher(e) <strong>${donnees.nom}</strong>,</p>
              <p style="margin:0 0 24px;font-size:14px;color:#666666;font-weight:300;">${pluriel ? 'Vos billets sont confirmés.' : 'Votre billet est confirmé.'} Retrouvez ci-dessous les détails de votre réservation.</p>

              <!-- Tableau détails -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:11px 0;font-size:13px;color:#888888;font-weight:300;width:45%;border-bottom:1px solid #f0f0f0;">${pluriel ? 'Billets' : 'Billet'}</td>
                  <td style="padding:11px 0;font-size:13px;text-align:right;border-bottom:1px solid #f0f0f0;">
                    <span style="display:inline-block;background:#e8f0fe;color:#1a3f7a;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:500;">${donnees.quantite} billet${pluriel ? 's' : ''} (entrée gratuite)</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:11px 0;font-size:13px;color:#888888;font-weight:300;width:45%;border-bottom:1px solid #f0f0f0;">Édition</td>
                  <td style="padding:11px 0;font-size:13px;text-align:right;font-weight:500;color:#1a1a2e;border-bottom:1px solid #f0f0f0;">${dateEdition}</td>
                </tr>
                <tr>
                  <td style="padding:11px 0;font-size:13px;color:#888888;font-weight:300;width:45%;">Référence commande</td>
                  <td style="padding:11px 0;font-size:12px;text-align:right;font-family:'Courier New',monospace;color:#888888;letter-spacing:0.08em;">${shortId}</td>
                </tr>
              </table>

              <!-- Avis pièce jointe -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#f0f4ff;border-left:3px solid #1a3a6b;padding:14px 16px;">
                    <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#1a3a6b;">${pluriel ? 'Vos billets sont joints à cet email.' : 'Votre billet est joint à cet email.'}</p>
                    <p style="margin:0;font-size:12px;color:#666666;font-weight:300;">Chaque PDF contient un code QR — ${pluriel ? 'présentez-les' : 'présentez-le'} à l'entrée pour le faire scanner.</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#888888;font-weight:300;font-style:italic;">Nous nous réjouissons de vous accueillir au festival. Profitez de la gastronomie, de la neige et de l'ambiance !</p>
            </td>
          </tr>

          <!-- Pied de page -->
          <tr>
            <td style="padding:16px 36px;background:#f8f9ff;border-top:1px solid #eef0f8;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size:13px;font-style:italic;color:#888888;">Snow Wonder Festival</td>
                  <td style="font-size:11px;color:#aaaaaa;font-weight:300;text-align:right;">Envoyé à ${donnees.email}</td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
