import React, { useState, useEffect } from 'react';
import { getRegistrationStats, getTicketStats } from '../services/registrationService';

export default function Dashboard() {
    const [stats, setStats] = useState({
        registrations: {
            total: 0,
            amateur: 0,
            pro: 0,
            today: 0
        },
        tickets: {
            totalOrders: 0,
            totalTickets: 0,
            today: 0,
            averageTicketsPerOrder: 0
        }
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setIsLoading(true);
            const [regStats, ticketStats] = await Promise.all([
                getRegistrationStats(),
                getTicketStats()
            ]);
            setStats({
                registrations: regStats,
                tickets: ticketStats
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const StatCard = ({ title, value, subtitle, icon, color }) => (
        <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${color}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                </div>
                <div className="text-4xl">{icon}</div>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                <button
                    onClick={loadStats}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    Refresh
                </button>
            </div>

            {/* Registration Stats */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">📝 Registrations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Registrations"
                        value={stats.registrations.total}
                        icon="👥"
                        color="border-blue-500"
                    />
                    <StatCard
                        title="Amateur"
                        value={stats.registrations.amateur}
                        icon="🎨"
                        color="border-green-500"
                    />
                    <StatCard
                        title="Professional"
                        value={stats.registrations.pro}
                        icon="💼"
                        color="border-purple-500"
                    />
                    <StatCard
                        title="Today"
                        value={stats.registrations.today}
                        subtitle="New registrations"
                        icon="⭐"
                        color="border-orange-500"
                    />
                </div>
            </div>

            {/* Ticket Stats */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">🎫 Ticket Orders</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Orders"
                        value={stats.tickets.totalOrders}
                        icon="📦"
                        color="border-indigo-500"
                    />
                    <StatCard
                        title="Total Tickets"
                        value={stats.tickets.totalTickets}
                        icon="🎫"
                        color="border-pink-500"
                    />
                    <StatCard
                        title="Today's Orders"
                        value={stats.tickets.today}
                        icon="📅"
                        color="border-yellow-500"
                    />
                    <StatCard
                        title="Avg per Order"
                        value={stats.tickets.averageTicketsPerOrder}
                        subtitle="tickets"
                        icon="📊"
                        color="border-teal-500"
                    />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">⚡ Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer">
                        <h4 className="font-semibold text-gray-900 mb-2">Export Data</h4>
                        <p className="text-sm text-gray-600">Download registrations and tickets as CSV</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer">
                        <h4 className="font-semibold text-gray-900 mb-2">Send Notifications</h4>
                        <p className="text-sm text-gray-600">Email registered participants</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer">
                        <h4 className="font-semibold text-gray-900 mb-2">View Reports</h4>
                        <p className="text-sm text-gray-600">Generate detailed analytics</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
