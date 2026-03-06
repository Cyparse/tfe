import React from 'react';

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
                    Festival de neige
                </h3>
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="flex flex-col gap-6 text-ice-blue/80 leading-relaxed text-lg">
                        <p>
                            Experience the enchantment of winter at the world-renowned Snow Wonder Festival. Every
                            year, master artisans gather from across the globe to transform pure ice and snow into
                            breathtaking masterpieces that defy the imagination.
                        </p>
                        <p>
                            From towering castles that reach for the stars to delicate crystalline carvings, the
                            festival is a celebration of artistry and the fleeting beauty of the cold season.
                        </p>
                    </div>
                    <div className="flex flex-col gap-6 text-ice-blue/80 leading-relaxed text-lg">
                        <p>
                            Beyond the sculptures, immerse yourself in our interactive snow zones, evening light
                            shows, and the warm camaraderie of our winter community. It's more than a festival; it's
                            a seasonal legacy.
                        </p>
                        <div className="pt-4">
                            <img 
                                alt="Grand Snow Sculpture" 
                                className="rounded-2xl border border-white/20 shadow-xl w-full"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbmi8anxilc3U36hMcgj4YRT2vWls65cKkEmtaJ8DPSrJELN5fkU_pc2EmlbToWqnfHz_Vpz1sA5icbY46f-k7jx4MkhYoX1YtSeNohFoEe_qDXcbZtGcApgTPsRNkiU0Ijv-wCZJ1SrlSf69bO7U6YfXZY7Xyai0eftnc2bqiSJhDGPK-5nM6l2GZ49WXHqDgbUSK2nX2lPpJMirHS_xsfH-16VFfFa1JaI4fLc8aOahCJFKxj8vqLRpsNYDf5nSG7oPiXRhbBiw" 
                            />
                        </div>
                    </div>
                </div>
               
            </div>
        </section>
    );
}
