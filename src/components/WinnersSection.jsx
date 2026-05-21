import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { snowflake } from '../assets/images';
import Carousel from './Carousel';

export default function WinnersSection() {
    const [images, setImages] = useState([]);
    const [winners, setWinners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            supabase
                .from('carousel_images')
                .select('id, url, alt')
                .eq('active', true)
                .order('position', { ascending: true }),
            supabase
                .from('winners')
                .select('*')
                .order('position', { ascending: true }),
        ]).then(([carousel, wins]) => {
            if (!carousel.error) setImages(carousel.data || []);
            if (!wins.error)     setWinners(wins.data || []);
            setLoading(false);
        });
    }, []);

    return (
        <section id="winners" className="max-w-7xl mx-auto px-6 relative z-20 pb-20">
            <div className="bg-deep-navy/40 p-10 md:p-16 text-white rounded-3xl shadow-2xl border border-white/10 overflow-hidden">

                {/* Section header */}
                <div className="text-center mb-12">
                    <p className="text-festival-yellow text-xs font-bold uppercase tracking-[0.3em] mb-3">Palmarès</p>
                    <h2 className="font-display text-5xl md:text-6xl text-white">Gagnants de l'édition pro précédente</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center">

                    {/* Left — Carousel */}
                    <div className="flex flex-col items-center">
                        {loading ? (
                            <div className="text-ice-blue/40 py-20">Chargement…</div>
                        ) : images.length === 0 ? (
                            <div className="text-center py-20 border-2 border-dashed border-white/20 rounded-2xl w-full">
                                <p className="text-ice-blue/40">Photos à venir.</p>
                            </div>
                        ) : (
                            <Carousel cards={images} />
                        )}
                    </div>

                    {/* Right — Winner cards */}
                    <div className="flex flex-col gap-5">
                        {loading ? (
                            <div className="text-ice-blue/40 py-10 text-center">Chargement…</div>
                        ) : winners.map((winner) => (
                            <div
                                key={winner.id}
                                className="flex items-center gap-5 rounded-2xl px-5 py-4"
                                style={{ background: winner.edition_bg, border: `1px solid ${winner.edition_color}33` }}
                            >
                                {/* Snowflake badge */}
                                <div
                                    className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                                    style={{ background: winner.edition_color }}
                                >
                                    <img
                                        src={snowflake}
                                        alt=""
                                        className="w-7 h-7"
                                        style={{ filter: 'brightness(0) saturate(100%) invert(12%) sepia(30%) saturate(800%) hue-rotate(185deg)' }}
                                    />
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-0.5" style={{ color: winner.edition_color }}>
                                        1ère place — Pro
                                    </p>
                                    <p className="font-semibold text-white text-base leading-tight">{winner.edition_label}</p>
                                    {winner.winner_name && (
                                        <p className="text-sm mt-0.5" style={{ color: winner.edition_color }}>{winner.winner_name}</p>
                                    )}
                                </div>

                                {/* Winner avatar circle */}
                                <div
                                    className="shrink-0 w-14 h-14 rounded-full flex items-center justify-center overflow-hidden"
                                    style={{ border: `2px solid ${winner.edition_color}66`, background: `${winner.edition_color}15` }}
                                >
                                    {winner.photo_url ? (
                                        <img src={winner.photo_url} alt={winner.winner_name || ''} className="w-full h-full object-cover" />
                                    ) : (
                                        <img
                                            src={snowflake}
                                            alt=""
                                            className="w-7 h-7 opacity-40"
                                            style={{ filter: `drop-shadow(0 0 4px ${winner.edition_color})` }}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
