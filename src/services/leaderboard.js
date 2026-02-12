// ============================================================================
// SISTEMA DE LEADERBOARD (Generador Mock + Utilidades)
// ============================================================================
// Para datos reales de Firebase, usar firestore.js -> getLeaderboard()
// Este módulo genera datos mock para desarrollo/testing y utilidades
// ============================================================================

import { getRank } from '../constants/game';

// ============================================================================
// CONSTANTES
// ============================================================================

export const LEADERBOARD_TYPES = {
  GLOBAL: 'global',
  REGIONAL: 'regional',
  FRIENDS: 'friends',
  SEASON: 'season',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
};

export const REGIONS = [
  { id: 'latam', name: 'Latinoamérica', flag: '🌎' },
  { id: 'spain', name: 'España', flag: '🇪🇸' },
  { id: 'usa', name: 'Estados Unidos', flag: '🇺🇸' },
  { id: 'caribbean', name: 'Caribe', flag: '🏝️' },
  { id: 'europe', name: 'Europa', flag: '🇪🇺' },
  { id: 'asia', name: 'Asia', flag: '🌏' }
];

// Nombres realistas por región
export const NAMES_BY_REGION = {
  latam: ['DominoKing', 'LaFicha', 'ElMaster', 'DobleNueve', 'Trancador', 'ElPro', 'FichaLoca', 'ManoGanadora', 'ElCrack', 'Dominator', 'ElCampeón', 'LaLeyenda', 'ElGenio', 'DobleDoble', 'Estratega', 'ElInvicto', 'ManoFirme', 'ElMaestro', 'LaEstrella', 'ElTitán', 'Capicúa', 'ElDoble', 'FichaRápida', 'ElRey', 'LaReina', 'Pollona', 'ElPolvo', 'Cerrador', 'LaTrancada', 'ElSabio'],
  spain: ['DominoMadrid', 'TileMaster', 'LaFichaLoca', 'DobleSeisESP', 'Trancador_ES', 'MadrileñoPro', 'BCN_Domino', 'SevillanoTop', 'ValenciaKing', 'ZaragozaPro', 'GaliciaFicha', 'CatalunyaDom', 'AndaluzPro', 'VascoFicha', 'Madrileño99'],
  usa: ['TileStorm', 'DominoUSA', 'NYCPlayer', 'MiamiDomino', 'LAKing', 'TexasHold', 'ChicagoTile', 'BostonPro', 'SeattleDom', 'DenverKing', 'AtlantaPro', 'PhillyDom', 'PhoenixTile', 'SanDiegoPro', 'LasVegasAce'],
  caribbean: ['IslandKing', 'CaribePro', 'TropicalDom', 'HavanaTile', 'SanJuanPro', 'DominicanKing', 'CubanMaster', 'PRBoricua', 'JamaicaPro', 'BahamasTile', 'TrinidadDom', 'ArubaKing', 'CuracaoPro', 'IslaFicha', 'MarCaribe'],
  europe: ['EuroMaster', 'ParisianTile', 'BerlinDom', 'LondonKing', 'RomaPro', 'AmsterdamDom', 'BrusselsTile', 'ViennaPro', 'PragueDom', 'WarsawKing', 'LisbonPro', 'AthensDOM', 'StockholmTile', 'OsloPro', 'CopenhagenDom'],
  asia: ['TokyoTile', 'SeoulMaster', 'SingaporePro', 'HongKongDom', 'TaipeiKing', 'BangkokTile', 'ManilaDOM', 'JakartaPro', 'KualaLumpurDom', 'ShanghaiKing', 'BeijingPro', 'MumbaiTile', 'DelhiDOM', 'DubaiPro', 'AsiaKing']
};

