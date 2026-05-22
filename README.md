# Snow Wonder Festival

A modern, responsive website for the Snow Wonder Festival — built with React, Vite, Tailwind CSS, Leaflet maps, and Supabase.

## Tech Stack

- **React 19** — UI library
- **Vite 7** — build tool and dev server
- **Tailwind CSS 4** — utility-first CSS
- **Leaflet** — interactive maps (Mapbox tiles)
- **Supabase** — PostgreSQL database, auth, edge functions
- **html5-qrcode** — QR code scanning in the browser
- **pdf-lib** (Deno edge function) — server-side PDF generation
- **Nodemailer** (Deno edge function) — transactional email via SMTP

## Project Structure

```
tfe/
├── src/
│   ├── components/
│   │   ├── buildingBlocks/      # Reusable UI components
│   │   │   ├── Navigation.jsx
│   │   │   ├── SideMenu.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Carousel.jsx
│   │   │   ├── Registration.jsx # Contest registration form
│   │   │   ├── Tickets.jsx      # Ticket reservation form
│   │   │   └── Footer.jsx
│   │   ├── sections/            # Page sections
│   │   │   ├── ContentSection.jsx
│   │   │   ├── FormsSection.jsx
│   │   │   ├── GallerySection.jsx
│   │   │   ├── MapSection.jsx   # "Comment venir" map (single marker)
│   │   │   ├── MarketSection.jsx # Market map modal (9 vendor markers)
│   │   │   ├── ScheduleSection.jsx
│   │   │   └── WinnersSection.jsx
│   │   └── modals/
│   │       ├── ContactModal.jsx
│   │       └── FAQModal.jsx
│   ├── admin/                   # Admin panel (auth-gated)
│   │   ├── AdminLogin.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── UpdatePassword.jsx
│   │   ├── AdminPanel.jsx       # Tab router + role-based access
│   │   ├── Dashboard.jsx
│   │   ├── RegistrationManager.jsx
│   │   ├── TicketManager.jsx
│   │   ├── TicketScanner.jsx    # QR scanner (tickets + registrations)
│   │   ├── CarouselManager.jsx
│   │   ├── EditionsManager.jsx
│   │   ├── WinnersManager.jsx
│   │   └── ContentManager.jsx
│   ├── services/
│   │   ├── authService.js
│   │   ├── contentService.js
│   │   ├── editionsService.js
│   │   ├── registrationService.js
│   │   └── ticketService.js
│   ├── assets/images/           # Centralized image exports (index.ts)
│   ├── supabaseClient.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── supabase/
│   └── functions/
│       ├── _shared/
│       │   ├── cors.ts
│       │   └── templates.ts     # HTML email templates
│       ├── send-ticket/         # Generates ticket PDF + sends email
│       ├── send-confirmation/   # Generates registration card PDF + sends email
│       └── send-contact/        # Forwards contact form messages
├── public/
│   └── snowflake-blue.png       # Favicon
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev      # dev server with HMR → http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview production build
```

## Database (Supabase)

### Tables

| Table | Purpose |
|---|---|
| `registrations` | Contest entries (amateur / pro), with `checked_in` + `checked_in_at` |
| `tickets` | Entrance ticket reservations, with `used` + `used_at` |
| `festival_editions` | Festival editions (date, label, active flag) |
| `admin_users` | Admin accounts with role (`admin`, `super_admin`, `scanner`) |
| `carousel_images` | Gallery/carousel image records |
| `winners` | Contest winners per edition |
| `error_logs` | Server-side error tracking |

### Edge Functions 

| Function | Trigger | Description |
|---|---|---|
| `send-ticket` | Ticket reservation | Generates per-ticket PDFs with QR code, sends via SMTP |
| `send-confirmation` | Contest registration | Generates registration card PDF with QR code, sends via SMTP |
| `send-contact` | Contact form | Forwards message to festival email |

Deploy:
```bash
supabase functions deploy send-ticket
supabase functions deploy send-confirmation
supabase functions deploy send-contact
```

Required Supabase secrets: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

## Admin Panel

Accessible at `/#admin`. Role-based access:

- **`admin` / `super_admin`** — full panel (dashboard, registrations, tickets, scanner, editions, gallery, winners)
- **`scanner`** — scanner-only view, no tab navigation

The QR scanner handles two code formats:
- `SWF-XXX-XXXXXX` — entrance ticket (marks `tickets.used = true`)
- UUID — registration card (marks `registrations.checked_in = true`)

## Maps

Both maps use a custom Mapbox tile style.

- **MapSection** — single marker at the festival location (Parc Georges Brassens, Tournai). "Comment venir" panel open by default on desktop, collapsed on mobile.
- **MarketSection** — modal map with 9 vendor markers using Material Symbols icons (festival-yellow circles, deep navy icons). Gazebo marker is larger with inverted colors.

## Fonts & Colors

**Fonts** (Google Fonts):
- Display: DM Serif Display
- Body: Nunito / Nunito Sans
- UI: Rubik
- Decorative: Lavishly Yours
- Icons: Material Symbols Outlined

**Custom CSS variables:**

| Variable | Value |
|---|---|
| `--color-festival-yellow` | #e8a94e |
| `--color-deep-navy` | #002442 |
| `--color-midblue` | #3a7ca5 |
| `--color-ice-blue` | #cae9ff |
| `--color-dark-brown` | #3a2416 |

---

