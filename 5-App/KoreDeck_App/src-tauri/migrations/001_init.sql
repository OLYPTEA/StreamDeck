-- =============================================================================
-- 001_init.sql — Schéma SQLite complet du StreamDeck DIY
-- Exécuté automatiquement par Tauri au premier lancement
-- =============================================================================

-- Profils utilisateur
CREATE TABLE IF NOT EXISTS profiles (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    description TEXT    NOT NULL DEFAULT '',
    is_active   INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    NOT NULL,
    updated_at  TEXT    NOT NULL
);

-- Configuration des boutons par profil et catégorie
CREATE TABLE IF NOT EXISTS button_configs (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id    INTEGER NOT NULL,
    category_id   INTEGER NOT NULL CHECK (category_id BETWEEN 0 AND 3),
    button_id     INTEGER NOT NULL CHECK (button_id BETWEEN 0 AND 6),
    label         TEXT    NOT NULL,
    icon          TEXT    NOT NULL DEFAULT 'Circle',
    color         TEXT    NOT NULL DEFAULT '#534AB7',
    action_type   TEXT    NOT NULL CHECK (action_type IN ('shortcut','app','script','macro','system')),
    action_value  TEXT    NOT NULL DEFAULT '',
    long_press    TEXT,
    double_press  TEXT,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    UNIQUE (profile_id, category_id, button_id)
);

-- Configuration des potentiomètres par profil et catégorie
CREATE TABLE IF NOT EXISTS pot_configs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id  INTEGER NOT NULL,
    category_id INTEGER NOT NULL CHECK (category_id BETWEEN 0 AND 3),
    pot_id      INTEGER NOT NULL CHECK (pot_id BETWEEN 0 AND 3),
    label       TEXT    NOT NULL,
    action      TEXT    NOT NULL,
    min_val     INTEGER NOT NULL DEFAULT 0,
    max_val     INTEGER NOT NULL DEFAULT 100,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    UNIQUE (profile_id, category_id, pot_id)
);

-- Paramètres application (clé/valeur)
CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Historique des actions (optionnel, pour debug)
CREATE TABLE IF NOT EXISTS action_log (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp  TEXT    NOT NULL,
    category   INTEGER NOT NULL,
    source     TEXT    NOT NULL,  -- 'button' | 'pot'
    action     TEXT    NOT NULL,
    value      TEXT
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_buttons_profile_cat ON button_configs (profile_id, category_id);
CREATE INDEX IF NOT EXISTS idx_pots_profile_cat    ON pot_configs    (profile_id, category_id);
CREATE INDEX IF NOT EXISTS idx_action_log_ts       ON action_log     (timestamp);

-- Paramètres par défaut
INSERT OR IGNORE INTO settings (key, value) VALUES
    ('serial_port',       'COM3'),
    ('baud_rate',         '115200'),
    ('send_interval',     '100'),
    ('auto_reconnect',    '1'),
    ('start_with_windows','0'),
    ('minimize_to_tray',  '1'),
    ('firmware_version',  'v2.0.0'),
    ('active_profile_id', '1');

-- Profil par défaut
INSERT OR IGNORE INTO profiles (id, name, description, is_active, created_at, updated_at)
VALUES (1, 'Profil par défaut', 'Configuration initiale', 1,
        datetime('now'), datetime('now'));
