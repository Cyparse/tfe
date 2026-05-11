import React, { useState, useEffect } from 'react';
import { getRegistrationStats } from '../services/registrationService';
import { getTicketStats } from '../services/ticketService';

export default function Dashboard() {
    const [stats, setStats] = useState({
        registrations: { total: 0, amateur: 0, pro: 0, today: 0 },
        tickets: { totalOrders: 0, totalTickets: 0, today: 0, averageTicketsPerOrder: 0 }
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { loadStats(); }, []);

    const loadStats = async () => {
        try {
            setIsLoading(true);
            const [regStats, ticketStats] = await Promise.all([getRegistrationStats(), getTicketStats()]);
            setStats({ registrations: regStats, tickets: ticketStats });
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const StatCard = ({ title, value, subtitle, accent, highlight }) => (
        <div className="rounded-xl p-6 border transition-all"
            style={{
                background: '#002442',
                borderColor: highlight ? accent : '#333535',
                borderTopWidth: highlight ? '2px' : '1px',
                borderTopColor: highlight ? accent : '#333535',
            }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-4"
                style={{ color: highlight ? accent : '#8d9198', fontFamily: 'Nunito Sans', letterSpacing: '0.05em' }}>
                {title}
            </p>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold" style={{ color: '#ffffff', fontFamily: 'Rubik' }}>{value}</span>
                {subtitle && (
                    <span className="text-xs" style={{ color: '#8d9198', fontFamily: 'Nunito Sans' }}>{subtitle}</span>
                )}
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-3" style={{ color: '#8d9198', fontFamily: 'Nunito Sans' }}>
                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                    Loading dashboard…
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Welcome Header */}
            <section className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                <div>
                    <h2 className="text-4xl font-bold mb-1" style={{ color: '#ffffff', fontFamily: 'Rubik', letterSpacing: '-0.02em' }}>
                        Dashboard Overview
                    </h2>
                    <p className="text-base" style={{ color: '#8d9198', fontFamily: 'Nunito Sans' }}>
                        Your festival logistics are currently running smoothly.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={loadStats}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                        style={{ background: '#004075', border: '1px solid #333535', color: '#ffffff', fontFamily: 'Nunito Sans' }}
                    >
                        <span className="material-symbols-outlined text-sm">refresh</span>
                        Refresh
                    </button>
                    <button
                        className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                        style={{ background: '#fcba5d', color: '#452b00', fontFamily: 'Nunito Sans' }}
                    >
                        New Event
                    </button>
                </div>
            </section>

            {/* Registration Stats */}
            <section>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4"
                    style={{ color: '#cae9ff', fontFamily: 'Nunito Sans', letterSpacing: '0.05em' }}>
                    Registrations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Registrations" value={stats.registrations.total} accent="#acc9ef" />
                    <StatCard title="Amateur Participants" value={stats.registrations.amateur} accent="#acc9ef" />
                    <StatCard title="Professional Participants" value={stats.registrations.pro} accent="#acc9ef" />
                    <StatCard title="Today" value={stats.registrations.today} subtitle="new registrations" accent="#acc9ef" />
                </div>
            </section>

            {/* Ticket Stats */}
            <section>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4"
                    style={{ color: '#cae9ff', fontFamily: 'Nunito Sans', letterSpacing: '0.05em' }}>
                    Ticket Orders
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Orders" value={stats.tickets.totalOrders} accent="#fcba5d" />
                    <StatCard title="Total Tickets" value={stats.tickets.totalTickets} accent="#fcba5d" highlight />
                    <StatCard title="Today's Orders" value={stats.tickets.today} accent="#fcba5d" />
                    <StatCard title="Avg per Order" value={stats.tickets.averageTicketsPerOrder} subtitle="tickets" accent="#fcba5d" />
                </div>
            </section>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <section className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold" style={{ color: '#ffffff', fontFamily: 'Rubik', fontSize: '1.1rem' }}>Quick Actions</h3>
                        <button className="text-xs font-bold" style={{ color: '#acc9ef', fontFamily: 'Nunito Sans' }}>Manage All</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { icon: 'download', title: 'Export Data', desc: 'Download CSV reports' },
                            { icon: 'send', title: 'Send Notifications', desc: 'Email participants' },
                            { icon: 'bar_chart', title: 'View Reports', desc: 'Detailed analytics' },
                        ].map(a => (
                            <button key={a.title}
                                className="rounded-xl p-5 border text-left transition-all"
                                style={{ background: '#002442', borderColor: '#333535' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#004075'}
                                onMouseLeave={e => e.currentTarget.style.background = '#002442'}
                            >
                                <span className="material-symbols-outlined mb-2 block" style={{ color: '#acc9ef' }}>{a.icon}</span>
                                <h4 className="text-xs font-bold uppercase tracking-wider mb-1"
                                    style={{ color: '#ffffff', fontFamily: 'Nunito Sans', letterSpacing: '0.05em' }}>{a.title}</h4>
                                <p className="text-xs" style={{ color: '#8d9198', fontFamily: 'Nunito Sans' }}>{a.desc}</p>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Recent Activity */}
                <section>
                    <h3 className="font-semibold mb-4" style={{ color: '#ffffff', fontFamily: 'Rubik', fontSize: '1.1rem' }}>
                        Recent Activity
                    </h3>
                    <div className="rounded-xl p-6 border space-y-4" style={{ background: '#002442', borderColor: '#333535' }}>
                        {[
                            { dot: '#acc9ef', text: 'New professional registration', time: '2 hours ago' },
                            { dot: '#fcba5d', text: 'Ticket batch #104 issued', time: '5 hours ago' },
                            { dot: '#8d9198', text: 'System backup completed', time: 'Yesterday' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: item.dot }} />
                                <div>
                                    <p className="text-sm" style={{ color: '#ffffff', fontFamily: 'Nunito Sans' }}>{item.text}</p>
                                    <p className="text-xs mt-0.5" style={{ color: '#8d9198', fontFamily: 'Nunito Sans' }}>{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}