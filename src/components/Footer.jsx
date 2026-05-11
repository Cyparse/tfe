import React from 'react';
import { snowflake, FooterImage } from "../assets/images";

export default function Footer() {
    const socialIcons = [
        { name: 'FB', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqlJC9NBqoX1DUmiZp5e5YsjaLd38gxnQcfl3x2cPneGj88qn5mfHnmhY0-iVCD6XKS4gtZ4grDHoQL9-skkc1RujaRBtAqoKtREzsYJnlPmlljVRFUgG8E1NggTeHiH7-kagyCq5SD50WHjRqjjudnKfGt_vW2Jiae2tFm9lrs3tuUUep2dOQa7C5RysG91U69a5R7B1xcEEELdXaP1AXukCKxpZviJJAmVl0zl0izEvSi-x3LPzAKM6dAB-a2HOe6yT2Gf8-CPs' },
        { name: 'TW', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB97cxLnYzx8iQdh00jFdwhG8cX2_60oIq4V5LViWcKt98r8AuWrdcDFTe96T0hf4PDD2al_vjaqkfLCyeWvG97ZIoMIxh_birOAPZlwPKWotDKjwpx3wKEXLhKtyY1Q7RcbRD7Lymv5PdBKLYtKPbEr2unsPNQ1WLktO2QTlttD_Bz7NJTng1Bdm16BTeUhpXDIcdO8AH6DSYMZrHyGcZd1a-6vFfJteKVxZzMCCPz1aTjAQiL9_mxcGDxhlSnICxNSpGU5p5FTPA' },
        { name: 'IG', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCr5rh3Vta8UqzHjLzz8PixbC1c9qaGmQOnfLA7Me1l9Ch-FA48yNsbD1HPiHGuC6dQGEIH7-8GaeOIoKeR1Kv0cSePMilKtehvuCTrM9tOkPWHPja_rpGG7FjwtLVqs_yTKaAFZ8QzjAP1lnMpqoD9Uln0gUx_4yfFw9nk3KcD94czdLPdUg5PeifY34-AvfAXfNttcuS9Y-HLDjf0ASsPZT-BvjHVTnwtAQ2XkQsxjApOt8esgpdu4QsQf7ewhp1-GCkTdq3DDA8' }
    ];

    return (
        <footer id="contact" className="relative text-white py-24 z-20 ">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-16">
                    {/* Brand Section */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-12 h-12 rounded-full flex items-center justify-center"><img src={snowflake} alt="Snowflake Logo" className="w-12 h-12" /></span>
                            <span className="font-display text-4xl">Snow Wonder</span>
                        </div>
                        <p className="text-ice-blue/60 max-w-sm mb-8 leading-relaxed">
                            Join us in celebrating the beauty and creativity of winter. A worldwide tradition bringing light
                            to the coldest nights since 1994.
                        </p>
                        <div className="flex gap-4">
                            {socialIcons.map((icon) => (
                                <a 
                                    key={icon.name}
                                    href="#" 
                                    className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center hover:bg-festival-yellow transition-all border border-white/10"
                                >
                                    <img 
                                        alt={icon.name} 
                                        src={icon.src}
                                        className="w-6 h-6 invert opacity-80" 
                                    />
                                </a>
                            ))}
                        </div>
                    </div>
                    
                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold uppercase tracking-[0.2em] text-xs mb-8 text-festival-yellow">
                            Quick Links
                        </h4>
                        <ul className="flex flex-col gap-5 text-ice-blue/60 text-sm font-medium">
                            [
                                { label: 'Le Festival', href: '#festival' },
                                { label: 'Programme', href: '#schedule' },
                                { label: 'Inscription', href: '#registration' },
                                { label: 'Billets', href: '#tickets' },
                                { label: 'Marché d\'hiver', href: '#market' },
                                { label: 'Nous Trouver', href: '#map' },
                            ].map(({ label, href }) => (
                                <li key={label}>
                                    <a href={href} className="hover:text-white transition-colors">{label}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-bold uppercase tracking-[0.2em] text-xs mb-8 text-festival-yellow">
                            Support
                        </h4>
                        <ul className="flex flex-col gap-5 text-ice-blue/60 text-sm font-medium">
                            <li>
                                <a href="#contact" className="hover:text-white transition-colors">Contact Us</a>
                            </li>
                            <li>
                                <a href="#admin" className="hover:text-white transition-colors">Admin Access</a>
                            </li>
                        </ul>
                    </div>
                </div>
                
                {/* Footer Bottom */}
                <div className="pt-16 mt-16 border-t border-white/10 text-center text-ice-blue/40 text-[10px] uppercase tracking-[0.3em]">
                    © 2026 Snow Wonder Festival. All rights reserved. Crafted for the Cold Season.
                </div>
            </div>
            
            {/* Footer Trees Background */}
            <div className="absolute bottom-0 left-0 w-full h-32 md:h-48 lg:h-110 bg-cover bg-bottom bg-no-repeat pointer-events-none z-0"
                 style={{backgroundImage: `url(${FooterImage})`}}></div>
        </footer>
    );
}
