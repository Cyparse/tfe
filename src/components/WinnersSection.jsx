import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Carousel from './Carousel';

export default function WinnersSection() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImages = async () => {
            const { data, error } = await supabase
                .from('carousel_images')
                .select('id, url, alt')
                .eq('active', true)
                .order('position', { ascending: true });

            if (!error && data) setImages(data);
            setLoading(false);
        };

        fetchImages();
    }, []);

    return (
        <section id="winners" className="max-w-7xl mx-auto px-6 relative z-20 pb-20">
            <div className="bg-deep-navy/40 p-10 md:p-20 text-white rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 text-festival-yellow font-bold uppercase tracking-[0.3em] text-xs mb-6">
                        <span className="h-0.5 w-16 bg-festival-yellow"></span>
                        Galerie
                        <span className="h-0.5 w-16 bg-festival-yellow"></span>
                    </div>
                    <h2 className="font-display text-5xl md:text-6xl mb-4 text-festival-yellow">Sculptures sur Neige</h2>
                    <p className="text-ice-blue/80 text-lg max-w-2xl mx-auto">
                        Découvrez les œuvres réalisées lors de nos éditions.
                    </p>
                </div>

                {loading ? (
                    <div className="text-center text-ice-blue/60 py-16">Chargement...</div>
                ) : images.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-white/20 rounded-2xl">
                        <span className="material-symbols-outlined text-5xl text-white/20 mb-4 block">photo_library</span>
                        <p className="text-ice-blue/50 text-lg">Les photos seront ajoutées prochainement.</p>
                    </div>
                ) : (
                    <Carousel cards={images} />
                )}
            </div>
        </section>
    );
}
