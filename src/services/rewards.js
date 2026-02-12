// ============================================================================
// SISTEMA DE RECOMPENSAS Y MONETIZACIÓN
// ============================================================================
// Recompensas por partidas, login diario, misiones, pase de temporada, etc.
// Para el catálogo de la tienda, usar services/shop.js
// ============================================================================

// ============================================================================
// MONEDAS
// ============================================================================

export const CURRENCIES = {
  COINS: 'coins',       // Moneda premium (comprada con dinero real)
  TOKENS: 'tokens'      // Moneda gratuita (ganada jugando)
};

// ============================================================================
// RECOMPENSAS POR PARTIDA
// ============================================================================

export const MATCH_REWARDS = {
  // Recompensas base
  WIN: { tokens: 25, xp: 50 },
  LOSS: { tokens: 10, xp: 20 },
  
  // Bonificaciones
  DOMINO_BONUS: { tokens: 10 },        // Ganar cerrando con dominó
  CAPICUA_BONUS: { tokens: 20 },       // Ganar con capicúa
  PERFECT_GAME: { tokens: 15 },        // Rival no anotó puntos
  COMEBACK_BONUS: { tokens: 15 },      // Remontar 30+ puntos
  STREAK_BONUS: { tokens: 5 },         // Por cada victoria en racha (max 5)
  FIRST_WIN_DAY: { tokens: 25 }        // Primera victoria del día
};

// ============================================================================
// RECOMPENSAS DIARIAS (LOGIN BONUS)
// ============================================================================

export const DAILY_LOGIN = {
  // Día 1-7, se resetea después del día 7
  rewards: [
    { day: 1, tokens: 50, coins: 0 },
    { day: 2, tokens: 75, coins: 0 },
    { day: 3, tokens: 100, coins: 5 },
    { day: 4, tokens: 125, coins: 0 },
    { day: 5, tokens: 150, coins: 10 },
    { day: 6, tokens: 200, coins: 0 },
    { day: 7, tokens: 300, coins: 25 }   // Día 7 es especial
  ],
  
  // Obtener recompensa por día
  getReward: (day) => {
    const adjustedDay = ((day - 1) % 7) + 1;
    return DAILY_LOGIN.rewards.find(r => r.day === adjustedDay) || DAILY_LOGIN.rewards[0];
  }
};

// ============================================================================
// MISIONES DIARIAS
// ============================================================================

export const DAILY_MISSIONS = [
  { 
    id: 'play_3', 
    name: 'Jugador Activo', 
    description: 'Juega 3 partidas', 
    target: 3, 
    type: 'games', 
    reward: { tokens: 30 } 
  },
  { 
    id: 'win_1', 
    name: 'Primera Victoria', 
    description: 'Gana 1 partida', 
    target: 1, 
    type: 'wins', 
    reward: { tokens: 40 } 
  },
  { 
    id: 'win_3', 
    name: 'Racha Ganadora', 
    description: 'Gana 3 partidas', 
    target: 3, 
    type: 'wins', 
    reward: { tokens: 75 } 
  },
  { 
    id: 'domino_1', 
    name: 'Dominador', 
    description: 'Gana 1 partida con dominó', 
    target: 1, 
    type: 'dominos', 
    reward: { tokens: 50 } 
  },
  { 
    id: 'points_100', 
    name: 'Centenario', 
    description: 'Anota 100 puntos en una partida', 
    target: 100, 
    type: 'points', 
    reward: { tokens: 40 } 
  },
  { 
    id: 'streak_3', 
    name: 'En Racha', 
    description: 'Gana 3 partidas seguidas', 
    target: 3, 
    type: 'streak', 
    reward: { tokens: 100 } 
  }
];

// ============================================================================
// PAQUETES DE MONEDAS
// ============================================================================

// COIN_PACKS: definidos en services/purchases.js (fuente canónica para IAP)
// Importar desde allí: import { COIN_PACKS } from './purchases';

// ============================================================================
// PASE DE TEMPORADA
// ============================================================================

