# Snow Wonder Festival

A modern, responsive website for the Snow Wonder Festival built with React, Vite, Tailwind CSS, integrated Leaflet maps, and Supabase backend.

## 🚀 Tech Stack

- **React 19** - UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **PostCSS & Autoprefixer** - CSS processing
- **Leaflet** - Interactive maps
- **Supabase** - Database and backend services
- **TypeScript** - Type declarations for assets

## 📁 Project Structure

```
tfe/
├── src/
│   ├── components/          # React components
│   │   ├── Navigation.jsx   # Navigation bar with scroll-to-top
│   │   ├── SideMenu.jsx     # Mobile menu
│   │   ├── Hero.jsx         # Hero section with twinkle animations
│   │   ├── ContentSection.jsx
│   │   ├── MarketSection.jsx # Market section with map modal
│   │   ├── MapSection.jsx   # Interactive Leaflet map
│   │   ├── Registration.jsx # Participant registration (amateur/pro)
│   │   ├── Tickets.jsx      # Ticket purchase form
│   │   └── Footer.jsx
│   ├── assets/
│   │   └── images/          # Image assets and TypeScript index
│   │       ├── index.ts     # Centralized image exports
│   │       ├── food.svg     # Hot food icon
│   │       ├── food copy.svg # Hot drink icon
│   │       └── *.png, *.jpg # Image files
│   ├── App.jsx              # Main app component
│   ├── index.css            # Global styles & Tailwind imports
│   ├── main.jsx             # App entry point
│   └── vite-env.d.ts        # TypeScript declarations for assets
├── public/                   # Static assets
├── .env                      # Environment variables (Supabase keys)
├── index.html               # HTML template with Leaflet CDN
├── tsconfig.json            # TypeScript configuration
├── tsconfig.node.json       # Node TypeScript configuration
├── tailwind.config.js       # Tailwind configuration
├── vite.config.js           # Vite configuration
├── postcss.config.js        # PostCSS configuration
└── package.json             # Dependencies & scripts
```

## 🛠️ Installation

Make sure you have Node.js and npm installed, then run:

```bash
npm install
```

## ⚙️ Configuration

Create a `.env` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

To get your Supabase credentials:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy the **Project URL** and **anon public** key

## 💾 Database Setup

The project uses Supabase (PostgreSQL) with the following tables:
- **registrations** - Participant registrations (amateur/pro)
- **ticket_orders** - Ticket purchases with customer details
- **events** - Festival events and scheduling
- **market_locations** - Map markers for market locations
- **newsletter_subscribers** - Newsletter subscriptions

Run the SQL schema in your Supabase SQL Editor (see database setup guide in project docs).

## 💻 Development

Start the development server with hot module replacement:

```bash
npm run dev
```

The site will be available at `http://localhost:5173/`

## 🏗️ Build

Create an optimized production build:

```bash
npm run build
```

The build output will be in the `dist/` folder.

## 👀 Preview

Preview the production build locally:

```bash
npm run preview
```

## 🎨 Features

- ✅ Fully responsive design
- ✅ Mobile-friendly side menu with logo
- ✅ Smooth scroll navigation
- ✅ Scroll-to-top button
- ✅ Interactive Leaflet maps with custom markers
- ✅ Modal overlays with maps
- ✅ Participant registration (amateur/professional)
- ✅ Ticket purchase system with validation
- ✅ Form validation and error handling
- ✅ Twinkle/sparkle animations
- ✅ Custom SVG icons (food & drink)
- ✅ Fast development with HMR
- ✅ Optimized production builds
- ✅ Custom Tailwind theme
- ✅ Modern React with hooks
- ✅ Component-based architecture
- ✅ TypeScript asset declarations
- ✅ Supabase backend integration

## 🗺️ Map Integration

The project uses **Leaflet** for interactive maps with:
- Custom marker styling with teardrop shapes
- Multiple location markers (Main Festival, Food Village, Amateur Location, Winter Market)
- Popup information with directions links
- Smooth zoom and pan controls
- CartoDB Voyager tile layer for clean aesthetics

## 📝 Custom Colors

The project uses a custom color palette defined in `tailwind.config.js`:

- `ice-blue`: #cae9ff
- `deep-navy`: #002442
- `midblue`: #3a7ca5
- `festival-yellow`: #e8a94e
- `dark-brown`: #3a2416

## 🎭 Fonts & Icons

- **Display**: DM Serif Display (serif)
- **Body**: Nunito (sans-serif)
- **Icons**: Material Symbols Outlined
- **Custom Icons**: SVG food and drink icons

## 🖼️ Assets

Images are centrally managed in `src/assets/images/index.ts` for easy imports:
```javascript
import { snowflake, Logo, HeroImage, FooterImage } from '../assets/images';
```

## 📱 Responsive Design

- Desktop: Full navigation menu
- Mobile: Hamburger menu with snowflake logo
- Optimized layouts for all screen sizes
- Touch-friendly interface

## 🗄️ Database Schema

### Tables

**registrations**
- Participant registrations (amateur/professional)
- Fields: type, first_name, last_name, email, phone, organization, experience
- Email uniqueness constraint
- Timestamps for tracking

**ticket_orders**
- Free ticket reservations with customer details
- Fields: customer info, address, ticket_count (1-10), special_requests, newsletter_opt_in
- No payment required - tickets are free

**events**
- Festival events and scheduling
- Fields: title, description, event_type, start_time, end_time, location
- Capacity management

**market_locations**
- Map markers for interactive map
- Fields: name, type, description, latitude, longitude, icon
- Used for Leaflet map integration

**newsletter_subscribers**
- Newsletter subscription management
- Email uniqueness constraint

### Security

- Row Level Security (RLS) enabled on all tables
- Public read access for events and locations
- Public insert for registrations, orders, and subscriptions
- User-specific access policies (ready for authentication)

## 🔧 Environment Variables

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ Never commit the `.env` file to version control!

## 📦 Dependencies

Key packages:
- `react` & `react-dom` - UI framework
- `@supabase/supabase-js` - Backend client
- `leaflet` - Map integration
- `tailwindcss` - Styling framework
- `vite` - Build tool

---

Built with ❄️ for Snow Wonder Festival 2026