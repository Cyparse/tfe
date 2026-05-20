import React, { useState, useEffect } from "react";
import Navigation from "./components/Navigation";
import SideMenu from "./components/SideMenu";
import Hero from "./components/Hero";
import ContentSection from "./components/ContentSection";
import MarketSection from "./components/MarketSection";
import MapSection from "./components/MapSection";
import Footer from "./components/Footer";
import ScheduleSection from "./components/ScheduleSection";
import WinnersSection from "./components/WinnersSection";
import FormsSection from "./components/FormsSection";
import AdminLogin from "./admin/AdminLogin";
import AdminPanel from "./admin/AdminPanel";
import UpdatePassword from "./admin/UpdatePassword";
import {
  getCurrentUser,
  isAdmin as checkAdminAccess,
} from "./services/authService";
import { Analytics } from "@vercel/analytics/react";

const getViewFromLocation = () => {
  const searchParams = new URLSearchParams(window.location.search);

  if (searchParams.get("mode") === "update-password") {
    return "update-password";
  }

  if (window.location.hash === "#admin") {
    return "admin";
  }

  return "home";
};

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState("home");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Listen for hash changes (SPA routing)
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentView(getViewFromLocation());
    };

    // Check initial location
    handleLocationChange();

    // Listen for location changes
    window.addEventListener("hashchange", handleLocationChange);
    window.addEventListener("popstate", handleLocationChange);

    return () => {
      window.removeEventListener("hashchange", handleLocationChange);
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser();

      if (user && (await checkAdminAccess())) {
        setAdminUser(user);
        setIsAdmin(true);
      } else {
        setAdminUser(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLoginSuccess = (result) => {
    setAdminUser(result.user);
    setIsAdmin(true);
  };

  const handleLogout = () => {
    setAdminUser(null);
    setIsAdmin(false);
    window.location.hash = "";
  };

  const handleReturnToAdmin = () => {
    window.history.replaceState(
      {},
      document.title,
      `${window.location.pathname}#admin`,
    );
    setCurrentView("admin");
    checkAuth();
  };

  if (currentView === "update-password") {
    return <UpdatePassword onReturnToAdmin={handleReturnToAdmin} />;
  }

  // Admin view
  if (currentView === "admin") {
    if (checkingAuth) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      );
    }

    if (!isAdmin) {
      return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
    }

    return <AdminPanel user={adminUser} onLogout={handleLogout} />;
  }

  // Main public website
  return (
    <div className="bg-linear-to-b from-ice-blue via-midblue to-deep-navy min-h-screen relative overflow-x-hidden">
      <Navigation onMenuClick={() => setMenuOpen(true)} />
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="relative z-10 pt-20">
        <Hero />
        {/* <ContentSection /> */}
        <ScheduleSection />
        <FormsSection />
        <MarketSection />
        <MapSection />
        <WinnersSection />
      </main>

      <Footer />

      <Analytics />
    </div>
  );
}

export default App;