export const SEASON_PASS = {
  price: 999, // $9.99 USD (en centavos)
  duration: 90, // días
  name: 'Pase de Temporada',
  description: 'Desbloquea recompensas cosméticas exclusivas durante toda la temporada',
  tiers: 50,
  xpPerTier: 1000,
  
  // Recompensas del pase GRATIS
  FREE_REWARDS: {
    5: { type: 'tokens', amount: 100 },
    10: { type: 'avatar', id: 'season_basic' },
    15: { type: 'tokens', amount: 150 },
    20: { type: 'emote', id: 'season_emote_1' },
    25: { type: 'tokens', amount: 200 },
    30: { type: 'title', id: 'season_title_free' },
    35: { type: 'tokens', amount: 250 },
    40: { type: 'frame', id: 'season_frame_basic' },
    45: { type: 'tokens', amount: 300 },
    50: { type: 'tile_design', id: 'season_tile_free' }
  },
  
  // Recompensas del pase PREMIUM
  PREMIUM_REWARDS: {
    1: { type: 'tokens', amount: 50 },
    5: { type: 'tokens', amount: 100 },
    10: { type: 'tile_design', id: 'premium_tiles_1' },
    15: { type: 'board', id: 'premium_board_1' },
    20: { type: 'title', id: 'premium_title_1' },
    25: { type: 'avatar', id: 'premium_avatar_1' },
    30: { type: 'effect', id: 'premium_effect_1' },
    35: { type: 'frame', id: 'premium_frame_1' },
    40: { type: 'tile_design', id: 'premium_tiles_2' },
    45: { type: 'frame', id: 'premium_frame_animated' },
    50: { type: 'bundle', id: 'season_legendary_set' }
  }
};

// ============================================================================
// TORNEOS
// ============================================================================

export const TOURNAMENTS = {
  // Torneos diarios
  DAILY: [
    { 
      id: 'daily_free', 
      name: 'Torneo Diario Gratis', 
      entryFee: 0, 
      currency: 'tokens', 
      prizePool: 500, 
      prizeType: 'tokens', 
      maxPlayers: 32, 
      format: 'single_elimination' 
    },
    { 
      id: 'daily_token', 
      name: 'Torneo Diario Token', 
      entryFee: 50, 
      currency: 'tokens', 
      prizePool: 1500, 
      prizeType: 'tokens', 
      maxPlayers: 32, 
      format: 'single_elimination' 
    },
    { 
      id: 'daily_premium', 
      name: 'Torneo Diario Premium', 
      entryFee: 25, 
      currency: 'coins', 
      prizePool: 100, 
      prizeType: 'coins', 
      maxPlayers: 16, 
      format: 'single_elimination' 
    }
  ],
  
  // Torneos semanales
  WEEKLY: [
    { 
      id: 'weekly_major', 
      name: 'Torneo Semanal Mayor', 
      entryFee: 100, 
      currency: 'tokens', 
      prizePool: 5000, 
      prizeType: 'tokens', 
      maxPlayers: 64, 
      format: 'double_elimination' 
    },
    { 
      id: 'weekly_premium', 
      name: 'Torneo Semanal Premium', 
      entryFee: 50, 
      currency: 'coins', 
      prizePool: 250, 
      prizeType: 'coins', 
      maxPlayers: 32, 
      format: 'double_elimination' 
    }
  ],
  
  // Distribución de premios (porcentaje del prize pool)
  PRIZE_DISTRIBUTION: {
    single_elimination: { 1: 50, 2: 25, 3: 15, 4: 10 },
    double_elimination: { 1: 40, 2: 25, 3: 15, 4: 10, 5: 5, 6: 5 },
    swiss: { 1: 30, 2: 20, 3: 15, 4: 12, 5: 8, 6: 6, 7: 5, 8: 4 }
  }
};

// ============================================================================
// BUNDLES / PAQUETES
// ============================================================================

export const BUNDLES = [
  {
    id: 'starter_pack',
    name: 'Pack de Inicio',
    description: '¡Comienza con estilo!',
    price: 499, // $4.99
    currency: 'usd',
    contents: [
      { type: 'coins', amount: 500 },
      { type: 'tile_design', id: 'obsidian' },
      { type: 'avatar', id: 'crown' },
      { type: 'frame', id: 'gold' }
    ],
    savings: '30%',
    oneTimePurchase: true
  },
  {
    id: 'pro_pack',
    name: 'Pack Pro',
    description: 'Para jugadores serios',
    price: 1499, // $14.99
    currency: 'usd',
    contents: [
      { type: 'coins', amount: 1500 },
      { type: 'tile_design', id: 'gold_plated' },
      { type: 'board', id: 'velvet_red' },
      { type: 'effect', id: 'fireworks' },
      { type: 'title', id: 'dominador' }
    ],
    savings: '40%',
    oneTimePurchase: true
  },
  {
    id: 'legend_pack',
    name: 'Pack Legendario',
    description: 'La colección definitiva',
    price: 4999, // $49.99
    currency: 'usd',
    contents: [
      { type: 'coins', amount: 6000 },
      { type: 'tile_design', id: 'dragon_scale' },
      { type: 'tile_design', id: 'phoenix_flame' },
      { type: 'board', id: 'galaxy' },
      { type: 'effect', id: 'gold_shower' },
      { type: 'frame', id: 'animated_rainbow' },
      { type: 'title', id: 'titan' },
      { type: 'avatar', id: 'dragon' }
    ],
    savings: '50%',
    oneTimePurchase: true
  }
];

