import React from 'react';
import './ScheduleSection.css';
import { useEditions } from '../../hooks/useEditions';

export default function ScheduleSection() {
    const { editions, loading } = useEditions();
    const gridRef = React.useRef(null);
    const [canScrollLeft, setCanScrollLeft] = React.useState(false);
    const [canScrollRight, setCanScrollRight] = React.useState(false);

    React.useEffect(() => {
        const el = gridRef.current;
        if (!el) return;
        setCanScrollRight(el.scrollWidth > el.clientWidth);
    }, [editions]);

    const handleScroll = () => {
        const el = gridRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    };

    const scroll = (dir) => {
        gridRef.current?.scrollBy({ left: dir * 324, behavior: 'smooth' });
    };

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
                        {editions.length} édition{editions.length !== 1 ? 's' : ''}
                        <span className="schedule-eyebrow-line"></span>
                    </div>
                    <h2 className="schedule-title">Programme du Festival</h2>

                </div>

                <div className="schedule-grid-wrapper">
                    <button
                        className={`schedule-scroll-btn schedule-scroll-btn--left${canScrollLeft ? ' visible' : ''}`}
                        onClick={() => scroll(-1)}
                        aria-label="Défiler vers la gauche"
                    >
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>

                    <div className="schedule-grid" ref={gridRef} onScroll={handleScroll}>
                    {loading ? (
                        <p className="schedule-date" style={{ opacity: 0.5 }}>Chargement…</p>
                    ) : editions.map((ed) => (
                        <article
                            key={ed.id}
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
                                    <p className="schedule-date">{ed.date_display}</p>
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

                    <button
                        className={`schedule-scroll-btn schedule-scroll-btn--right${canScrollRight ? ' visible' : ''}`}
                        onClick={() => scroll(1)}
                        aria-label="Défiler vers la droite"
                    >
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </div>
        </section>
    );
}
