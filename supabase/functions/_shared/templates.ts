// Pas de React nécessaire — template literals TypeScript
// Deno ne supporte pas React/JSX sans configuration supplémentaire

type Edition = 'decembre' | 'janvier' | 'fevrier'
type CategorieParticipant = 'amateur' | 'professionnel'

const datesEditions: Record<Edition, string> = {
  decembre: '6 décembre 2026',
  janvier:  '10 janvier 2027',
  fevrier:  '7 février 2027',
}

const headerStyles = `
  body { font-family: 'Nunito', Arial, sans-serif; background: #f0f4ff; margin: 0; padding: 0; }
  .carte { max-width: 560px; margin: 40px auto; background: white;
           border-radius: 20px; overflow: hidden; border: 1px solid #e0e8f0; }
  .entete { background: linear-gradient(160deg, #0d2a5e 0%, #1a3f7a 50%, #0d2a5e 100%);
            padding: 40px 36px 36px; text-align: center; }
  .ornement { display: flex; align-items: center; justify-content: center;
              gap: 12px; margin-bottom: 20px; }
  .ligne-ornement { flex: 1; max-width: 60px; height: 1px;
                    background: linear-gradient(to right, transparent, rgba(212,175,55,0.6)); }
  .ligne-ornement-droite { background: linear-gradient(to left, transparent, rgba(212,175,55,0.6)); }
  .losange { width: 6px; height: 6px; background: #d4af37; transform: rotate(45deg); }
  .cercle-icone { width: 72px; height: 72px; border-radius: 50%;
                  border: 1px solid rgba(212,175,55,0.35);
                  display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }
  .libelle-festival { font-size: 10px; font-weight: 500; letter-spacing: 0.18em;
                      text-transform: uppercase; color: rgba(212,175,55,0.75);
                      margin: 0 0 8px; }
  .titre-email { font-family: 'Rubik', Arial, sans-serif; font-size: 26px;
                 font-weight: 600; color: #ffffff; margin: 0 0 6px; line-height: 1.2; }
  .sous-titre-email { font-family: 'Rubik', Arial, sans-serif; font-size: 12px; font-weight: 300; letter-spacing: 0.12em;
                      text-transform: uppercase; color: rgba(168,196,232,0.9); margin: 0; }
  .corps { padding: 32px 36px; }
  .salutation { font-size: 15px; color: #1a1a2e; margin: 0 0 6px; }
  .intro { font-size: 14px; color: #666; margin: 0 0 24px; font-weight: 300; }
  .tableau-details { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  .tableau-details tr { border-bottom: 1px solid #f0f0f0; }
  .tableau-details tr:last-child { border-bottom: none; }
  .tableau-details td { padding: 11px 0; font-size: 13px; }
  .tableau-details td:first-child { color: #888; font-weight: 300; width: 45%; }
  .tableau-details td:last-child { text-align: right; }
  .badge { display: inline-block; background: #e8f0fe; color: #1a3f7a;
           padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
  .valeur-date { font-weight: 500; color: #1a1a2e; font-size: 13px; }
  .valeur-id { font-family: 'Courier New', monospace; font-size: 12px;
               color: #888; letter-spacing: 0.08em; }
  .avis-pj { background: #f0f4ff; border-left: 3px solid #1a3a6b;
             padding: 14px 16px; margin-bottom: 24px; }
  .avis-pj strong { display: block; font-size: 13px; font-weight: 500;
                    color: #1a3a6b; margin-bottom: 4px; }
  .avis-pj p { font-size: 12px; color: #666; margin: 0; font-weight: 300; }
  .texte-cloture { font-size: 13px; color: #888; font-weight: 300;
                   margin: 0; font-style: italic; }
  .pied-page { padding: 16px 36px; background: #f8f9ff;
               border-top: 1px solid #eef0f8;
               display: flex; justify-content: space-between; align-items: center; }
  .marque { font-family: 'Rubik', Arial, sans-serif; font-size: 13px;
            font-style: italic; color: #888; }
  .email-destinataire { font-size: 11px; color: #aaa; font-weight: 300; }
`

