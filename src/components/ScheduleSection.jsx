import React from 'react';

const EDITIONS = [
    {
        month: 'Décembre',
        date: '6 décembre 2026',
        theme: 'Édition Ouverture',
        color: 'from-festival-yellow/20 to-festival-yellow/5',
        border: 'border-festival-yellow/40',
        badge: 'bg-festival-yellow text-deep-navy',
        events: [
            { icon: 'emoji_events', label: 'Concours de bonhommes de neige amateur' },
            { icon: 'star', label: 'Concours de bonhommes de neige pro' },
            { icon: 'storefront', label: 'Village gastronomique ouvert' },
            { icon: 'celebration', label: 'Cérémonie d\'ouverture & illuminations' },
        ],
    },
    {
        month: 'Janvier',
        date: '10 janvier 2027',
        theme: 'Édition Mi-Hiver',
        color: 'from-ice-blue/20 to-ice-blue/5',
        border: 'border-ice-blue/40',
        badge: 'bg-ice-blue text-deep-navy',
        events: [
            { icon: 'emoji_events', label: 'Concours de bonhommes de neige amateur' },
            { icon: 'star', label: 'Concours de bonhommes de neige pro' },
            { icon: 'storefront', label: 'Village gastronomique ouvert' },
            { icon: 'music_note', label: 'Musique live & animations' },
        ],
    },
    {
        month: 'Février',
        date: '7 février 2027',
        theme: 'Grande Finale',
        color: 'from-white/15 to-white/5',
        border: 'border-white/30',
        badge: 'bg-white text-deep-navy',
        events: [
            { icon: 'emoji_events', label: 'Concours de bonhommes de neige amateur' },
            { icon: 'star', label: 'Concours de bonhommes de neige pro' },
            { icon: 'storefront', label: 'Village gastronomique ouvert' },
            { icon: 'trophy', label: 'Cérémonie de remise des prix & palmarès' },
        ],
    },
];

export default function ScheduleSection() {
    return (
        <section id="schedule" className="max-w-7xl mx-auto px-6 relative z-20 pb-20">
            <div className="bg-deep-navy/40 p-10 md:p-20 text-white rounded-3xl shadow-2xl border border-white/10">
                {/* Header */}
                <div className="text-center mb-14">
                    <div className="flex items-center justify-center gap-3 text-festival-yellow font-bold uppercase tracking-[0.3em] text-xs mb-6">
                        <span className="h-0.5 w-16 bg-festival-yellow"></span>
                        Trois Éditions
                        <span className="h-0.5 w-16 bg-festival-yellow"></span>
                    </div>
                    <h2 className="font-display text-5xl md:text-6xl mb-4 text-festival-yellow">Programme du Festival</h2>
                    <p className="text-ice-blue/80 text-lg max-w-2xl mx-auto">
                        Chaque édition hivernale apporte sa propre magie. Venez une fois, ou vivez les trois.
                    </p>
                </div>

                {/* Edition Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    {EDITIONS.map((ed) => (
                        <div
                            key={ed.month}
                            className={`bg-linear-to-b ${ed.color} border ${ed.border} rounded-2xl p-8 flex flex-col gap-6`}
                        >
                            {/* Badge */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${ed.badge}`}>
                                        {ed.theme}
                                    </span>
                                    <h3 className="text-3xl font-bold text-white">{ed.month}</h3>
                                    <p className="text-ice-blue/70 text-sm mt-1">{ed.date}</p>
                                </div>
                                <span className="material-symbols-outlined text-4xl text-white/20">ac_unit</span>
                            </div>

                            {/* Events list */}
                            <ul className="flex flex-col gap-3">
                                {ed.events.map(({ icon, label }) => (
                                    <li key={label} className="flex items-center gap-3 text-sm text-ice-blue/80">
                                        <span className="material-symbols-outlined text-base text-festival-yellow">{icon}</span>
                                        {label}
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <a
                                href="#tickets"
                                className="mt-auto block text-center py-3 px-6 rounded-xl border-2 border-white/20 text-white text-sm font-bold hover:bg-white/10 transition-all uppercase tracking-wider"
                            >
                                Obtenir des Billets
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
