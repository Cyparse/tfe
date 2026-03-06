import React, { useState } from 'react';
import Navigation from './components/Navigation';
import SideMenu from './components/SideMenu';
import Hero from './components/Hero';
import ContentSection from './components/ContentSection';
import MarketSection from './components/MarketSection';
import MapSection from './components/MapSection';
import Footer from './components/Footer';
import Registration from './components/Registration';
import Tickets from './components/Tickets';

function App() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="bg-gradient-to-b from-ice-blue via-midblue to-deep-navy min-h-screen relative overflow-x-hidden">
            <Navigation onMenuClick={() => setMenuOpen(true)} />
            <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
            
            <main className="relative z-10 pt-20">
                <Hero />
                <ContentSection />
                <Registration />
                <Tickets />                               
                <MarketSection />
                <MapSection />
            </main>
            
            <Footer />
        </div>
    );
}

export default App;
