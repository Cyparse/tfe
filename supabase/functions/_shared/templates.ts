// No React needed — just TypeScript template literals
// Deno can't run React/JSX without extra config, so HTML strings are the move

type Edition = 'december' | 'january' | 'february'
type ContestCategory = 'amateur' | 'pro'

const editionDates: Record<Edition, string> = {
  december: 'December 6, 2026',
  january:  'January 10, 2027',
  february: 'February 7, 2027',
}

export function contestConfirmationEmail(data: {
  name: string
  email: string
  edition: Edition
  category: ContestCategory
  registrationId: string
}) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: sans-serif; background: #f0f4ff; margin: 0; padding: 0; }
      .card { max-width: 560px; margin: 40px auto; background: white;
              border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
      .header { background: #1a3a6b; padding: 32px; text-align: center; }
      .header h1 { color: white; margin: 0; font-size: 22px; }
      .snowflake { font-size: 48px; }
      .body { padding: 32px; }
      .badge { display: inline-block; background: #e8f0fe; color: #1a3a6b;
               padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: bold; }
      .detail-row { display: flex; justify-content: space-between;
                    padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
      .attachment-note { margin-top: 24px; padding: 16px; background: #f0f4ff;
                         border-left: 4px solid #1a3a6b; border-radius: 4px; }
      .footer { padding: 24px 32px; background: #f8f9ff; font-size: 12px; color: #999; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="header">
        <div class="snowflake">⛄</div>
        <h1>Snow Wonder Festival — Snowman Contest</h1>
        <p style="color:#a8c4e8; margin:8px 0 0">Registration Confirmed</p>
      </div>
      <div class="body">
        <p>Hi <strong>${data.name}</strong>,</p>
        <p>You're registered for the snowman contest! Here are your details:</p>

        <div class="detail-row">
          <span>Category</span>
          <span class="badge">${data.category === 'pro' ? '🏆 Professional' : '🌟 Amateur'}</span>
        </div>
        <div class="detail-row">
          <span>Edition</span>
          <span><strong>${editionDates[data.edition]}</strong></span>
        </div>
        <div class="detail-row">
          <span>Registration ID</span>
          <span style="font-family:monospace; color:#666">${data.registrationId.slice(0, 8).toUpperCase()}</span>
        </div>

        <div class="attachment-note">
          <strong>📎 Your registration card is attached to this email.</strong><br>
          It contains a QR code — present it at the contest desk on arrival.
        </div>

        <p style="margin-top:24px; color:#555">
          Bring your creativity and your warmest gloves. Good luck! 🏔️
        </p>
      </div>
      <div class="footer">
        Snow Wonder Festival · This email was sent to ${data.email}
      </div>
    </div>
  </body>
  </html>
  `
}

export function ticketConfirmationEmail(data: {
  name: string
  email: string
  edition: Edition
  quantity: number
  orderId: string
}) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: sans-serif; background: #f0f4ff; margin: 0; padding: 0; }
      .card { max-width: 560px; margin: 40px auto; background: white;
              border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
      .header { background: #1a3a6b; padding: 32px; text-align: center; }
      .header h1 { color: white; margin: 0; font-size: 22px; }
      .icon { font-size: 48px; }
      .body { padding: 32px; }
      .badge { display: inline-block; background: #e8f0fe; color: #1a3a6b;
               padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: bold; }
      .detail-row { display: flex; justify-content: space-between;
                    padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
      .attachment-note { margin-top: 24px; padding: 16px; background: #f0f4ff;
                         border-left: 4px solid #1a3a6b; border-radius: 4px; }
      .footer { padding: 24px 32px; background: #f8f9ff; font-size: 12px; color: #999; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="header">
        <div class="icon">🎫</div>
        <h1>Snow Wonder Festival — Food Village</h1>
        <p style="color:#a8c4e8; margin:8px 0 0">Booking Confirmed</p>
      </div>
      <div class="body">
        <p>Hi <strong>${data.name}</strong>,</p>
        <p>Your tickets are confirmed! Here are your booking details:</p>

        <div class="detail-row">
          <span>Tickets</span>
          <span class="badge">🎪 ${data.quantity} ticket${data.quantity > 1 ? 's' : ''} (free entry)</span>
        </div>
        <div class="detail-row">
          <span>Edition</span>
          <span><strong>${editionDates[data.edition]}</strong></span>
        </div>
        <div class="detail-row">
          <span>Order ID</span>
          <span style="font-family:monospace; color:#666">${data.orderId.slice(0, 8).toUpperCase()}</span>
        </div>

        <div class="attachment-note">
          <strong>📎 Your ticket${data.quantity > 1 ? 's are' : ' is'} attached to this email.</strong><br>
          Each PDF contains a QR code — present it at the entrance to be scanned.
        </div>

        <p style="margin-top:24px; color:#555">
          We look forward to seeing you at the festival. Enjoy the food, the snow, and the atmosphere! 🏔️
        </p>
      </div>
      <div class="footer">
        Snow Wonder Festival · This email was sent to ${data.email}
      </div>
    </div>
  </body>
  </html>
  `
}