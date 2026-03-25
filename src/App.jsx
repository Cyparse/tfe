import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Navigation from './components/Navigation';
import SideMenu from './components/SideMenu';
import Hero from './components/Hero';
import ContentSection from './components/ContentSection';
import MarketSection from './components/MarketSection';
import MapSection from './components/MapSection';
import Footer from './components/Footer';
import Registration from './components/Registration';
import Tickets from './components/Tickets';
import AdminLogin from './admin/AdminLogin';
import AdminPanel from './admin/AdminPanel';
import { getCurrentUser } from './services/authService';

function App() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [currentView, setCurrentView] = useState('home');
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminUser, setAdminUser] = useState(null);
    const [checkingAuth, setCheckingAuth] = useState(true);

    // Check auth on mount
    useEffect(() => {
        checkAuth();
    }, []);

    // Listen for hash changes (SPA routing)
    useEffect(() => {
        const handleHashChange = () => {
            if (window.location.hash === '#admin') {
                setCurrentView('admin');
            } else {
                setCurrentView('home');
            }
        };

        // Check initial hash
        handleHashChange();

        // Listen for hash changes
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const checkAuth = async () => {
        try {
            const user = await getCurrentUser();
            if (user) {
                setAdminUser(user);
                setIsAdmin(true);
            }
        } catch (error) {
            console.error('Auth check error:', error);
        } finally {
            setCheckingAuth(false);
        }
    };

    const handleLoginSuccess = (result) => {
        setAdminUser(result.user);
        setIsAdmin(true);
    };

    const handleLogout = () => {
        setAdminUser(null);
        setIsAdmin(false);
        window.location.hash = '';
    };

    // Admin view
    if (currentView === 'admin') {
        if (checkingAuth) {
            return (
                <>
                    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                        <div className="text-gray-600">Loading...</div>
                    </div>
                    <Analytics />
                </>
            );
        }

        if (!isAdmin) {
            return (
                <>
                    <AdminLogin onLoginSuccess={handleLoginSuccess} />
                    <Analytics />
                </>
            );
        }

        return (
            <>
                <AdminPanel user={adminUser} onLogout={handleLogout} />
                <Analytics />
            </>
        );
    }

    // Main public website
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
            
            {/* Admin Access Link */}
            <a 
                href="#admin"
                className="fixed bottom-6 right-6 bg-gray-900/80 backdrop-blur text-white px-4 py-2 rounded-full text-sm hover:bg-gray-900 transition-colors shadow-lg z-50 opacity-50 hover:opacity-100"
                title="Admin Panel"
            >
                🔐 Admin
            </a>
            
            <Analytics />
        </div>
    );
}

export default App;
