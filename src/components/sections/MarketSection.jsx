import React, { useState, useEffect, useRef } from "react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapBackground } from "../../assets/images";

export default function MarketSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);

  useEffect(() => {
    // Initialize Leaflet map when modal opens
    if (isModalOpen && mapRef.current && !leafletMapRef.current && L) {
      // Market vendor locations
      const FriesLocation = [50.602745, 3.388051];
      const PretzelLocation = [50.602816, 3.388209];
      const RacletteLocation = [50.602922, 3.388429];
      const ClothesLocation = [50.603021, 3.388631];
      const HotDrinksLocation = [50.602838, 3.388859];
      const SausageLocation = [50.602741, 3.388638];
      const WafflesLocation = [50.602676, 3.388451];
      const CandyLocation = [50.602568, 3.38824];
      const GazeboLocation = [50.602631, 3.387923];

      // Create map
      leafletMapRef.current = L.map(mapRef.current, {
        scrollWheelZoom: true,
      }).setView([50.60278, 3.388435], 19);

      // Add tile layer
      L.tileLayer(
        "https://api.mapbox.com/styles/v1/cyparse/cmmj8gl6z00cc01qu9pm3a08y/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiY3lwYXJzZSIsImEiOiJjbW1qN2c2czAxNjJ3MnBzOGQzdWs5Njk1In0.yIAmgxiT-MXxxf9WtJhR2g",
        {
          attribution:
            '&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          tileSize: 512,
          zoomOffset: -1,
        },
      ).addTo(leafletMapRef.current);

      const makeIcon = (src, border = '#7b563b', bg = '#ffffff', size = 50) =>
        L.divIcon({
          html: `<div style="background-color:${bg};width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid ${border};box-shadow:0 3px 10px rgba(0,0,0,0.3);overflow:hidden;"><img src="${src}" style="width:${size * 0.84}px;height:${size * 0.84}px;object-fit:contain;" /></div>`,
          className: 'custom-marker',
          iconSize: [size, size],
          iconAnchor: [size / 2, size],
        });

      const popup = (name, description) =>
        `<div style="font-family:'Nunito',sans-serif;padding:8px;">
          <h3 style="margin:0 0 8px 0;color:var(--color-deep-navy);font-size:16px;font-weight:bold;">${name}</h3>
          <p style="margin:0;color:var(--color-midblue);font-size:14px;">${description}</p>
        </div>`;

      const vendors = [
        { latlng: FriesLocation,    src: '/fries.png',   border: '#7b563b', name: 'Baraque Friture',        desc: 'Frites & Accompagnements' },
        { latlng: PretzelLocation,  src: '/pretzel.png', border: '#7b563b', name: 'Doughy Delights',        desc: 'Pretzels, Bretzels & Snacks' },
        { latlng: RacletteLocation, src: '/cheese.png',  border: '#7b563b', name: 'Raclette',               desc: 'Raclette & Fromages' },
        { latlng: ClothesLocation,  src: '/gloves.png',  border: 'var(--color-midblue)', name: 'Pas froid aux yeux',     desc: 'Gants, Bonnets & Écharpes' },
        { latlng: HotDrinksLocation,src: '/coffee.png',  border: 'var(--color-festival-yellow)', name: 'Chaud Cacao',            desc: 'Vin chaud & Boissons chaudes' },
        { latlng: SausageLocation,  src: '/sausage.png', border: '#7b563b', name: 'Paradis de la saucisse', desc: 'Bratwurst, Currywurst & spécialités' },
        { latlng: WafflesLocation,  src: '/waffle.png',  border: 'var(--color-festival-yellow)', name: 'Waffling About',         desc: 'Gaufres & Crêpes' },
        { latlng: CandyLocation,    src: '/candy.png',   border: 'var(--color-festival-yellow)', name: 'Chalet Sucré',           desc: 'Bonbons, chouchous et chocolats' },
        { latlng: GazeboLocation,   src: '/gazebo.png',  border: '#ffffff', bg: 'var(--color-midblue)', size: 60, anchor: 'center', name: 'Espace Gazebo', desc: 'Pavillon & animations' },
      ];

      vendors.forEach(({ latlng, src, border, bg, size, anchor, name, desc }) => {
        const icon = makeIcon(src, border, bg, size);
        if (anchor === 'center') {
          icon.options.iconAnchor = [size / 2, size / 2];
        }
        L.marker(latlng, { icon })
          .addTo(leafletMapRef.current)
          .bindPopup(popup(name, desc));
      });
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
              Magie de saison
            </div>
            <h2 className="text-4xl md:text-6xl font-bold leading-tight text-white drop-shadow-md">
              Soirées douillettes au marché d'hiver
            </h2>
            <p className="text-xl text-ice-blue font-medium">
              Réchauffez-vous avec un chocolat chaud artisanal et découvrez
              des trésors uniques. Notre marché réunit plus de 50 exposants
              locaux, des lampions lumineux et de la musique live.
            </p>
            <ul className="flex flex-col gap-5 text-white/90">
              {[
                "Cadeaux artisanaux uniques",
                "Spécialités et délices de saison",
                "Patinoire & animations live",
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
              Explorer le marché
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
              className="absolute top-4 right-4 bg-deep-navy text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-deep-navy/80 transition-colors z-9999"
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div ref={mapRef} className="w-full h-150 rounded-2xl"></div>
          </div>
        </div>
      )}
    </section>
  );
}
