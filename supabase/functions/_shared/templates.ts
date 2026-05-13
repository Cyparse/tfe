// Pas de React nécessaire — template literals TypeScript
// Tous les styles sont inline pour une compatibilité maximale avec les clients email

type Edition = 'decembre' | 'janvier' | 'fevrier' | 'december' | 'january' | 'february'
type CategorieParticipant = 'amateur' | 'professionnel' | 'pro'

const datesEditions: Record<Edition, string> = {
  // Clés françaises
  decembre: '6 décembre 2026',
  janvier:  '10 janvier 2027',
  fevrier:  '7 février 2027',
  // Clés anglaises (rétrocompatibilité)
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
  const labelCategorie = (donnees.categorie === 'professionnel' || donnees.categorie === 'pro') ? 'Professionnel' : 'Amateur'

  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#eef2fb;font-family:Arial,Helvetica,sans-serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef2fb;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dde4f0;">

        <!-- En-tête -->
        <tr>
          <td style="background-color:#0d2a5e;padding:36px 36px 32px;text-align:center;">

            <!-- Ornement doré -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td style="border-bottom:1px solid rgba(212,175,55,0.45);width:60px;"></td>
                <td style="width:10px;text-align:center;padding-bottom:0;">
                  <div style="width:6px;height:6px;background-color:#d4af37;transform:rotate(45deg);display:inline-block;margin:0 auto;"></div>
                </td>
                <td style="border-bottom:1px solid rgba(212,175,55,0.45);width:60px;"></td>
              </tr>
            </table>

            <!-- Cercle icône -->
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
              <tr>
                <td width="64" height="64" align="center" valign="middle" style="border-radius:50%;border:1px solid rgba(212,175,55,0.4);font-size:22px;color:#d4af37;font-weight:bold;">&#9733;</td>
              </tr>
            </table>

            <p style="margin:0 0 6px;font-size:10px;font-weight:bold;letter-spacing:0.18em;text-transform:uppercase;color:rgba(212,175,55,0.8);">Snow Wonder Festival</p>
            <h1 style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:600;color:#ffffff;line-height:1.25;">Concours de bonhomme de neige</h1>
            <p style="margin:0;font-size:11px;font-weight:normal;letter-spacing:0.14em;text-transform:uppercase;color:rgba(168,196,232,0.9);">Inscription confirmée</p>
          </td>
        </tr>

        <!-- Corps -->
        <tr>
          <td style="padding:32px 36px;">
            <p style="margin:0 0 4px;font-size:15px;color:#1a1a2e;">Cher(e) <strong style="font-weight:600;">${donnees.nom}</strong>,</p>
            <p style="margin:0 0 24px;font-size:14px;color:#777777;font-weight:300;line-height:1.6;">Votre inscription au concours a bien été enregistrée. Retrouvez ci-dessous le récapitulatif de votre participation.</p>

            <!-- Tableau détails -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">

              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="padding:11px 0;font-size:13px;color:#999999;font-weight:300;width:45%;">Catégorie</td>
                <td style="padding:11px 0;font-size:13px;text-align:right;">
                  <span style="display:inline-block;background-color:#e8f0fe;color:#1a3f7a;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:600;">${labelCategorie}</span>
                </td>
              </tr>

              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="padding:11px 0;font-size:13px;color:#999999;font-weight:300;">Édition</td>
                <td style="padding:11px 0;font-size:13px;text-align:right;font-weight:600;color:#1a1a2e;">${datesEditions[donnees.edition]}</td>
              </tr>

              <tr>
                <td style="padding:11px 0;font-size:13px;color:#999999;font-weight:300;">Numéro d'inscription</td>
                <td style="padding:11px 0;font-size:12px;text-align:right;font-family:'Courier New',Courier,monospace;color:#888888;letter-spacing:0.08em;">${donnees.idInscription.slice(0, 8).toUpperCase()}</td>
              </tr>

            </table>

            <!-- Note pièce jointe -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="border-left:3px solid #1a3a6b;padding:12px 16px;background-color:#f0f4ff;">
                  <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#1a3a6b;">Votre carte d'inscription est jointe à cet email.</p>
                  <p style="margin:0;font-size:12px;color:#777777;font-weight:300;">Elle contient un code QR — présentez-la au bureau d'accueil à votre arrivée.</p>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:13px;color:#999999;font-weight:300;font-style:italic;">Apportez votre créativité et vos gants les plus chauds. Bonne chance !</p>
          </td>
        </tr>

        <!-- Pied de page -->
        <tr>
          <td style="background-color:#f8f9ff;border-top:1px solid #eef0f8;padding:16px 36px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-family:Georgia,serif;font-size:13px;font-style:italic;color:#aaaaaa;">Snow Wonder Festival</td>
                <td style="font-size:11px;color:#cccccc;font-weight:300;text-align:right;">Envoyé à ${donnees.email}</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>
  `
}

export function emailConfirmationBillets(donnees: {
  nom: string
  email: string
  edition: Edition
  quantite: number
  idCommande: string
}) {
  const pluriel = donnees.quantite > 1

  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#eef2fb;font-family:Arial,Helvetica,sans-serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef2fb;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dde4f0;">

        <!-- En-tête -->
        <tr>
          <td style="background-color:#0d2a5e;padding:36px 36px 32px;text-align:center;">

            <!-- Ornement doré -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td style="border-bottom:1px solid rgba(212,175,55,0.45);width:60px;"></td>
                <td style="width:10px;text-align:center;">
                  <div style="width:6px;height:6px;background-color:#d4af37;transform:rotate(45deg);display:inline-block;margin:0 auto;"></div>
                </td>
                <td style="border-bottom:1px solid rgba(212,175,55,0.45);width:60px;"></td>
              </tr>
            </table>

            <!-- Cercle icône -->
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
              <tr>
                <td width="64" height="64" align="center" valign="middle" style="border-radius:50%;border:1px solid rgba(212,175,55,0.4);font-size:22px;color:#d4af37;font-weight:bold;">&#9670;</td>
              </tr>
            </table>

            <p style="margin:0 0 6px;font-size:10px;font-weight:bold;letter-spacing:0.18em;text-transform:uppercase;color:rgba(212,175,55,0.8);">Snow Wonder Festival</p>
            <h1 style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:600;color:#ffffff;line-height:1.25;">Village Gastronomique</h1>
            <p style="margin:0;font-size:11px;font-weight:normal;letter-spacing:0.14em;text-transform:uppercase;color:rgba(168,196,232,0.9);">Réservation confirmée</p>
          </td>
        </tr>

        <!-- Corps -->
        <tr>
          <td style="padding:32px 36px;">
            <p style="margin:0 0 4px;font-size:15px;color:#1a1a2e;">Cher(e) <strong style="font-weight:600;">${donnees.nom}</strong>,</p>
            <p style="margin:0 0 24px;font-size:14px;color:#777777;font-weight:300;line-height:1.6;">${pluriel ? 'Vos billets sont confirmés.' : 'Votre billet est confirmé.'} Retrouvez ci-dessous les détails de votre réservation.</p>

            <!-- Tableau détails -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">

              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="padding:11px 0;font-size:13px;color:#999999;font-weight:300;width:45%;">${pluriel ? 'Billets' : 'Billet'}</td>
                <td style="padding:11px 0;font-size:13px;text-align:right;">
                  <span style="display:inline-block;background-color:#e8f0fe;color:#1a3f7a;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:600;">${donnees.quantite} billet${pluriel ? 's' : ''} (entrée gratuite)</span>
                </td>
              </tr>

              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="padding:11px 0;font-size:13px;color:#999999;font-weight:300;">Édition</td>
                <td style="padding:11px 0;font-size:13px;text-align:right;font-weight:600;color:#1a1a2e;">${datesEditions[donnees.edition]}</td>
              </tr>

              <tr>
                <td style="padding:11px 0;font-size:13px;color:#999999;font-weight:300;">Référence commande</td>
                <td style="padding:11px 0;font-size:12px;text-align:right;font-family:'Courier New',Courier,monospace;color:#888888;letter-spacing:0.08em;">${donnees.idCommande.slice(0, 8).toUpperCase()}</td>
              </tr>

            </table>

            <!-- Note pièce jointe -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="border-left:3px solid #1a3a6b;padding:12px 16px;background-color:#f0f4ff;">
                  <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#1a3a6b;">${pluriel ? 'Vos billets sont joints à cet email.' : 'Votre billet est joint à cet email.'}</p>
                  <p style="margin:0;font-size:12px;color:#777777;font-weight:300;">Chaque PDF contient un code QR — ${pluriel ? 'présentez-les' : 'présentez-le'} à l'entrée pour le faire scanner.</p>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:13px;color:#999999;font-weight:300;font-style:italic;">Nous nous réjouissons de vous accueillir au festival. Profitez de la gastronomie, de la neige et de l'ambiance !</p>
          </td>
        </tr>

        <!-- Pied de page -->
        <tr>
          <td style="background-color:#f8f9ff;border-top:1px solid #eef0f8;padding:16px 36px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-family:Georgia,serif;font-size:13px;font-style:italic;color:#aaaaaa;">Snow Wonder Festival</td>
                <td style="font-size:11px;color:#cccccc;font-weight:300;text-align:right;">Envoyé à ${donnees.email}</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>
  `
}