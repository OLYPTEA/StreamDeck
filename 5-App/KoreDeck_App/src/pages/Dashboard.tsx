import { useStore } from "@/store";
import { CATEGORIES, CategoryId } from "@/types";
import {
  Home, Box, Target, Gamepad2,
  Cpu, Database, Mic, MicOff,
  Music, Clock, SkipBack, Play, Pause, SkipForward, Activity,
} from "lucide-react";

const TILE_ICONS = [Home, Box, Target, Gamepad2];

const card: React.CSSProperties = {
  background: "#141416",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 10,
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
  padding: 16,
};

/* ─── MetricCard ─────────────────────────────────────────────────────────── */
function MetricCard({ label, value, sub, percent, barColor = "#6366F1", Icon }: {
  label: string; value: string; sub?: string;
  percent?: number; barColor?: string; Icon: React.ElementType;
}) {
  return (
    <div style={card}>
      <div style={{
        fontSize: 10, color: "#4E4E60", fontWeight: 600,
        display: "flex", alignItems: "center", gap: 5,
        textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10,
      }}>
        <Icon size={11} aria-hidden="true"/> {label}
      </div>
      <div style={{
        fontSize: 28, fontWeight: 500,
        color: "#ECECEF", letterSpacing: "-0.03em", lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
      }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: "#4E4E60", marginTop: 5 }}>{sub}</div>}
      {percent !== undefined && (
        <div style={{ height: 2, borderRadius: 2, marginTop: 14, background: "rgba(255,255,255,0.07)" }}>
          <div style={{
            height: "100%", borderRadius: 2,
            background: barColor,
            width: `${Math.min(100, percent)}%`,
            transition: "width 0.6s ease",
          }}/>
        </div>
      )}
    </div>
  );
}

