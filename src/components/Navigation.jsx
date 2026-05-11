import React, { useState, useEffect } from 'react';
import { snowflake } from "../assets/images";

export default function Navigation({ onMenuClick }) {
    const [showScrollTop, setShowScrollTop] = useState(false);

    const menuItems = [
        { label: 'Le Festival', href: '#festival' },
        { label: 'Programme', href: '#schedule' },
        { label: 'Inscription', href: '#registration' },
        { label: 'Billets', href: '#tickets' },
        { label: 'Marché', href: '#market' },
        { label: 'Nous Trouver', href: '#map' },
    ];

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleClick = (e, href) => {
        e.preventDefault();
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
        <nav className="w-full z-50 text-deep-navy py-4 px-6 mt-4 flex items-center">
            <div className="max-w-7xl mx-auto w-full">
                
                {/* Desktop Navigation */}
                <ul className="hidden md:flex items-center gap-8 justify-evenly w-200 mx-auto">
                    {menuItems.map((item) => (
                        <li key={item.label}>
                            <a 
                                href={item.href}
                                onClick={(e) => handleClick(e, item.href)}
                                className="text-deep-navy font-semibold text-sm hover:text-festival-yellow transition-colors"
                            >
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>

                {/* Mobile Navigation - Snowflake Logo & Burger Menu */}
                <div className="md:hidden flex items-center justify-between w-full">
                    <div className="bg-deep-navy/30 rounded-full p-2 border shadow-lg">
                        <img src={snowflake} alt="Snowflake" className="w-10 h-10" />
                    </div>
                    <button 
                        onClick={onMenuClick}
                        className="p-2 cursor-pointer"
                    >
                        <div className="w-7.5 h-5 flex flex-col justify-between">
                            <span className="block w-full h-0.75 bg-deep-navy rounded"></span>
                            <span className="block w-full h-0.75 bg-deep-navy rounded"></span>
                            <span className="block w-full h-0.75 bg-deep-navy rounded"></span>
                        </div>
                    </button>
                </div>
            </div>
        </nav>

        {/* Scroll to Top Button */}
        <button
            onClick={scrollToTop}
            className={`fixed bottom-8 right-8 bg-deep-navy text-white p-4 rounded-full shadow-2xl hover:bg-deep-navy/90 transition-all duration-300 z-50 ${
                showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16 pointer-events-none'
            }`}
            aria-label="Scroll to top"
        >
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
        </button>
        </>
    );
}
