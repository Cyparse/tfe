import React, { useState, useEffect, useRef } from 'react';
import { MapBackground } from '../assets/images';

export default function MarketSection() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const mapRef = useRef(null);
    const leafletMapRef = useRef(null);

    useEffect(() => {
        // Initialize Leaflet map when modal opens
        if (isModalOpen && mapRef.current && !leafletMapRef.current && window.L) {
            // Market location
            const marketLocation = [50.602511757616966, 3.388043095146282];

            // Create map
            leafletMapRef.current = window.L.map(mapRef.current, {
                scrollWheelZoom: true
            }).setView(marketLocation, 17);

            // Add tile layer
            window.L.tileLayer(
                'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
                {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19
                }
            ).addTo(leafletMapRef.current);

            // Custom marker icon
            const marketIcon = window.L.divIcon({
                html: '<div style="background-color: #e8a94e; width: 35px; height: 35px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.3);"><div style="width: 12px; height: 12px; background: white; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg);"></div></div>',
                className: 'custom-marker',
                iconSize: [35, 35],
                iconAnchor: [17.5, 35]
            });

            // Add marker
            const marker = window.L.marker(marketLocation, {
                icon: marketIcon
            }).addTo(leafletMapRef.current);

            marker.bindPopup(`
                <div style="font-family: 'Nunito', sans-serif; padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; color: #002442; font-size: 16px; font-weight: bold;">Winter Market</h3>
                    <p style="margin: 0 0 8px 0; color: #3a7ca5; font-size: 14px;">Artisan Crafts & Hot Beverages</p>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=50.602511757616966,3.388043095146282" target="_blank" style="display: inline-block; background-color: #e8a94e; color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; margin-top: 4px;">Get Directions</a>
                </div>
            `).openPopup();
        }

        // Cleanup when modal closes
        if (!isModalOpen && leafletMapRef.current) {
            leafletMapRef.current.remove();
            leafletMapRef.current = null;
        }

        return () => {
            if (leafletMapRef.current) {
                leafletMapRef.current.remove();
                leafletMapRef.current = null;
            }
        };
    }, [isModalOpen]);

    return (
        <section id="market" className="py-32 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    {/* Image */}
                    <div className="relative order-2 md:order-1">
                        <div className="absolute -inset-6 bg-festival-yellow/10 rounded-3xl blur-3xl"></div>
                        <img 
                            src={MapBackground}
                            alt="Cozy Night Winter Market"
                            className="w-full h-auto rounded-2xl"
                        />
                    </div>
                    
                    {/* Content */}
                    <div className="flex flex-col gap-8 order-1 md:order-2">
                        <div className="flex items-center gap-3 text-festival-yellow font-bold uppercase tracking-[0.3em] text-xs">
                            <span className="h-0.5 w-16 bg-festival-yellow"></span>
                            Seasonal Magic
                        </div>
                        <h2 className="text-4xl md:text-6xl font-bold leading-tight text-white drop-shadow-md">
                            Cozy Nights at the Winter Market
                        </h2>
                        <p className="text-xl text-ice-blue font-medium">
                            Warm your hands with artisan hot cocoa and find one-of-a-kind treasures. Our market
                            features over 50 local vendors, glowing lanterns, and live music.
                        </p>
                        <ul className="flex flex-col gap-5 text-white/90">
                            {[
                                'Artisanal Handcrafted Gifts',
                                'Traditional Seasonal Delicacies',
                                'Ice Skating Rink & Live Entertainment'
                            ].map((feature) => (
                                <li key={feature} className="flex items-center gap-4">
                                    <span className="material-symbols-outlined text-festival-yellow bg-white/10 p-1 rounded-full text-xl">
                                        check
                                    </span>
                                    <span className="font-medium">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-festival-yellow text-white py-5 px-12 rounded-2xl font-bold shadow-2xl hover:bg-festival-yellow/90 transition-all flex items-center justify-center gap-3 w-full md:w-auto uppercase tracking-[0.2em] text-sm"
                        >
                            Browse the Market 
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div 
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div 
                        className="bg-white rounded-3xl p-6 max-w-5xl w-full relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 bg-deep-navy text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-deep-navy/80 transition-colors z-10"
                            aria-label="Close modal"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <div 
                            ref={mapRef}
                            className="w-full h-[600px] rounded-2xl"
                        ></div>
                    </div>
                </div>
            )}
        </section>
    );
}
