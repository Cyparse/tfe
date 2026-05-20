import React, { useState, useEffect } from 'react';

const ICE  = '#cae9ff';
const NAVY = '#002442';
const MID  = '#3a7ca5';
const GOLD = '#e8a94e';
const MAX_VIS = 3;

function lerpColor(hexA, hexB, t) {
  const a = parseInt(hexA.slice(1), 16), b = parseInt(hexB.slice(1), 16);
  const ar = a >> 16, ag = (a >> 8) & 255, ab = a & 255;
  const br = b >> 16, bg = (b >> 8) & 255, bb = b & 255;
  const r  = Math.round(ar + (br - ar) * t);
  const g  = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1)}`;
}

function Carousel({ cards = [] }) {
  const [active, setActive] = useState(Math.floor(cards.length / 2));

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft')  setActive(a => Math.max(0, a - 1));
      if (e.key === 'ArrowRight') setActive(a => Math.min(cards.length - 1, a + 1));
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [cards.length]);

  return (
    <div style={{ width: '100%', padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
      <div style={{ position: 'relative', width: '22rem', height: '22rem', perspective: '500px', transformStyle: 'preserve-3d' }}>
        {cards.map((card, i) => {
          const dist      = Math.abs(active - i);
          if (dist > MAX_VIS) return null;
          const offset    = (active - i) / 3;
          const absOffset = dist / 3;
          const direction = Math.sign(active - i);
          const isActive  = i === active;
          const textOpacity = isActive ? 1 : Math.max(0, 1 - absOffset * 1.4);

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                transition: 'all .3s ease-out',
                transform: `rotateY(${offset * 50}deg) scaleY(${1 + absOffset * -0.4}) translateZ(${absOffset * -30}rem) translateX(${direction * -5}rem)`,
                filter: `blur(${absOffset}rem)`,
                opacity: dist >= MAX_VIS ? 0 : 1,
                pointerEvents: isActive ? 'auto' : 'none',
                zIndex: cards.length - dist,
              }}
            >
              <div style={{
                width: '100%',
                height: '100%',
                padding: '1.75rem',
                borderRadius: '12px',
                transition: 'all .3s ease-out',
                display: 'flex',
                flexDirection: 'column',
                gap: '.75rem',
                boxSizing: 'border-box',
                background: isActive ? ICE : lerpColor(ICE, NAVY, absOffset * 0.8),
                border: isActive ? `2px solid ${GOLD}` : `0.5px solid ${MID}44`,
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 500,
                  textAlign: 'center',
                  color: isActive ? NAVY : lerpColor(NAVY, ICE, absOffset),
                  opacity: textOpacity,
                  ...(isActive && { borderBottom: `1.5px solid ${GOLD}44`, paddingBottom: '.5rem', marginBottom: '.25rem' }),
                }}>
                  {card.title}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: 1.7,
                  color: isActive ? MID : lerpColor(MID, ICE, absOffset * 0.7),
                  opacity: textOpacity,
                }}>
                  {card.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => setActive(a => a - 1)}
          disabled={active <= 0}
          aria-label="Previous card"
          style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', background: NAVY, border: 'none', color: ICE, cursor: active <= 0 ? 'default' : 'pointer', opacity: active <= 0 ? 0.3 : 1, transition: 'opacity .2s' }}
        >
          <i className="ti ti-chevron-left" aria-hidden="true" />
        </button>
        <span style={{ fontSize: '13px', color: MID, minWidth: '4rem', textAlign: 'center', fontWeight: 500 }}>
          {active + 1} / {cards.length}
        </span>
        <button
          onClick={() => setActive(a => a + 1)}
          disabled={active >= cards.length - 1}
          aria-label="Next card"
          style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', background: NAVY, border: 'none', color: ICE, cursor: active >= cards.length - 1 ? 'default' : 'pointer', opacity: active >= cards.length - 1 ? 0.3 : 1, transition: 'opacity .2s' }}
        >
          <i className="ti ti-chevron-right" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default Carousel;