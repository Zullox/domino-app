// ============================================================================
// FIREBASE ANALYTICS - Tracking de eventos clave
// ============================================================================
// Registra eventos importantes para entender retención, engagement y monetización
// ============================================================================

import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics, logEvent, setUserProperties, setUserId } from 'firebase/analytics';

let analytics = null;

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

export const initAnalytics = () => {
  try {
    // Solo en producción y si hay soporte (no en SSR)
    if (typeof window === 'undefined') return;
    
    const app = getApps()[0];
    if (!app) {
      console.warn('[Analytics] Firebase no inicializado');
      return;
    }
    
    analytics = getAnalytics(app);
    console.log('[Analytics] ✅ Inicializado');
  } catch (error) {
    console.warn('[Analytics] No disponible:', error.message);
  }
};

// ============================================================================
// IDENTIFICACIÓN DE USUARIO
// ============================================================================

export const identifyUser = (userId, properties = {}) => {
  if (!analytics) return;
  
  try {
    setUserId(analytics, userId);
    
    if (properties.rank) setUserProperties(analytics, { rank: properties.rank });
    if (properties.level) setUserProperties(analytics, { level: String(properties.level) });
    if (properties.country) setUserProperties(analytics, { country: properties.country });
    if (properties.language) setUserProperties(analytics, { language: properties.language });
  } catch (e) {
    console.warn('[Analytics] Error identify:', e);
  }
};

// ============================================================================
// EVENTOS DE JUEGO
// ============================================================================

export const trackGameStart = (params = {}) => {
  track('game_start', {
    mode: params.mode || 'unknown',        // 'ranked', 'casual', 'offline'
    target_score: params.targetScore || 200,
    player_rating: params.rating || 1500
  });
};

export const trackGameEnd = (params = {}) => {
  track('game_end', {
    mode: params.mode || 'unknown',
    result: params.won ? 'win' : 'loss',
    final_score: params.score || '',
    duration_seconds: params.duration || 0,
    rounds_played: params.rounds || 0,
    rating_change: params.ratingChange || 0,
    is_domino: params.isDomino || false,
    is_tranca: params.isTranca || false
  });
};

export const trackMatchmaking = (params = {}) => {
  track('matchmaking', {
    action: params.action || 'join',       // 'join', 'cancel', 'found', 'timeout'
    wait_seconds: params.waitSeconds || 0,
    mode: params.mode || 'ranked'
  });
};

export const trackRematch = (accepted) => {
  track('rematch', { accepted });
};

// ============================================================================
// EVENTOS DE PROGRESIÓN
// ============================================================================

export const trackLevelUp = (newLevel) => {
  track('level_up', { level: newLevel });
};

export const trackRankChange = (oldRank, newRank, rating) => {
  track('rank_change', {
    old_rank: oldRank,
    new_rank: newRank,
    rating: rating
  });
};

export const trackAchievement = (achievementId) => {
  track('unlock_achievement', { achievement_id: achievementId });
};

// ============================================================================
// EVENTOS DE MONETIZACIÓN
// ============================================================================

export const trackPurchase = (params = {}) => {
  track('purchase', {
    item_id: params.itemId,
    currency_type: params.currency || 'tokens',  // 'tokens', 'coins', 'real'
    price: params.price || 0,
    item_category: params.category || 'cosmetic'
  });
};

export const trackAdWatched = (adType = 'rewarded') => {
  track('ad_watched', { ad_type: adType });
};

export const trackDailyRewardClaim = (day, streak) => {
  track('daily_reward_claim', { day, streak });
};

export const trackMissionComplete = (missionId, reward) => {
  track('mission_complete', { mission_id: missionId, reward });
};

// ============================================================================
// EVENTOS DE RETENCIÓN
// ============================================================================

export const trackSessionStart = () => {
  track('session_start', {
    timestamp: new Date().toISOString()
  });
};

export const trackScreenView = (screenName) => {
  track('screen_view', { screen_name: screenName });
};

export const trackTutorialStep = (step, completed = false) => {
  track('tutorial_progress', { step, completed });
};

// ============================================================================
// EVENTOS SOCIALES
// ============================================================================

export const trackFriendAction = (action) => {
  track('friend_action', { action }); // 'add', 'accept', 'reject', 'remove', 'invite'
};

export const trackShare = (contentType) => {
  track('share', { content_type: contentType }); // 'game_result', 'profile', 'invite'
};

// ============================================================================
// EVENTOS DE ERROR
// ============================================================================

export const trackError = (errorType, errorMessage) => {
  track('app_error', {
    error_type: errorType,
    error_message: (errorMessage || '').substring(0, 100)
  });
};

export const trackDisconnect = (reason) => {
  track('connection_lost', { reason });
};

// ============================================================================
// FUNCIÓN BASE
// ============================================================================

const track = (eventName, params = {}) => {
  if (!analytics) return;
  
  try {
    logEvent(analytics, eventName, params);
  } catch (e) {
    // Silently fail - analytics should never break the app
  }
};

export default {
  initAnalytics,
  identifyUser,
  trackGameStart,
  trackGameEnd,
  trackMatchmaking,
  trackRematch,
  trackLevelUp,
  trackRankChange,
  trackAchievement,
  trackPurchase,
  trackAdWatched,
  trackDailyRewardClaim,
  trackMissionComplete,
  trackSessionStart,
  trackScreenView,
  trackTutorialStep,
  trackFriendAction,
  trackShare,
  trackError,
  trackDisconnect
};
