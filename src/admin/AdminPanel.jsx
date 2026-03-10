import React, { useState, useEffect } from 'react';
import { signOut } from '../services/authService';
import RegistrationManager from './RegistrationManager';
import TicketManager from './TicketManager';
import ContentManager from './ContentManager';
import Dashboard from './Dashboard';

export default function AdminPanel({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'registrations', label: 'Registrations', icon: '📝' },
        { id: 'tickets', label: 'Tickets', icon: '🎫' },
        { id: 'content', label: 'Content', icon: '📄' }
    ];

    const handleLogout = async () => {
        try {
            await signOut();
            onLogout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                            <p className="text-sm text-gray-600">Welcome, {user?.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8 overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'registrations' && <RegistrationManager />}
                {activeTab === 'tickets' && <TicketManager />}
                {activeTab === 'content' && <ContentManager />}
            </main>
        </div>
    );
}
