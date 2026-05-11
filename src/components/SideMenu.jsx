import React from 'react';

export default function SideMenu({ isOpen, onClose }) {
    const menuItems = [
        { label: 'Le Festival', href: '#festival' },
        { label: 'Programme', href: '#schedule' },
        { label: 'Inscription', href: '#registration' },
        { label: 'Billets', href: '#tickets' },
        { label: 'Marché', href: '#market' },
        { label: 'Nous Trouver', href: '#map' },
        { label: 'Contact', href: '#contact' },
    ];

    const handleClick = (e, href) => {
        e.preventDefault();
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        onClose();
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 transition-all duration-300 z-1040 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onClick={onClose}
            />

            {/* Side Menu */}
            <aside className={`fixed top-0 right-0 w-100 max-w-[85vw] h-screen bg-white/95 backdrop-blur-xl shadow-2xl transition-transform duration-400 z-1050 p-8 overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-ice-blue">
                    <h2 className="text-2xl font-bold text-deep-navy">Menu</h2>
                    <button 
                        onClick={onClose}
                        className="text-deep-navy w-10 h-10 flex items-center justify-center rounded-full hover:bg-ice-blue transition-colors"
                    >
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>
                </div>
                <ul className="space-y-4">
                    {menuItems.map((item) => (
                        <li key={item.label}>
                            <a 
                                href={item.href}
                                onClick={(e) => handleClick(e, item.href)}
                                className="block py-4 px-4 text-deep-navy text-lg font-semibold rounded-lg hover:bg-ice-blue hover:pl-6 transition-all"
                            >
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </aside>
        </>
    );
}
