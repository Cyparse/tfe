import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {Carousel} from './Carousel';

const EDITION_LABELS = {
    december: 'Décembre 2026',
    january: 'Janvier 2027',
    february: 'Février 2027',
};

const CATEGORY_LABELS = {
    amateur: 'Amateur',
    pro: 'Professionnel',
};

const RANK_LABELS = { 1: '1ère place', 2: '2ème place', 3: '3ème place' };
const RANK_COLORS = {
    1: 'text-festival-yellow border-festival-yellow/50 bg-festival-yellow/10',
    2: 'text-ice-blue border-ice-blue/40 bg-ice-blue/10',
    3: 'text-amber-600 border-amber-600/40 bg-amber-600/10',
};

export default function WinnersSection() {
    const [winners, setWinners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeEdition, setActiveEdition] = useState('december');

    useEffect(() => {
        const fetchWinners = async () => {
            const { data, error } = await supabase
                .from('winners')
                .select('*')
                .order('rank', { ascending: true });

            if (!error && data) setWinners(data);
            setLoading(false);
        };

        fetchWinners();
    }, []);

    const editionWinners = winners.filter((w) => w.festival_edition === activeEdition);
    const amateurWinners = editionWinners.filter((w) => w.category === 'amateur');
    const proWinners = editionWinners.filter((w) => w.category === 'pro');
    const hasResults = editionWinners.length > 0;

    return (
        <section id="winners" className="max-w-7xl mx-auto px-6 relative z-20 pb-20">
            <div className="bg-deep-navy/40 p-10 md:p-20 text-white rounded-3xl shadow-2xl border border-white/10">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 text-festival-yellow font-bold uppercase tracking-[0.3em] text-xs mb-6">
                        <span className="h-0.5 w-16 bg-festival-yellow"></span>
                        Palmarès
                        <span className="h-0.5 w-16 bg-festival-yellow"></span>
                    </div>
                    <h2 className="font-display text-5xl md:text-6xl mb-4 text-festival-yellow">Lauréats du Concours</h2>
                    <p className="text-ice-blue/80 text-lg max-w-2xl mx-auto">
                        Félicitons les meilleurs constructeurs de bonhommes de neige de chaque édition.
                    </p>
                </div>

            <Carousel cards={editionWinners} />
                {/* Edition Tabs */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
                    {Object.entries(EDITION_LABELS).map(([value, label]) => (
                        <button
                            key={value}
                            onClick={() => setActiveEdition(value)}
                            className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all border-2 ${
                                activeEdition === value
                                    ? 'border-festival-yellow bg-festival-yellow/20 text-festival-yellow'
                                    : 'border-white/20 text-ice-blue/60 hover:border-white/40 hover:text-white'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center text-ice-blue/60 py-16">Loading results...</div>
                ) : !hasResults ? (
                    <div className="text-center py-16 border-2 border-dashed border-white/20 rounded-2xl">
                        <span className="material-symbols-outlined text-5xl text-white/20 mb-4 block">hourglass_empty</span>
                        <p className="text-ice-blue/50 text-lg">Les résultats de l'édition {EDITION_LABELS[activeEdition]} seront annoncés après l'événement.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-10">
                        {[{ label: 'Amateur', list: amateurWinners }, { label: 'Professionnel', list: proWinners }].map(({ label, list }) => (
                            <div key={label}>
                                <h3 className="text-xl font-bold text-ice-blue uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-festival-yellow">emoji_events</span>
                                    {label} Category
                                </h3>
                                <div className="flex flex-col gap-4">
                                    {list.length === 0 ? (
                                        <p className="text-ice-blue/40 text-sm">Aucun résultat pour le moment.</p>
                                    ) : list.map((w) => (
                                        <div key={w.id} className={`flex items-center gap-5 p-5 rounded-xl border-2 ${RANK_COLORS[w.rank] ?? 'border-white/10 bg-white/5'}`}>
                                            <div className="text-2xl font-black w-8 text-center shrink-0">
                                                {w.rank === 1 ? '🥇' : w.rank === 2 ? '🥈' : '🥉'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-white truncate">{w.participant_name}</div>
                                                {w.snowman_name && (
                                                    <div className="text-sm text-ice-blue/60 italic truncate">"{w.snowman_name}"</div>
                                                )}
                                            </div>
                                            <div className="text-xs font-semibold uppercase tracking-wider shrink-0 opacity-70">
                                                {RANK_LABELS[w.rank]}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