// ============================================================================
// COLORES DE RAREZA
// ============================================================================

// RARITY_COLORS: definidos en constants/cosmetics.js (fuente canónica)

// ============================================================================
// FUNCIONES DE CÁLCULO
// ============================================================================

/**
 * Formatear precio
 */
export const formatPrice = (price, currency) => {
  if (currency === 'usd') return `$${(price / 100).toFixed(2)}`;
  if (currency === 'coins') return `${price} 💎`;
  if (currency === 'tokens') return `${price} 🪙`;
  return String(price);
};

/**
 * Calcular tokens ganados por partida
 */
export const calculateTokensEarned = (matchResult) => {
  let tokens = 10; // Base por participar
  
  // Victoria
  if (matchResult.won) {
    tokens += MATCH_REWARDS.WIN.tokens;
  } else {
    tokens += MATCH_REWARDS.LOSS.tokens;
  }
  
  // Dominó
  if (matchResult.endType === 'domino' && matchResult.closedByPlayer) {
    tokens += MATCH_REWARDS.DOMINO_BONUS.tokens;
  }
  
  // Capicúa
  if (matchResult.endType === 'capicua' && matchResult.closedByPlayer) {
    tokens += MATCH_REWARDS.CAPICUA_BONUS.tokens;
  }
  
  // Tranca ganada
  if (matchResult.endType === 'tranca' && matchResult.won) {
    tokens += 10;
  }
  
  // Perfect game (rival no anotó)
  if (matchResult.won && matchResult.opponentScore === 0) {
    tokens += MATCH_REWARDS.PERFECT_GAME.tokens;
  }
  
  // Comeback (remontar 30+ puntos)
  if (matchResult.won && matchResult.comeback) {
    tokens += MATCH_REWARDS.COMEBACK_BONUS.tokens;
  }
  
  // Bonus por racha (máximo 5 bonus)
  const streakBonus = Math.min(5, matchResult.winStreak || 0) * MATCH_REWARDS.STREAK_BONUS.tokens;
  tokens += streakBonus;
  
  // Primera victoria del día
  if (matchResult.isFirstWinOfDay && matchResult.won) {
    tokens += MATCH_REWARDS.FIRST_WIN_DAY.tokens;
  }
  
  return tokens;
};

/**
 * Calcular XP de pase de temporada por partida
 */
export const calculateSeasonXP = (matchResult) => {
  let xp = 50; // Base por completar partida
  
  // Victoria
  if (matchResult.won) {
    xp += 100;
  }
  
  // Primera victoria del día
  if (matchResult.isFirstWinOfDay && matchResult.won) {
    xp += 150;
  }
  
  // Dominó
  if (matchResult.endType === 'domino' && matchResult.closedByPlayer) {
    xp += 50;
  }
  
  return xp;
};

/**
 * Calcular nivel de pase de temporada
 */
export const calculateSeasonLevel = (totalXP) => {
  const level = Math.floor(totalXP / SEASON_PASS.xpPerTier);
  const currentLevelXP = totalXP % SEASON_PASS.xpPerTier;
  const progress = Math.round((currentLevelXP / SEASON_PASS.xpPerTier) * 100);
  
  return {
    level: Math.min(level, SEASON_PASS.tiers),
    currentXP: currentLevelXP,
    xpToNext: SEASON_PASS.xpPerTier - currentLevelXP,
    progress,
    isMaxLevel: level >= SEASON_PASS.tiers
  };
};

/**
 * Verificar si misión está completada
 */
export const checkMissionComplete = (mission, progress) => {
  return progress >= mission.target;
};

/**
 * Obtener progreso de misión como porcentaje
 */
export const getMissionProgress = (mission, progress) => {
  return Math.min(100, Math.round((progress / mission.target) * 100));
};

// ============================================================================
// EXPORTACIÓN
// ============================================================================

export default {
  CURRENCIES,
  MATCH_REWARDS,
  DAILY_LOGIN,
  DAILY_MISSIONS,
  SEASON_PASS,
  TOURNAMENTS,
  BUNDLES,
  formatPrice,
  calculateTokensEarned,
  calculateSeasonXP,
  calculateSeasonLevel,
  checkMissionComplete,
  getMissionProgress
};
