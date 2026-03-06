import React from "react";
import { LogoSvg, Twinkle } from "../assets/images";

export default function Hero() {
  return (
    <section
      id="festival"
      className="relative min-h-[600px] h-[65vh] flex items-center justify-center overflow-hidden"
    >
      {/* Twinkle overlays with pulse animation */}
      <img 
        src={Twinkle} 
        alt="" 
        className="absolute top-20 left-10 w-8 h-8 animate-ping opacity-60 pointer-events-none"
        style={{ animationDuration: '2s' }}
      />
      <img 
        src={Twinkle} 
        alt="" 
        className="absolute top-32 right-20 w-6 h-6 animate-ping opacity-70 pointer-events-none"
        style={{ animationDuration: '3s', animationDelay: '0.5s' }}
      />
      <img 
        src={Twinkle} 
        alt="" 
        className="absolute top-1/4 left-1/4 w-10 h-10 animate-ping opacity-50 pointer-events-none"
        style={{ animationDuration: '2.5s', animationDelay: '1s' }}
      />
      <img 
        src={Twinkle} 
        alt="" 
        className="absolute top-1/3 right-1/3 w-7 h-7 animate-ping opacity-65 pointer-events-none"
        style={{ animationDuration: '3.5s', animationDelay: '0.3s' }}
      />
      <img 
        src={Twinkle} 
        alt="" 
        className="absolute bottom-1/4 left-1/3 w-9 h-9 animate-ping opacity-55 pointer-events-none"
        style={{ animationDuration: '2.8s', animationDelay: '1.2s' }}
      />
      <img 
        src={Twinkle} 
        alt="" 
        className="absolute bottom-32 right-16 w-8 h-8 animate-ping opacity-60 pointer-events-none"
        style={{ animationDuration: '3.2s', animationDelay: '0.7s' }}
      />
      
      <div className="absolute inset-0">
        <div className="text-center px-4 max-w-4xl mx-auto">
          <div className="inline-block mb-6 mt-6">
            <div className="w-full">
              <img src={LogoSvg} alt="Logo" className="w-2xl mx-auto" />
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-6">
            <button className="bg-deep-navy text-white py-4 px-10 rounded-full font-bold shadow-xl hover:bg-deep-navy/90 transition-all uppercase tracking-[0.2em] text-xs">
              Explore Works
            </button>
            <button className="bg-white/80 backdrop-blur-xl text-deep-navy py-4 px-10 rounded-full font-bold border border-deep-navy/10 shadow-xl hover:bg-white transition-all uppercase tracking-[0.2em] text-xs">
              Get Tickets
            </button>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4">
          <div className="w-2 h-2 rounded-full bg-deep-navy/20"></div>
          <div className="w-2 h-2 rounded-full bg-deep-navy/60"></div>
          <div className="w-2 h-2 rounded-full bg-deep-navy/20"></div>
        </div>
      </div>
    </section>
  );
}
