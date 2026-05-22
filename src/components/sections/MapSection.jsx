import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapSection() {
    const mapRef = useRef(null);
    const leafletMapRef = useRef(null);
    const [showInfo, setShowInfo] = useState(() => window.innerWidth >= 1024);

    useEffect(() => {
        // Initialize Leaflet map
        if (mapRef.current && !leafletMapRef.current && L) {
            const foodVillageLocation = [50.602511757616966, 3.388043095146282];

            // Set zoom level based on screen width
            const isMobile = screen.width < 768;
            const zoomLevel = isMobile ? 15 : 17;

            leafletMapRef.current = L.map(mapRef.current, {
                scrollWheelZoom: false
            }).setView(foodVillageLocation, zoomLevel);

            L.tileLayer(
                'https://api.mapbox.com/styles/v1/cyparse/cmmj8gl6z00cc01qu9pm3a08y/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiY3lwYXJzZSIsImEiOiJjbW1qN2c2czAxNjJ3MnBzOGQzdWs5Njk1In0.yIAmgxiT-MXxxf9WtJhR2g',
                {
                    attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19,
                    tileSize: 512,
                    zoomOffset: -1
                }
            ).addTo(leafletMapRef.current);

            const mainIcon = L.divIcon({
                html: '<div style="background-color: var(--color-festival-yellow); width: 35px; height: 35px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.3);"><div style="width: 12px; height: 12px; background: white; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg);"></div></div>',
                className: 'custom-marker',
                iconSize: [35, 35],
                iconAnchor: [17.5, 35]
            });

            const mainMarker = L.marker(foodVillageLocation, {
                icon: mainIcon
            }).addTo(leafletMapRef.current);

            mainMarker.bindPopup(`
                <div style="font-family: 'Nunito', sans-serif; padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; color: var(--color-deep-navy); font-size: 16px; font-weight: bold;">Festival & Marché d'hiver</h3>
                    <p style="margin: 0 0 8px 0; color: var(--color-midblue); font-size: 14px;">Parc Georges Brassens, Tournai</p>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=50.602511757616966,3.388043095146282" target="_blank" style="display: inline-block; background-color: var(--color-festival-yellow); color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; margin-top: 4px;">Itinéraire</a>
                </div>
            `);
        }

        // Cleanup on unmount
        return () => {
            if (leafletMapRef.current) {
                leafletMapRef.current.remove();
                leafletMapRef.current = null;
            }
        };
    }, []);

    return (
        <section id="map" className="py-20 relative  overflow-x-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 text-festival-yellow font-bold uppercase tracking-[0.3em] text-xs mb-6">
                        <span className="h-0.5 w-16 bg-festival-yellow"></span>
                        Nous Trouver
                        <span className="h-0.5 w-16 bg-festival-yellow"></span>
                    </div>
                    <h2 className="font-display text-4xl md:text-6xl font-bold leading-tight text-white drop-shadow-md mb-4">
                        Trouver le Festival
                    </h2>
                    <p className="text-xl text-ice-blue font-medium max-w-2xl mx-auto">
                        Au cœur de l'hiver, facilement accessible en voiture ou à pied depuis la gare
                    </p>
                </div>

                {/* Map Container */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
                    <div
                        ref={mapRef}
                        className="w-full h-125 md:h-150"
                    />

                    {/* Map Overlay Info */}
                    <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-auto z-1000">
                        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl max-w-md overflow-hidden">
                            <button
                                onClick={() => setShowInfo(!showInfo)}
                                className="w-full flex items-center justify-between px-6 py-4 text-deep-navy hover:text-festival-yellow transition-colors"
                                aria-label="Toggle info"
                            >
                                <h3 className="text-2xl font-bold">Comment venir</h3>
                                <span className={`material-symbols-outlined transition-transform duration-300 ${showInfo ? 'rotate-0' : 'rotate-180'}`}>
                                    expand_more
                                </span>
                            </button>
                            <div className={`transition-all duration-300 overflow-hidden ${showInfo ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="px-6 pb-6 space-y-2 text-deep-navy/80">
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-festival-yellow mt-0.5">directions_car</span>
                                        <p className="text-sm">En voiture : suivre les panneaux vers le centre-ville, stationnement gratuit à proximité</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-festival-yellow mt-0.5">directions_walk</span>
                                        <p className="text-sm">10 minutes à pied depuis la gare principale</p>
                                    </div>
                                    <a
                                        href="https://www.google.com/maps/dir/?api=1&destination=50.602511757616966,3.388043095146282"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-4 block w-full bg-festival-yellow text-white py-3 px-6 rounded-xl font-bold hover:bg-festival-yellow/90 transition-all text-sm uppercase tracking-wider text-center"
                                    >
                                        Itinéraire
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}