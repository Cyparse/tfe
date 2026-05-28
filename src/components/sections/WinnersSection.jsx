import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { snowflake } from '../../assets/images';
import Carousel from '../buildingBlocks/Carousel';
import Lightbox from '../buildingBlocks/Lightbox';

export default function WinnersSection() {
    const [images, setImages] = useState([]);
    const [winners, setWinners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lightbox, setLightbox] = useState(null);

    useEffect(() => {
        Promise.all([
            supabase
                .from('carousel_images')
                .select('id, url, alt')
                .eq('active', true)
                .eq('section', 'winners')
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
        <>
        {lightbox && <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />}
        <section id="winners" className="max-w-7xl mx-auto px-4 sm:px-6 relative z-20 pb-20">
            <div className="bg-deep-navy/40 p-6 sm:p-10 md:p-16 text-white rounded-2xl sm:rounded-3xl shadow-2xl border border-white/10">

                {/* Section header */}
                <div className="text-center mb-8 sm:mb-12">
<div className="flex items-center justify-center gap-3 text-festival-yellow font-bold uppercase tracking-[0.3em] text-xs mb-6">
                        <span className="h-0.5 w-16 bg-festival-yellow"></span>
                        Palmarès
                        <span className="h-0.5 w-16 bg-festival-yellow"></span>
                    </div>                    <h2 className="font-display text-3xl sm:text-5xl md:text-6xl text-white leading-tight">
                        Gagnants de l'édition<br className="sm:hidden" /> précédente
                    </h2>
                </div>

                <div className="flex flex-col wide:grid wide:grid-cols-2 gap-8 wide:gap-12 items-center">

                    {/* Winner cards — first on mobile */}
                    <div className="flex flex-col gap-3 sm:gap-5 w-full wide:order-2">
                        {loading ? (
                            <div className="text-ice-blue/40 py-10 text-center">Chargement…</div>
                        ) : winners.map((winner) => (
                            <div
                                key={winner.id}
                                className="flex items-center gap-3 sm:gap-5 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4"
                                style={{ background: winner.edition_bg, border: `1px solid ${winner.edition_color}33` }}
                            >
                                {/* Snowflake badge */}
                                <div
                                    className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
                                    style={{ background: winner.edition_color }}
                                >
                                    <img
                                        src={snowflake}
                                        alt=""
                                        className="w-6 h-6 sm:w-7 sm:h-7"
                                        style={{ filter: 'brightness(0) saturate(100%) invert(12%) sepia(30%) saturate(800%) hue-rotate(185deg)' }}
                                    />
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-0.5" style={{ color: winner.edition_color }}>
                                        1ère place — Pro
                                    </p>
                                    <p className="font-semibold text-white text-sm sm:text-base leading-tight">{winner.edition_label}</p>
                                    {winner.winner_name && (
                                        <p className="text-xs sm:text-sm mt-0.5" style={{ color: winner.edition_color }}>{winner.winner_name}</p>
                                    )}
                                </div>

                                {/* Winner avatar */}
                                <div
                                    className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center overflow-hidden"
                                    style={{ border: `2px solid ${winner.edition_color}66`, background: `${winner.edition_color}15`, cursor: winner.photo_url ? 'zoom-in' : 'default' }}
                                    onClick={winner.photo_url ? () => setLightbox({ src: winner.photo_url, alt: winner.winner_name || '' }) : undefined}
                                >
                                    {winner.photo_url ? (
                                        <img src={winner.photo_url} alt={winner.winner_name || ''} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                    ) : (
                                        <img
                                            src={snowflake}
                                            alt=""
                                            className="w-6 h-6 sm:w-7 sm:h-7 opacity-40"
                                            style={{ filter: `drop-shadow(0 0 4px ${winner.edition_color})` }}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Carousel — second on mobile */}
                    <div className="flex flex-col items-center w-full wide:order-1">
                        {loading ? (
                            <div className="text-ice-blue/40 py-20">Chargement…</div>
                        ) : images.length === 0 ? (
                            <div className="text-center py-12 sm:py-20 border-2 border-dashed border-white/20 rounded-2xl w-full">
                                <p className="text-ice-blue/40">Photos à venir.</p>
                            </div>
                        ) : (
                            <Carousel cards={images} onImageClick={(src, alt) => setLightbox({ src, alt })} />
                        )}
                    </div>

                </div>
            </div>
        </section>
        </>
    );
}