/* ─── DwinPreview ────────────────────────────────────────────────────────── */
function DwinPreview() {
  const activeCategoryId  = useStore(s => s.activeCategoryId);
  const setActiveCategory = useStore(s => s.setActiveCategory);
  const getActiveCategory = useStore(s => s.getActiveCategory);
  const catData = getActiveCategory();

  return (
    <div style={{ ...card, marginBottom: 10 }}>
      <div style={{
        fontSize: 10, color: "#4E4E60", fontWeight: 600,
        marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.09em",
        display: "flex", alignItems: "center", gap: 5,
      }}>
        <Activity size={10} aria-hidden="true"/> Prévisualisation DWIN — 960×240
      </div>

      {/* Hardware display mockup */}
      <div style={{
        background: "#060608",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 8,
        padding: 8,
        boxShadow: "inset 0 2px 10px rgba(0,0,0,0.6)",
      }}>
        <div style={{
          borderRadius: 4, height: 78,
          display: "flex", overflow: "hidden",
          background: "#09090C",
        }} role="tablist">
          {CATEGORIES.map(cat => {
            const active = activeCategoryId === cat.id;
            const TileIcon = TILE_ICONS[cat.id];
            return (
              <button key={cat.id} role="tab" aria-selected={active}
                onClick={() => setActiveCategory(cat.id as CategoryId)}
                style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 5,
                  background: active ? "rgba(99,102,241,0.14)" : "transparent",
                  border: "none",
                  borderRight: "1px solid rgba(255,255,255,0.05)",
                  cursor: "pointer", transition: "background 0.12s",
                }}>
                <TileIcon size={14}
                  color={active ? "#818CF8" : "rgba(255,255,255,0.20)"}
                  aria-hidden="true"/>
                <span style={{
                  fontSize: 8, letterSpacing: "0.06em", textTransform: "uppercase",
                  color: active ? "#ECECEF" : "rgba(255,255,255,0.20)",
                }}>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {catData && (
          <div style={{ marginTop: 7, display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
            {catData.buttons.map(btn => (
              <div key={btn.id} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 4, padding: "4px 2px", textAlign: "center",
              }}>
                <div style={{ fontSize: 8, color: btn.color, marginBottom: 1, opacity: 0.75 }}>●</div>
                <div style={{ fontSize: 7, color: "rgba(255,255,255,0.28)", lineHeight: 1.2 }}>{btn.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── SpotifyCard ────────────────────────────────────────────────────────── */
function SpotifyCard() {
  const stats = useStore(s => s.stats);
  const controls = [
    { Icon: SkipBack,                              label: "Précédent"    },
    { Icon: stats.pomoRunning ? Pause : Play,      label: "Lecture/Pause"},
    { Icon: SkipForward,                           label: "Suivant"      },
  ];
  return (
    <div style={{ ...card, display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 9, flexShrink: 0,
        background: "rgba(99,102,241,0.10)",
        border: "1px solid rgba(99,102,241,0.20)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Music size={16} color="#818CF8" aria-hidden="true"/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 500, color: "#ECECEF",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {stats.trackTitle || "Aucune lecture"}
        </div>
        <div style={{ fontSize: 11, color: "#4E4E60", marginTop: 3 }}>
          {stats.trackArtist || "—"}
        </div>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {controls.map(({ Icon, label }) => (
          <button key={label} aria-label={label} style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 6, padding: 6, color: "#8E8EA0",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background   = "rgba(99,102,241,0.15)";
              el.style.color        = "#ECECEF";
              el.style.borderColor  = "rgba(99,102,241,0.30)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background   = "rgba(255,255,255,0.05)";
              el.style.color        = "#8E8EA0";
              el.style.borderColor  = "rgba(255,255,255,0.09)";
            }}
          >
            <Icon size={12} aria-hidden="true"/>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── PomodoroCard ───────────────────────────────────────────────────────── */
function PomodoroCard() {
  const stats = useStore(s => s.stats);
  const pct = Math.round((1 - (stats.pomoMinutes * 60 + stats.pomoSeconds) / (25 * 60)) * 100);
  return (
    <div style={card}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10,
      }}>
        <span style={{
          fontSize: 10, color: "#4E4E60", fontWeight: 600,
          display: "flex", alignItems: "center", gap: 4,
          textTransform: "uppercase", letterSpacing: "0.09em",
        }}>
          <Clock size={11} aria-hidden="true"/> Pomodoro
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{
            fontSize: 10,
            background: "rgba(99,102,241,0.12)", color: "#818CF8",
            border: "1px solid rgba(99,102,241,0.25)",
            padding: "1px 7px", borderRadius: 4,
          }}>
            #{stats.pomoSession}
          </span>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: stats.pomoRunning ? "#22C55E" : "#4E4E60",
            boxShadow: stats.pomoRunning ? "0 0 5px #22C55E80" : "none",
            animation: stats.pomoRunning ? "blink 2s ease-in-out infinite" : "none",
          }}/>
        </div>
      </div>
      <div style={{
        fontSize: 32, fontWeight: 500,
        fontVariantNumeric: "tabular-nums",
        color: "#ECECEF", letterSpacing: "-0.03em", lineHeight: 1,
      }}>
        {String(stats.pomoMinutes).padStart(2,"0")}:{String(stats.pomoSeconds).padStart(2,"0")}
      </div>
      <div style={{ height: 2, borderRadius: 2, marginTop: 14, background: "rgba(255,255,255,0.07)" }}>
        <div style={{
          height: "100%", borderRadius: 2,
          background: "#6366F1",
          width: `${Math.max(0, Math.min(100, pct))}%`,
          transition: "width 1s linear",
        }}/>
      </div>
    </div>
  );
}

/* ─── Dashboard ──────────────────────────────────────────────────────────── */
export function Dashboard() {
  const stats = useStore(s => s.stats);
  return (
    <div style={{ padding: "26px 22px", flex: 1, overflowY: "auto" }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: "#ECECEF", letterSpacing: "-0.02em" }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 12, color: "#4E4E60", marginTop: 3 }}>
          Monitoring en temps réel
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 10 }}>
        <MetricCard label="CPU"   Icon={Cpu}
          value={`${stats.cpu}%`} percent={stats.cpu}
          barColor={stats.cpu > 80 ? "#EF4444" : stats.cpu > 60 ? "#F59E0B" : "#6366F1"}/>
        <MetricCard label="RAM"   Icon={Database}
          value={`${stats.ram.toFixed(1)}%`} percent={stats.ram}
          barColor={stats.ram > 85 ? "#EF4444" : "#8E8EA0"}/>
        <MetricCard label="FPS"   Icon={Gamepad2}
          value={String(stats.fps)} sub={stats.fps > 0 ? "En jeu" : "Inactif"}/>
        <MetricCard label="Micro" Icon={stats.micMuted ? MicOff : Mic}
          value={stats.micMuted ? "Muté" : "Actif"}
          sub={stats.micMuted ? "BTN4 pour activer" : "Signal capturé"}
          barColor={stats.micMuted ? "#EF4444" : "#22C55E"}/>
      </div>

      <DwinPreview/>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <SpotifyCard/>
        <PomodoroCard/>
      </div>
    </div>
  );
}
