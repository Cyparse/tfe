import React, { useState, lazy, Suspense } from "react";
import { signOut } from "../services/authService";
import { snowflake } from "../assets/images";

const Dashboard           = lazy(() => import("./Dashboard"));
const RegistrationManager = lazy(() => import("./RegistrationManager"));
const TicketManager       = lazy(() => import("./TicketManager"));
const ContentManager      = lazy(() => import("./ContentManager"));
const CarouselManager     = lazy(() => import("./CarouselManager"));
const WinnersManager      = lazy(() => import("./WinnersManager"));
const EditionsManager     = lazy(() => import("./EditionsManager"));
const TicketScanner       = lazy(() => import("./TicketScanner"));

export default function AdminPanel({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleLogout = async () => {
    try {
      await signOut();
      onLogout();
    } catch (e) {
      console.error(e);
    }
  };

  // Scanner-only role: minimal header + just the scanner
  if (user?.role === "scanner") {
    return (
      <div
        className="min-h-screen"
        style={{
          background:
            "linear-gradient(180deg, var(--color-midblue) 0%, var(--color-deep-navy) 100%)",
          color: "#ffffff",
        }}
      >
        <header
          className="sticky top-0 z-50 border-b"
          style={{
            background: "var(--color-deep-navy)",
            borderColor: "var(--color-midblue)",
          }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--color-festival-yellow)" }}
              >
                <img src={snowflake} alt="Snow Wonder" className="w-6 h-6" />
              </div>
              <span
                className="font-semibold tracking-tight hidden sm:block"
                style={{ color: "#ffffff", fontFamily: "var(--font-family-rubik)", fontSize: "1.1rem" }}
              >
                Snow Wonder
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "#ffffff", fontFamily: "var(--font-family-body)" }}
                >
                  {user?.full_name || "Utilisateur"}
                </span>
                <span
                  className="text-[10px] uppercase tracking-widest"
                  style={{ color: "var(--color-festival-yellow)", fontFamily: "var(--font-family-body)" }}
                >
                  Contrôleur
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: "#ffb4ab", fontFamily: "var(--font-family-body)", letterSpacing: "0.05em" }}
              >
                Déconnexion
              </button>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
          <Suspense fallback={<div className="p-8 text-center opacity-50">Chargement…</div>}>
            <TicketScanner />
          </Suspense>
        </main>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Tableau de bord", icon: "dashboard" },
    { id: "registrations", label: "Inscriptions", icon: "edit_note" },
    { id: "tickets", label: "Billetterie", icon: "confirmation_number" },
    { id: "scanner", label: "Scanner", icon: "qr_code_scanner" },
    { id: "editions", label: "Éditions", icon: "event" },
    { id: "carousel", label: "Galerie", icon: "photo_library" },
    { id: "winners", label: "Gagnants", icon: "emoji_events" },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(180deg, var(--color-midblue) 0%, var(--color-deep-navy) 100%)",
        color: "#ffffff",
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: "var(--color-deep-navy)",
          borderColor: "var(--color-midblue)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--color-festival-yellow)" }}
              >
                <img src={snowflake} alt="Snow Wonder" className="w-6 h-6" />
              </div>
              <span
                className="font-semibold tracking-tight hidden sm:block"
                style={{
                  color: "#ffffff",
                  fontFamily: "var(--font-family-rubik)",
                  fontSize: "1.1rem",
                }}
              >
                Snow Wonder
              </span>
            </div>
            {/* Search */}
            {/* <div className="hidden md:flex items-center gap-2 rounded-full px-4 py-1.5 border"
                            style={{ background: '#004075', borderColor: 'var(--color-midblue)', minWidth: '220px' }}>
                            <span className="material-symbols-outlined text-sm" style={{ color: 'var(--color-festival-yellow)' }}>search</span>
                            <input
                                className="bg-transparent border-none outline-none text-sm w-full"
                                style={{ color: '#ffffff', fontFamily: 'var(--font-family-body)' }}
                                placeholder="Rechercher…"
                            />
                        </div> */}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* <button className="material-symbols-outlined transition-colors"
                            style={{ color: 'var(--color-festival-yellow)', fontSize: '1.25rem' }}>notifications</button> */}
            <div className="hidden sm:flex flex-col items-end">
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{
                  color: "#ffffff",
                  fontFamily: "var(--font-family-body)",
                }}
              >
                {user?.full_name || "Utilisateur"}
              </span>
              <span
                className="text-[10px] uppercase tracking-widest"
                style={{
                  color: "var(--color-festival-yellow)",
                  fontFamily: "var(--font-family-body)",
                }}
              >
                Admin
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-bold uppercase tracking-wider transition-colors"
              style={{
                color: "#ffb4ab",
                fontFamily: "var(--font-family-body)",
                letterSpacing: "0.05em",
              }}
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className="border-t"
          style={{
            borderColor: "rgba(51,53,53,0.4)",
            background: "var(--color-deep-navy)",
          }}
        >
          <nav className="max-w-7xl mx-auto px-6 lg:px-10 flex gap-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 py-4 border-b-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors"
                style={{
                  borderBottomColor:
                    activeTab === tab.id
                      ? "var(--color-festival-yellow)"
                      : "transparent",
                  color:
                    activeTab === tab.id
                      ? "var(--color-festival-yellow)"
                      : "var(--color-festival-yellow)",
                  fontFamily: "var(--font-family-body)",
                  letterSpacing: "0.05em",
                }}
              >
                <span className="material-symbols-outlined text-base">
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        <Suspense fallback={<div className="p-8 text-center opacity-50">Chargement…</div>}>
          {activeTab === "dashboard" && <Dashboard onNavigate={setActiveTab} />}
          {activeTab === "registrations" && <RegistrationManager />}
          {activeTab === "tickets" && <TicketManager />}
          {activeTab === "scanner" && <TicketScanner />}
          {/* {activeTab === 'content'       && <ContentManager />} */}
          {activeTab === "editions" && <EditionsManager />}
          {activeTab === "carousel" && <CarouselManager />}
          {activeTab === "winners" && <WinnersManager />}
        </Suspense>
      </main>
    </div>
  );
}
