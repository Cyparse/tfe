import React from 'react';

const EDITIONS = [
    {
        month: 'Décembre',
        date: '6 décembre 2026',
        theme: 'Édition Ouverture',
        accent: '#249eff',
        icon: 'calendar_month',
        description: 'Lancement du festival, illuminations et premières sculptures de neige.',
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
        accent: '#7dd3fc',
        icon: 'ac_unit',
        description: 'Ambiance glacée, animations nocturnes et énergie hivernale maximale.',
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
        accent: '#ffffff',
        icon: 'trophy',
        description: 'Dernière édition, remise des prix et final spectaculaire du festival.',
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
        <section id="schedule" className="relative z-20 px-6 py-20 md:py-28">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-14 md:mb-16 text-white">
                    <div className="flex items-center justify-center gap-3 text-white/75 font-bold uppercase tracking-[0.3em] text-[11px] mb-5">
                        <span className="h-px w-14 bg-white/60"></span>
                        Trois éditions
                        <span className="h-px w-14 bg-white/60"></span>
                    </div>
                    <h2 className="font-display text-5xl md:text-6xl text-festival-yellow mb-4">Programme du Festival</h2>
                    <p className="text-ice-blue/80 text-lg max-w-2xl mx-auto">
                        Trois cartes, trois ambiances, une même identité hivernale. Chaque édition garde le même langage visuel.
                    </p>
                </div>

                <div className="flex justify-center flex-wrap gap-10 md:gap-14">
                    {EDITIONS.map((ed) => (
                        <article
                            key={ed.month}
                            className="schedule-card relative w-75 h-112.5 rounded-[20px] rounded-tl-[70px] overflow-hidden shadow-2xl"
                            style={{ '--clr': ed.accent }}
                        >
                            <div className="absolute inset-2.5 rounded-[10px] bg-[#1a1a1a] border border-white/5 overflow-hidden">
                                <div className="schedule-icon absolute top-0 left-0 w-35 h-35 rounded-br-full bg-(--clr) transition-all duration-500">
                                    <div className="absolute inset-2.5 rounded-full rounded-tr-[10px] rounded-bl-[10px] bg-[#1a1a1a] flex items-center justify-center">
                                        <span
                                            className="material-symbols-outlined text-[4rem]"
                                            style={{ color: ed.accent === '#ffffff' ? '#1a1a1a' : 'var(--clr)', fontVariationSettings: '"FILL" 0, "wght" 300, "GRAD" 0, "opsz" 48' }}
                                        >
                                            {ed.icon}
                                        </span>
                                    </div>
                                </div>

                                <div className="absolute top-40 left-5 right-5 text-center text-white">
                                    <h3 className="text-[1.35em] font-bold uppercase tracking-[0.12em]">{ed.theme}</h3>
                                    <p className="text-[0.95em] text-white/75 mb-1">{ed.month}</p>
                                    <p className="text-[0.95em] text-white/75 leading-relaxed mb-4">{ed.description}</p>
                                    <p className="text-[0.78em] text-white/55 uppercase tracking-[0.35em] mb-5">{ed.date}</p>

                                    <ul className="text-left flex flex-col gap-3">
                                        {ed.events.map(({ icon, label }) => (
                                            <li key={label} className="flex items-start gap-3 text-xs text-white/75 leading-relaxed">
                                                <span
                                                    className="material-symbols-outlined text-base shrink-0 mt-0.5"
                                                    style={{ color: 'var(--clr)' }}
                                                >
                                                    {icon}
                                                </span>
                                                <span>{label}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <a
                                        href="#tickets"
                                        className="mt-6 inline-block bg-(--clr) px-6 py-2.5 no-underline text-[#1a1a1a] font-semibold uppercase rounded-full transition-all duration-500 hover:tracking-[0.2em]"
                                    >
                                        Voir l'édition
                                    </a>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
