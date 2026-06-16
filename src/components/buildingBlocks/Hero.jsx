import React, { useState, useEffect } from "react";
import { LogoSvg, Twinkle } from "../../assets/images";
import { useEditions } from "../../hooks/useEditions";

const scrollTo = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

function useCountdown(targetDate) {
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const timeLeft = Math.max(0, targetDate - new Date());
  const days    = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);
  return { days, hours, minutes, seconds, over: timeLeft === 0 };
}

function CountdownUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl md:text-4xl font-black text-white tabular-nums w-14 text-center">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] uppercase tracking-[0.2em] text-ice-blue/60 mt-1">{label}</span>
    </div>
  );
}

function Countdown() {
  const { editions, loading } = useEditions();
  const now = new Date();
  const next = editions.find((e) => new Date(e.date_iso) > now) ?? editions[editions.length - 1];

  const { days, hours, minutes, seconds, over } = useCountdown(next ? new Date(next.date_iso) : now);

  if (!loading && (!next || over)) return null;

  if (loading) return (
    <div className="mb-8">
      <div className="h-3 w-36 rounded-full bg-white/10 mb-3 animate-pulse" />
      <div className="inline-flex items-center gap-3 bg-deep-navy/50 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-4 shadow-xl">
        {[0, 1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="text-2xl font-black text-white/10 mb-3">:</span>}
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-9 rounded-lg bg-white/10 animate-pulse" />
              <div className="w-8 h-2 rounded-full bg-white/10 animate-pulse" />
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mb-8">
      <p className="text-xs uppercase tracking-[0.3em] text-midblue/60 mb-3">
        {next.label} commence dans
      </p>

      <div className="inline-flex items-center gap-3 bg-deep-navy/50 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-4 shadow-xl">
        <CountdownUnit value={days} label="Jours" />
        <span className="text-2xl font-black text-white/30 mb-3">:</span>
        <CountdownUnit value={hours} label="Heures" />
        <span className="text-2xl font-black text-white/30 mb-3">:</span>
        <CountdownUnit value={minutes} label="Min" />
        <span className="text-2xl font-black text-white/30 mb-3">:</span>
        <CountdownUnit value={seconds} label="Sec" />
      </div>
    </div>
  );
}

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
        className="absolute top-2 md:top-20 left-10 md:left-20 w-8 h-8 animate-ping opacity-60 pointer-events-none"
        style={{ animationDuration: '2s' }}
      />
      <img 
        src={Twinkle} 
        alt="" 
        className="absolute top-12 md:top-32 right-20 w-6 h-6 animate-ping opacity-70 pointer-events-none"
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
        className="absolute top-1/3 md:top-1/2 right-1/3 w-7 h-7 animate-ping opacity-65 pointer-events-none"
        style={{ animationDuration: '3.5s', animationDelay: '0.3s' }}
      />
      <img 
        src={Twinkle} 
        alt="" 
        className="absolute top-10 md:bottom-1/4 left-1/3 w-9 h-9 animate-ping opacity-55 pointer-events-none"
        style={{ animationDuration: '2.8s', animationDelay: '1.2s' }}
      />
      <img 
        src={Twinkle} 
        alt="" 
        className="absolute top-4 md:bottom-32 right-16 w-8 h-8 animate-ping opacity-60 pointer-events-none"
        style={{ animationDuration: '3.2s', animationDelay: '0.7s' }}
      />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-center px-4 max-w-4xl mx-auto">
          <div className="inline-block mb-6 mt-6">
            <div className="w-full">
              <img src={LogoSvg} alt="Logo" width="448" height="160" className="w-2xl mx-auto" />
            </div>
          </div>

          <div className="min-h-35 flex flex-col items-center justify-center">
            <Countdown />
          </div>

          <div className="flex flex-col md:flex-row justify-center gap-6">
            <button onClick={() => scrollTo('gallery')} className="bg-deep-navy text-white py-4 px-10 rounded-full font-bold shadow-xl hover:bg-deep-navy/90 transition-all uppercase tracking-[0.2em] text-xs">
              Découvrir les Œuvres
            </button>
            <button onClick={() => scrollTo('forms')} className="bg-white/80 backdrop-blur-xl text-deep-navy py-4 px-10 rounded-full font-bold border border-deep-navy/10 shadow-xl hover:bg-white transition-all uppercase tracking-[0.2em] text-xs mb-20 md:mb-0">
              Obtenir des Billets
            </button>
          </div>
        </div>
       
      </div>
    </section>
  );
}
