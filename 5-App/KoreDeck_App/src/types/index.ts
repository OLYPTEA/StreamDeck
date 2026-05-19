// =============================================================================
// types/index.ts — Définitions TypeScript centralisées
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// Catégories
// ─────────────────────────────────────────────────────────────────────────────
export type CategoryId = 0 | 1 | 2 | 3;

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
}

export const CATEGORIES: Category[] = [
  { id: 0, name: "Home",      icon: "Home",       color: "#534AB7" },
  { id: 1, name: "3D Making", icon: "Box",         color: "#1D9E75" },
  { id: 2, name: "Focus",     icon: "Target",      color: "#BA7517" },
  { id: 3, name: "Game",      icon: "Gamepad2",    color: "#E24B4A" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────────────────────────────────────
export type ActionType = "shortcut" | "app" | "script" | "macro" | "system";

export interface ButtonAction {
  type:     ActionType;
  value:    string;       // Raccourci, chemin app, script, texte ou action système
  longPress?: string;     // Action pour appui long
  doublePress?: string;   // Action pour double-appui
}

// ─────────────────────────────────────────────────────────────────────────────
// Boutons
// ─────────────────────────────────────────────────────────────────────────────
export interface ButtonConfig {
  id:      number;        // 0-6
  label:   string;        // Affiché sur l'écran DWIN
  icon:    string;        // Nom icône Lucide
  color:   string;        // Couleur hex de l'icône
  action:  ButtonAction;
}

// ─────────────────────────────────────────────────────────────────────────────
// Potentiomètres
// ─────────────────────────────────────────────────────────────────────────────
export type PotActionKey =
  | "VOL_MASTER" | "VOL_MUSIC" | "VOL_GAME" | "VOL_DISCORD"
  | "BRIGHTNESS" | "MIC_GAIN" | "ZOOM" | "OPACITY"
  | "ROTATION" | "WHITE_NOISE" | "POMO_DURATION";

export interface PotConfig {
  id:      number;        // 0-3
  label:   string;        // Affiché sur l'écran DWIN
  action:  PotActionKey;
  min:     number;        // Valeur minimale (%)
  max:     number;        // Valeur maximale (%)
}

// ─────────────────────────────────────────────────────────────────────────────
// Profil
// ─────────────────────────────────────────────────────────────────────────────
export interface CategoryConfig {
  categoryId: CategoryId;
  buttons:    ButtonConfig[];
  pots:       PotConfig[];
}

export interface Profile {
  id:          number;
  name:        string;
  description: string;
  createdAt:   string;
  updatedAt:   string;
  isActive:    boolean;
  categories:  CategoryConfig[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Monitoring live
// ─────────────────────────────────────────────────────────────────────────────
export interface SystemStats {
  cpu:         number;    // 0-100
  ram:         number;    // 0-100
  fps:         number;
  micMuted:    boolean;
  dndActive:   boolean;
  obsActive:   boolean;
  trackTitle:  string;
  trackArtist: string;
  pomoMinutes: number;
  pomoSeconds: number;
  pomoSession: number;
  pomoRunning: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Connexion ESP32
// ─────────────────────────────────────────────────────────────────────────────
export type ConnectionStatus = "connected" | "disconnected" | "reconnecting";

export interface ConnectionState {
  status:    ConnectionStatus;
  port:      string;
  baud:      number;
  lastSeen:  Date | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Paramètres application
// ─────────────────────────────────────────────────────────────────────────────
export interface AppSettings {
  serialPort:      string;
  baudRate:        number;
  sendInterval:    number;   // ms
  autoReconnect:   boolean;
  startWithWindows:boolean;
  minimizeToTray:  boolean;
  firmwareVersion: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Valeurs par défaut
// ─────────────────────────────────────────────────────────────────────────────
export const DEFAULT_BUTTONS: ButtonConfig[][] = [
  // HOME
  [
    { id:0, label:"Lecture/Pause",   icon:"Play",          color:"#534AB7", action:{type:"system", value:"MEDIA_PLAY"} },
    { id:1, label:"Piste suivante",  icon:"SkipForward",   color:"#1D9E75", action:{type:"system", value:"MEDIA_NEXT"} },
    { id:2, label:"Piste précédente",icon:"SkipBack",      color:"#1D9E75", action:{type:"system", value:"MEDIA_PREV"} },
    { id:3, label:"Mute micro",      icon:"MicOff",        color:"#E24B4A", action:{type:"system", value:"MIC_TOGGLE"} },
    { id:4, label:"Capture écran",   icon:"Camera",        color:"#BA7517", action:{type:"shortcut",value:"Win+Shift+S"} },
    { id:5, label:"Explorateur",     icon:"FolderOpen",    color:"#BA7517", action:{type:"shortcut",value:"Win+E"} },
    { id:6, label:"Veille écrans",   icon:"Moon",          color:"#555555", action:{type:"script",  value:"sleep.ps1"} },
  ],
  // 3D MAKING
  [
    { id:0, label:"Annuler",         icon:"Undo2",         color:"#534AB7", action:{type:"shortcut",value:"Ctrl+Z"} },
    { id:1, label:"Rétablir",        icon:"Redo2",         color:"#534AB7", action:{type:"shortcut",value:"Ctrl+Y"} },
    { id:2, label:"Enregistrer",     icon:"Save",          color:"#1D9E75", action:{type:"shortcut",value:"Ctrl+S"} },
    { id:3, label:"Vue Home",        icon:"Home",          color:"#BA7517", action:{type:"shortcut",value:"H"} },
    { id:4, label:"Section view",    icon:"Scissors",      color:"#BA7517", action:{type:"macro",   value:"SECTION_VIEW"} },
    { id:5, label:"Nouveau comp.",   icon:"Plus",          color:"#555555", action:{type:"shortcut",value:"Ctrl+N"} },
    { id:6, label:"Exporter STL",    icon:"FileOutput",    color:"#555555", action:{type:"shortcut",value:"Ctrl+Shift+E"} },
  ],
  // FOCUS
  [
    { id:0, label:"Pomo Toggle",     icon:"Clock",         color:"#1D9E75", action:{type:"system", value:"POMO_TOGGLE"} },
    { id:1, label:"Reset timer",     icon:"RotateCcw",     color:"#1D9E75", action:{type:"system", value:"POMO_RESET"} },
    { id:2, label:"Ouvrir Notion",   icon:"BookOpen",      color:"#534AB7", action:{type:"app",    value:"notion://"} },
    { id:3, label:"Mode DND",        icon:"BellOff",       color:"#E24B4A", action:{type:"system", value:"DND_TOGGLE"} },
    { id:4, label:"Snap gauche",     icon:"PanelLeft",     color:"#555555", action:{type:"shortcut",value:"Win+Left"} },
    { id:5, label:"Snap droit",      icon:"PanelRight",    color:"#555555", action:{type:"shortcut",value:"Win+Right"} },
    { id:6, label:"Bureau suivant",  icon:"LayoutGrid",    color:"#555555", action:{type:"shortcut",value:"Ctrl+Win+Right"} },
  ],
  // GAME
  [
    { id:0, label:"Mute micro",      icon:"MicOff",        color:"#E24B4A", action:{type:"system", value:"GAME_MIC"} },
    { id:1, label:"Sourdine Discord",icon:"Volume2",       color:"#534AB7", action:{type:"shortcut",value:"Ctrl+Shift+M"} },
    { id:2, label:"Screenshot jeu",  icon:"Camera",        color:"#BA7517", action:{type:"shortcut",value:"F12"} },
    { id:3, label:"Clip 30s",        icon:"Video",         color:"#E24B4A", action:{type:"shortcut",value:"Win+Alt+G"} },
    { id:4, label:"OBS Toggle",      icon:"Radio",         color:"#E24B4A", action:{type:"app",    value:"obs://"} },
    { id:5, label:"Alt+Tab",         icon:"Layers",        color:"#555555", action:{type:"shortcut",value:"Alt+Tab"} },
    { id:6, label:"Task Manager",    icon:"List",          color:"#555555", action:{type:"shortcut",value:"Ctrl+Shift+Esc"} },
  ],
];

export const DEFAULT_POTS: PotConfig[][] = [
  // HOME
  [
    { id:0, label:"Vol. Master",  action:"VOL_MASTER",    min:0, max:100 },
    { id:1, label:"Vol. Musique", action:"VOL_MUSIC",     min:0, max:100 },
    { id:2, label:"Luminosité",   action:"BRIGHTNESS",    min:10, max:100 },
    { id:3, label:"Mic Gain",     action:"MIC_GAIN",      min:0, max:100 },
  ],
  // 3D
  [
    { id:0, label:"Zoom",         action:"ZOOM",          min:0, max:100 },
    { id:1, label:"Opacité",      action:"OPACITY",       min:0, max:100 },
    { id:2, label:"Rotation",     action:"ROTATION",      min:0, max:100 },
    { id:3, label:"Vol. Master",  action:"VOL_MASTER",    min:0, max:100 },
  ],
  // FOCUS
  [
    { id:0, label:"Vol. Master",  action:"VOL_MASTER",    min:0, max:100 },
    { id:1, label:"Bruit blanc",  action:"WHITE_NOISE",   min:0, max:100 },
    { id:2, label:"Luminosité",   action:"BRIGHTNESS",    min:10, max:100 },
    { id:3, label:"Durée Pomo",   action:"POMO_DURATION", min:5,  max:60  },
  ],
  // GAME
  [
    { id:0, label:"Vol. Master",  action:"VOL_MASTER",    min:0, max:100 },
    { id:1, label:"Vol. Jeu",     action:"VOL_GAME",      min:0, max:100 },
    { id:2, label:"Vol. Discord", action:"VOL_DISCORD",   min:0, max:100 },
    { id:3, label:"Vol. Musique", action:"VOL_MUSIC",     min:0, max:100 },
  ],
];
