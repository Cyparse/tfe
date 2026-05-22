# CMS Backend Documentation

Admin panel and backend services for the Snow Wonder Festival site, built with React, Vite, Supabase, and Tailwind CSS.

---

## Features

- **Festival Editions**: Create and manage editions (year, theme, accent colour, events JSON, active flag)
- **Registration Management**: View, search, filter, and export amateur/pro registrations per edition
- **Ticket Management**: View, search, and export ticket orders; generate individual tickets
- **Ticket Scanner**: QR/barcode check-in scanner for entry control (scanner role only)
- **Carousel Manager**: Upload and reorder images by section (gallery, etc.)
- **Winners Manager**: Add past edition winners with photos and podium positions
- **Newsletter Subscribers**: View and manage newsletter opt-ins
- **Admin Authentication**: Role-based access (`super_admin`, `admin`, `scanner`)
- **Error Logging**: Automatic error capture via `errorLogger.js` → `error_logs` table

---

## Project Structure

```
src/
├── admin/
│   ├── AdminLogin.jsx         # Login + forgot/reset password flow
│   ├── AdminPanel.jsx         # Tab container; guards by role
│   ├── Dashboard.jsx          # Stats overview (registrations, tickets, revenue)
│   ├── RegistrationManager.jsx
│   ├── TicketManager.jsx
│   ├── TicketScanner.jsx      # Scanner role: QR check-in UI
│   ├── EditionsManager.jsx    # CRUD for festival_editions
│   ├── CarouselManager.jsx    # CRUD for carousel_images
│   ├── WinnersManager.jsx     # CRUD for winners
│   ├── ContentManager.jsx     # Generic table browser
│   ├── ForgotPassword.jsx
│   └── UpdatePassword.jsx
│
├── services/
│   ├── authService.js         # Supabase Auth + admin_users role check
│   ├── registrationService.js # Registrations CRUD + CSV export
│   ├── ticketService.js       # Ticket orders + individual tickets CRUD
│   ├── editionsService.js     # Festival editions CRUD
│   └── contentService.js      # Generic CRUD for any table
│
├── hooks/
│   └── useEditions.js         # Shared hook: fetch active editions list
│
├── utils/
│   └── errorLogger.js         # Writes to error_logs table
│
├── components/
│   ├── buildingBlocks/        # Public-facing UI components
│   └── sections/              # Page sections (Schedule, Gallery, Winners, etc.)
│
└── supabaseClient.js          # Supabase client singleton
```

---

## Getting Started

### 1. Database

Run all scripts in [DATABASE_SETUP.md](DATABASE_SETUP.md) in order. `festival_editions` must be seeded before registrations or ticket orders can be submitted.

### 2. Environment

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install & Run

```bash
npm install
npm run dev
```

---

## Accessing the Admin Panel

Navigate to `/admin`:

```
http://localhost:5173/admin
```

Login with a user that exists in both Supabase Authentication and the `admin_users` table.

---

## Roles

| Role | Access |
|---|---|
| `super_admin` | Full access to all tabs |
| `admin` | All tabs except cannot delete other admins |
| `scanner` | Ticket Scanner tab only |

---

## Service APIs

### authService.js

```javascript
import { signInAdmin, signOut, getCurrentUser, isAdmin } from './services/authService';

await signInAdmin(email, password);
await signOut();
const user = await getCurrentUser();
const { isAdmin, role } = await isAdmin(); // checks admin_users table
```

### editionsService.js

```javascript
import { getEditions, createEdition, updateEdition, deleteEdition } from './services/editionsService';

const editions = await getEditions();          // all, ordered by sort_order
await createEdition(editionData);
await updateEdition(id, updates);
await deleteEdition(id);
```

### registrationService.js

```javascript
import { getRegistrations, createRegistration, updateRegistration, deleteRegistration, getRegistrationStats, exportRegistrationsToCSV } from './services/registrationService';

const result = await getRegistrations({
    page: 1,
    pageSize: 20,
    festivalEdition: 'edition-2025',
    type: 'amateur',           // 'amateur' | 'pro' | null
    search: 'john',
    sortBy: 'created_at',
    sortOrder: 'desc'
});
// result: { data, count, page, pageSize }

await createRegistration({ type, first_name, last_name, email, phone, festival_edition, terms_accepted });
await updateRegistration(id, { checked_in: true, checked_in_at: new Date() });
await deleteRegistration(id);

const stats = await getRegistrationStats(festivalEdition);
// { total, amateur, pro, checkedIn, today }

const csv = exportRegistrationsToCSV(registrations);
```

### ticketService.js

```javascript
import { getTicketOrders, createTicketOrder, deleteTicketOrder, getTicketStats, exportTicketOrdersToCSV } from './services/ticketService';

const result = await getTicketOrders({ page: 1, pageSize: 20, festivalEdition: 'edition-2025' });
await createTicketOrder(orderData);   // also generates rows in tickets table
await deleteTicketOrder(id);

const stats = await getTicketStats(festivalEdition);
// { totalOrders, totalTickets, newsletterOptIns }

const csv = exportTicketOrdersToCSV(orders);
```

### contentService.js (generic CRUD)

```javascript
import { getItems, getItemById, createItem, updateItem, deleteItem } from './services/contentService';

const items = await getItems('carousel_images', { sortBy: 'position', sortOrder: 'asc' });
await createItem('winners', { edition_label, winner_name, photo_url, position });
await updateItem('carousel_images', id, { active: false });
await deleteItem('winners', id);
```

---

## Security

- RLS enabled on all user-facing tables
- Anonymous users can only INSERT (public forms)
- Authenticated users have full CRUD
- `scanner` role accounts are restricted to the check-in view by the admin panel
- Rate limiting tracked in `rate_limits` table
- Errors logged to `error_logs` via `errorLogger.js`

### Authentication Flow

1. User submits credentials → `authService.signInAdmin`
2. Supabase Auth validates credentials
3. Service checks `admin_users` table for matching email and `is_active = true`
4. Returns role; `AdminPanel` renders tabs based on role

---

## Troubleshooting

| Problem | Check |
|---|---|
| Cannot log in | User exists in Supabase Auth AND `admin_users` with `is_active = true` |
| No editions in dropdowns | Seed at least one row in `festival_editions` |
| Tables empty after login | RLS policies — verify authenticated role has SELECT |
| Scanner not checking in | Ticket `used` flag is already `true`, or wrong `edition` |
| CSV export blank | Load data first; check for empty result set |
