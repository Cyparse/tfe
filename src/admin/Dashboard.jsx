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
                background: 'var(--color-deep-navy)',
                borderColor: highlight ? accent : 'var(--color-midblue)',
                borderTopWidth: highlight ? '2px' : '1px',
                borderTopColor: highlight ? accent : 'var(--color-midblue)',
            }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-4"
                style={{ color: highlight ? accent : 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)', letterSpacing: '0.05em' }}>
                {title}
            </p>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold" style={{ color: '#ffffff', fontFamily: 'var(--font-family-rubik)' }}>{value}</span>
                {subtitle && (
                    <span className="text-xs" style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>{subtitle}</span>
                )}
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-3" style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>
                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                    Chargement du tableau de bord…
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Welcome Header */}
            <section className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                <div>
                    <h2 className="text-4xl font-bold mb-1" style={{ color: '#ffffff', fontFamily: 'var(--font-family-rubik)', letterSpacing: '-0.02em' }}>
                        Vue d'ensemble
                    </h2>
                    <p className="text-base" style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>
                        La logistique du festival se déroule actuellement sans problème.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={loadStats}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                        style={{ background: '#004075', border: '1px solid var(--color-midblue)', color: '#ffffff', fontFamily: 'var(--font-family-body)' }}
                    >
                        <span className="material-symbols-outlined text-sm">refresh</span>
                        Actualiser
                    </button>
                    <button
                        className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                        style={{ background: 'var(--color-festival-yellow)', color: 'var(--color-dark-brown)', fontFamily: 'var(--font-family-body)' }}
                    >
                        Nouvel événement
                    </button>
                </div>
            </section>

            {/* Registration Stats */}
            <section>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4"
                    style={{ color: 'var(--color-ice-blue)', fontFamily: 'var(--font-family-body)', letterSpacing: '0.05em' }}>
                    Inscriptions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total des inscriptions" value={stats.registrations.total} accent="#acc9ef" />
                    <StatCard title="Participants amateurs" value={stats.registrations.amateur} accent="#acc9ef" />
                    <StatCard title="Participants professionnels" value={stats.registrations.pro} accent="#acc9ef" />
                    <StatCard title="Aujourd'hui" value={stats.registrations.today} subtitle="nouvelles inscriptions" accent="#acc9ef" />
                </div>
            </section>

            {/* Ticket Stats */}
            <section>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4"
                    style={{ color: 'var(--color-ice-blue)', fontFamily: 'var(--font-family-body)', letterSpacing: '0.05em' }}>
                    Commandes de billets
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total des commandes" value={stats.tickets.totalOrders} accent="var(--color-festival-yellow)" />
                    <StatCard title="Total des billets" value={stats.tickets.totalTickets} accent="var(--color-festival-yellow)" highlight />
                    <StatCard title="Commandes du jour" value={stats.tickets.today} accent="var(--color-festival-yellow)" />
                    <StatCard title="Moy. par commande" value={stats.tickets.averageTicketsPerOrder} subtitle="billets" accent="var(--color-festival-yellow)" />
                </div>
            </section>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <section className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold" style={{ color: '#ffffff', fontFamily: 'var(--font-family-rubik)', fontSize: '1.1rem' }}>Actions rapides</h3>
                        <button className="text-xs font-bold" style={{ color: '#acc9ef', fontFamily: 'var(--font-family-body)' }}>Tout gérer</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { icon: 'download', title: 'Exporter les données', desc: 'Télécharger les rapports CSV' },
                            { icon: 'send', title: 'Envoyer des notifications', desc: 'Envoyer un e-mail aux participants' },
                            { icon: 'bar_chart', title: 'Voir les rapports', desc: 'Analyses détaillées' },
                        ].map(a => (
                            <button key={a.title}
                                className="rounded-xl p-5 border text-left transition-all"
                                style={{ background: 'var(--color-deep-navy)', borderColor: 'var(--color-midblue)' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#004075'}
                                onMouseLeave={e => e.currentTarget.style.background = 'var(--color-deep-navy)'}
                            >
                                <span className="material-symbols-outlined mb-2 block" style={{ color: '#acc9ef' }}>{a.icon}</span>
                                <h4 className="text-xs font-bold uppercase tracking-wider mb-1"
                                    style={{ color: '#ffffff', fontFamily: 'var(--font-family-body)', letterSpacing: '0.05em' }}>{a.title}</h4>
                                <p className="text-xs" style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>{a.desc}</p>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Recent Activity */}
                <section>
                    <h3 className="font-semibold mb-4" style={{ color: '#ffffff', fontFamily: 'var(--font-family-rubik)', fontSize: '1.1rem' }}>
                        Activité récente
                    </h3>
                    <div className="rounded-xl p-6 border space-y-4" style={{ background: 'var(--color-deep-navy)', borderColor: 'var(--color-midblue)' }}>
                        {[
                            { dot: '#acc9ef', text: 'Nouvelle inscription professionnelle', time: 'Il y a 2 heures' },
                            { dot: 'var(--color-festival-yellow)', text: 'Lot de billets #104 émis', time: 'Il y a 5 heures' },
                            { dot: 'var(--color-festival-yellow)', text: 'Sauvegarde système terminée', time: 'Hier' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: item.dot }} />
                                <div>
                                    <p className="text-sm" style={{ color: '#ffffff', fontFamily: 'var(--font-family-body)' }}>{item.text}</p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}