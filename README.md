# Snow Wonder Festival

A modern, responsive website for the Snow Wonder Festival built with React, Vite, and Tailwind CSS.

## 🚀 Tech Stack

- **React 19** - UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **PostCSS & Autoprefixer** - CSS processing

## 📁 Project Structure

```
tfe/
├── src/
│   ├── components/          # React components
│   │   ├── App.jsx         # Main app component
│   │   ├── Navigation.jsx  # Navigation bar
│   │   ├── SideMenu.jsx    # Mobile menu
│   │   ├── Hero.jsx        # Hero section
│   │   ├── ContentSection.jsx
│   │   ├── MarketSection.jsx
│   │   └── Footer.jsx
│   ├── index.css           # Global styles & Tailwind imports
│   └── main.jsx            # App entry point
├── public/                  # Static assets (images, etc.)
├── index.html              # HTML template
├── tailwind.config.js      # Tailwind configuration
├── vite.config.js          # Vite configuration
├── postcss.config.js       # PostCSS configuration
└── package.json            # Dependencies & scripts
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
- ✅ Mobile-friendly side menu
- ✅ Fast development with HMR
- ✅ Optimized production builds
- ✅ Custom Tailwind theme
- ✅ Modern React with hooks
- ✅ Component-based architecture

## 📝 Custom Colors

The project uses a custom color palette defined in `tailwind.config.js`:

- `ice-blue`: #cae9ff
- `deep-navy`: #002442
- `midblue`: #3a7ca5
- `festival-yellow`: #e8a94e
- `dark-brown`: #3a2416

## 🎭 Fonts

- **Display**: Lavishly Yours (cursive)
- **Body**: Nunito (sans-serif)
- **Icons**: Material Symbols Outlined
