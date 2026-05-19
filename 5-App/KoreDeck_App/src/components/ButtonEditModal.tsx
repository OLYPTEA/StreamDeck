import { useState, useEffect, useCallback } from "react";
import { X, Keyboard } from "lucide-react";
import { ButtonConfig, ActionType } from "@/types";
import { useStore } from "@/store";

const ICON_OPTIONS = [
  "Play","Pause","SkipForward","SkipBack","Volume2","VolumeX",
  "MicOff","Mic","Camera","Video","Monitor","Moon","Sun",
  "Home","FolderOpen","Save","Undo2","Redo2","Plus","Minus",
  "Scissors","FileOutput","BookOpen","Clock","RotateCcw","Target",
  "BellOff","Bell","PanelLeft","PanelRight","LayoutGrid","Layers",
  "Radio","Gamepad2","List","Keyboard","Terminal","Code2",
  "Zap","Star","Heart","Coffee","Music","Headphones",
];

const ACTION_TYPES: { id: ActionType; label: string; desc: string }[] = [
  { id: "shortcut", label: "Raccourci",   desc: "Ex: Ctrl+Z, Win+E"              },
  { id: "app",      label: "Application", desc: "Chemin ou URI (notion://)"       },
  { id: "script",   label: "Script",      desc: "Fichier .ps1, .bat, .sh"         },
  { id: "macro",    label: "Macro texte", desc: "Texte à taper"                   },
  { id: "system",   label: "Système",     desc: "Action interne Kore Deck"        },
];

const COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#8E8EA0"];

interface Props { button: ButtonConfig; onClose: () => void; }

export function ButtonEditModal({ button, onClose }: Props) {
  const updateButton    = useStore((s) => s.updateButton);
  const activeProfileId = useStore((s) => s.activeProfileId);
  const activeCategoryId= useStore((s) => s.activeCategoryId);

  const [label,       setLabel]       = useState(button.label);
  const [icon,        setIcon]        = useState(button.icon);
  const [color,       setColor]       = useState(button.color);
  const [actionType,  setActionType]  = useState<ActionType>(button.action.type);
  const [actionValue, setActionValue] = useState(button.action.value);
  const [longPress,   setLongPress]   = useState(button.action.longPress   ?? "");
  const [doublePress, setDoublePress] = useState(button.action.doublePress ?? "");
  const [recording,   setRecording]   = useState<"simple"|"long"|"double"|null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!recording) return;
    e.preventDefault();
    const parts: string[] = [];
    if (e.ctrlKey)  parts.push("Ctrl");
    if (e.altKey)   parts.push("Alt");
    if (e.shiftKey) parts.push("Shift");
    if (e.metaKey)  parts.push("Win");
    const key = e.key;
    if (!["Control","Alt","Shift","Meta"].includes(key))
      parts.push(key === " " ? "Space" : key);
    const combo = parts.join("+");
    if (!combo) return;
    if (recording === "simple") setActionValue(combo);
    if (recording === "long")   setLongPress(combo);
    if (recording === "double") setDoublePress(combo);
    setRecording(null);
  }, [recording]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleSave = () => {
    updateButton(activeProfileId, activeCategoryId, button.id, {
      label, icon, color,
      action: {
        type: actionType, value: actionValue,
        longPress:   longPress   || undefined,
        doublePress: doublePress || undefined,
      },
    });
    onClose();
  };

  return (
    <div
      role="dialog" aria-modal="true" aria-label={`Édition du bouton ${button.id + 1}`}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.70)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#111113",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 13,
        boxShadow: "0 24px 64px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.07)",
        width: 440, maxHeight: "85vh", overflowY: "auto",
        padding: 22,
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#ECECEF", letterSpacing: "-0.01em" }}>
            Modifier le bouton {button.id + 1}
          </h2>
          <button
            onClick={onClose} aria-label="Fermer"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "#8E8EA0", padding: "4px 5px",
              borderRadius: 6, display: "flex", alignItems: "center",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.10)";
              (e.currentTarget as HTMLElement).style.color = "#ECECEF";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
              (e.currentTarget as HTMLElement).style.color = "#8E8EA0";
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Icon picker */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: "#4E4E60", fontWeight: 600, marginBottom: 8,
            textTransform: "uppercase", letterSpacing: "0.09em" }}>
            Icône
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 5,
            maxHeight: 118, overflowY: "auto",
          }}>
            {ICON_OPTIONS.map((name) => (
              <button key={name} title={name} onClick={() => setIcon(name)} style={{
                width: 34, height: 34,
                border: `1px solid ${icon === name ? `${color}55` : "rgba(255,255,255,0.08)"}`,
                borderRadius: 6,
                background: icon === name ? `${color}14` : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: 12,
                color: icon === name ? color : "#4E4E60",
                transition: "all 0.10s",
              }}>
                {name.slice(0, 2)}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 10, color: "#4E4E60", fontWeight: 600,
            textTransform: "uppercase", letterSpacing: "0.09em" }}>
            Couleur
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)} aria-label={`Couleur ${c}`} style={{
                width: 20, height: 20, borderRadius: "50%", background: c,
                border: color === c ? "2px solid #fff" : "2px solid transparent",
                cursor: "pointer", transition: "transform 0.10s",
                transform: color === c ? "scale(1.2)" : "scale(1)",
              }} />
            ))}
          </div>
        </div>

        {/* Label */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: "#4E4E60", fontWeight: 600, marginBottom: 6,
            textTransform: "uppercase", letterSpacing: "0.09em" }}>
            Nom affiché
          </div>
          <input type="text" value={label} maxLength={16}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex: Lecture/Pause"/>
        </div>

        {/* Action type */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: "#4E4E60", fontWeight: 600, marginBottom: 8,
            textTransform: "uppercase", letterSpacing: "0.09em" }}>
            Type d'action
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {ACTION_TYPES.map(({ id, label: lbl }) => (
              <button key={id} onClick={() => setActionType(id)} style={{
                padding: "5px 10px",
                border: `1px solid ${actionType === id ? "rgba(99,102,241,0.40)" : "rgba(255,255,255,0.09)"}`,
                borderRadius: 6,
                background: actionType === id ? "rgba(99,102,241,0.12)" : "transparent",
                color: actionType === id ? "#818CF8" : "#8E8EA0",
                fontSize: 11, transition: "all 0.10s",
              }}>
                {lbl}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: "#4E4E60", marginTop: 5 }}>
            {ACTION_TYPES.find((a) => a.id === actionType)?.desc}
          </div>
        </div>

        <ShortcutField label="Appui simple" value={actionValue}
          recording={recording === "simple"} onStartRecord={() => setRecording("simple")}
          onChange={setActionValue} actionType={actionType}/>
        <ShortcutField label="Appui long (optionnel)" value={longPress}
          recording={recording === "long"} onStartRecord={() => setRecording("long")}
          onChange={setLongPress} actionType={actionType}/>
        <ShortcutField label="Double-appui (optionnel)" value={doublePress}
          recording={recording === "double"} onStartRecord={() => setRecording("double")}
          onChange={setDoublePress} actionType={actionType}/>

        {/* Footer */}
        <div style={{
          display: "flex", gap: 8, justifyContent: "flex-end",
          marginTop: 20, borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 16,
        }}>
          <button onClick={onClose} style={{
            background: "none",
            border: "1px solid rgba(255,255,255,0.09)",
            padding: "7px 14px", color: "#8E8EA0", fontSize: 12,
          }}>
            Annuler
          </button>
          <button onClick={handleSave} style={{
            background: "#6366F1", border: "none",
            padding: "7px 16px", color: "#fff", fontSize: 12, fontWeight: 500,
          }}>
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}

