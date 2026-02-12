// ============================================================================
// DEFINICIONES DE LOGROS - Constantes y funciones de verificación
// ============================================================================
// Migrado de DominoR.jsx líneas 2916-3520

import { TIER_ORDER } from './cosmetics';

// Verificar si un tier cumple el requisito
const isTierUnlocked = (playerTier, requiredTier) => {
  if (!requiredTier) return true;
  if (!playerTier) return false;
  const playerIndex = TIER_ORDER.indexOf(playerTier);
  const requiredIndex = TIER_ORDER.indexOf(requiredTier);
  return playerIndex >= requiredIndex;
};

// ============================================================================
// LOGROS COMPLETOS
// ============================================================================
export const ACHIEVEMENTS = {
  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORÍA: PARTIDAS JUGADAS
  // ═══════════════════════════════════════════════════════════════════════════
  games_10: {
    id: 'games_10',
    name: 'Primeros Pasos',
    description: 'Juega 10 partidas',
    icon: '🎮',
    category: 'games',
    requirement: { type: 'games_played', value: 10 },
    reward: { tokens: 50 },
    rarity: 'common'
  },
  games_50: {
    id: 'games_50',
    name: 'Jugador Activo',
    description: 'Juega 50 partidas',
    icon: '🎮',
    category: 'games',
    requirement: { type: 'games_played', value: 50 },
    reward: { tokens: 100 },
    rarity: 'common'
  },
  games_100: {
    id: 'games_100',
    name: 'Veterano',
    description: 'Juega 100 partidas',
    icon: '🎖️',
    category: 'games',
    requirement: { type: 'games_played', value: 100 },
    reward: { tokens: 200, coins: 10 },
    rarity: 'rare'
  },
  games_500: {
    id: 'games_500',
    name: 'Adicto al Dominó',
    description: 'Juega 500 partidas',
    icon: '🏅',
    category: 'games',
    requirement: { type: 'games_played', value: 500 },
    reward: { tokens: 500, coins: 50 },
    rarity: 'epic'
  },
  games_1000: {
    id: 'games_1000',
    name: 'Leyenda Viviente',
    description: 'Juega 1000 partidas',
    icon: '👑',
    category: 'games',
    requirement: { type: 'games_played', value: 1000 },
    reward: { tokens: 1000, coins: 100, title: 'leyenda_viva' },
    rarity: 'legendary'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORÍA: VICTORIAS
  // ═══════════════════════════════════════════════════════════════════════════
  wins_10: {
    id: 'wins_10',
    name: 'Primera Sangre',
    description: 'Gana 10 partidas',
    icon: '🏆',
    category: 'wins',
    requirement: { type: 'wins', value: 10 },
    reward: { tokens: 75 },
    rarity: 'common'
  },
  wins_50: {
    id: 'wins_50',
    name: 'Ganador Serial',
    description: 'Gana 50 partidas',
    icon: '🏆',
    category: 'wins',
    requirement: { type: 'wins', value: 50 },
    reward: { tokens: 150 },
    rarity: 'rare'
  },
  wins_100: {
    id: 'wins_100',
    name: 'Centenario',
    description: 'Gana 100 partidas',
    icon: '💯',
    category: 'wins',
    requirement: { type: 'wins', value: 100 },
    reward: { tokens: 300, coins: 25 },
    rarity: 'rare'
  },
  wins_250: {
    id: 'wins_250',
    name: 'Conquistador',
    description: 'Gana 250 partidas',
    icon: '⚔️',
    category: 'wins',
    requirement: { type: 'wins', value: 250 },
    reward: { tokens: 500, coins: 50 },
    rarity: 'epic'
  },
  wins_500: {
    id: 'wins_500',
    name: 'Invicto',
    description: 'Gana 500 partidas',
    icon: '🎯',
    category: 'wins',
    requirement: { type: 'wins', value: 500 },
    reward: { tokens: 1000, coins: 100, title: 'invencible' },
    rarity: 'legendary'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORÍA: RACHAS DE VICTORIAS
  // ═══════════════════════════════════════════════════════════════════════════
  streak_3: {
    id: 'streak_3',
    name: 'En Racha',
    description: 'Gana 3 partidas seguidas',
    icon: '🔥',
    category: 'streak',
    requirement: { type: 'win_streak', value: 3 },
    reward: { tokens: 50 },
    rarity: 'common'
  },
  streak_5: {
    id: 'streak_5',
    name: 'Imparable',
    description: 'Gana 5 partidas seguidas',
    icon: '🔥',
    category: 'streak',
    requirement: { type: 'win_streak', value: 5 },
    reward: { tokens: 100 },
    rarity: 'rare'
  },
  streak_10: {
    id: 'streak_10',
    name: 'En Llamas',
    description: 'Gana 10 partidas seguidas',
    icon: '💥',
    category: 'streak',
    requirement: { type: 'win_streak', value: 10 },
    reward: { tokens: 250, coins: 25 },
    rarity: 'epic'
  },
  streak_20: {
    id: 'streak_20',
    name: 'Intratable',
    description: 'Gana 20 partidas seguidas',
    icon: '☄️',
    category: 'streak',
    requirement: { type: 'win_streak', value: 20 },
    reward: { tokens: 500, coins: 50 },
    rarity: 'legendary'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORÍA: DOMINÓ Y CAPICÚA
  // ═══════════════════════════════════════════════════════════════════════════
  domino_first: {
    id: 'domino_first',
    name: '¡Dominó!',
    description: 'Gana tu primera partida con dominó',
    icon: '🀄',
    category: 'domino',
    requirement: { type: 'domino_wins', value: 1 },
    reward: { tokens: 30 },
    rarity: 'common'
  },
  domino_10: {
    id: 'domino_10',
    name: 'Dominador',
    description: 'Gana 10 partidas con dominó',
    icon: '🀄',
    category: 'domino',
    requirement: { type: 'domino_wins', value: 10 },
    reward: { tokens: 100 },
    rarity: 'rare'
  },
  domino_50: {
    id: 'domino_50',
    name: 'Maestro del Dominó',
    description: 'Gana 50 partidas con dominó',
    icon: '🎴',
    category: 'domino',
    requirement: { type: 'domino_wins', value: 50 },
    reward: { tokens: 300, coins: 30 },
    rarity: 'epic'
  },
  capicua_first: {
    id: 'capicua_first',
    name: '¡Capicúa!',
    description: 'Gana tu primera partida con capicúa',
    icon: '🌟',
    category: 'domino',
    requirement: { type: 'capicua_wins', value: 1 },
    reward: { tokens: 50 },
    rarity: 'rare'
  },
  capicua_10: {
    id: 'capicua_10',
    name: 'Capicuero',
    description: 'Gana 10 partidas con capicúa',
    icon: '⭐',
    category: 'domino',
    requirement: { type: 'capicua_wins', value: 10 },
    reward: { tokens: 200, coins: 20 },
    rarity: 'epic'
  },
  capicua_25: {
    id: 'capicua_25',
    name: 'Rey de la Capicúa',
    description: 'Gana 25 partidas con capicúa',
    icon: '💫',
    category: 'domino',
    requirement: { type: 'capicua_wins', value: 25 },
    reward: { tokens: 500, coins: 50 },
    rarity: 'legendary'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORÍA: PUNTUACIÓN
  // ═══════════════════════════════════════════════════════════════════════════
  points_100: {
    id: 'points_100',
    name: 'Triple Dígitos',
    description: 'Alcanza 100 puntos en una partida',
    icon: '💯',
    category: 'points',
    requirement: { type: 'max_points_game', value: 100 },
    reward: { tokens: 50 },
    rarity: 'common'
  },
  points_150: {
    id: 'points_150',
    name: 'Aplastante',
    description: 'Alcanza 150 puntos en una partida',
    icon: '🎯',
    category: 'points',
    requirement: { type: 'max_points_game', value: 150 },
    reward: { tokens: 100, coins: 10 },
    rarity: 'rare'
  },
  points_200: {
    id: 'points_200',
    name: 'Demoledor',
    description: 'Alcanza 200 puntos en una partida',
    icon: '💪',
    category: 'points',
    requirement: { type: 'max_points_game', value: 200 },
    reward: { tokens: 200, coins: 25 },
    rarity: 'epic'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORÍA: RANGOS
  // ═══════════════════════════════════════════════════════════════════════════
  rank_silver: {
    id: 'rank_silver',
    name: 'Plata Alcanzada',
    description: 'Alcanza el rango Plata',
    icon: '🥈',
    category: 'rank',
    requirement: { type: 'rank_tier', value: 'silver' },
    reward: { tokens: 100 },
    rarity: 'common'
  },
  rank_gold: {
    id: 'rank_gold',
    name: 'Oro Alcanzado',
    description: 'Alcanza el rango Oro',
    icon: '🥇',
    category: 'rank',
    requirement: { type: 'rank_tier', value: 'gold' },
    reward: { tokens: 200, coins: 20 },
    rarity: 'rare'
  },
  rank_platinum: {
    id: 'rank_platinum',
    name: 'Platino Alcanzado',
    description: 'Alcanza el rango Platino',
    icon: '💎',
    category: 'rank',
    requirement: { type: 'rank_tier', value: 'platinum' },
    reward: { tokens: 300, coins: 30 },
    rarity: 'rare'
  },
  rank_diamond: {
    id: 'rank_diamond',
    name: 'Diamante Alcanzado',
    description: 'Alcanza el rango Diamante',
    icon: '💠',
    category: 'rank',
    requirement: { type: 'rank_tier', value: 'diamond' },
    reward: { tokens: 500, coins: 50 },
    rarity: 'epic'
  },
  rank_master: {
    id: 'rank_master',
    name: 'Maestro Alcanzado',
    description: 'Alcanza el rango Maestro',
    icon: '👑',
    category: 'rank',
    requirement: { type: 'rank_tier', value: 'master' },
    reward: { tokens: 750, coins: 75 },
    rarity: 'epic'
  },
  rank_grandmaster: {
    id: 'rank_grandmaster',
    name: 'Gran Maestro',
    description: 'Alcanza el rango Gran Maestro',
    icon: '🏆',
    category: 'rank',
    requirement: { type: 'rank_tier', value: 'grandmaster' },
    reward: { tokens: 1000, coins: 100 },
    rarity: 'legendary'
  },
  rank_legend: {
    id: 'rank_legend',
    name: 'Leyenda',
    description: 'Alcanza el rango Leyenda',
    icon: '⭐',
    category: 'rank',
    requirement: { type: 'rank_tier', value: 'legend' },
    reward: { tokens: 2000, coins: 200, title: 'dios_domino' },
    rarity: 'legendary'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORÍA: TRANCAS
  // ═══════════════════════════════════════════════════════════════════════════
  tranca_first: {
    id: 'tranca_first',
    name: 'Primera Tranca',
    description: 'Gana tu primera partida por tranca',
    icon: '🔒',
    category: 'tranca',
    requirement: { type: 'tranca_wins', value: 1 },
    reward: { tokens: 30 },
    rarity: 'common'
  },
  tranca_10: {
    id: 'tranca_10',
    name: 'Trancador',
    description: 'Gana 10 partidas por tranca',
    icon: '🔐',
    category: 'tranca',
    requirement: { type: 'tranca_wins', value: 10 },
    reward: { tokens: 100 },
    rarity: 'rare'
  },
  tranca_survive: {
    id: 'tranca_survive',
    name: 'Superviviente',
    description: 'Gana una partida por tranca teniendo menos puntos',
    icon: '🛡️',
    category: 'tranca',
    requirement: { type: 'tranca_comeback', value: 1 },
    reward: { tokens: 150, coins: 15 },
    rarity: 'epic'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORÍA: ESPECIALES
  // ═══════════════════════════════════════════════════════════════════════════
  perfect_game: {
    id: 'perfect_game',
    name: 'Partida Perfecta',
    description: 'Gana una partida sin que el rival anote',
    icon: '✨',
    category: 'special',
    requirement: { type: 'perfect_game', value: 1 },
    reward: { tokens: 200, coins: 20 },
    rarity: 'epic'
  },
  comeback_king: {
    id: 'comeback_king',
    name: 'Rey del Comeback',
    description: 'Gana estando 50+ puntos abajo',
    icon: '👑',
    category: 'special',
    requirement: { type: 'comeback_50', value: 1 },
    reward: { tokens: 250, coins: 25 },
    rarity: 'epic'
  },
  speed_demon: {
    id: 'speed_demon',
    name: 'Velocista',
    description: 'Gana una partida en menos de 3 minutos',
    icon: '⚡',
    category: 'special',
    requirement: { type: 'fast_win', value: 1 },
    reward: { tokens: 100 },
    rarity: 'rare'
  },
  double_starter: {
    id: 'double_starter',
    name: 'Doble o Nada',
    description: 'Empieza 10 rondas con el doble 9',
    icon: '9️⃣',
    category: 'special',
    requirement: { type: 'double9_starts', value: 10 },
    reward: { tokens: 75 },
    rarity: 'common'
  },
  all_doubles: {
    id: 'all_doubles',
    name: 'Mano de Dobles',
    description: 'Ten 4+ dobles en tu mano inicial',
    icon: '🎰',
    category: 'special',
    requirement: { type: 'four_doubles_hand', value: 1 },
    reward: { tokens: 100 },
    rarity: 'rare'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORÍA: SOCIAL
  // ═══════════════════════════════════════════════════════════════════════════
  emote_10: {
    id: 'emote_10',
    name: 'Expresivo',
    description: 'Envía 10 emotes',
    icon: '😄',
    category: 'social',
    requirement: { type: 'emotes_sent', value: 10 },
    reward: { tokens: 25 },
    rarity: 'common'
  },
  emote_100: {
    id: 'emote_100',
    name: 'Comunicador',
    description: 'Envía 100 emotes',
    icon: '🗣️',
    category: 'social',
    requirement: { type: 'emotes_sent', value: 100 },
    reward: { tokens: 75 },
    rarity: 'rare'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORÍA: COLECCIÓN
  // ═══════════════════════════════════════════════════════════════════════════
  collector_5: {
    id: 'collector_5',
    name: 'Coleccionista',
    description: 'Desbloquea 5 items de la tienda',
    icon: '🛍️',
    category: 'collection',
    requirement: { type: 'items_owned', value: 5 },
    reward: { tokens: 50 },
    rarity: 'common'
  },
  collector_15: {
    id: 'collector_15',
    name: 'Acumulador',
    description: 'Desbloquea 15 items de la tienda',
    icon: '🎁',
    category: 'collection',
    requirement: { type: 'items_owned', value: 15 },
    reward: { tokens: 150, coins: 15 },
    rarity: 'rare'
  },
  collector_30: {
    id: 'collector_30',
    name: 'Magnate',
    description: 'Desbloquea 30 items de la tienda',
    icon: '💰',
    category: 'collection',
    requirement: { type: 'items_owned', value: 30 },
    reward: { tokens: 300, coins: 30 },
    rarity: 'epic'
  }
};

// ============================================================================
// CATEGORÍAS DE LOGROS
// ============================================================================
export const ACHIEVEMENT_CATEGORIES = {
  games: { name: 'Partidas', icon: '🎮', color: '#60A5FA' },
  wins: { name: 'Victorias', icon: '🏆', color: '#FBBF24' },
  streak: { name: 'Rachas', icon: '🔥', color: '#F97316' },
  domino: { name: 'Dominó', icon: '🀄', color: '#A855F7' },
  points: { name: 'Puntos', icon: '💯', color: '#EC4899' },
  rank: { name: 'Rangos', icon: '🎖️', color: '#10B981' },
  tranca: { name: 'Trancas', icon: '🔒', color: '#6366F1' },
  special: { name: 'Especiales', icon: '⭐', color: '#EF4444' },
  social: { name: 'Social', icon: '💬', color: '#14B8A6' },
  collection: { name: 'Colección', icon: '🎁', color: '#8B5CF6' }
};

// ============================================================================
// COLORES DE RAREZA
// ============================================================================
export const ACHIEVEMENT_RARITY = {
  common: { name: 'Común', color: '#9CA3AF', bg: 'rgba(156, 163, 175, 0.2)' },
  rare: { name: 'Raro', color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.2)' },
  epic: { name: 'Épico', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.2)' },
  legendary: { name: 'Legendario', color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.2)' }
};

// ============================================================================
// FUNCIONES DE VERIFICACIÓN
// ============================================================================

/**
 * Verifica si un logro está desbloqueado
 */
export const checkAchievement = (achievement, playerStats) => {
  const req = achievement.requirement;
  
  switch (req.type) {
    case 'games_played':
      return (playerStats.gamesPlayed || 0) >= req.value;
    case 'wins':
      return (playerStats.wins || 0) >= req.value;
    case 'win_streak':
      return (playerStats.maxWinStreak || 0) >= req.value;
    case 'domino_wins':
      return (playerStats.dominoWins || 0) >= req.value;
    case 'capicua_wins':
      return (playerStats.capicuaWins || 0) >= req.value;
    case 'max_points_game':
      return (playerStats.maxPointsInGame || 0) >= req.value;
    case 'rank_tier':
      return isTierUnlocked(playerStats.currentTier, req.value);
    case 'tranca_wins':
      return (playerStats.trancaWins || 0) >= req.value;
    case 'tranca_comeback':
      return (playerStats.trancaComebacks || 0) >= req.value;
    case 'perfect_game':
      return (playerStats.perfectGames || 0) >= req.value;
    case 'comeback_50':
      return (playerStats.bigComebacks || 0) >= req.value;
    case 'fast_win':
      return (playerStats.fastWins || 0) >= req.value;
    case 'double9_starts':
      return (playerStats.double9Starts || 0) >= req.value;
    case 'four_doubles_hand':
      return (playerStats.fourDoublesHands || 0) >= req.value;
    case 'emotes_sent':
      return (playerStats.emotesSent || 0) >= req.value;
    case 'items_owned':
      return (playerStats.itemsOwned || 0) >= req.value;
    default:
      return false;
  }
};

/**
 * Obtiene el progreso de un logro (0-100%)
 */
export const getAchievementProgress = (achievement, playerStats) => {
  const req = achievement.requirement;
  let current = 0;
  
  switch (req.type) {
    case 'games_played': current = playerStats.gamesPlayed || 0; break;
    case 'wins': current = playerStats.wins || 0; break;
    case 'win_streak': current = playerStats.maxWinStreak || 0; break;
    case 'domino_wins': current = playerStats.dominoWins || 0; break;
    case 'capicua_wins': current = playerStats.capicuaWins || 0; break;
    case 'max_points_game': current = playerStats.maxPointsInGame || 0; break;
    case 'tranca_wins': current = playerStats.trancaWins || 0; break;
    case 'tranca_comeback': current = playerStats.trancaComebacks || 0; break;
    case 'perfect_game': current = playerStats.perfectGames || 0; break;
    case 'comeback_50': current = playerStats.bigComebacks || 0; break;
    case 'fast_win': current = playerStats.fastWins || 0; break;
    case 'double9_starts': current = playerStats.double9Starts || 0; break;
    case 'four_doubles_hand': current = playerStats.fourDoublesHands || 0; break;
    case 'emotes_sent': current = playerStats.emotesSent || 0; break;
    case 'items_owned': current = playerStats.itemsOwned || 0; break;
    case 'rank_tier':
      return isTierUnlocked(playerStats.currentTier, req.value) ? 100 : 0;
    default: return 0;
  }
  
  return Math.min(100, Math.round((current / req.value) * 100));
};

/**
 * Obtiene valor actual y objetivo de un logro
 */
export const getAchievementValues = (achievement, playerStats) => {
  const req = achievement.requirement;
  let current = 0;
  
  switch (req.type) {
    case 'games_played': current = playerStats.gamesPlayed || 0; break;
    case 'wins': current = playerStats.wins || 0; break;
    case 'win_streak': current = playerStats.maxWinStreak || 0; break;
    case 'domino_wins': current = playerStats.dominoWins || 0; break;
    case 'capicua_wins': current = playerStats.capicuaWins || 0; break;
    case 'max_points_game': current = playerStats.maxPointsInGame || 0; break;
    case 'tranca_wins': current = playerStats.trancaWins || 0; break;
    case 'tranca_comeback': current = playerStats.trancaComebacks || 0; break;
    case 'perfect_game': current = playerStats.perfectGames || 0; break;
    case 'comeback_50': current = playerStats.bigComebacks || 0; break;
    case 'fast_win': current = playerStats.fastWins || 0; break;
    case 'double9_starts': current = playerStats.double9Starts || 0; break;
    case 'four_doubles_hand': current = playerStats.fourDoublesHands || 0; break;
    case 'emotes_sent': current = playerStats.emotesSent || 0; break;
    case 'items_owned': current = playerStats.itemsOwned || 0; break;
    case 'rank_tier':
      return { current: playerStats.currentTier || 'bronze', target: req.value };
    default: 
      return { current: 0, target: req.value };
  }
  
  return { current, target: req.value };
};

/**
 * Obtener logros por categoría
 */
export const getAchievementsByCategory = (category) => {
  return Object.values(ACHIEVEMENTS).filter(a => a.category === category);
};

/**
 * Obtener todos los logros desbloqueados
 */
export const getUnlockedAchievements = (playerStats) => {
  return Object.values(ACHIEVEMENTS).filter(a => checkAchievement(a, playerStats));
};

/**
 * Obtener resumen de logros
 */
export const getAchievementsSummary = (playerStats) => {
  const all = Object.values(ACHIEVEMENTS);
  const unlocked = all.filter(a => checkAchievement(a, playerStats));
  
  return {
    total: all.length,
    unlocked: unlocked.length,
    percentage: Math.round((unlocked.length / all.length) * 100),
    byCategory: Object.keys(ACHIEVEMENT_CATEGORIES).map(cat => ({
      category: cat,
      ...ACHIEVEMENT_CATEGORIES[cat],
      total: all.filter(a => a.category === cat).length,
      unlocked: unlocked.filter(a => a.category === cat).length
    }))
  };
};

// Lista de IDs para referencia rápida
export const ACHIEVEMENT_IDS = Object.keys(ACHIEVEMENTS);
