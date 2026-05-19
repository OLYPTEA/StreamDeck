// =============================================================================
// components/DwinPreview.tsx — Prévisualisation temps réel de l'écran DWIN
// Simule visuellement les 4 tuiles de la page d'accueil 960×240
// =============================================================================

import { Home, Box, Target, Gamepad2 } from "lucide-react";
import { useStore } from "@/store";
import { CATEGORIES } from "@/types";

const CAT_ICONS = [Home, Box, Target, Gamepad2];
const CAT_COLORS = ["#534AB7", "#1D9E75", "#BA7517", "#E24B4A"];

export function DwinPreview() {
  const activeCategoryId = useStore((s) => s.activeCategoryId);
  const setCategory      = useStore((s) => s.setActiveCategory);
  const stats            = useStore((s) => s.stats);

  return (
    <div style={{
      background: "#161616",
      border: "0.5px solid #2a2a2a",
      borderRadius: "10px",
      padding: "16px",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "12px",
      }}>
        <div style={{ fontSize: "11px", color: "#666", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "6px", height: "6px", background: "#1D9E75", borderRadius: "50%", display: "inline-block" }} />
          Prévisualisation DWIN — 960×240px
        </div>
        <div style={{ fontSize: "10px", color: "#444" }}>Temps réel</div>
      </div>

      {/* Écran DWIN simulé */}
      <div
        role="group"
        aria-label="Écran DWIN — sélecteur de catégorie"
        style={{
          background: "#0a0a0a",
          borderRadius: "6px",
          border: "0.5px solid #333",
          display: "flex",
          overflow: "hidden",
          height: "120px",
        }}
      >
        {CATEGORIES.map((cat) => {
          const Icon    = CAT_ICONS[cat.id];
          const color   = CAT_COLORS[cat.id];
          const isActive = activeCategoryId === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id as 0|1|2|3)}
              aria-pressed={isActive}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                borderRight: "0.5px solid #222",
                background: isActive ? `${color}18` : "transparent",
                border: "none",
                cursor: "pointer",
                transition: "background 0.15s",
                padding: "8px",
              }}
            >
              <Icon size={24} color={isActive ? color : "#444"} />

              <span style={{ fontSize: "10px", color: isActive ? color : "#555" }}>
                {cat.name}
              </span>

              {/* Info contextuelle par catégorie */}
              {isActive && (
                <div style={{ fontSize: "9px", color: "#555", textAlign: "center", lineHeight: 1.4 }}>
                  {cat.id === 0 && stats.trackTitle !== "Aucune lecture"
                    ? stats.trackTitle.slice(0, 16) + "…"
                    : cat.id === 2
                    ? `${stats.pomoMinutes}:${String(stats.pomoSeconds).padStart(2,"0")}`
                    : cat.id === 3
                    ? `${stats.fps} FPS`
                    : `CPU ${stats.cpu}%`
                  }
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Barre d'info bas */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        marginTop: "8px", fontSize: "10px", color: "#444",
      }}>
        <span>Catégorie active : <strong style={{ color: "#888" }}>{CATEGORIES[activeCategoryId].name}</strong></span>
        <span>Cliquer pour changer</span>
      </div>
    </div>
  );
}
