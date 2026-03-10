import React, { useState, useEffect } from 'react';
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
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminUser, setAdminUser] = useState(null);
    const [checkingAuth, setCheckingAuth] = useState(true);

    // Check if accessing admin route
    const isAdminRoute = window.location.pathname === '/admin' || window.location.hash === '#admin';

    useEffect(() => {
        checkAuth();
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
        window.location.href = '/';
    };

    // Admin route handling
    if (isAdminRoute) {
        if (checkingAuth) {
            return (
                <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                    <div className="text-gray-600">Loading...</div>
                </div>
            );
        }

        if (!isAdmin) {
            return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
        }

        return <AdminPanel user={adminUser} onLogout={handleLogout} />;
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
        </div>
    );
}

export default App;
