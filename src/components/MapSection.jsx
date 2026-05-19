import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapSection() {
    const mapRef = useRef(null);
    const leafletMapRef = useRef(null);
    const [showInfo, setShowInfo] = useState(true);

    useEffect(() => {
        // Initialize Leaflet map
        if (mapRef.current && !leafletMapRef.current && L) {
            // Festival locations
            const mainFestivalLocation = [50.602860262325706, 3.3809785070446057];
            const foodVillageLocation = [50.602511757616966, 3.388043095146282];
            const amateurLocation = [50.599967067972884, 3.3919939590763226];
            const gazeboLocation = [50.60274997307288, 3.387951859916449];

            // Set zoom level based on screen width
            const isMobile = screen.width < 768;
            const zoomLevel = isMobile ? 15 : 16;

            // Create map centered between all locations
            leafletMapRef.current = L.map(mapRef.current, {
                scrollWheelZoom: false
            }).setView([50.6022, 3.3870], zoomLevel);

            // Add tile layer with Mapbox style (matching MarketSection)
            L.tileLayer(
                'https://api.mapbox.com/styles/v1/cyparse/cmmj8gl6z00cc01qu9pm3a08y/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiY3lwYXJzZSIsImEiOiJjbW1qN2c2czAxNjJ3MnBzOGQzdWs5Njk1In0.yIAmgxiT-MXxxf9WtJhR2g',
                {
                    attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19,
                    tileSize: 512,
                    zoomOffset: -1
                }
            ).addTo(leafletMapRef.current);

            // Custom marker icon for main festival (yellow)
            const mainIcon = L.divIcon({
                html: '<div style="background-color: var(--color-festival-yellow); width: 35px; height: 35px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.3);"><div style="width: 12px; height: 12px; background: white; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg);"></div></div>',
                className: 'custom-marker',
                iconSize: [35, 35],
                iconAnchor: [17.5, 35]
            });

            // Custom marker icon for food village (orange-red)
            const foodIcon = L.divIcon({
                html: '<div style="background-color: #ff6b6b; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.3);"><div style="width: 10px; height: 10px; background: white; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg);"></div></div>',
                className: 'custom-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            });

            // Custom marker icon for amateur location (light blue)
            const amateurIcon = L.divIcon({
                html: '<div style="background-color: #4ecdc4; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.3);"><div style="width: 10px; height: 10px; background: white; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg);"></div></div>',
                className: 'custom-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            });

            // Custom marker icon for gazebo (with image inside)
            const gazeboIcon = L.divIcon({
                html: '<div style="background-color: white; width: 35px; height: 35px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid #8b4789; box-shadow: 0 3px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; overflow: hidden;"><img src="/gazebo.png" style="width: 20px; height: 20px; object-fit: contain; transform: rotate(45deg);" /></div>',
                className: 'custom-marker',
                iconSize: [35, 35],
                iconAnchor: [17.5, 35]
            });

            // Add main festival marker
            const mainMarker = L.marker(mainFestivalLocation, {
                icon: mainIcon
            }).addTo(leafletMapRef.current);

            mainMarker.bindPopup(`
                <div style="font-family: 'Nunito', sans-serif; padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; color: var(--color-deep-navy); font-size: 16px; font-weight: bold;">Main Festival</h3>
                    <p style="margin: 0 0 8px 0; color: var(--color-midblue); font-size: 14px;">Primary Event Grounds</p>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=50.602860262325706,3.3809785070446057" target="_blank" style="display: inline-block; background-color: var(--color-festival-yellow); color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; margin-top: 4px;">Get Directions</a>
                </div>
            `);

            // Add food village marker
            const foodMarker = L.marker(foodVillageLocation, {
                icon: foodIcon
            }).addTo(leafletMapRef.current);

            foodMarker.bindPopup(`
                <div style="font-family: 'Nunito', sans-serif; padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; color: var(--color-deep-navy); font-size: 16px; font-weight: bold;">Food Village</h3>
                    <p style="margin: 0 0 8px 0; color: var(--color-midblue); font-size: 14px;">Dining & Refreshments</p>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=50.602511757616966,3.388043095146282" target="_blank" style="display: inline-block; background-color: #ff6b6b; color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; margin-top: 4px;">Get Directions</a>
                </div>
            `);

            // Add amateur location marker
            const amateurMarker = L.marker(amateurLocation, {
                icon: amateurIcon
            }).addTo(leafletMapRef.current);

            amateurMarker.bindPopup(`
                <div style="font-family: 'Nunito', sans-serif; padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; color: var(--color-deep-navy); font-size: 16px; font-weight: bold;">Amateur Location</h3>
                    <p style="margin: 0 0 8px 0; color: var(--color-midblue); font-size: 14px;">Community Performances</p>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=50.601703501440326,3.4015264883903047" target="_blank" style="display: inline-block; background-color: #4ecdc4; color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; margin-top: 4px;">Get Directions</a>
                </div>
            `);

            // Add gazebo marker
            const gazeboMarker = L.marker(gazeboLocation, {
                icon: gazeboIcon
            }).addTo(leafletMapRef.current);

            gazeboMarker.bindPopup(`
                <div style="font-family: 'Nunito', sans-serif; padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; color: var(--color-deep-navy); font-size: 16px; font-weight: bold;">Gazebo Area</h3>
                    <p style="margin: 0 0 8px 0; color: var(--color-midblue); font-size: 14px;">Outdoor Pavilion</p>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=50.60274997307288,3.387951859916449" target="_blank" style="display: inline-block; background-color: #8b4789; color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; margin-top: 4px;">Get Directions</a>
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
                    <h2 className="text-4xl md:text-6xl font-bold leading-tight text-white drop-shadow-md mb-4">
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
                    <div className={`absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-auto z-1000 transition-transform duration-300 ${showInfo ? 'translate-y-0' : 'translate-y-[calc(100%+24px)]'}`}>
                        <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl max-w-md">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-2xl font-bold text-deep-navy">Comment venir</h3>
                                <button 
                                    onClick={() => setShowInfo(!showInfo)}
                                    className="md:hidden text-deep-navy hover:text-festival-yellow transition-colors"
                                    aria-label="Toggle info"
                                >
                                    <span className="material-symbols-outlined">
                                        {showInfo ? 'expand_more' : 'expand_less'}
                                    </span>
                                </button>
                            </div>
                            <div className="space-y-2 text-deep-navy/80">
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-festival-yellow mt-0.5">directions_car</span>
                                    <p className="text-sm">En voiture : suivre les panneaux vers le centre-ville, stationnement gratuit à proximité</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-festival-yellow mt-0.5">directions_walk</span>
                                    <p className="text-sm">10 minutes à pied depuis la gare principale</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-festival-yellow mt-0.5">pin_drop</span>
                                    <p className="text-sm">GPS: 50.6029° N, 3.3810° E</p>
                                </div>
                            </div>
                            <a
                                href="https://www.google.com/maps/dir/?api=1&destination=50.602860262325706,3.3809785070446057"
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
        </section>
    );
}