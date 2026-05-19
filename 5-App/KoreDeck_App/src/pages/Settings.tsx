import { useState, useEffect } from "react";
import { listSerialPorts, setAutostart, type SerialPort } from "@/lib/tauri-commands";
import { RefreshCw, Upload, Trash2, Check } from "lucide-react";
import { useStore } from "@/store";

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      style={{
        width: 36, height: 20,
        background: value ? "#6366F1" : "rgba(255,255,255,0.07)",
        borderRadius: 10,
        border: `1px solid ${value ? "#4F46E5" : "rgba(255,255,255,0.12)"}`,
        position: "relative", cursor: "pointer",
        transition: "background 0.2s, border-color 0.2s", flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute", top: 3,
        left: value ? 17 : 3,
        width: 12, height: 12,
        background: value ? "#fff" : "rgba(255,255,255,0.35)",
        borderRadius: "50%",
        transition: "left 0.18s, background 0.2s",
      }} />
    </button>
  );
}

function SettingsRow({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
    }}>
      <div>
        <div style={{ fontSize: 13, color: "#ECECEF" }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "#4E4E60", marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ marginLeft: 16 }}>{children}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#141416",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 10,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
      padding: 16, marginBottom: 12,
    }}>
      <div style={{
        fontSize: 10, color: "#4E4E60", fontWeight: 600,
        marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.10em",
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export function Settings() {
  const settings       = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const [saved, setSaved] = useState(false);
  const [ports, setPorts] = useState<SerialPort[]>([]);

  useEffect(() => { listSerialPorts().then(setPorts); }, []);

  const handleAutostart = async (v: boolean) => {
    updateSettings({ startWithWindows: v });
    await setAutostart(v);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm("Réinitialiser tous les paramètres ?")) {
      updateSettings({
        serialPort: "COM3", baudRate: 115200,
        sendInterval: 100, autoReconnect: true,
        startWithWindows: false, minimizeToTray: true,
      });
    }
  };

  const handleExportConfig = () => {
    const store = useStore.getState();
    const blob  = new Blob(
      [JSON.stringify({ profiles: store.profiles, settings: store.settings }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a   = document.createElement("a");
    a.href = url; a.download = "koredeck_backup.json"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main style={{ padding: "26px 22px", flex: 1, overflowY: "auto" }}>
      <div style={{ marginBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#ECECEF", letterSpacing: "-0.02em" }}>
            Paramètres
          </h1>
          <p style={{ fontSize: 12, color: "#4E4E60", marginTop: 3 }}>
            Configuration de l'application
          </p>
        </div>
        <button
          onClick={handleSave}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: saved ? "rgba(34,197,94,0.12)" : "#6366F1",
            border: saved ? "1px solid rgba(34,197,94,0.35)" : "none",
            borderRadius: 7, padding: "7px 14px",
            color: saved ? "#22C55E" : "#fff",
            fontSize: 12, fontWeight: 500, transition: "all 0.25s",
          }}
        >
          <Check size={13} />
          {saved ? "Sauvegardé !" : "Sauvegarder"}
        </button>
      </div>

      <Section title="Connexion ESP32">
        <SettingsRow label="Port COM" sub="Détection automatique au démarrage">
          <select
            value={settings.serialPort}
            onChange={(e) => updateSettings({ serialPort: e.target.value })}
            style={{ width: 120, fontSize: 12 }}
          >
            {(ports.length > 0 ? ports : [{ name: settings.serialPort, description: "" }]).map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}{p.description ? " — " + p.description : ""}
              </option>
            ))}
          </select>
        </SettingsRow>

        <SettingsRow label="Baud rate">
          <select
            value={settings.baudRate}
            onChange={(e) => updateSettings({ baudRate: Number(e.target.value) })}
            style={{ width: 120, fontSize: 12 }}
          >
            {[9600, 57600, 115200, 921600].map((b) => (
              <option key={b} value={b}>{b.toLocaleString()}</option>
            ))}
          </select>
        </SettingsRow>

        <SettingsRow label="Reconnexion automatique" sub="Retente toutes les 3 secondes si déconnexion">
          <Toggle value={settings.autoReconnect} onChange={(v) => updateSettings({ autoReconnect: v })} />
        </SettingsRow>

        <SettingsRow label="Intervalle d'envoi" sub="Fréquence trame PC → ESP32">
          <select
            value={settings.sendInterval}
            onChange={(e) => updateSettings({ sendInterval: Number(e.target.value) })}
            style={{ width: 100, fontSize: 12 }}
          >
            {[50, 100, 200, 500].map((ms) => (
              <option key={ms} value={ms}>{ms}ms</option>
            ))}
          </select>
        </SettingsRow>
      </Section>

      <Section title="Système">
        <SettingsRow label="Démarrage avec Windows" sub="Lance l'agent automatiquement au boot">
          <Toggle value={settings.startWithWindows} onChange={handleAutostart} />
        </SettingsRow>

        <SettingsRow label="Réduire dans la barre système" sub="Minimise vers le systray au lieu de fermer">
          <Toggle value={settings.minimizeToTray} onChange={(v) => updateSettings({ minimizeToTray: v })} />
        </SettingsRow>
      </Section>

      <Section title="Firmware ESP32">
        <div style={{
          background: "rgba(0,0,0,0.22)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 7, padding: "10px 14px",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{ flex: 1, fontSize: 12, color: "#8E8EA0" }}>
            Version : <strong style={{ color: "#ECECEF" }}>{settings.firmwareVersion}</strong>
          </div>
          <button style={{
            display: "flex", alignItems: "center", gap: 5,
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 5, padding: "5px 10px",
            color: "#818CF8", fontSize: 11, fontWeight: 500,
          }}>
            <RefreshCw size={11} /> Vérifier
          </button>
          <button style={{
            display: "flex", alignItems: "center", gap: 5,
            background: "none",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 5, padding: "5px 10px",
            color: "#8E8EA0", fontSize: 11,
          }}>
            <Upload size={11} /> Flasher
          </button>
        </div>
      </Section>

      <Section title="Données & Backup">
        <SettingsRow label="Exporter la configuration" sub="Sauvegarde complète (profils + paramètres)">
          <button
            onClick={handleExportConfig}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "none", border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 5, padding: "5px 10px",
              color: "#8E8EA0", fontSize: 11, transition: "all 0.12s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
              e.currentTarget.style.color       = "#ECECEF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
              e.currentTarget.style.color       = "#8E8EA0";
            }}
          >
            <Upload size={11} /> Exporter JSON
          </button>
        </SettingsRow>

        <SettingsRow label="Réinitialiser" sub="Remet tous les paramètres aux valeurs par défaut">
          <button
            onClick={handleReset}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "none", border: "1px solid rgba(239,68,68,0.30)",
              borderRadius: 5, padding: "5px 10px",
              color: "#EF4444", fontSize: 11, transition: "all 0.12s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background  = "rgba(239,68,68,0.08)";
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.50)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background  = "none";
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.30)";
            }}
          >
            <Trash2 size={11} /> Réinitialiser
          </button>
        </SettingsRow>
      </Section>

      <div style={{ fontSize: 11, color: "#4E4E60", textAlign: "center", marginTop: 16 }}>
        Kore Deck — v2.0.0 — Build Tauri 2 + React + TypeScript
      </div>
    </main>
  );
}