export function emailConfirmationConcours(donnees: {
  nom: string
  email: string
  edition: Edition
  categorie: CategorieParticipant
  idInscription: string
}) {
  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="utf-8">
    <style>${headerStyles}</style>
  </head>
  <body>
    <div class="carte">
      <div class="entete">
        <div class="ornement">
          <div class="ligne-ornement"></div>
          <div class="losange"></div>
          <div class="ligne-ornement ligne-ornement-droite"></div>
        </div>
        <div class="cercle-icone">
          <span style="font-size:26px; color:#d4af37;">&#x2605;</span>
        </div>
        <p class="libelle-festival">Snow Wonder Festival</p>
        <h1 class="titre-email">Concours de bonhomme de neige</h1>
        <p class="sous-titre-email">Inscription confirmée</p>
      </div>

      <div class="corps">
        <p class="salutation">Cher(e) <strong>${donnees.nom}</strong>,</p>
        <p class="intro">Votre inscription au concours a bien été enregistrée.
          Retrouvez ci-dessous le récapitulatif de votre participation.</p>

        <table class="tableau-details">
          <tr>
            <td>Catégorie</td>
            <td>
              <span class="badge">
                ${donnees.categorie === 'professionnel' ? 'Professionnel' : 'Amateur'}
              </span>
            </td>
          </tr>
          <tr>
            <td>Édition</td>
            <td><span class="valeur-date">${datesEditions[donnees.edition]}</span></td>
          </tr>
          <tr>
            <td>Numéro d'inscription</td>
            <td><span class="valeur-id">${donnees.idInscription.slice(0, 8).toUpperCase()}</span></td>
          </tr>
        </table>

        <div class="avis-pj">
          <strong>Votre carte d'inscription est jointe à cet email.</strong>
          <p>Elle contient un code QR — présentez-la au bureau d'accueil à votre arrivée.</p>
        </div>

        <p class="texte-cloture">
          Apportez votre créativité et vos gants les plus chauds. Bonne chance !
        </p>
      </div>

      <div class="pied-page">
        <span class="marque">Snow Wonder Festival</span>
        <span class="email-destinataire">Envoyé à ${donnees.email}</span>
      </div>
    </div>
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
  <head>
    <meta charset="utf-8">
    <style>${headerStyles}</style>
  </head>
  <body>
    <div class="carte">
      <div class="entete">
        <div class="ornement">
          <div class="ligne-ornement"></div>
          <div class="losange"></div>
          <div class="ligne-ornement ligne-ornement-droite"></div>
        </div>
        <div class="cercle-icone">
          <span style="font-size:26px; color:#d4af37;">&#x2756;</span>
        </div>
        <p class="libelle-festival">Snow Wonder Festival</p>
        <h1 class="titre-email">${pluriel ? 'Billets' : 'Billet'} d'entrée</h1>
        <p class="sous-titre-email">Réservation confirmée</p>
      </div>

      <div class="corps">
        <p class="salutation">Cher(e) <strong>${donnees.nom}</strong>,</p>
        <p class="intro">
          ${pluriel ? 'Vos billets sont confirmés.' : 'Votre billet est confirmé.'}
          Retrouvez ci-dessous les détails de votre réservation.
        </p>

        <table class="tableau-details">
          <tr>
            <td>${pluriel ? 'Billets' : 'Billet'}</td>
            <td>
              <span class="badge">
                ${donnees.quantite} billet${pluriel ? 's' : ''} (entrée gratuite)
              </span>
            </td>
          </tr>
          <tr>
            <td>Édition</td>
            <td><span class="valeur-date">${datesEditions[donnees.edition]}</span></td>
          </tr>
          <tr>
            <td>Référence commande</td>
            <td><span class="valeur-id">${donnees.idCommande.slice(0, 8).toUpperCase()}</span></td>
          </tr>
        </table>

        <div class="avis-pj">
          <strong>
            ${pluriel ? 'Vos billets sont joints à cet email.' : 'Votre billet est joint à cet email.'}
          </strong>
          <p>
            Chaque PDF contient un code QR —
            ${pluriel ? 'présentez-les' : 'présentez-le'} à l'entrée pour le faire scanner.
          </p>
        </div>

        <p class="texte-cloture">
          Nous nous réjouissons de vous accueillir au festival.
          Profitez de la gastronomie, de la neige et de l'ambiance !
        </p>
      </div>

      <div class="pied-page">
        <span class="marque">Snow Wonder Festival</span>
        <span class="email-destinataire">Envoyé à ${donnees.email}</span>
      </div>
    </div>
  </body>
  </html>
  `
}