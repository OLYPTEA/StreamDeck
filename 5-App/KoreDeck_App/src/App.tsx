// =============================================================================
// App.tsx — Composant racine Kore Deck
// =============================================================================

import "./index.css";
import { useEffect } from "react";
import { useStore }    from "@/store";
import { useSerial }   from "@/hooks/useSerial";
import { Sidebar }     from "@/components/Sidebar";
import { Dashboard }   from "@/pages/Dashboard";
import { Config }      from "@/pages/Config";
import { Profiles }    from "@/pages/Profiles";
import { Settings }    from "@/pages/Settings";

// Simulateur de données — UNIQUEMENT en mode développement (npm run dev).
// En production Tauri, les vraies stats viennent du WebSocket de l'agent Python.
function useDevSimulator() {
  const updateStats = useStore((s) => s.updateStats);
  const setConn     = useStore((s) => s.setConnectionStatus);

  useEffect(() => {
    if (!import.meta.env.DEV) return;   // ← désactivé en build de production

    const connTimer = setTimeout(() => {
      setConn({ status: "connected", port: "COM3", baud: 115200, lastSeen: new Date() });
    }, 1500);

    let cpu = 34, ram = 61, pomoSec = 24 * 60 + 13;

    const interval = setInterval(() => {
      cpu = Math.max(5,  Math.min(95,  cpu + (Math.random() - 0.5) * 4));
      ram = Math.max(30, Math.min(90,  ram + (Math.random() - 0.5) * 1));
      if (pomoSec > 0) pomoSec--;

      updateStats({
        cpu: Math.round(cpu), ram: Math.round(ram), fps: 144,
        micMuted: false, dndActive: false, obsActive: false,
        trackTitle: "Harder Better Faster Stronger",
        trackArtist: "Daft Punk",
        pomoMinutes: Math.floor(pomoSec / 60),
        pomoSeconds: pomoSec % 60,
        pomoSession: 3, pomoRunning: true,
      });
    }, 1000);

    return () => {
      clearTimeout(connTimer);
      clearInterval(interval);
    };
  }, [updateStats, setConn]);
}

export default function App() {
  const selectedPage = useStore((s) => s.selectedPage);
  useSerial();
  useDevSimulator();

  const pages: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
    config:    <Config />,
    profiles:  <Profiles />,
    settings:  <Settings />,
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0C0C0E", overflow: "hidden" }}>
      <Sidebar />
      {pages[selectedPage]}
    </div>
  );
}
