import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

export default function GallerySection() {
    const [images, setImages] = useState([]);
    const [lightbox, setLightbox] = useState(null);
    const trackRef = useRef(null);

    useEffect(() => {
        supabase
            .from('carousel_images')
            .select('*')
            .eq('active', true)
            .eq('section', 'gallery')
            .order('position', { ascending: true })
            .then(({ data }) => setImages(data || []));
    }, []);

    useEffect(() => {
        if (lightbox === null) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') setLightbox(null);
            if (e.key === 'ArrowRight') setLightbox(i => Math.min(i + 1, images.length - 1));
            if (e.key === 'ArrowLeft') setLightbox(i => Math.max(i - 1, 0));
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [lightbox, images.length]);

    if (!images.length) return null;

    const scroll = (dir) => {
        trackRef.current?.scrollBy({ left: dir * 580, behavior: 'smooth' });
    };

    return (
        <section id="gallery" className="py-24 relative">
            <style>{`
                .gallery-track::-webkit-scrollbar { display: none; }
            `}</style>

            {/* Title */}
            <div className="text-center mb-16 px-6">
                <p className="text-festival-yellow text-xs font-bold uppercase tracking-[0.3em] mb-4">Photos</p>
                <h2 className="font-display text-5xl md:text-6xl text-white mb-6">Galerie</h2>
                <div className="w-24 h-0.5 bg-festival-yellow/40 mx-auto" />
            </div>

            {/* Mosaic + scroll */}
            <div className="relative max-w-7xl mx-auto px-6">
                {/* Left button */}
                <button
                    onClick={() => scroll(-1)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-deep-navy/80 text-white hover:bg-white/10 transition-colors border border-white/20"
                    aria-label="Précédent"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Scrollable mosaic track */}
                <div
                    ref={trackRef}
                    className="gallery-track mx-8"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        flexWrap: 'wrap',
                        alignContent: 'flex-start',
                        gap: '0.75rem',
                        height: '560px',
                        overflowX: 'auto',
                        overflowY: 'hidden',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    {images.map((img, i) => (
                        <div
                            key={img.id ?? i}
                            className="cursor-pointer overflow-hidden rounded-xl group"
                            style={{ width: '260px', flexShrink: 0 }}
                            onClick={() => setLightbox(i)}
                        >
                            <img
                                src={img.url}
                                alt={img.alt || ''}
                                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                                style={{ border: '1.5px solid rgba(202,233,255,0.12)', borderRadius: '0.75rem', display: 'block' }}
                                draggable={false}
                            />
                        </div>
                    ))}
                </div>

                {/* Right button */}
                <button
                    onClick={() => scroll(1)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-deep-navy/80 text-white hover:bg-white/10 transition-colors border border-white/20"
                    aria-label="Suivant"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Lightbox */}
            {lightbox !== null && (
                <div
                    className="fixed inset-0 z-3000 flex items-center justify-center bg-deep-navy/90 backdrop-blur-sm p-4"
                    onClick={() => setLightbox(null)}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); setLightbox(i => Math.max(i - 1, 0)); }}
                        disabled={lightbox === 0}
                        className="absolute left-4 md:left-8 text-white/60 hover:text-white disabled:opacity-20 transition-colors"
                        aria-label="Précédent"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <img
                        src={images[lightbox].url}
                        alt={images[lightbox].alt || ''}
                        className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />

                    <button
                        onClick={(e) => { e.stopPropagation(); setLightbox(i => Math.min(i + 1, images.length - 1)); }}
                        disabled={lightbox === images.length - 1}
                        className="absolute right-4 md:right-8 text-white/60 hover:text-white disabled:opacity-20 transition-colors"
                        aria-label="Suivant"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    <button
                        onClick={() => setLightbox(null)}
                        className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                        aria-label="Fermer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <span className="absolute bottom-4 text-ice-blue/40 text-sm">
                        {lightbox + 1} / {images.length}
                    </span>
                </div>
            )}
        </section>
    );
}