// Avatares por región
export const AVATARS_BY_REGION = {
  latam: ['😎', '🧔', '👨', '👩', '🎭', '🌮', '⚽', '🎸', '🦜', '🌴'],
  spain: ['🇪🇸', '🐂', '🎨', '⚽', '🍷', '🏰', '💃', '🎸', '👨', '👩'],
  usa: ['🇺🇸', '🏈', '🗽', '🌟', '🎬', '🎸', '🤠', '🏀', '👨', '👩'],
  caribbean: ['🌴', '🏝️', '🌺', '🥥', '🦜', '☀️', '🌊', '🎺', '👨', '👩'],
  europe: ['🇪🇺', '🏰', '🎭', '⚽', '🍷', '🎨', '🎻', '📚', '👨', '👩'],
  asia: ['🌸', '🎎', '🐉', '🏯', '🍜', '🎋', '⛩️', '🧧', '👨', '👩']
};

// ============================================================================
// GENERADORES
// ============================================================================

/**
 * Generar jugador aleatorio para leaderboard (mock)
 */
export const generateMockPlayer = (rank, region = 'latam', baseRating = 2800) => {
  const names = NAMES_BY_REGION[region] || NAMES_BY_REGION.latam;
  const avatars = AVATARS_BY_REGION[region] || AVATARS_BY_REGION.latam;
  
  // Rating disminuye con el rank, con variación aleatoria
  const ratingVariance = Math.floor(Math.random() * 30);
  const rating = Math.max(1200, Math.round(baseRating - (rank - 1) * 25 - ratingVariance));
  
  // Estadísticas basadas en rating
  const skillFactor = rating / 2800;
  const totalGames = Math.floor(50 + Math.random() * 300);
  const winRate = Math.min(85, Math.max(45, 50 + skillFactor * 30 + (Math.random() - 0.5) * 10));
  const wins = Math.round(totalGames * winRate / 100);
  const losses = totalGames - wins;
  
  // Estadísticas adicionales
  const dominoes = Math.floor(wins * (0.3 + Math.random() * 0.2));
  const trancas = Math.floor(wins * (0.05 + Math.random() * 0.1));
  const avgScore = Math.round(15 + skillFactor * 10 + (Math.random() - 0.5) * 5);
  const winStreak = Math.floor(Math.random() * (rating > 2000 ? 15 : 8));
  const maxWinStreak = winStreak + Math.floor(Math.random() * 10);
  
  // Datos de temporada
  const seasonGames = Math.floor(totalGames * (0.3 + Math.random() * 0.3));
  const seasonWins = Math.round(seasonGames * winRate / 100);
  
  return {
    id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    rank,
    name: names[Math.floor(Math.random() * names.length)] + (rank > 15 ? Math.floor(Math.random() * 999) : ''),
    avatar: avatars[Math.floor(Math.random() * avatars.length)],
    rating,
    rankInfo: getRank(rating),
    region,
    wins,
    losses,
    winRate: Math.round(winRate),
    dominoes,
    trancas,
    avgScore,
    winStreak,
    maxWinStreak,
    seasonWins,
    seasonGames,
    seasonRank: rank + Math.floor(Math.random() * 10) - 5,
    lastActive: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
    isOnline: Math.random() > 0.7,
    isPlayer: false,
    isFriend: false
  };
};

/**
 * Generar leaderboard completo (mock)
 */
