import React, { useState, useEffect } from "react";
import { LogoSvg, Twinkle } from "../../assets/images";

const scrollTo = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

const EDITIONS = [
  { label: 'Édition Décembre', date: new Date('2026-12-06T10:00:00') },
  { label: 'Édition Janvier',  date: new Date('2027-01-10T10:00:00') },
  { label: 'Édition Février',  date: new Date('2027-02-07T10:00:00') },
];

function getNextEdition() {
  const now = new Date();
  return EDITIONS.find((e) => e.date > now) ?? EDITIONS[EDITIONS.length - 1];
}

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = targetDate - new Date();
    return diff > 0 ? diff : 0;
  });

  useEffect(() => {
    const id = setInterval(() => {
      const diff = targetDate - new Date();
      setTimeLeft(diff > 0 ? diff : 0);
    }, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

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
  const next = getNextEdition();
  const { days, hours, minutes, seconds, over } = useCountdown(next.date);

  if (over) return null;

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

          <Countdown />

          <div className="flex flex-col md:flex-row justify-center gap-6">
            <button onClick={() => scrollTo('gallery')} className="bg-deep-navy text-white py-4 px-10 rounded-full font-bold shadow-xl hover:bg-deep-navy/90 transition-all uppercase tracking-[0.2em] text-xs">
              Découvrir les Œuvres
            </button>
            <button onClick={() => scrollTo('forms')} className="bg-white/80 backdrop-blur-xl text-deep-navy py-4 px-10 rounded-full font-bold border border-deep-navy/10 shadow-xl hover:bg-white transition-all uppercase tracking-[0.2em] text-xs">
              Obtenir des Billets
            </button>
          </div>
        </div>
       
      </div>
    </section>
  );
}