function ShortcutField({ label, value, recording, onStartRecord, onChange, actionType }: {
  label: string; value: string; recording: boolean;
  onStartRecord: () => void; onChange: (v: string) => void; actionType: ActionType;
}) {
  const isShortcut = actionType === "shortcut";
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10, color: "#4E4E60", fontWeight: 600, marginBottom: 6,
        textTransform: "uppercase", letterSpacing: "0.09em" }}>
        {label}
      </div>
      {isShortcut ? (
        <button onClick={onStartRecord} style={{
          width: "100%", textAlign: "left",
          background: recording ? "rgba(99,102,241,0.10)" : "rgba(0,0,0,0.28)",
          border: `1px solid ${recording ? "rgba(99,102,241,0.45)" : "rgba(255,255,255,0.10)"}`,
          borderRadius: 6, padding: "8px 12px",
          color: value ? "#ECECEF" : "#4E4E60",
          display: "flex", alignItems: "center", gap: 8,
          transition: "all 0.12s",
        }}>
          <Keyboard size={13} color={recording ? "#818CF8" : "#4E4E60"}/>
          {recording ? (
            <span style={{ color: "#818CF8", fontSize: 12 }}>
              Appuyez sur les touches...
            </span>
          ) : value ? (
            <span style={{
              background: "rgba(255,255,255,0.08)", borderRadius: 4,
              padding: "2px 8px", fontFamily: "monospace", fontSize: 12,
              color: "#ECECEF",
            }}>
              {value}
            </span>
          ) : (
            <span style={{ fontSize: 12 }}>Cliquer pour enregistrer</span>
          )}
        </button>
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={
            actionType === "app"    ? "chemin/vers/app.exe ou notion://" :
            actionType === "script" ? "chemin/vers/script.ps1" :
            actionType === "macro"  ? "Texte à taper automatiquement" :
            "ACTION_ID"
          }
        />
      )}
    </div>
  );
}
