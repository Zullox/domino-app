// ============================================================================
// CONSTANTES DEL JUEGO
// ============================================================================

export const SERVIDOR_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const CONFIG = {
  maxTile: 9,
  tilesPerPlayer: 10,
  targetScore: 200,
  turnTime: 30,
  maxRematches: 3
};

// ============================================================================
// SISTEMA DE RANGOS
// ============================================================================
export const RANKS = [
  { name: 'Bronce V', min: 0, max: 799, tier: 'bronze', division: 5, icon: '🥉' },
  { name: 'Bronce IV', min: 800, max: 899, tier: 'bronze', division: 4, icon: '🥉' },
  { name: 'Bronce III', min: 900, max: 999, tier: 'bronze', division: 3, icon: '🥉' },
  { name: 'Bronce II', min: 1000, max: 1099, tier: 'bronze', division: 2, icon: '🥉' },
  { name: 'Bronce I', min: 1100, max: 1199, tier: 'bronze', division: 1, icon: '🥉' },
  { name: 'Plata V', min: 1200, max: 1299, tier: 'silver', division: 5, icon: '🥈' },
  { name: 'Plata IV', min: 1300, max: 1349, tier: 'silver', division: 4, icon: '🥈' },
  { name: 'Plata III', min: 1350, max: 1399, tier: 'silver', division: 3, icon: '🥈' },
  { name: 'Plata II', min: 1400, max: 1449, tier: 'silver', division: 2, icon: '🥈' },
  { name: 'Plata I', min: 1450, max: 1499, tier: 'silver', division: 1, icon: '🥈' },
  { name: 'Oro V', min: 1500, max: 1549, tier: 'gold', division: 5, icon: '🥇' },
  { name: 'Oro IV', min: 1550, max: 1599, tier: 'gold', division: 4, icon: '🥇' },
  { name: 'Oro III', min: 1600, max: 1649, tier: 'gold', division: 3, icon: '🥇' },
  { name: 'Oro II', min: 1650, max: 1699, tier: 'gold', division: 2, icon: '🥇' },
  { name: 'Oro I', min: 1700, max: 1799, tier: 'gold', division: 1, icon: '🥇' },
  { name: 'Platino V', min: 1800, max: 1849, tier: 'platinum', division: 5, icon: '💎' },
  { name: 'Platino IV', min: 1850, max: 1899, tier: 'platinum', division: 4, icon: '💎' },
  { name: 'Platino III', min: 1900, max: 1949, tier: 'platinum', division: 3, icon: '💎' },
  { name: 'Platino II', min: 1950, max: 1999, tier: 'platinum', division: 2, icon: '💎' },
  { name: 'Platino I', min: 2000, max: 2099, tier: 'platinum', division: 1, icon: '💎' },
  { name: 'Diamante V', min: 2100, max: 2149, tier: 'diamond', division: 5, icon: '💠' },
  { name: 'Diamante IV', min: 2150, max: 2199, tier: 'diamond', division: 4, icon: '💠' },
  { name: 'Diamante III', min: 2200, max: 2249, tier: 'diamond', division: 3, icon: '💠' },
  { name: 'Diamante II', min: 2250, max: 2299, tier: 'diamond', division: 2, icon: '💠' },
  { name: 'Diamante I', min: 2300, max: 2399, tier: 'diamond', division: 1, icon: '💠' },
  { name: 'Maestro', min: 2400, max: 2599, tier: 'master', division: 0, icon: '👑' },
  { name: 'Gran Maestro', min: 2600, max: 2799, tier: 'grandmaster', division: 0, icon: '🏆' },
  { name: 'Leyenda', min: 2800, max: 9999, tier: 'legend', division: 0, icon: '⭐' },
];

export const TIER_COLORS = {
  bronze: { primary: '#cd7f32', secondary: '#8b4513', bg: 'linear-gradient(135deg, #cd7f32, #8b4513)' },
  silver: { primary: '#c0c0c0', secondary: '#808080', bg: 'linear-gradient(135deg, #c0c0c0, #a8a8a8)' },
  gold: { primary: '#ffd700', secondary: '#daa520', bg: 'linear-gradient(135deg, #ffd700, #ffb300)' },
  platinum: { primary: '#00d4aa', secondary: '#008b8b', bg: 'linear-gradient(135deg, #00d4aa, #20b2aa)' },
  diamond: { primary: '#b9f2ff', secondary: '#00bfff', bg: 'linear-gradient(135deg, #b9f2ff, #87ceeb)' },
  master: { primary: '#9932cc', secondary: '#8b008b', bg: 'linear-gradient(135deg, #9932cc, #ba55d3)' },
  grandmaster: { primary: '#ff4500', secondary: '#dc143c', bg: 'linear-gradient(135deg, #ff4500, #ff6347)' },
  legend: { primary: '#ffd700', secondary: '#ff4500', bg: 'linear-gradient(135deg, #ffd700, #ff8c00, #ff4500)' },
};

// ============================================================================
// TEMA VISUAL
// ============================================================================
export const THEME = {
  colors: {
    bg: {
      deep: '#0a0a0f',
      surface: '#12121a',
      card: '#1a1a24',
      elevated: '#22222e',
      border: '#2a2a3a'
    },
    text: {
      primary: '#ffffff',
      secondary: '#a0a0b0',
      muted: '#606070'
    },
    accent: {
      blue: '#3B82F6',
      green: '#10B981',
      red: '#EF4444',
      purple: '#8B5CF6',
      slate: '#94A3B8'
    },
    gold: {
      main: '#F59E0B',
      light: '#FCD34D',
      dark: '#D97706'
    }
  }
};

// ============================================================================
// EMOTES
// ============================================================================
export const EMOTES = ['😄', '😢', '😠', '👍', '👎', '🎉'];

// ============================================================================
// FUNCIONES DE RANGO
// ============================================================================
export const getRank = (mmr) => {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (mmr >= RANKS[i].min) return RANKS[i];
  }
  return RANKS[0];
};

export const getRankProgress = (mmr) => {
  const rank = getRank(mmr);
  const range = rank.max - rank.min;
  if (range === 0) return 100;
  return Math.min(100, Math.max(0, Math.round(((mmr - rank.min) / range) * 100)));
};

export const checkRankChange = (oldMmr, newMmr) => {
  const oldRank = getRank(oldMmr);
  const newRank = getRank(newMmr);
  if (newRank.min > oldRank.min) return { type: 'promotion', from: oldRank, to: newRank };
  if (newRank.min < oldRank.min) return { type: 'demotion', from: oldRank, to: newRank };
  return null;
};