export const generateMockLeaderboard = (type, playerData = null, options = {}) => {
  const { region = 'latam', friendsList = [], limit: initialLimit = 100 } = options;
  const leaderboard = [];
  
  // Configurar según tipo
  let baseRating = 2800;
  let limit = initialLimit;
  
  if (type === LEADERBOARD_TYPES.WEEKLY) {
    baseRating = 2400;
  } else if (type === LEADERBOARD_TYPES.FRIENDS) {
    limit = Math.min(50, friendsList.length + 1);
  }
  
  // Generar jugadores mock
  for (let i = 0; i < limit; i++) {
    const player = generateMockPlayer(i + 1, region, baseRating);
    
    // Para lista de amigos, marcar algunos como amigos
    if (type === LEADERBOARD_TYPES.FRIENDS && i < friendsList.length) {
      player.isFriend = true;
      player.name = friendsList[i]?.name || player.name;
      player.avatar = friendsList[i]?.avatar || player.avatar;
    }
    
    leaderboard.push(player);
  }
  
  // Insertar al jugador real en su posición correcta
  if (playerData) {
    const playerRating = playerData.rating || 1500;
    let insertIndex = leaderboard.findIndex(p => p.rating < playerRating);
    if (insertIndex === -1) insertIndex = leaderboard.length;
    
    const playerEntry = {
      id: playerData.id || 'player_self',
      rank: insertIndex + 1,
      name: playerData.name || 'Tú',
      avatar: playerData.avatar || '😎',
      rating: playerRating,
      rankInfo: getRank(playerRating),
      region: playerData.region || region,
      wins: playerData.wins || 0,
      losses: playerData.losses || 0,
      winRate: playerData.wins ? Math.round((playerData.wins / (playerData.wins + (playerData.losses || 0))) * 100) : 0,
      dominoes: playerData.seasonDominoes || 0,
      trancas: playerData.seasonTrancas || 0,
      avgScore: playerData.avgScore || 0,
      winStreak: playerData.currentStreak || 0,
      maxWinStreak: playerData.maxStreak || 0,
      seasonWins: playerData.seasonWins || 0,
      seasonGames: (playerData.seasonWins || 0) + (playerData.seasonLosses || 0),
      seasonRank: insertIndex + 1,
      lastActive: Date.now(),
      isOnline: true,
      isPlayer: true,
      isFriend: false
    };
    
    leaderboard.splice(insertIndex, 0, playerEntry);
    
    // Actualizar ranks
    leaderboard.forEach((p, i) => {
      p.rank = i + 1;
      if (type === LEADERBOARD_TYPES.SEASON) {
        p.seasonRank = i + 1;
      }
    });
    
    // Limitar tamaño
    if (leaderboard.length > limit) {
      leaderboard.splice(limit);
    }
  }
  
  return leaderboard;
};

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Obtener jugadores cercanos al usuario
 */
export const getNearbyPlayers = (leaderboard, playerId, range = 5) => {
  const playerIndex = leaderboard.findIndex(p => p.isPlayer || p.id === playerId);
  if (playerIndex === -1) return leaderboard.slice(0, range * 2 + 1);
  
  const start = Math.max(0, playerIndex - range);
  const end = Math.min(leaderboard.length, playerIndex + range + 1);
  
  return leaderboard.slice(start, end);
};

/**
 * Obtener estadísticas del leaderboard
 */
export const getLeaderboardStats = (leaderboard) => {
  if (!leaderboard || leaderboard.length === 0) {
    return {
      playerRank: 0,
      totalPlayers: 0,
      percentile: 0,
      avgRating: 0,
      topTier: 0,
      activePlayers: 0
    };
  }
  
  const playerRank = leaderboard.find(p => p.isPlayer)?.rank || 0;
  const totalPlayers = leaderboard.length;
  const percentile = playerRank > 0 ? Math.round((1 - playerRank / totalPlayers) * 100) : 0;
  const avgRating = Math.round(leaderboard.reduce((sum, p) => sum + p.rating, 0) / totalPlayers);
  
  return {
    playerRank,
    totalPlayers,
    percentile,
    avgRating,
    topTier: leaderboard.filter(p => p.rankInfo?.tier === 'legend' || p.rankInfo?.tier === 'grandmaster').length,
    activePlayers: leaderboard.filter(p => p.isOnline).length
  };
};

/**
 * Obtener región por ID
 */
export const getRegionById = (regionId) => {
  return REGIONS.find(r => r.id === regionId) || REGIONS[0];
};

// ============================================================================
// EXPORTACIÓN AGRUPADA
// ============================================================================

export const Leaderboard = {
  TYPES: LEADERBOARD_TYPES,
  REGIONS,
  NAMES_BY_REGION,
  AVATARS_BY_REGION,
  generatePlayer: generateMockPlayer,
  generateLeaderboard: generateMockLeaderboard,
  getNearbyPlayers,
  getStats: getLeaderboardStats,
  getRegionById
};

export default Leaderboard;
