# Snow Wonder Festival

A modern, responsive website for the Snow Wonder Festival built with React, Vite, Tailwind CSS, and integrated Leaflet maps.

## 🚀 Tech Stack

- **React 19** - UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **PostCSS & Autoprefixer** - CSS processing
- **Leaflet** - Interactive maps
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
- ✅ Twinkle/sparkle animations
- ✅ Custom SVG icons (food & drink)
- ✅ Fast development with HMR
- ✅ Optimized production builds
- ✅ Custom Tailwind theme
- ✅ Modern React with hooks
- ✅ Component-based architecture
- ✅ TypeScript asset declarations

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

- **Display**: Lavishly Yours (cursive)
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
