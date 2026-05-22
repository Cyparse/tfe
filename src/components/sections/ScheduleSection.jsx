import React from 'react';
import './ScheduleSection.css';

const EDITIONS = [
    {
        month: 'Décembre',
        date: '6 décembre 2026',
        theme: 'Édition Ouverture',
        accent: '#4289b6',
        icon: 'ac_unit',
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
        accent: '#CAE9FF',
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
        icon: 'ac_unit',
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
            <div className="schedule-wave-top">
                <svg preserveAspectRatio="none" viewBox="0 0 1200 120" className="w-full h-16 fill-white">
                    <path d="M0,0 C150,90 400,10 600,60 C800,110 1050,10 1200,80 L1200,120 L0,120 Z"></path>
                </svg>
                {/* Wave decorations */}
                <div className="absolute top-0 left-14 w-2 h-2 bg-white rounded-full opacity-60"></div>
                <div className="absolute top-2.5 left-24 w-1.5 h-1.5 bg-white rounded-full opacity-40"></div>
                <div className="absolute top-5 right-16 w-3 h-3 bg-white rounded-full opacity-50"></div>
                <div className="absolute top-0 right-8 w-2 h-2 bg-white rounded-full opacity-60"></div>
                <div className="absolute top-3 right-6 w-1.5 h-1.5 bg-white rounded-full opacity-40"></div>
            </div>

            <div className="schedule-container">
                <div className="schedule-header">
                    <div className="schedule-eyebrow">
                        <span className="schedule-eyebrow-line"></span>
                        Trois éditions
                        <span className="schedule-eyebrow-line"></span>
                    </div>
                    <h2 className="schedule-title">Programme du Festival</h2>
                    
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
                                            style={{ color: ed.accent }}
                                        >
                                            {ed.icon}
                                        </span>
                                    </div>
                                </div>

                                <div className="schedule-content">
                                    <h3>{ed.theme}</h3>
                                    <p className="schedule-date">{ed.date}</p>
                                    <p className="schedule-description">{ed.description}</p>

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

                                    <button
                                        className="schedule-btn"
                                        style={{ background: ed.accent, color: '#1a1a1a' }}
                                        onClick={() => document.getElementById('forms')?.scrollIntoView({ behavior: 'smooth' })}
                                    >
                                        Réserver mes billets
                                    </button>
                                </div>

                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
