import { useState } from "react";
import { Home, Box, Target, Gamepad2 } from "lucide-react";
import { useStore } from "@/store";
import { ButtonConfig, CategoryId, CATEGORIES, PotActionKey } from "@/types";
import { ButtonEditModal } from "@/components/ButtonEditModal";

const CAT_ICONS = [Home, Box, Target, Gamepad2];

const POT_ACTIONS: { id: PotActionKey; label: string }[] = [
  { id: "VOL_MASTER",    label: "Volume Master"  },
  { id: "VOL_MUSIC",     label: "Volume Musique" },
  { id: "VOL_GAME",      label: "Volume Jeu"     },
  { id: "VOL_DISCORD",   label: "Volume Discord" },
  { id: "BRIGHTNESS",    label: "Luminosité"     },
  { id: "MIC_GAIN",      label: "Gain micro"     },
  { id: "ZOOM",          label: "Zoom"           },
  { id: "OPACITY",       label: "Opacité"        },
  { id: "ROTATION",      label: "Rotation"       },
  { id: "WHITE_NOISE",   label: "Bruit blanc"    },
  { id: "POMO_DURATION", label: "Durée Pomodoro" },
];

const card: React.CSSProperties = {
  background: "#141416",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 10,
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
  padding: 13,
};

export function Config() {
  const activeCategoryId = useStore(s => s.activeCategoryId);
  const setCategory      = useStore(s => s.setActiveCategory);
  const activeProfileId  = useStore(s => s.activeProfileId);
  const updatePot        = useStore(s => s.updatePot);

  const categoryData = useStore(s => {
    const profile = s.profiles.find(p => p.id === s.activeProfileId);
    return profile?.categories.find(c => c.categoryId === s.activeCategoryId);
  });

  const [editingButton, setEditingButton] = useState<ButtonConfig | null>(null);
  if (!categoryData) return null;

  return (
    <main style={{ padding: "26px 22px", flex: 1, overflowY: "auto" }}>

      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: "#ECECEF", letterSpacing: "-0.02em" }}>
          Configuration
        </h1>
        <p style={{ fontSize: 12, color: "#4E4E60", marginTop: 3 }}>
          Cliquez sur un bouton pour modifier son action
        </p>
      </div>

      {/* Category tabs */}
      <div style={{
        display: "flex", gap: 2, marginBottom: 18,
        background: "rgba(0,0,0,0.22)",
        border: "1px solid rgba(255,255,255,0.07)",
        padding: 3, borderRadius: 9, width: "fit-content",
      }}>
        {CATEGORIES.map(cat => {
          const Icon   = CAT_ICONS[cat.id];
          const active = activeCategoryId === cat.id;
          return (
            <button key={cat.id}
              onClick={() => setCategory(cat.id as CategoryId)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 13px", borderRadius: 6, fontSize: 12,
                color: active ? "#ECECEF" : "#4E4E60",
                background: active ? "#1A1A1D" : "transparent",
                border: active ? "1px solid rgba(255,255,255,0.10)" : "1px solid transparent",
                boxShadow: active ? "inset 0 1px 0 rgba(255,255,255,0.07)" : "none",
                transition: "all 0.12s",
              }}>
              <Icon size={12}/> {cat.name}
            </button>
          );
        })}
      </div>

      {/* Button grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8, marginBottom: 24 }}>
        {categoryData.buttons.map(btn => (
          <ButtonCard key={btn.id} button={btn} onClick={() => setEditingButton(btn)}/>
        ))}
      </div>

      {/* Pots */}
      <div>
        <div style={{
          fontSize: 10, color: "#4E4E60", fontWeight: 600,
          marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.1em",
        }}>
          Potentiomètres
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {categoryData.pots.map(pot => (
            <div key={pot.id} style={card}>
              <div style={{
                fontSize: 9, fontWeight: 600, marginBottom: 8,
                display: "flex", alignItems: "center", gap: 5,
              }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 4,
                  background: "rgba(99,102,241,0.12)",
                  border: "1px solid rgba(99,102,241,0.25)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, color: "#818CF8", fontWeight: 700,
                }}>
                  P{pot.id + 1}
                </span>
              </div>
              <input
                type="text" defaultValue={pot.label} maxLength={16}
                onBlur={e => updatePot(activeProfileId, activeCategoryId, pot.id, { label: e.target.value })}
                style={{ marginBottom: 6 }}
              />
              <select
                value={pot.action}
                onChange={e => updatePot(activeProfileId, activeCategoryId, pot.id, {
                  action: e.target.value as PotActionKey,
                })}
                style={{ marginBottom: 8 }}
              >
                {POT_ACTIONS.map(({ id, label }) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
              <div style={{ display: "flex", gap: 5 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, color: "#4E4E60", marginBottom: 3 }}>Min</div>
                  <input type="number" defaultValue={pot.min} min={0} max={99}
                    onBlur={e => updatePot(activeProfileId, activeCategoryId, pot.id, { min: Number(e.target.value) })}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, color: "#4E4E60", marginBottom: 3 }}>Max</div>
                  <input type="number" defaultValue={pot.max} min={1} max={100}
                    onBlur={e => updatePot(activeProfileId, activeCategoryId, pot.id, { max: Number(e.target.value) })}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingButton && (
        <ButtonEditModal button={editingButton} onClose={() => setEditingButton(null)}/>
      )}
    </main>
  );
}

function ButtonCard({ button, onClick }: { button: ButtonConfig; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`Bouton ${button.id + 1}: ${button.label}`}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 5, padding: "11px 6px",
        background: hovered ? "#1A1A1D" : "#141416",
        border: hovered
          ? "1px solid rgba(255,255,255,0.13)"
          : "1px solid rgba(255,255,255,0.07)",
        borderRadius: 9,
        boxShadow: hovered
          ? "inset 0 1px 0 rgba(255,255,255,0.09)"
          : "inset 0 1px 0 rgba(255,255,255,0.04)",
        cursor: "pointer", position: "relative",
        transition: "all 0.12s",
      }}
    >
      <span style={{ position: "absolute", top: 5, left: 7, fontSize: 8.5, color: "#4E4E60" }}>
        {button.id + 1}
      </span>
      <div style={{
        width: 30, height: 30, borderRadius: 6,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: `${button.color}12`,
        border: `1px solid ${button.color}${hovered ? "40" : "22"}`,
        fontSize: 12, color: button.color,
        transition: "all 0.12s",
      }}>
        {button.icon.slice(0, 2)}
      </div>
      <span style={{
        fontSize: 9, color: hovered ? "#8E8EA0" : "#4E4E60",
        textAlign: "center", lineHeight: 1.3,
      }}>
        {button.label}
      </span>
    </button>
  );
}
