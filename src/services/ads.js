// ============================================================================
// SERVICIO DE ADMOB - Anuncios para monetización
// ============================================================================
// Tipos de anuncio:
//   - Rewarded: "Ver anuncio para ganar X tokens" 
//   - Interstitial: Entre partidas (cada 3 partidas)
//   - Banner: En menú principal (opcional, menos invasivo)
// ============================================================================

import { Platform } from './native';

let AdMob = null;
let initialized = false;

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const AD_CONFIG = {
  // IDs de test (reemplazar con IDs reales antes de publicar)
  // Los IDs de test de Google muestran anuncios de prueba
  testIds: {
    rewarded: 'ca-app-pub-3940256099942544/5224354917',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    banner: 'ca-app-pub-3940256099942544/6300978111'
  },
  // IDs de producción (se configuran en .env)
  prodIds: {
    rewarded: import.meta.env.VITE_ADMOB_REWARDED_ID || '',
    interstitial: import.meta.env.VITE_ADMOB_INTERSTITIAL_ID || '',
    banner: import.meta.env.VITE_ADMOB_BANNER_ID || ''
  },
  // Cooldowns y límites
  limits: {
    maxRewardedPerDay: 10,
    maxInterstitialPerHour: 3,
    interstitialEveryNGames: 3,     // Mostrar interstitial cada N partidas
    cooldownBetweenAds: 60000,      // 1 minuto entre anuncios
  }
};

// ============================================================================
// ESTADO
// ============================================================================

const state = {
  rewardedCount: 0,
  interstitialCount: 0,
  gamesPlayed: 0,
  lastAdTime: 0,
  lastResetDate: null
};

// Cargar estado del día
const loadDailyState = () => {
  try {
    const today = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem('admobState') || '{}');
    
    if (saved.date === today) {
      state.rewardedCount = saved.rewardedCount || 0;
      state.interstitialCount = saved.interstitialCount || 0;
      state.gamesPlayed = saved.gamesPlayed || 0;
    } else {
      // Nuevo día - reset contadores
      state.rewardedCount = 0;
      state.interstitialCount = 0;
      state.gamesPlayed = 0;
    }
    state.lastResetDate = today;
  } catch (e) {}
};

const saveDailyState = () => {
  try {
    localStorage.setItem('admobState', JSON.stringify({
      date: new Date().toDateString(),
      rewardedCount: state.rewardedCount,
      interstitialCount: state.interstitialCount,
      gamesPlayed: state.gamesPlayed
    }));
  } catch (e) {}
};

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

export const initAdMob = async () => {
  if (!Platform.isNative) {
    console.log('[AdMob] Solo disponible en plataformas nativas');
    return false;
  }
  
  if (initialized) return true;
  
  try {
    // Importar dinámicamente (solo en nativo)
    const mod = await import('@capacitor-community/admob');
    AdMob = mod.AdMob;
    
    await AdMob.initialize({
      initializeForTesting: import.meta.env.DEV,
      testingDevices: [], // Agregar IDs de dispositivos de test
    });
    
    loadDailyState();
    initialized = true;
    console.log('[AdMob] ✅ Inicializado');
    return true;
  } catch (e) {
    console.warn('[AdMob] No disponible:', e.message);
    return false;
  }
};

// ============================================================================
// REWARDED AD - "Ver anuncio para ganar tokens"
// ============================================================================

/**
 * Mostrar anuncio rewarded
 * @param {Object} reward - { tokens: number, label: string }
 * @returns {Promise<boolean>} true si el usuario completó el anuncio
 */
