// ============================================================================
// SERVICIO DE ACHIEVEMENTS - FIREBASE
// ============================================================================
// Sistema completo de logros sincronizado con Firestore

import { 
  doc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firestore';

// ============================================================================
// DEFINICIÓN DE LOGROS
// ============================================================================

export const ACHIEVEMENTS = {
  // ═══════════════════════════════════════════════════════════════════════════
  // PARTIDAS JUGADAS
  // ═══════════════════════════════════════════════════════════════════════════
  first_game: {
    id: 'first_game',
    category: 'games',
    name: 'Principiante',
    description: 'Juega tu primera partida',
    icon: '🎮',
    target: 1,
    stat: 'gamesPlayed',
    reward: { tokens: 50, xp: 25 }
  },
  games_10: {
    id: 'games_10',
    category: 'games',
    name: 'Aficionado',
    description: 'Juega 10 partidas',
    icon: '🎮',
    target: 10,
    stat: 'gamesPlayed',
    reward: { tokens: 100, xp: 50 }
  },
  games_50: {
    id: 'games_50',
    category: 'games',
    name: 'Habitual',
    description: 'Juega 50 partidas',
    icon: '🎮',
    target: 50,
    stat: 'gamesPlayed',
    reward: { tokens: 250, xp: 100 }
  },
  games_100: {
    id: 'games_100',
    category: 'games',
    name: 'Veterano',
    description: 'Juega 100 partidas',
    icon: '🎮',
    target: 100,
    stat: 'gamesPlayed',
    reward: { tokens: 500, xp: 200, title: 'Veterano' }
  },
  games_500: {
    id: 'games_500',
    category: 'games',
    name: 'Leyenda Viviente',
    description: 'Juega 500 partidas',
    icon: '🎮',
    target: 500,
    stat: 'gamesPlayed',
    reward: { tokens: 2000, coins: 100, xp: 500, title: 'Leyenda' }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VICTORIAS
  // ═══════════════════════════════════════════════════════════════════════════
  first_win: {
    id: 'first_win',
    category: 'wins',
    name: 'Primera Victoria',
    description: 'Gana tu primera partida',
    icon: '🏆',
    target: 1,
    stat: 'wins',
    reward: { tokens: 100, xp: 50 }
  },
  wins_10: {
    id: 'wins_10',
    category: 'wins',
    name: 'Ganador',
    description: 'Gana 10 partidas',
    icon: '🏆',
    target: 10,
    stat: 'wins',
    reward: { tokens: 200, xp: 100 }
  },
  wins_50: {
    id: 'wins_50',
    category: 'wins',
    name: 'Campeón',
    description: 'Gana 50 partidas',
    icon: '🏆',
    target: 50,
    stat: 'wins',
    reward: { tokens: 500, xp: 250 }
  },
  wins_100: {
    id: 'wins_100',
    category: 'wins',
    name: 'Maestro',
    description: 'Gana 100 partidas',
    icon: '🏆',
    target: 100,
    stat: 'wins',
    reward: { tokens: 1000, xp: 500, title: 'Maestro' }
  },
  wins_250: {
    id: 'wins_250',
    category: 'wins',
    name: 'Gran Maestro',
    description: 'Gana 250 partidas',
    icon: '🏆',
    target: 250,
    stat: 'wins',
    reward: { tokens: 2500, coins: 150, xp: 1000, title: 'Gran Maestro' }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RACHAS
  // ═══════════════════════════════════════════════════════════════════════════
  streak_3: {
    id: 'streak_3',
    category: 'streaks',
    name: 'Racha',
    description: 'Gana 3 partidas seguidas',
    icon: '🔥',
    target: 3,
    stat: 'maxWinStreak',
    reward: { tokens: 150, xp: 75 }
  },
  streak_5: {
    id: 'streak_5',
    category: 'streaks',
    name: 'En Llamas',
    description: 'Gana 5 partidas seguidas',
    icon: '🔥',
    target: 5,
    stat: 'maxWinStreak',
    reward: { tokens: 300, xp: 150 }
  },
  streak_10: {
    id: 'streak_10',
    category: 'streaks',
    name: 'Imparable',
    description: 'Gana 10 partidas seguidas',
    icon: '🔥',
    target: 10,
    stat: 'maxWinStreak',
    reward: { tokens: 750, xp: 300, title: 'Imparable' }
  },
  streak_20: {
    id: 'streak_20',
    category: 'streaks',
    name: 'Invencible',
    description: 'Gana 20 partidas seguidas',
    icon: '🔥',
    target: 20,
    stat: 'maxWinStreak',
    reward: { tokens: 2000, coins: 100, xp: 750, title: 'Invencible' }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DOMINÓS
  // ═══════════════════════════════════════════════════════════════════════════
  domino_first: {
    id: 'domino_first',
    category: 'dominoes',
    name: 'Primer Dominó',
    description: 'Gana con dominó por primera vez',
    icon: '🎯',
    target: 1,
    stat: 'dominoes',
    reward: { tokens: 75, xp: 35 }
  },
  domino_10: {
    id: 'domino_10',
    category: 'dominoes',
    name: 'Dominador',
    description: 'Gana 10 veces con dominó',
    icon: '🎯',
    target: 10,
    stat: 'dominoes',
    reward: { tokens: 200, xp: 100 }
  },
  domino_50: {
    id: 'domino_50',
    category: 'dominoes',
    name: 'Experto en Dominó',
    description: 'Gana 50 veces con dominó',
    icon: '🎯',
    target: 50,
    stat: 'dominoes',
    reward: { tokens: 500, xp: 250 }
  },
  domino_100: {
    id: 'domino_100',
    category: 'dominoes',
    name: 'Perfeccionista',
    description: 'Gana 100 veces con dominó',
    icon: '🎯',
    target: 100,
    stat: 'dominoes',
    reward: { tokens: 1000, xp: 500, title: 'Perfeccionista' }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TRANCAS
  // ═══════════════════════════════════════════════════════════════════════════
  tranca_first: {
    id: 'tranca_first',
    category: 'trancas',
    name: 'Primera Tranca',
    description: 'Gana por tranca por primera vez',
    icon: '🔒',
    target: 1,
    stat: 'trancas',
    reward: { tokens: 100, xp: 50 }
  },
  tranca_10: {
    id: 'tranca_10',
    category: 'trancas',
    name: 'Bloqueador',
    description: 'Gana 10 veces por tranca',
    icon: '🔒',
    target: 10,
    stat: 'trancas',
    reward: { tokens: 250, xp: 125 }
  },
  tranca_50: {
    id: 'tranca_50',
    category: 'trancas',
    name: 'Estratega',
    description: 'Gana 50 veces por tranca',
    icon: '🔒',
    target: 50,
    stat: 'trancas',
    reward: { tokens: 750, xp: 350, title: 'Estratega' }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RANGOS
  // ═══════════════════════════════════════════════════════════════════════════
  rank_silver: {
    id: 'rank_silver',
    category: 'ranks',
    name: 'Plata Alcanzada',
    description: 'Alcanza el rango Plata',
    icon: '🥈',
    target: 1200,
    stat: 'rating',
    type: 'threshold',
    reward: { tokens: 200, xp: 100 }
  },
  rank_gold: {
    id: 'rank_gold',
    category: 'ranks',
    name: 'Oro Alcanzado',
    description: 'Alcanza el rango Oro',
    icon: '🥇',
    target: 1500,
    stat: 'rating',
    type: 'threshold',
    reward: { tokens: 500, xp: 250 }
  },
  rank_platinum: {
    id: 'rank_platinum',
    category: 'ranks',
    name: 'Platino Alcanzado',
    description: 'Alcanza el rango Platino',
    icon: '💎',
    target: 1800,
    stat: 'rating',
    type: 'threshold',
    reward: { tokens: 1000, xp: 500 }
  },
  rank_diamond: {
    id: 'rank_diamond',
    category: 'ranks',
    name: 'Diamante Alcanzado',
    description: 'Alcanza el rango Diamante',
    icon: '💠',
    target: 2100,
    stat: 'rating',
    type: 'threshold',
    reward: { tokens: 2000, coins: 100, xp: 1000 }
  },
  rank_master: {
    id: 'rank_master',
    category: 'ranks',
    name: 'Maestro Alcanzado',
    description: 'Alcanza el rango Maestro',
    icon: '👑',
    target: 2400,
    stat: 'rating',
    type: 'threshold',
    reward: { tokens: 5000, coins: 250, xp: 2000, title: 'Maestro Supremo' }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ESPECIALES
  // ═══════════════════════════════════════════════════════════════════════════
  capicua_first: {
    id: 'capicua_first',
    category: 'special',
    name: 'Capicúa',
    description: 'Gana con capicúa por primera vez',
    icon: '✨',
    target: 1,
    stat: 'capicuas',
    reward: { tokens: 150, xp: 75 }
  },
  capicua_10: {
    id: 'capicua_10',
    category: 'special',
    name: 'Especialista en Capicúa',
    description: 'Gana 10 capicúas',
    icon: '✨',
    target: 10,
    stat: 'capicuas',
    reward: { tokens: 500, xp: 250 }
  },
  pollona_first: {
    id: 'pollona_first',
    category: 'special',
    name: 'Pollona',
    description: 'Gana una pollona (200-0)',
    icon: '🐔',
    target: 1,
    stat: 'pollonas',
    reward: { tokens: 300, xp: 150 }
  },
  pollona_5: {
    id: 'pollona_5',
    category: 'special',
    name: 'Aplastador',
    description: 'Gana 5 pollonas',
    icon: '🐔',
    target: 5,
    stat: 'pollonas',
    reward: { tokens: 1000, xp: 500, title: 'Aplastador' }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SOCIAL
  // ═══════════════════════════════════════════════════════════════════════════
  friend_first: {
    id: 'friend_first',
    category: 'social',
    name: 'Amistoso',
    description: 'Añade tu primer amigo',
    icon: '👥',
    target: 1,
    stat: 'friendsCount',
    reward: { tokens: 50, xp: 25 }
  },
  friends_10: {
    id: 'friends_10',
    category: 'social',
    name: 'Popular',
    description: 'Ten 10 amigos',
    icon: '👥',
    target: 10,
    stat: 'friendsCount',
    reward: { tokens: 200, xp: 100 }
  },
  friends_50: {
    id: 'friends_50',
    category: 'social',
    name: 'Influencer',
    description: 'Ten 50 amigos',
    icon: '👥',
    target: 50,
    stat: 'friendsCount',
    reward: { tokens: 500, xp: 250, title: 'Influencer' }
  }
};

// Lista de todos los IDs de logros
export const ACHIEVEMENT_IDS = Object.keys(ACHIEVEMENTS);

// Categorías de logros
export const ACHIEVEMENT_CATEGORIES = [
  { id: 'all', name: 'Todos', icon: '📋' },
  { id: 'games', name: 'Partidas', icon: '🎮' },
  { id: 'wins', name: 'Victorias', icon: '🏆' },
  { id: 'streaks', name: 'Rachas', icon: '🔥' },
  { id: 'dominoes', name: 'Dominós', icon: '🎯' },
  { id: 'trancas', name: 'Trancas', icon: '🔒' },
  { id: 'ranks', name: 'Rangos', icon: '👑' },
  { id: 'special', name: 'Especiales', icon: '✨' },
  { id: 'social', name: 'Social', icon: '👥' }
];

// ============================================================================
// FUNCIONES DE ACHIEVEMENTS
// ============================================================================

/**
 * Obtener el progreso de un logro específico basado en las stats del usuario
 */
export const getAchievementProgress = (achievement, stats, rating) => {
  if (achievement.type === 'threshold') {
    // Para logros de umbral (ej: alcanzar rating)
    return rating || 0;
  }
  
  // Para logros basados en stats
  return stats?.[achievement.stat] || 0;
};

/**
 * Verificar si un logro está completado
 */
export const isAchievementCompleted = (achievement, stats, rating) => {
  const progress = getAchievementProgress(achievement, stats, rating);
  return progress >= achievement.target;
};

/**
 * Obtener todos los logros con su estado para un usuario
 */
export const getUserAchievements = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return { achievements: [], stats: {}, rating: 1500, claimedAchievements: [] };
    }
    
    const userData = userSnap.data();
    const stats = userData.stats || {};
    const rating = userData.rating || 1500;
    const claimedAchievements = userData.achievements || [];
    const friendsCount = userData.friends?.length || 0;
    
    // Agregar friendsCount a stats para logros sociales
    const enrichedStats = { ...stats, friendsCount };
    
    // Mapear todos los logros con su estado
    const achievementsWithStatus = Object.values(ACHIEVEMENTS).map(achievement => {
      const progress = getAchievementProgress(achievement, enrichedStats, rating);
      const completed = progress >= achievement.target;
      const claimed = claimedAchievements.includes(achievement.id);
      
      return {
        ...achievement,
        progress,
        completed,
        claimed,
        percentage: Math.min(100, (progress / achievement.target) * 100)
      };
    });
    
    return {
      achievements: achievementsWithStatus,
      stats: enrichedStats,
      rating,
      claimedAchievements
    };
  } catch (error) {
    console.error('[Achievements] Error getUserAchievements:', error);
    throw error;
  }
};

/**
 * Reclamar recompensa de un logro completado
 */
export const claimAchievementReward = async (userId, achievementId) => {
  try {
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) {
      return { success: false, error: 'Logro no encontrado' };
    }
    
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return { success: false, error: 'Usuario no encontrado' };
    }
    
    const userData = userSnap.data();
    const stats = userData.stats || {};
    const rating = userData.rating || 1500;
    const friendsCount = userData.friends?.length || 0;
    const enrichedStats = { ...stats, friendsCount };
    
    // Verificar si ya está reclamado
    if (userData.achievements?.includes(achievementId)) {
      return { success: false, error: 'Ya reclamaste este logro' };
    }
    
    // Verificar si está completado
    if (!isAchievementCompleted(achievement, enrichedStats, rating)) {
      return { success: false, error: 'Logro no completado' };
    }
    
    // Preparar actualizaciones
    const updates = {
      achievements: arrayUnion(achievementId),
      lastAchievement: {
        id: achievementId,
        name: achievement.name,
        icon: achievement.icon,
        claimedAt: serverTimestamp()
      }
    };
    
    // Agregar recompensas
    const { reward } = achievement;
    if (reward.tokens) {
      updates.tokens = increment(reward.tokens);
    }
    if (reward.coins) {
      updates.coins = increment(reward.coins);
    }
    if (reward.xp) {
      updates.experience = increment(reward.xp);
    }
    if (reward.title) {
      updates.inventory = arrayUnion(`title_${achievementId}`);
    }
    
    await updateDoc(userRef, updates);
    
    console.log(`[Achievements] ✅ Logro reclamado: ${achievement.name}`);
    
    return {
      success: true,
      reward: achievement.reward,
      achievement: achievement
    };
  } catch (error) {
    console.error('[Achievements] Error claimAchievementReward:', error);
    return { success: false, error: 'Error de servidor' };
  }
};

/**
 * Verificar y desbloquear nuevos logros después de una acción
 * Retorna lista de logros nuevamente completados (no reclamados aún)
 */
export const checkNewAchievements = async (userId) => {
  try {
    const { achievements, claimedAchievements } = await getUserAchievements(userId);
    
    // Filtrar logros completados pero no reclamados
    const newlyCompleted = achievements.filter(a => a.completed && !a.claimed);
    
    return newlyCompleted;
  } catch (error) {
    console.error('[Achievements] Error checkNewAchievements:', error);
    return [];
  }
};

/**
 * Reclamar todos los logros completados pendientes de una vez
 */
export const claimAllPendingAchievements = async (userId) => {
  try {
    const newlyCompleted = await checkNewAchievements(userId);
    
    if (newlyCompleted.length === 0) {
      return { success: true, claimed: [], totalReward: {} };
    }
    
    const userRef = doc(db, 'users', userId);
    
    // Calcular recompensas totales
    let totalTokens = 0;
    let totalCoins = 0;
    let totalXP = 0;
    const titles = [];
    const achievementIds = [];
    
    newlyCompleted.forEach(a => {
      achievementIds.push(a.id);
      totalTokens += a.reward.tokens || 0;
      totalCoins += a.reward.coins || 0;
      totalXP += a.reward.xp || 0;
      if (a.reward.title) {
        titles.push(`title_${a.id}`);
      }
    });
    
    // Actualizar en una sola operación
    const updates = {
      achievements: arrayUnion(...achievementIds),
      tokens: increment(totalTokens),
      experience: increment(totalXP)
    };
    
    if (totalCoins > 0) {
      updates.coins = increment(totalCoins);
    }
    
    if (titles.length > 0) {
      updates.inventory = arrayUnion(...titles);
    }
    
    await updateDoc(userRef, updates);
    
    console.log(`[Achievements] ✅ Reclamados ${newlyCompleted.length} logros`);
    
    return {
      success: true,
      claimed: newlyCompleted,
      totalReward: {
        tokens: totalTokens,
        coins: totalCoins,
        xp: totalXP,
        titles
      }
    };
  } catch (error) {
    console.error('[Achievements] Error claimAllPendingAchievements:', error);
    return { success: false, error: 'Error de servidor' };
  }
};

/**
 * Obtener resumen de progreso de logros
 */
export const getAchievementsSummary = (achievements) => {
  const total = achievements.length;
  const completed = achievements.filter(a => a.completed).length;
  const claimed = achievements.filter(a => a.claimed).length;
  const pending = completed - claimed;
  
  // Contar por categoría
  const byCategory = {};
  achievements.forEach(a => {
    if (!byCategory[a.category]) {
      byCategory[a.category] = { total: 0, completed: 0 };
    }
    byCategory[a.category].total++;
    if (a.completed) {
      byCategory[a.category].completed++;
    }
  });
  
  return {
    total,
    completed,
    claimed,
    pending,
    percentage: Math.round((completed / total) * 100),
    byCategory
  };
};

export default {
  ACHIEVEMENTS,
  ACHIEVEMENT_IDS,
  ACHIEVEMENT_CATEGORIES,
  getUserAchievements,
  claimAchievementReward,
  checkNewAchievements,
  claimAllPendingAchievements,
  getAchievementsSummary,
  getAchievementProgress,
  isAchievementCompleted
};
