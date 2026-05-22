import React from 'react';
import { HeroImage } from '../../assets/images';

export default function ContentSection() {
    return (
        <section id="sculptures" className="max-w-7xl mx-auto px-6 relative z-20 pb-20">
            {/* Wave Top */}
            <div className="relative w-full overflow-hidden leading-none -mb-px">
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
            
            {/* Content Card */}
            <div className="bg-deep-navy p-10 md:p-20 text-white rounded-b-3xl shadow-2xl relative border-l border-r border-b border-white/10">
                <h2 className="font-display text-5xl md:text-6xl mb-6 text-festival-yellow">
                    Winter Wonderland
                </h2>
                <h3 className="text-3xl font-bold mb-10 uppercase tracking-tight opacity-90">
                    Festival de Neige
                </h3>
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="flex flex-col gap-6 text-ice-blue/80 leading-relaxed text-lg">
                        <p>
                            Vivez l'enchantement de l'hiver au festival Snow Wonder. Chaque année, des artistes
                            passionnés se réunissent pour transformer la neige et la glace en œuvres d'art
                            spectaculaires qui défient l'imagination.
                        </p>
                        <p>
                            Des châteaux majestueux aux sculptures délicates, le festival célèbre la créativité
                            et la beauté éphémère de la saison froide.
                        </p>
                    </div>
                    <div className="flex flex-col gap-6 text-ice-blue/80 leading-relaxed text-lg">
                        <p>
                            Au-delà des sculptures, plongez dans nos zones interactives, les illuminations du
                            soir et la chaleur de notre communauté hivernale. Plus qu'un festival, c'est
                            un rendez-vous incontournable de l'hiver.
                        </p>
                        <div className="pt-4">
                            <img
                                alt="Sculpture de neige"
                                className="rounded-2xl border border-white/20 shadow-xl w-full object-cover"
                                src={HeroImage}
                                width="600"
                                height="400"
                                fetchpriority="high"
                            />
                        </div>
                    </div>
                </div>
               
            </div>
        </section>
    );
}
