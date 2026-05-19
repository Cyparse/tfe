import React from 'react';
import Registration from './Registration';
import Tickets from './Tickets';

const circleStyle = {
  position: "absolute",
  width: "1000px",
  height: "1000px",
  borderRadius: "50%",
  background: "rgba(255,255,255,0.55)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "2px solid rgba(255,255,255,0.7)",
  boxShadow: "0 8px 40px rgba(30,80,140,0.18)",
  overflow: "hidden",
};

const glassCard = {
  background: "rgba(255,255,255,0.55)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "2px solid rgba(255,255,255,0.7)",
  boxShadow: "0 8px 40px rgba(30,80,140,0.18)",
};

function MobileFormsSection() {
  return (
    <section
      style={{
        background: "linear-gradient(180deg, #7ab8e0 0%, #4a8fc2 50%, #3070a8 100%)",
        fontFamily: "'DM Sans', sans-serif",
        position: "relative",
        overflow: "hidden",
        paddingBottom: "40px",
      }}
    >
      {/* Decorative rings — echo the desktop circles */}
      <div style={{ position: "absolute", width: "500px", height: "500px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.18)", top: "-180px", left: "-140px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: "380px", height: "380px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.12)", top: "-80px", left: "-60px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: "500px", height: "500px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.18)", bottom: "-180px", right: "-140px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: "380px", height: "380px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.12)", bottom: "-80px", right: "-60px", pointerEvents: "none" }} />

      {/* Registration */}
      <div
        style={{
          ...glassCard,
          borderRadius: "0px 0px 60vw 0vw",
          padding: "48px 28px 124px",
          marginBottom: "32px",
          position: "relative",
        }}
      >
        <Registration inCircle />
      </div>

      {/* Tickets */}
      <div
        style={{
          ...glassCard,
          borderRadius: "64vw 0vw 0px 0px",
          padding: "45px 36px 39px",
          margin: "0px",
          position: "relative",
          textAlign: "right",
        }}
      >
        <Tickets inCircle />
      </div>
    </section>
  );
}

export default function FormsSection() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600&family=DM+Serif+Display&display=swap"
        rel="stylesheet"
      />
      {/* Mobile */}
      <div className="md:hidden">
        <MobileFormsSection />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <section
          style={{
            position: "relative",
            minHeight: "1480px",
            background: "linear-gradient(180deg, #7ab8e0 0%, #4a8fc2 50%, #3070a8 100%)",
            overflow: "hidden",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 70% 75%, rgba(255,255,255,0.06) 0%, transparent 50%)",
              pointerEvents: "none",
            }}
          />

          {/* Top circle: Registration */}
          <div style={{ ...circleStyle, left: "-150px", top: "-150px" }}>
            <div
              style={{
                position: "absolute",
                left: "180px",
                right: "150px",
                top: "170px",
                bottom: "70px",
                overflowY: "auto",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <Registration inCircle />
            </div>
          </div>

          {/* Bottom circle: Tickets */}
          <div style={{ ...circleStyle, left: "640px", bottom: "-45px" }}>
            <div
              style={{
                position: "absolute",
                left: "150px",
                right: "150px",
                top: "70px",
                bottom: "155px",
                overflowY: "auto",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <Tickets inCircle />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
