// =============================================================================
// components/Layout.tsx — Layout principal de l'application
// Sidebar de navigation + zone de contenu principale
// =============================================================================

import React from "react";
import {
  LayoutDashboard, Keyboard, Layers, Settings, Loader2,
} from "lucide-react";
import { useStore } from "@/store";
import type { ConnectionStatus } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Indicateur de connexion ESP32
// ─────────────────────────────────────────────────────────────────────────────
function ConnectionIndicator({ status }: { status: ConnectionStatus }) {
  const colors: Record<ConnectionStatus, string> = {
    connected:    "#1D9E75",
    disconnected: "#E24B4A",
    reconnecting: "#BA7517",
  };
  const labels: Record<ConnectionStatus, string> = {
    connected:    "ESP32 connecté",
    disconnected: "ESP32 déconnecté",
    reconnecting: "Reconnexion...",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {status === "reconnecting" ? (
        <Loader2
          size={10}
          color={colors[status]}
          style={{ animation: "spin 1s linear infinite" }}
          aria-hidden="true"
        />
      ) : (
        <div
          style={{
            width: 7, height: 7, borderRadius: "50%",
            background: colors[status],
          }}
          aria-hidden="true"
        />
      )}
      <span style={{ fontSize: 11, color: "#666" }}>{labels[status]}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Items de navigation
// ─────────────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard" as const, label: "Dashboard",  Icon: LayoutDashboard },
  { id: "config"    as const, label: "Boutons",     Icon: Keyboard },
  { id: "profiles"  as const, label: "Profils",     Icon: Layers },
  { id: "settings"  as const, label: "Paramètres",  Icon: Settings },
];

// ─────────────────────────────────────────────────────────────────────────────
// Layout
// ─────────────────────────────────────────────────────────────────────────────
interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const selectedPage = useStore((s) => s.selectedPage);
  const setPage      = useStore((s) => s.setPage);
  const connection   = useStore((s) => s.connection);
  const settings     = useStore((s) => s.settings);

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg-primary)" }}>

      {/* ── Sidebar ── */}
      <aside
        style={{
          width: 200, minWidth: 200,
          background: "var(--bg-secondary)",
          borderRight: "0.5px solid var(--border)",
          display: "flex", flexDirection: "column",
        }}
        aria-label="Navigation principale"
      >
        {/* Logo */}
        <div style={{
          padding: "16px 16px 20px",
          borderBottom: "0.5px solid var(--border)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{ width: 32, height: 32, flexShrink: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="32" height="32">
              <rect width="512" height="512" fill="#ffffff" rx="115" />
              <defs>
                <linearGradient id="koreGradL" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1E1B4B" />
                  <stop offset="50%" stopColor="#4338CA" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
              <path d="M 140 160 L 140 352" stroke="url(#koreGradL)" strokeWidth="44" strokeLinecap="round" />
              <path d="M 250 160 L 140 256 L 250 352" stroke="url(#koreGradL)" strokeWidth="44" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="360" cy="256" r="64" stroke="url(#koreGradL)" strokeWidth="44" fill="none" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>
              Kore Deck
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>v2.0</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: "12px 0", flex: 1 }} aria-label="Menu">
          <div style={{
            fontSize: 10, color: "#444", padding: "0 16px 8px",
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            Navigation
          </div>

          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const isActive = selectedPage === id;
            return (
              <button
                key={id}
                onClick={() => setPage(id)}
                aria-current={isActive ? "page" : undefined}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 16px", fontSize: 13, textAlign: "left",
                  background: isActive ? "var(--bg-tertiary)" : "none",
                  border: "none",
                  borderLeft: `2px solid ${isActive ? "var(--accent)" : "transparent"}`,
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                    (e.currentTarget as HTMLElement).style.background = "var(--bg-tertiary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                    (e.currentTarget as HTMLElement).style.background = "none";
                  }
                }}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Statut connexion */}
        <div style={{
          padding: "12px 16px",
          borderTop: "0.5px solid var(--border)",
        }}>
          <ConnectionIndicator status={connection.status} />
          <div style={{ fontSize: 10, color: "#444", marginTop: 4 }}>
            {settings.serialPort} · {settings.baudRate} baud
          </div>
        </div>
      </aside>

      {/* ── Contenu principal ── */}
      <main
        style={{ flex: 1, overflowY: "auto", background: "var(--bg-primary)" }}
        tabIndex={-1}
      >
        {children}
      </main>

    </div>
  );
}
