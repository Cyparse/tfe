import React, { useState } from 'react';
import { signOut } from '../services/authService';
import RegistrationManager from './RegistrationManager';
import TicketManager from './TicketManager';
import ContentManager from './ContentManager';
import Dashboard from './Dashboard';

export default function AdminPanel({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState('dashboard');

    const tabs = [
        { id: 'dashboard',      label: 'Dashboard',      icon: 'dashboard' },
        { id: 'registrations',  label: 'Registrations',  icon: 'edit_note' },
        { id: 'tickets',        label: 'Ticketing',      icon: 'confirmation_number' },
        { id: 'content',        label: 'Content',        icon: 'article' },
    ];

    const handleLogout = async () => {
        try { await signOut(); onLogout(); } catch (e) { console.error(e); }
    };

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, var(--color-deep-navy) 0%, #121414 100%)', color: '#ffffff' }}>
            {/* Header */}
            <header className="sticky top-0 z-50 border-b"
                style={{ background: '#121414', borderColor: 'var(--color-midblue)' }}>
                <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-festival-yellow)' }}>
                                <span className="material-symbols-outlined text-xl"
                                    style={{ fontVariationSettings: "'FILL' 1", color: 'var(--color-dark-brown)' }}>ac_unit</span>
                            </div>
                            <span className="font-semibold tracking-tight hidden sm:block"
                                style={{ color: '#ffffff', fontFamily: 'var(--font-family-rubik)', fontSize: '1.1rem' }}>
                                Snow Wonder
                            </span>
                        </div>
                        {/* Search */}
                        <div className="hidden md:flex items-center gap-2 rounded-full px-4 py-1.5 border"
                            style={{ background: '#004075', borderColor: 'var(--color-midblue)', minWidth: '220px' }}>
                            <span className="material-symbols-outlined text-sm" style={{ color: 'var(--color-festival-yellow)' }}>search</span>
                            <input
                                className="bg-transparent border-none outline-none text-sm w-full"
                                style={{ color: '#ffffff', fontFamily: 'var(--font-family-body)' }}
                                placeholder="Search…"
                            />
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-4">
                        <button className="material-symbols-outlined transition-colors"
                            style={{ color: 'var(--color-festival-yellow)', fontSize: '1.25rem' }}>notifications</button>
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#ffffff', fontFamily: 'var(--font-family-body)' }}>
                                {user?.email?.split('@')[0]}
                            </span>
                            <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>
                                Admin
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-xs font-bold uppercase tracking-wider transition-colors"
                            style={{ color: '#ffb4ab', fontFamily: 'var(--font-family-body)', letterSpacing: '0.05em' }}
                        >
                            Log Out
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-t" style={{ borderColor: 'rgba(51,53,53,0.4)', background: '#121414' }}>
                    <nav className="max-w-7xl mx-auto px-6 lg:px-10 flex gap-6 overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="flex items-center gap-2 py-4 border-b-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors"
                                style={{
                                    borderBottomColor: activeTab === tab.id ? 'var(--color-festival-yellow)' : 'transparent',
                                    color: activeTab === tab.id ? 'var(--color-festival-yellow)' : 'var(--color-festival-yellow)',
                                    fontFamily: 'var(--font-family-body)',
                                    letterSpacing: '0.05em',
                                }}
                            >
                                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
                {activeTab === 'dashboard'     && <Dashboard />}
                {activeTab === 'registrations' && <RegistrationManager />}
                {activeTab === 'tickets'       && <TicketManager />}
                {activeTab === 'content'       && <ContentManager />}
            </main>
        </div>
    );
}