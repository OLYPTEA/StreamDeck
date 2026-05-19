// =============================================================================
// lib/db.ts — Couche d'accès SQLite via @tauri-apps/plugin-sql
//
// Toute la persistance passe par SQLite local.
// Les profils, boutons, potards et paramètres sont stockés ici.
// =============================================================================

import Database from "@tauri-apps/plugin-sql";

let db: Awaited<ReturnType<typeof Database.load>> | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// Initialisation — crée les tables si elles n'existent pas
// ─────────────────────────────────────────────────────────────────────────────
export async function initDb(): Promise<void> {
  db = await Database.load("sqlite:streamdeck.db");

  await db.execute(`
    CREATE TABLE IF NOT EXISTS profiles (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      description TEXT    DEFAULT '',
      is_active   INTEGER DEFAULT 0,
      created_at  TEXT    NOT NULL,
      updated_at  TEXT    NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS button_configs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id  INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      button_id   INTEGER NOT NULL,
      label       TEXT    NOT NULL,
      icon        TEXT    NOT NULL,
      color       TEXT    NOT NULL,
      action_type TEXT    NOT NULL,
      action_value TEXT   NOT NULL,
      long_press  TEXT    DEFAULT NULL,
      double_press TEXT   DEFAULT NULL,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS pot_configs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id  INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      pot_id      INTEGER NOT NULL,
      label       TEXT    NOT NULL,
      action      TEXT    NOT NULL,
      min_val     INTEGER DEFAULT 0,
      max_val     INTEGER DEFAULT 100,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

// ─────────────────────────────────────────────────────────────────────────────
// Profils
// ─────────────────────────────────────────────────────────────────────────────
export async function getAllProfiles() {
  if (!db) return [];
  return db.select<any[]>("SELECT * FROM profiles ORDER BY created_at ASC");
}

export async function createProfile(name: string, description: string) {
  if (!db) return;
  const now = new Date().toISOString();
  return db.execute(
    "INSERT INTO profiles (name, description, is_active, created_at, updated_at) VALUES (?, ?, 0, ?, ?)",
    [name, description, now, now]
  );
}

export async function deleteProfile(id: number) {
  if (!db) return;
  return db.execute("DELETE FROM profiles WHERE id = ?", [id]);
}

export async function setActiveProfile(id: number) {
  if (!db) return;
  await db.execute("UPDATE profiles SET is_active = 0");
  await db.execute("UPDATE profiles SET is_active = 1, updated_at = ? WHERE id = ?",
    [new Date().toISOString(), id]
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Boutons
// ─────────────────────────────────────────────────────────────────────────────
export async function getButtons(profileId: number, categoryId: number) {
  if (!db) return [];
  return db.select<any[]>(
    "SELECT * FROM button_configs WHERE profile_id = ? AND category_id = ? ORDER BY button_id ASC",
    [profileId, categoryId]
  );
}

export async function upsertButton(
  profileId: number, categoryId: number, buttonId: number,
  label: string, icon: string, color: string,
  actionType: string, actionValue: string,
  longPress?: string, doublePress?: string
) {
  if (!db) return;
  await db.execute(`
    INSERT INTO button_configs
      (profile_id, category_id, button_id, label, icon, color, action_type, action_value, long_press, double_press)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(profile_id, category_id, button_id) DO UPDATE SET
      label=excluded.label, icon=excluded.icon, color=excluded.color,
      action_type=excluded.action_type, action_value=excluded.action_value,
      long_press=excluded.long_press, double_press=excluded.double_press
  `, [profileId, categoryId, buttonId, label, icon, color, actionType, actionValue, longPress ?? null, doublePress ?? null]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Paramètres
// ─────────────────────────────────────────────────────────────────────────────
export async function getSetting(key: string): Promise<string | null> {
  if (!db) return null;
  const rows = await db.select<{value: string}[]>(
    "SELECT value FROM settings WHERE key = ?", [key]
  );
  return rows[0]?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  if (!db) return;
  await db.execute(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    [key, value]
  );
}
