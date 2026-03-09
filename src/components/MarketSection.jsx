import React, { useState, useEffect, useRef } from "react";
import { MapBackground } from "../assets/images";

export default function MarketSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);

  useEffect(() => {
    // Initialize Leaflet map when modal opens
    if (isModalOpen && mapRef.current && !leafletMapRef.current && window.L) {
      // Market vendor locations
      const FriesLocation = [50.602745, 3.388051];
      const PretzelLocation = [50.602816, 3.388209];
      const RacletteLocation = [50.602922, 3.388429];
      const ClothesLocation = [50.603021, 3.388631];
      const HotDrinksLocation = [50.602838, 3.388859];
      const SausageLocation = [50.602741, 3.388638];
      const WafflesLocation = [50.602676, 3.388451];
      const CandyLocation = [50.602568, 3.38824];
      const GazeboLocation = [50.602558, 3.387799];

      // Create map
      leafletMapRef.current = window.L.map(mapRef.current, {
        scrollWheelZoom: true,
      }).setView([50.60278, 3.388435], 19);

      // Add tile layer
      window.L.tileLayer(
        "https://api.mapbox.com/styles/v1/cyparse/cmmj8gl6z00cc01qu9pm3a08y/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiY3lwYXJzZSIsImEiOiJjbW1qN2c2czAxNjJ3MnBzOGQzdWs5Njk1In0.yIAmgxiT-MXxxf9WtJhR2g",
        {
          attribution:
            '&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          tileSize: 512,
          zoomOffset: -1,
        },
      ).addTo(leafletMapRef.current);

      // Custom icons

      const friesIcon = window.L.divIcon({
        html: '<div style="background-color: #ffffff; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #7b563b; box-shadow: 0 3px 10px rgba(0,0,0,0.3); font-size: 24px;">🍟</div>',
        className: "custom-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const pretzelIcon = window.L.divIcon({
        html: '<div style="background-color: #ffffff; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #7b563b; box-shadow: 0 3px 10px rgba(0,0,0,0.3); font-size: 24px;">🥨</div>',
        className: "custom-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const racletteIcon = window.L.divIcon({
        html: '<div style="background-color: #ffffff; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #7b563b; box-shadow: 0 3px 10px rgba(0,0,0,0.3); font-size: 24px;">🧀</div>',
        className: "custom-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const clothesIcon = window.L.divIcon({
        html: '<div style="background-color: #ffffff; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #3a7ca5; box-shadow: 0 3px 10px rgba(0,0,0,0.3); font-size: 24px;">🧣</div>',
        className: "custom-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const hotDrinksIcon = window.L.divIcon({
        html: '<div style="background-color: #ffffff; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #e8a94e; box-shadow: 0 3px 10px rgba(0,0,0,0.3); font-size: 24px;">☕</div>',
        className: "custom-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const sausageIcon = window.L.divIcon({
        html: '<div style="background-color: #ffffff; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #7b563b; box-shadow: 0 3px 10px rgba(0,0,0,0.3); font-size: 24px;">🌭</div>',
        className: "custom-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const wafflesIcon = window.L.divIcon({
        html: '<div style="background-color: #ffffff; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #e8a94e; box-shadow: 0 3px 10px rgba(0,0,0,0.3); font-size: 24px;">🧇</div>',
        className: "custom-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      // Custom marker icons
      const candyIcon = window.L.divIcon({
        html: '<div style="background-color: #ffffff; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #e8a94e; box-shadow: 0 3px 10px rgba(0,0,0,0.3); font-size: 24px;">🍬</div>',
        className: "custom-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const gazeboIcon = window.L.divIcon({
        html: '<div style="background-color: #3a7ca5; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #FFFFFF; box-shadow: 0 3px 10px rgba(0,0,0,0.3); overflow: hidden;"><img src="/gazebo.png" style="width: 32px; height: 32px; object-fit: contain;" /></div>',
        className: "custom-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      // Add craft vendor marker
      const friesMarker = window.L.marker(FriesLocation, {
        icon: friesIcon,
      }).addTo(leafletMapRef.current);
      friesMarker.bindPopup(`
                <div style="font-family: 'Nunito', sans-serif; padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; color: #002442; font-size: 16px; font-weight: bold;">Baraque Friture</h3>
                    <p style="margin: 0 0 8px 0; color: #3a7ca5; font-size: 14px;">Frites & Accompagnements</p>
                </div>
            `);

      // Add food stall marker
      const pretzelMarker = window.L.marker(PretzelLocation, {
        icon: pretzelIcon,
      }).addTo(leafletMapRef.current);
      pretzelMarker.bindPopup(`
                <div style="font-family: 'Nunito', sans-serif; padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; color: #002442; font-size: 16px; font-weight: bold;">Doughy Delights</h3>
                    <p style="margin: 0 0 8px 0; color: #3a7ca5; font-size: 14px;">Pretzels, Bretzels & Snacks</p>
                </div>
            `);

      // Add ice rink marker
      const racletteMarker = window.L.marker(RacletteLocation, {
        icon: racletteIcon,
      }).addTo(leafletMapRef.current);
      racletteMarker.bindPopup(`
                <div style="font-family: 'Nunito', sans-serif; padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; color: #002442; font-size: 16px; font-weight: bold;">Raclette</h3>
                    <p style="margin: 0 0 8px 0; color: #3a7ca5; font-size: 14px;">Raclette & Fromages</p>
                </div>
            `);

      // Add hot cocoa marker
      const clothesMarker = window.L.marker(ClothesLocation, {
        icon: clothesIcon,
      }).addTo(leafletMapRef.current);
      clothesMarker.bindPopup(`
                <div style="font-family: 'Nunito', sans-serif; padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; color: #002442; font-size: 16px; font-weight: bold;">Pas froid aux yeux</h3>
                    <p style="margin: 0 0 8px 0; color: #3a7ca5; font-size: 14px;">Gants, Bonnets & Écharpes</p>
                </div>
            `);

      // Add toy shop marker
      const hotDrinksMarker = window.L.marker(HotDrinksLocation, {
        icon: hotDrinksIcon,
      }).addTo(leafletMapRef.current);
      hotDrinksMarker.bindPopup(`
                <div style="font-family: 'Nunito', sans-serif; padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; color: #002442; font-size: 16px; font-weight: bold;">Chaud Cacao</h3>
                    <p style="margin: 0 0 8px 0; color: #3a7ca5; font-size: 14px;">Vin chaud & Boissons chaudes</p>
                </div>
            `);

      // Add live stage marker
      const sausageMarker = window.L.marker(SausageLocation, {
        icon: sausageIcon,
      }).addTo(leafletMapRef.current);
      sausageMarker.bindPopup(`
                <div style="font-family: 'Nunito', sans-serif; padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; color: #002442; font-size: 16px; font-weight: bold;">Paradis de la saucisse</h3>
                    <p style="margin: 0 0 8px 0; color: #3a7ca5; font-size: 14px;">Bradwurst, Currywurst & autres spécialités</p>
                </div>
            `);

      // Add bakery marker
      const wafflesMarker = window.L.marker(WafflesLocation, {
        icon: wafflesIcon,
      }).addTo(leafletMapRef.current);
      wafflesMarker.bindPopup(`
                <div style="font-family: 'Nunito', sans-serif; padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; color: #002442; font-size: 16px; font-weight: bold;">Waffling About</h3>
                    <p style="margin: 0 0 8px 0; color: #3a7ca5; font-size: 14px;">Gauffres & Crêpes</p>
                </div>
            `);

      // Add market entrance marker
      const candyMarker = window.L.marker(CandyLocation, {
        icon: candyIcon,
      }).addTo(leafletMapRef.current);

      candyMarker.bindPopup(`
                <div style="font-family: 'Nunito', sans-serif; padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; color: #002442; font-size: 16px; font-weight: bold;">Chalet Sucré</h3>
                    <p style="margin: 0 0 8px 0; color: #3a7ca5; font-size: 14px;">Bonbons, chouchous et chocolats</p>
                </div>
            `);

      // Add gazebo marker
      const gazeboMarker = window.L.marker(GazeboLocation, {
        icon: gazeboIcon,
      }).addTo(leafletMapRef.current);

      gazeboMarker.bindPopup(`
                <div style="font-family: 'Nunito', sans-serif; padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; color: #002442; font-size: 16px; font-weight: bold;">Gazebo Area</h3>
                    <p style="margin: 0 0 8px 0; color: #3a7ca5; font-size: 14px;">Outdoor Pavilion</p>
                </div>
            `);
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
              Warm your hands with artisan hot cocoa and find one-of-a-kind
              treasures. Our market features over 50 local vendors, glowing
              lanterns, and live music.
            </p>
            <ul className="flex flex-col gap-5 text-white/90">
              {[
                "Artisanal Handcrafted Gifts",
                "Traditional Seasonal Delicacies",
                "Ice Skating Rink & Live Entertainment",
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
              className="absolute top-4 right-4 bg-deep-navy text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-deep-navy/80 transition-colors z-[9999]"
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div ref={mapRef} className="w-full h-[600px] rounded-2xl"></div>
          </div>
        </div>
      )}
    </section>
  );
}
