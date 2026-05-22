import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getRegistrationStats, exportRegistrationsToCSV } from '../services/registrationService';
import { getTicketStats, exportTicketOrdersToCSV } from '../services/ticketService';

export default function Dashboard({ onNavigate }) {
    const [stats, setStats] = useState({
        registrations: { total: 0, amateur: 0, pro: 0, today: 0 },
        tickets: { totalOrders: 0, totalTickets: 0, today: 0, averageTicketsPerOrder: 0 }
    });
    const [activity, setActivity] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [exportingReg, setExportingReg] = useState(false);
    const [exportingTickets, setExportingTickets] = useState(false);

    useEffect(() => { loadAll(); }, []);

    const loadRecentActivity = async () => {
        const [{ data: regs }, { data: tickets }] = await Promise.all([
            supabase.from('registrations').select('id, first_name, last_name, type, created_at').order('created_at', { ascending: false }).limit(5),
            supabase.from('ticket_orders').select('id, first_name, last_name, ticket_count, created_at').order('created_at', { ascending: false }).limit(5),
        ]);
        const items = [
            ...(regs || []).map(r => ({
                text: `Inscription ${r.type === 'pro' ? 'professionnelle' : 'amateur'} — ${r.first_name} ${r.last_name}`,
                date: new Date(r.created_at),
                dot: 'var(--color-light-blue)',
            })),
            ...(tickets || []).map(t => ({
                text: `Commande de ${t.ticket_count} billet${t.ticket_count > 1 ? 's' : ''} — ${t.first_name} ${t.last_name}`,
                date: new Date(t.created_at),
                dot: 'var(--color-festival-yellow)',
            })),
        ];
        return items.sort((a, b) => b.date - a.date).slice(0, 5);
    };

    const loadAll = async () => {
        try {
            setIsLoading(true);
            const [regStats, ticketStats, recentActivity] = await Promise.all([
                getRegistrationStats(),
                getTicketStats(),
                loadRecentActivity(),
            ]);
            setStats({ registrations: regStats, tickets: ticketStats });
            setActivity(recentActivity);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const formatRelativeTime = (date) => {
        const diffMs = Date.now() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1) return "À l'instant";
        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
        if (diffDays === 1) return 'Hier';
        if (diffDays < 7) return `Il y a ${diffDays} jours`;
        return date.toLocaleDateString('fr-BE');
    };

    const downloadCSV = (content, filename) => {
        const blob = new Blob([content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportRegistrations = async () => {
        setExportingReg(true);
        try {
            const { data } = await supabase.from('registrations').select('*').order('created_at', { ascending: false });
            if (data) downloadCSV(exportRegistrationsToCSV(data), `inscriptions_${new Date().toISOString().split('T')[0]}.csv`);
        } catch (e) { console.error(e); }
        finally { setExportingReg(false); }
    };

    const handleExportTickets = async () => {
        setExportingTickets(true);
        try {
            const { data } = await supabase.from('ticket_orders').select('*').order('created_at', { ascending: false });
            if (data) downloadCSV(exportTicketOrdersToCSV(data), `tickets_${new Date().toISOString().split('T')[0]}.csv`);
        } catch (e) { console.error(e); }
        finally { setExportingTickets(false); }
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

    const quickActions = [
        {
            icon: 'add_photo_alternate',
            title: 'Ajouter une image',
            desc: 'Ajouter à la galerie',
            onClick: () => onNavigate?.('carousel'),
            loading: false,
        },
        {
            icon: 'person_add',
            title: 'Exporter les inscriptions',
            desc: 'Télécharger le CSV',
            onClick: handleExportRegistrations,
            loading: exportingReg,
        },
        {
            icon: 'confirmation_number',
            title: 'Exporter les tickets',
            desc: 'Télécharger le CSV',
            onClick: handleExportTickets,
            loading: exportingTickets,
        },
    ];

    return (
        <div className="space-y-10">
            {/* Welcome Header */}
            <section className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                <div>
                    <h2 className="text-4xl font-bold mb-1" style={{ color: '#ffffff', fontFamily: 'var(--font-family-rubik)', letterSpacing: '-0.02em' }}>
                        Vue d'ensemble
                    </h2>
                    {/* <p className="text-base" style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>
                        La logistique du festival se déroule actuellement sans problème.
                    </p> */}
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={loadAll}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                        style={{ background: 'var(--color-navy-dark)', border: '1px solid var(--color-midblue)', color: '#ffffff', fontFamily: 'var(--font-family-body)' }}
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
                    <StatCard title="Total des inscriptions" value={stats.registrations.total} accent="var(--color-light-blue)" />
                    <StatCard title="Participants amateurs" value={stats.registrations.amateur} accent="var(--color-light-blue)" />
                    <StatCard title="Participants professionnels" value={stats.registrations.pro} accent="var(--color-light-blue)" />
                    <StatCard title="Aujourd'hui" value={stats.registrations.today} subtitle="nouvelles inscriptions" accent="var(--color-light-blue)" />
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
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {quickActions.map(a => (
                            <button key={a.title}
                                onClick={a.onClick}
                                disabled={a.loading}
                                className="rounded-xl p-5 border text-left transition-all"
                                style={{ background: 'var(--color-deep-navy)', borderColor: 'var(--color-midblue)', opacity: a.loading ? 0.7 : 1 }}
                                onMouseEnter={e => { if (!a.loading) e.currentTarget.style.background = 'var(--color-navy-dark)'; }}
                                onMouseLeave={e => e.currentTarget.style.background = 'var(--color-deep-navy)'}
                            >
                                <span className={`material-symbols-outlined mb-2 block${a.loading ? ' animate-spin' : ''}`} style={{ color: 'var(--color-light-blue)' }}>
                                    {a.loading ? 'progress_activity' : a.icon}
                                </span>
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
                        {activity.length === 0 ? (
                            <p className="text-sm" style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>
                                Aucune activité récente.
                            </p>
                        ) : activity.map((item, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: item.dot }} />
                                <div>
                                    <p className="text-sm" style={{ color: '#ffffff', fontFamily: 'var(--font-family-body)' }}>{item.text}</p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-festival-yellow)', fontFamily: 'var(--font-family-body)' }}>
                                        {formatRelativeTime(item.date)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
