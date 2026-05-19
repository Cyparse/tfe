import React from 'react';
import './ScheduleSection.css';

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
            { icon: 'celebration', label: "Cérémonie d'ouverture & illuminations" },
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
        <section id="schedule" className="schedule-section">
            <div className="schedule-container">
                <div className="schedule-header">
                    <div className="schedule-eyebrow">
                        <span className="schedule-eyebrow-line"></span>
                        Trois éditions
                        <span className="schedule-eyebrow-line"></span>
                    </div>
                    <h2 className="schedule-title">Programme du Festival</h2>
                    <p className="schedule-subtitle">
                        Trois cartes, trois ambiances, une même identité hivernale. Chaque édition garde le même langage visuel.
                    </p>
                </div>

                <div className="schedule-grid">
                    {EDITIONS.map((ed) => (
                        <article
                            key={ed.month}
                            className="schedule-card"
                            style={{ '--clr': ed.accent }}
                        >
                            <div className="schedule-card-inner">

                                <div className="schedule-icon">
                                    <div className="schedule-icon-box">
                                        <span
                                            className="material-symbols-outlined"
                                            style={{ color: ed.accent === '#ffffff' ? '#1a1a1a' : ed.accent }}
                                        >
                                            {ed.icon}
                                        </span>
                                    </div>
                                </div>

                                <div className="schedule-content">
                                    <h3>{ed.theme}</h3>
                                    <p className="schedule-month">{ed.month}</p>
                                    <p className="schedule-description">{ed.description}</p>
                                    <p className="schedule-date">{ed.date}</p>

                                    <ul className="schedule-events">
                                        {ed.events.map(({ icon, label }) => (
                                            <li key={label} className="schedule-event">
                                                <span
                                                    className="material-symbols-outlined"
                                                    style={{ color: ed.accent }}
                                                >
                                                    {icon}
                                                </span>
                                                <span>{label}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <a
                                        href="#tickets"
                                        className="schedule-btn"
                                        style={{ background: ed.accent, color: '#1a1a1a' }}
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
