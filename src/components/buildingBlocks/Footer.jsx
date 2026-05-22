import React, { useState } from 'react';
import { snowflake, FooterImage } from "../../assets/images";
import FAQModal from '../modals/FAQModal';

export default function Footer({ onContactOpen }) {
    const [faqOpen, setFaqOpen] = useState(false);

    const handleScroll = (e, href) => {
        e.preventDefault();
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const socialIcons = [
        { name: 'FB', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqlJC9NBqoX1DUmiZp5e5YsjaLd38gxnQcfl3x2cPneGj88qn5mfHnmhY0-iVCD6XKS4gtZ4grDHoQL9-skkc1RujaRBtAqoKtREzsYJnlPmlljVRFUgG8E1NggTeHiH7-kagyCq5SD50WHjRqjjudnKfGt_vW2Jiae2tFm9lrs3tuUUep2dOQa7C5RysG91U69a5R7B1xcEEELdXaP1AXukCKxpZviJJAmVl0zl0izEvSi-x3LPzAKM6dAB-a2HOe6yT2Gf8-CPs' },
        { name: 'TW', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB97cxLnYzx8iQdh00jFdwhG8cX2_60oIq4V5LViWcKt98r8AuWrdcDFTe96T0hf4PDD2al_vjaqkfLCyeWvG97ZIoMIxh_birOAPZlwPKWotDKjwpx3wKEXLhKtyY1Q7RcbRD7Lymv5PdBKLYtKPbEr2unsPNQ1WLktO2QTlttD_Bz7NJTng1Bdm16BTeUhpXDIcdO8AH6DSYMZrHyGcZd1a-6vFfJteKVxZzMCCPz1aTjAQiL9_mxcGDxhlSnICxNSpGU5p5FTPA' },
        { name: 'IG', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCr5rh3Vta8UqzHjLzz8PixbC1c9qaGmQOnfLA7Me1l9Ch-FA48yNsbD1HPiHGuC6dQGEIH7-8GaeOIoKeR1Kv0cSePMilKtehvuCTrM9tOkPWHPja_rpGG7FjwtLVqs_yTKaAFZ8QzjAP1lnMpqoD9Uln0gUx_4yfFw9nk3KcD94czdLPdUg5PeifY34-AvfAXfNttcuS9Y-HLDjf0ASsPZT-BvjHVTnwtAQ2XkQsxjApOt8esgpdu4QsQf7ewhp1-GCkTdq3DDA8' }
    ];

    return (
        <footer id="contact" className="relative text-white py-24 z-20 ">
            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-16">
                    {/* Brand Section */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-12 h-12 rounded-full flex items-center justify-center"><img src={snowflake} alt="Snowflake Logo" className="w-12 h-12" /></span>
                            <span className="font-lavish text-4xl">Snow Wonder</span>
                        </div>
                        <p className="text-ice-blue/60 max-w-sm mb-8 leading-relaxed">
                            Rejoignez-nous pour célébrer la beauté et la créativité de l'hiver. Une tradition qui illumine les nuits les plus froides depuis 1996.
                        </p>
                        
                    </div>
                    
                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold uppercase tracking-[0.2em] text-xs mb-8 text-festival-yellow">
                            Liens rapides
                        </h4>
                        <ul className="flex flex-col gap-5 text-ice-blue/60 text-sm font-medium">
                            {[
                                { label: 'Programme', href: '#schedule' },
                                { label: 'Inscription', href: '#forms' },
                                { label: 'Billets', href: '#forms' },
                                { label: 'Galerie', href: '#gallery' },
                                { label: "Marché d'hiver", href: '#market' },
                                { label: 'Nous Trouver', href: '#map' },
                                { label: 'Palmarès', href: '#winners' },
                            ].map(({ label, href }) => (
                                <li key={label}>
                                    <a href={href} onClick={(e) => handleScroll(e, href)} className="hover:text-white transition-colors">{label}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-bold uppercase tracking-[0.2em] text-xs mb-8 text-festival-yellow">
                            Assistance
                        </h4>
                        <ul className="flex flex-col gap-5 text-ice-blue/60 text-sm font-medium">
                            <li>
                                <button onClick={() => setFaqOpen(true)} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 text-ice-blue/60 text-sm font-medium">Questions fréquentes</button>
                            </li>
                            <li>
                                <button onClick={onContactOpen} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 text-ice-blue/60 text-sm font-medium">Nous contacter</button>
                            </li>
                            <li>
                                <a href="#admin" className="hover:text-white transition-colors">Accès administrateur</a>
                            </li>
                        </ul>
                    </div>
                </div>
                
                {/* Footer Bottom */}
                <div className="pt-16 mt-16 border-t border-white/10 text-center text-ice-blue/40 text-[10px] uppercase tracking-[0.3em]">
                    © 2026 Snow Wonder Festival. Tous droits réservés. Fait pour la saison froide.
                </div>
            </div>
            
            {/* Footer Trees Background */}
            <img src={FooterImage} alt="" className="absolute bottom-0 left-0 w-full pointer-events-none z-0" />

            <FAQModal isOpen={faqOpen} onClose={() => setFaqOpen(false)} />
        </footer>
    );
}
