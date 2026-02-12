// ============================================================================
// CONFIGURACIÓN DEL JUEGO - Constantes y Settings
// ============================================================================
// Migrado de DominoR.jsx líneas 3720, 8263-8297
// ============================================================================

// ============================================================================
// CONFIGURACIÓN PRINCIPAL DEL JUEGO
// ============================================================================
export const CONFIG = { 
  maxTile: 9,           // Doble 9 (fichas van de 0-9)
  tilesPerPlayer: 10,   // 10 fichas por jugador
  passesForTranca: 4,   // 4 pases consecutivos = tranca
  colSize: 8,           // Tamaño de columna visual
  centerColSize: 4,     // Tamaño de columna central
  targetScore: 200,     // Puntos para ganar partida
  maxRounds: 50,        // Máximo de rondas por seguridad
  turnTimeout: 30,      // Segundos por turno
  aiDelay: {
    easy: 2000,
    medium: 1500,
    hard: 1000,
    expert: 500
  }
};

// ============================================================================
// CONFIGURACIÓN DE DIFICULTAD DE IA
// ============================================================================
export const AI_DIFFICULTY = {
  easy: {
    name: 'Fácil',
    icon: '😊',
    description: 'Juega fichas al azar',
    thinkTime: 2000
  },
  medium: {
    name: 'Normal',
    icon: '🤔',
    description: 'Estrategia básica',
    thinkTime: 1500
  },
  hard: {
    name: 'Difícil',
    icon: '😤',
    description: 'Estrategia avanzada',
    thinkTime: 1000
  },
  expert: {
    name: 'Experto',
    icon: '🧠',
    description: 'Cuenta fichas y predice',
    thinkTime: 500
  }
};

// ============================================================================
// CONFIGURACIÓN POR DEFECTO DEL USUARIO
// ============================================================================
export const getDefaultSettings = () => ({
  // Audio
  musicVolume: 70,
  sfxVolume: 100,
  vibration: true,
  soundNotifications: true,
  
  // Juego
  confirmPlay: false,
  quickSelect: false,
  aiDifficulty: 'hard',
  
  // Visual
  animationSpeed: 'fast',
  textSize: 'normal',
  tileTheme: 'classic',
  boardTheme: 'green',
  colorblindMode: 'none',
  particles: true,
  darkMode: true,
  
  // Social
  showChat: true,
  allowEmotes: true,
  showOnlineStatus: true,
  showElo: true,
  gameInvites: 'friends',
  friendRequests: 'all',
  
  // Otros
  language: 'es',
  region: 'auto',
  keepAwake: true,
  saveHistory: true
});

// ============================================================================
// OPCIONES DE CONFIGURACIÓN (Para UI de Settings)
// ============================================================================
export const SETTINGS_OPTIONS = {
  animationSpeed: [
    { value: 'slow', label: 'Lento' },
    { value: 'normal', label: 'Normal' },
    { value: 'fast', label: 'Rápido' },
    { value: 'instant', label: 'Instantáneo' }
  ],
  textSize: [
    { value: 'small', label: 'Pequeño' },
    { value: 'normal', label: 'Normal' },
    { value: 'large', label: 'Grande' }
  ],
  boardTheme: [
    { value: 'green', label: 'Verde Clásico', color: '#2D5A3D' },
    { value: 'blue', label: 'Azul', color: '#1a3a5e' },
    { value: 'red', label: 'Rojo', color: '#4a1a1a' },
    { value: 'purple', label: 'Púrpura', color: '#3a1a4a' }
  ],
  colorblindMode: [
    { value: 'none', label: 'Ninguno' },
    { value: 'protanopia', label: 'Protanopía' },
    { value: 'deuteranopia', label: 'Deuteranopía' },
    { value: 'tritanopia', label: 'Tritanopía' }
  ],
  gameInvites: [
    { value: 'all', label: 'Todos' },
    { value: 'friends', label: 'Solo amigos' },
    { value: 'none', label: 'Nadie' }
  ],
  friendRequests: [
    { value: 'all', label: 'Todos' },
    { value: 'friends_of_friends', label: 'Amigos de amigos' },
    { value: 'none', label: 'Nadie' }
  ],
  language: [
    { value: 'es', label: 'Español', flag: '🇪🇸' },
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'pt', label: 'Português', flag: '🇧🇷' },
    { value: 'fr', label: 'Français', flag: '🇫🇷' }
  ]
};

// ============================================================================
// TEMAS DE TABLERO
// ============================================================================
export const BOARD_THEMES = {
  green: { 
    bg: 'radial-gradient(ellipse at center, #1a4a2e 0%, #0d2818 100%)', 
    felt: '#1a4a2e',
    border: '#0d2e1a'
  },
  blue: { 
    bg: 'radial-gradient(ellipse at center, #1a3a5e 0%, #0d1828 100%)', 
    felt: '#1a3a5e',
    border: '#0d1a3a'
  },
  red: { 
    bg: 'radial-gradient(ellipse at center, #4a1a1a 0%, #280d0d 100%)', 
    felt: '#4a1a1a',
    border: '#3a0d0d'
  },
  purple: { 
    bg: 'radial-gradient(ellipse at center, #3a1a4a 0%, #1a0d28 100%)', 
    felt: '#3a1a4a',
    border: '#2a0d3a'
  }
};

// ============================================================================
// VALIDACIÓN DE SETTINGS
// ============================================================================
export const validateSettings = (settings) => {
  const defaults = getDefaultSettings();
  const validated = { ...defaults };
  
  // Validar cada campo
  Object.keys(defaults).forEach(key => {
    if (settings && settings[key] !== undefined) {
      // Validar tipos
      if (typeof settings[key] === typeof defaults[key]) {
        validated[key] = settings[key];
      }
    }
  });
  
  // Validar rangos numéricos
  validated.musicVolume = Math.max(0, Math.min(100, validated.musicVolume));
  validated.sfxVolume = Math.max(0, Math.min(100, validated.sfxVolume));
  
  return validated;
};

// ============================================================================
// MERGE SETTINGS (para actualizar parcialmente)
// ============================================================================
export const mergeSettings = (current, updates) => {
  return validateSettings({ ...current, ...updates });
};
