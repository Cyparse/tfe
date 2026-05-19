import React from 'react';
import Registration from './Registration';
import Tickets from './Tickets';

export default function FormsSection() {
    return (
        <section className="max-w-7xl mx-auto px-6 relative z-20 pb-20">
            <div className="relative flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-2xl border border-white/10">

                {/* Registration panel */}
                <div id="registration" className="flex-1 bg-[#111]">
                    <Registration />
                </div>

                {/* Yin-yang wave divider — visible only on md+ */}
                <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-25 z-10 pointer-events-none">
                    <svg
                        viewBox="0 0 100 600"
                        preserveAspectRatio="none"
                        className="h-full w-full"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Left panel color sweeps into upper-right (yin side) */}
                        <path
                            d="M50,0 C200,150 -100,450 50,600 L0,600 L0,0 Z"
                            fill="#111"
                        />
                        {/* Right panel color sweeps into lower-left (yang side) */}
                        <path
                            d="M50,0 C200,150 -100,450 50,600 L100,600 L100,0 Z"
                            fill="#1a1a1a"
                        />
                        {/* The S-curve edge */}
                        <path
                            d="M50,0 C200,150 -100,450 50,600"
                            fill="none"
                            stroke="rgba(255,255,255,0.15)"
                            strokeWidth="1.5"
                        />
                    </svg>
                </div>

                {/* Horizontal divider on mobile */}
                <div className="md:hidden w-full h-px bg-white/10" />

                {/* Tickets panel */}
                <div id="tickets" className="flex-1 bg-[#1a1a1a]">
                    <Tickets />
                </div>
            </div>
        </section>
    );
}