export const showRewardedAd = async (reward = { tokens: 50, label: 'tokens' }) => {
  // Verificar límites
  if (state.rewardedCount >= AD_CONFIG.limits.maxRewardedPerDay) {
    return { success: false, error: 'daily_limit', message: 'Límite diario alcanzado' };
  }
  
  const now = Date.now();
  if (now - state.lastAdTime < AD_CONFIG.limits.cooldownBetweenAds) {
    const wait = Math.ceil((AD_CONFIG.limits.cooldownBetweenAds - (now - state.lastAdTime)) / 1000);
    return { success: false, error: 'cooldown', message: `Espera ${wait}s`, waitSeconds: wait };
  }
  
  if (!AdMob || !Platform.isNative) {
    // En web, simular éxito para testing
    if (import.meta.env.DEV) {
      console.log('[AdMob] DEV: Simulando rewarded ad');
      state.rewardedCount++;
      state.lastAdTime = now;
      saveDailyState();
      return { success: true, reward };
    }
    return { success: false, error: 'not_available' };
  }
  
  try {
    const isProd = import.meta.env.PROD;
    const adId = isProd ? AD_CONFIG.prodIds.rewarded : AD_CONFIG.testIds.rewarded;
    
    // Preparar anuncio
    await AdMob.prepareRewardVideoAd({
      adId,
      isTesting: !isProd
    });
    
    // Mostrar y esperar resultado
    const result = await AdMob.showRewardVideoAd();
    
    if (result && result.type === 'earned') {
      state.rewardedCount++;
      state.lastAdTime = Date.now();
      saveDailyState();
      return { success: true, reward };
    }
    
    return { success: false, error: 'not_completed' };
  } catch (e) {
    console.error('[AdMob] Error rewarded:', e);
    return { success: false, error: 'failed', message: e.message };
  }
};

// ============================================================================
// INTERSTITIAL - Entre partidas
// ============================================================================

/**
 * Registrar que se jugó una partida y mostrar interstitial si toca
 * @returns {Promise<boolean>} true si se mostró el anuncio
 */
export const onGameEnd = async () => {
  state.gamesPlayed++;
  saveDailyState();
  
  // Verificar si toca mostrar interstitial
  if (state.gamesPlayed % AD_CONFIG.limits.interstitialEveryNGames !== 0) {
    return false;
  }
  
  return showInterstitial();
};

export const showInterstitial = async () => {
  if (state.interstitialCount >= AD_CONFIG.limits.maxInterstitialPerHour) {
    return false;
  }
  
  const now = Date.now();
  if (now - state.lastAdTime < AD_CONFIG.limits.cooldownBetweenAds) {
    return false;
  }
  
  if (!AdMob || !Platform.isNative) {
    if (import.meta.env.DEV) {
      console.log('[AdMob] DEV: Simulando interstitial');
    }
    return false;
  }
  
  try {
    const isProd = import.meta.env.PROD;
    const adId = isProd ? AD_CONFIG.prodIds.interstitial : AD_CONFIG.testIds.interstitial;
    
    await AdMob.prepareInterstitial({
      adId,
      isTesting: !isProd
    });
    
    await AdMob.showInterstitial();
    
    state.interstitialCount++;
    state.lastAdTime = Date.now();
    saveDailyState();
    return true;
  } catch (e) {
    console.error('[AdMob] Error interstitial:', e);
    return false;
  }
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * ¿Puede ver un rewarded ad ahora?
 */
export const canShowRewarded = () => {
  loadDailyState();
  const now = Date.now();
  return {
    available: state.rewardedCount < AD_CONFIG.limits.maxRewardedPerDay 
               && (now - state.lastAdTime >= AD_CONFIG.limits.cooldownBetweenAds),
    remaining: AD_CONFIG.limits.maxRewardedPerDay - state.rewardedCount,
    cooldownLeft: Math.max(0, AD_CONFIG.limits.cooldownBetweenAds - (now - state.lastAdTime))
  };
};

/**
 * Obtener estado actual
 */
export const getAdState = () => ({
  rewardedToday: state.rewardedCount,
  maxRewardedPerDay: AD_CONFIG.limits.maxRewardedPerDay,
  interstitialThisHour: state.interstitialCount,
  gamesPlayed: state.gamesPlayed,
  isNative: Platform.isNative
});

export default {
  initAdMob,
  showRewardedAd,
  showInterstitial,
  onGameEnd,
  canShowRewarded,
  getAdState
};
