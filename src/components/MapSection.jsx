import React, { useEffect, useRef } from 'react';

export default function MapSection() {
    const mapRef = useRef(null);
    const leafletMapRef = useRef(null);

    useEffect(() => {
        // Initialize Leaflet map
        if (mapRef.current && !leafletMapRef.current && window.L) {
            // Festival locations
            const mainFestivalLocation = [50.602860262325706, 3.3809785070446057];
            const foodVillageLocation = [50.602511757616966, 3.388043095146282];
            const amateurLocation = [50.599967067972884, 3.3919939590763226];

            // Create map centered between all locations
            leafletMapRef.current = window.L.map(mapRef.current, {
                scrollWheelZoom: false
            }).setView([50.6032, 3.3875], 16);

            // Add tile layer with clean CartoDB style
            window.L.tileLayer(
                'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
                {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                    maxZoom: 19
                }
            ).addTo(leafletMapRef.current);

            // Custom marker icon for main festival (yellow)
            const mainIcon = window.L.divIcon({
                html: '<div style="background-color: #e8a94e; width: 35px; height: 35px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.3);"><div style="width: 12px; height: 12px; background: white; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg);"></div></div>',
                className: 'custom-marker',
                iconSize: [35, 35],
                iconAnchor: [17.5, 35]
            });

            // Custom marker icon for food village (orange-red)
            const foodIcon = window.L.divIcon({
                html: '<div style="background-color: #ff6b6b; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.3);"><div style="width: 10px; height: 10px; background: white; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg);"></div></div>',
                className: 'custom-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            });

            // Custom marker icon for amateur location (light blue)
            const amateurIcon = window.L.divIcon({
                html: '<div style="background-color: #4ecdc4; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.3);"><div style="width: 10px; height: 10px; background: white; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg);"></div></div>',
                className: 'custom-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            });

            // Add main festival marker
            const mainMarker = window.L.marker(mainFestivalLocation, {
                icon: mainIcon
            }).addTo(leafletMapRef.current);

            mainMarker.bindPopup(`
                <div style="font-family: 'Nunito', sans-serif; padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; color: #002442; font-size: 16px; font-weight: bold;">Main Festival</h3>
                    <p style="margin: 0 0 8px 0; color: #3a7ca5; font-size: 14px;">Primary Event Grounds</p>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=50.602860262325706,3.3809785070446057" target="_blank" style="display: inline-block; background-color: #e8a94e; color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; margin-top: 4px;">Get Directions</a>
                </div>
            `);

            // Add food village marker
            const foodMarker = window.L.marker(foodVillageLocation, {
                icon: foodIcon
            }).addTo(leafletMapRef.current);

            foodMarker.bindPopup(`
                <div style="font-family: 'Nunito', sans-serif; padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; color: #002442; font-size: 16px; font-weight: bold;">Food Village</h3>
                    <p style="margin: 0 0 8px 0; color: #3a7ca5; font-size: 14px;">Dining & Refreshments</p>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=50.602511757616966,3.388043095146282" target="_blank" style="display: inline-block; background-color: #ff6b6b; color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; margin-top: 4px;">Get Directions</a>
                </div>
            `);

            // Add amateur location marker
            const amateurMarker = window.L.marker(amateurLocation, {
                icon: amateurIcon
            }).addTo(leafletMapRef.current);

            amateurMarker.bindPopup(`
                <div style="font-family: 'Nunito', sans-serif; padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; color: #002442; font-size: 16px; font-weight: bold;">Amateur Location</h3>
                    <p style="margin: 0 0 8px 0; color: #3a7ca5; font-size: 14px;">Community Performances</p>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=50.601703501440326,3.4015264883903047" target="_blank" style="display: inline-block; background-color: #4ecdc4; color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; margin-top: 4px;">Get Directions</a>
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
                        Visit Us
                        <span className="h-0.5 w-16 bg-festival-yellow"></span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold leading-tight text-white drop-shadow-md mb-4">
                        Find the Festival
                    </h2>
                    <p className="text-xl text-ice-blue font-medium max-w-2xl mx-auto">
                        Located in the heart of the winter wonderland, easily accessible by public transport
                    </p>
                </div>

                {/* Map Container */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
                    <div 
                        ref={mapRef}
                        className="w-full h-[500px] md:h-[600px]"
                    />
                    
                    {/* Map Overlay Info */}
                    <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-auto z-[1000]">
                        <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl max-w-md">
                            <h3 className="text-2xl font-bold text-deep-navy mb-3">Getting Here</h3>
                            <div className="space-y-2 text-deep-navy/80">
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-festival-yellow mt-0.5">directions_subway</span>
                                    <p className="text-sm">Metro: Festival Station (Line 1)</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-festival-yellow mt-0.5">directions_bus</span>
                                    <p className="text-sm">Bus: Routes 12, 45, 78</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-festival-yellow mt-0.5">local_parking</span>
                                    <p className="text-sm">Parking: 500+ spaces available</p>
                                </div>
                            </div>
                            <button className="mt-4 w-full bg-festival-yellow text-white py-3 px-6 rounded-xl font-bold hover:bg-festival-yellow/90 transition-all text-sm uppercase tracking-wider">
                                Get Directions
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
