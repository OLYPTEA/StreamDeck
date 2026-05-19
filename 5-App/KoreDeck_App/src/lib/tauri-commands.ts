// =============================================================================
// lib/tauri-commands.ts — Wrapper TypeScript pour les commandes Rust/Tauri
//
// Centralise tous les appels invoke() avec typage strict.
// En mode développement (sans Tauri), retourne des données simulées.
// =============================================================================

import { invoke } from "@tauri-apps/api/core";

// ─────────────────────────────────────────────────────────────────────────────
// Détection environnement
// ─────────────────────────────────────────────────────────────────────────────
const IS_TAURI = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface SerialPort {
  name:        string;
  description: string;
}

export interface AppVersion {
  app:      string;
  firmware: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Ports série
// ─────────────────────────────────────────────────────────────────────────────
export async function listSerialPorts(): Promise<SerialPort[]> {
  if (!IS_TAURI) {
    // Simulation dev
    return [
      { name: "COM3", description: "Silicon Labs CP210x (ESP32-S3)" },
      { name: "COM4", description: "USB Serial Device" },
    ];
  }
  return invoke<SerialPort[]>("list_serial_ports");
}

// ─────────────────────────────────────────────────────────────────────────────
// Agent Python
// ─────────────────────────────────────────────────────────────────────────────
export async function startAgent(port: string): Promise<string> {
  if (!IS_TAURI) return "started";
  return invoke<string>("start_agent", { port });
}

export async function stopAgent(): Promise<string> {
  if (!IS_TAURI) return "stopped";
  return invoke<string>("stop_agent");
}

export async function getAgentStatus(): Promise<"running" | "stopped" | "error"> {
  if (!IS_TAURI) return "running";
  return invoke<"running" | "stopped" | "error">("get_agent_status");
}

// ─────────────────────────────────────────────────────────────────────────────
// Version
// ─────────────────────────────────────────────────────────────────────────────
export async function getAppVersion(): Promise<AppVersion> {
  if (!IS_TAURI) return { app: "2.0.0", firmware: "v2.0.0" };
  return invoke<AppVersion>("get_app_version");
}

// ─────────────────────────────────────────────────────────────────────────────
// Démarrage automatique
// ─────────────────────────────────────────────────────────────────────────────
export async function setAutostart(enabled: boolean): Promise<void> {
  if (!IS_TAURI) return;
  return invoke<void>("set_autostart", { enabled });
}

// ─────────────────────────────────────────────────────────────────────────────
// Export / Import configuration
// ─────────────────────────────────────────────────────────────────────────────
export async function exportConfig(profilesJson: string): Promise<string> {
  if (!IS_TAURI) {
    return JSON.stringify({ version: "2.0", exported: new Date().toISOString(), profiles: JSON.parse(profilesJson) }, null, 2);
  }
  return invoke<string>("export_config", { profilesJson });
}

export async function importConfig(jsonStr: string): Promise<unknown> {
  if (!IS_TAURI) {
    const parsed = JSON.parse(jsonStr);
    if (parsed.version !== "2.0") throw new Error("Version incompatible");
    return parsed.profiles;
  }
  return invoke<unknown>("import_config", { jsonStr });
}

// ─────────────────────────────────────────────────────────────────────────────
// Ouvrir le dossier app
// ─────────────────────────────────────────────────────────────────────────────
export async function openAppDir(): Promise<void> {
  if (!IS_TAURI) return;
  return invoke<void>("open_app_dir");
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers utilitaires
// ─────────────────────────────────────────────────────────────────────────────

/** Télécharger un fichier texte côté navigateur */
export function downloadTextFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Lire un fichier texte depuis un input file */
export function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
