// ============================================================================
// USE PLAYER PROFILE - Perfil, ranking, monetización
// ============================================================================
// Migrado de DominoRanked (líneas 8916-9100)
// Maneja: perfil, ELO, inventario, currencies, cosméticos
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { createDefaultPlayerProfile } from '../constants/playerProfile';
import { DecaySystem } from '../services/decay';
import { Glicko2 } from '../services/rating';
import { getRank } from '../constants/game';
import { TIER_ORDER } from '../constants/cosmetics';
import { MatchHistory } from '../services/matchHistory';
import { getOrCreateUser, subscribeToUser, updateUser } from '../firestore';

// ============================================================================
// STORAGE KEYS
// ============================================================================
const STORAGE_KEYS = {
  PROFILE: 'dominoPlayerProfile',
  INVENTORY: 'dominoPlayerInventory',
  CURRENCIES: 'dominoPlayerCurrencies',
  COSMETICS: 'dominoEquippedCosmetics',
  SEASON_PASS: 'dominoSeasonPass',
  DAILY_REWARDS: 'dominoDailyRewards',
  MATCH_HISTORY: 'dominoMatchHistory'
};

// ============================================================================
// DEFAULT VALUES
// ============================================================================
const DEFAULT_INVENTORY = new Set([
  'classic_white', 'classic_ivory', 'felt_green', 'felt_blue',
  'default_1', 'default_2', 'default_3',
  'thumbs_up', 'thumbs_down', 'clap', 'thinking',
  'none', 'bronze', 'novato'
]);

const DEFAULT_CURRENCIES = { coins: 0, tokens: 500 };

const DEFAULT_COSMETICS = {
  skinSet: 'classic',
  menuBackground: 'elegant_green',
  avatar: 'default',
  title: 'novato',
  frame: 'none',
  effect: null
};

const DEFAULT_DAILY_REWARDS = {
  lastLoginDate: null,
  currentStreak: 0,
  todayClaimed: false,
  firstWinToday: false,
  gamesPlayedToday: 0,
  winsToday: 0,
  dominosToday: 0,
  pointsToday: 0,
  streakToday: 0
};

// ============================================================================
// HOOK
// ============================================================================
export const usePlayerProfile = (authUser) => {
  // === PROFILE ===
  const [playerProfile, setPlayerProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) {
        const profile = JSON.parse(saved);
        return DecaySystem.applyDecay(profile);
      }
    } catch (e) {
      console.error('Error loading profile:', e);
    }
    return createDefaultPlayerProfile();
  });
  
  // === INVENTORY ===
  const [playerInventory, setPlayerInventory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      if (saved) return new Set(JSON.parse(saved));
    } catch (e) {
      console.error('Error loading inventory:', e);
    }
    return DEFAULT_INVENTORY;
  });
  
  // === CURRENCIES ===
  const [playerCurrencies, setPlayerCurrencies] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENCIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading currencies:', e);
    }
    return DEFAULT_CURRENCIES;
  });
  
  // === COSMETICS ===
  const [equippedCosmetics, setEquippedCosmetics] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COSMETICS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading cosmetics:', e);
    }
    return DEFAULT_COSMETICS;
  });
  
  // === SEASON PASS ===
  const [seasonPass, setSeasonPass] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SEASON_PASS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading season pass:', e);
    }
    return { owned: false, tier: 0, xp: 0, claimedFree: [], claimedPremium: [] };
  });
  
  // === DAILY REWARDS ===
  const [dailyRewards, setDailyRewards] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DAILY_REWARDS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading daily rewards:', e);
    }
    return DEFAULT_DAILY_REWARDS;
  });
  
  // === MATCH HISTORY ===
  const [matchHistory, setMatchHistory] = useState(() => MatchHistory.load());
  
  // === LAST MATCH REWARDS ===
  const [lastMatchRewards, setLastMatchRewards] = useState(null);
  
  // === RANK CHANGE ===
  const [rankChange, setRankChange] = useState(null);
  
  // ============================================================================
  // PERSISTENCE
  // ============================================================================
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(playerProfile));
    } catch (e) {
      console.error('Error saving profile:', e);
    }
  }, [playerProfile]);
  
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify([...playerInventory]));
    } catch (e) {
      console.error('Error saving inventory:', e);
    }
  }, [playerInventory]);
  
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENCIES, JSON.stringify(playerCurrencies));
    } catch (e) {
      console.error('Error saving currencies:', e);
    }
  }, [playerCurrencies]);
  
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COSMETICS, JSON.stringify(equippedCosmetics));
    } catch (e) {
      console.error('Error saving cosmetics:', e);
    }
  }, [equippedCosmetics]);
  
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DAILY_REWARDS, JSON.stringify(dailyRewards));
    } catch (e) {
      console.error('Error saving daily rewards:', e);
    }
  }, [dailyRewards]);
  
  // ============================================================================
  // FIRESTORE SYNC (source of truth for authenticated users)
  // ============================================================================
  const firestoreInitRef = useRef(false);
  const syncingFromFirestore = useRef(false);
  const syncTimerRef = useRef(null);
  
  // Subscribe to Firestore when authenticated
  useEffect(() => {
    if (!authUser || authUser.isGuest || !authUser.id) return;
    
    const userId = authUser.id;
    let unsubscribe = null;
    
    const init = async () => {
      try {
        // Create or get user doc in Firestore
        const userData = await getOrCreateUser(authUser);
        
        if (userData && !firestoreInitRef.current) {
          firestoreInitRef.current = true;
          syncingFromFirestore.current = true;
          
          // Merge Firestore data into local state (Firestore wins)
          if (userData.rating) {
            setPlayerProfile(prev => ({
              ...prev,
              rating: userData.rating ?? prev.rating,
              rd: userData.rd ?? prev.rd,
              volatility: userData.volatility ?? prev.volatility,
              rank: userData.rank ?? prev.rank,
              rankTier: userData.rankTier ?? prev.rankTier,
              peakRating: userData.peakRating ?? prev.peakRating,
              stats: { ...prev.stats, ...(userData.stats || {}) },
              name: userData.name ?? authUser.name ?? prev.name,
              lastPlayed: userData.lastPlayed ?? prev.lastPlayed
            }));
          }
          
          if (userData.coins != null || userData.tokens != null) {
            setPlayerCurrencies(prev => ({
              coins: userData.coins ?? prev.coins,
              tokens: userData.tokens ?? prev.tokens
            }));
          }
          
          if (userData.inventory?.length > 0) {
            setPlayerInventory(prev => {
              const merged = new Set([...prev, ...userData.inventory]);
              return merged;
            });
          }
          
          if (userData.equippedCosmetics) {
            setEquippedCosmetics(prev => ({ ...prev, ...userData.equippedCosmetics }));
          }
          
          setTimeout(() => { syncingFromFirestore.current = false; }, 500);
        }
        
        // Subscribe to real-time updates
        unsubscribe = subscribeToUser(userId, (data) => {
          if (!data || !firestoreInitRef.current) return;
          syncingFromFirestore.current = true;
          
          // Only update server-authoritative fields
          if (data.rating != null) {
            setPlayerProfile(prev => ({
              ...prev,
              rating: data.rating,
              rd: data.rd ?? prev.rd,
              rank: data.rank ?? prev.rank,
              peakRating: data.peakRating ?? prev.peakRating
            }));
          }
          
          if (data.coins != null) {
            setPlayerCurrencies(prev => ({
              coins: data.coins ?? prev.coins,
              tokens: data.tokens ?? prev.tokens
            }));
          }
          
          setTimeout(() => { syncingFromFirestore.current = false; }, 500);
        });
      } catch (e) {
        console.error('[Profile] Firestore init error:', e);
      }
    };
    
    init();
    
    return () => {
      if (unsubscribe) unsubscribe();
      firestoreInitRef.current = false;
    };
  }, [authUser]);
  
  // Debounced sync local changes → Firestore
  useEffect(() => {
    if (!authUser || authUser.isGuest || !authUser.id) return;
    if (syncingFromFirestore.current) return;
    if (!firestoreInitRef.current) return;
    
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    
    syncTimerRef.current = setTimeout(async () => {
      try {
        await updateUser(authUser.id, {
          stats: playerProfile.stats,
          equippedCosmetics,
          inventory: [...playerInventory],
          coins: playerCurrencies.coins,
          tokens: playerCurrencies.tokens,
          name: playerProfile.name,
          lastPlayed: playerProfile.lastPlayed
        });
      } catch (e) {
        console.warn('[Profile] Firestore sync error:', e);
      }
    }, 2000); // Debounce 2s
    
    return () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current); };
  }, [playerProfile.stats, playerProfile.lastPlayed, equippedCosmetics, playerInventory, playerCurrencies]);
  
  // ============================================================================
  // UPDATE PLAYER STATS
  // ============================================================================
  const updatePlayerStats = useCallback((updates) => {
    setPlayerProfile(prev => {
      const newProfile = {
        ...prev,
        stats: { ...prev.stats, ...updates },
        lastPlayed: new Date().toISOString()
      };
      return newProfile;
    });
  }, []);
  
  // ============================================================================
  // UPDATE RATING
  // ============================================================================
  const updatePlayerRating = useCallback((won, opponents, matchData) => {
    setPlayerProfile(prev => {
      const oldRank = prev.rank;
      const oldTier = prev.rankTier;
      
      // Calcular nuevo rating con Glicko-2
      const opponentRatings = opponents.map(o => ({
        rating: o.elo || 1500,
        rd: 350,
        volatility: 0.06
      }));
      
      const result = won ? 1 : 0;
      const newRating = Glicko2.updateRating(
        { rating: prev.rating, rd: prev.rd, volatility: prev.volatility },
        opponentRatings,
        [result]
      );
      
      // Determinar nuevo rango
      const newRank = getRank(newRating.rating);
      const newTier = newRank.tier;
      
      // Detectar promoción/descenso
      if (newTier !== oldTier) {
        setRankChange({
          type: TIER_ORDER.indexOf(newTier) > TIER_ORDER.indexOf(oldTier) 
            ? 'promotion' : 'demotion',
          from: oldRank,
          to: newRank.name,
          fromTier: oldTier,
          toTier: newTier
        });
      }
      
      return {
        ...prev,
        rating: newRating.rating,
        rd: newRating.rd,
        volatility: newRating.volatility,
        rank: newRank.name,
        rankTier: newTier,
        rankIcon: newRank.icon,
        peakRating: Math.max(prev.peakRating || 0, newRating.rating)
      };
    });
  }, []);
  
  // ============================================================================
  // PURCHASE
  // ============================================================================
  const handlePurchase = useCallback(async (item) => {
    const currency = item.currency || 'tokens';
    const price = item.price || 0;
    
    if (playerCurrencies[currency] < price) {
      return { success: false, error: 'Fondos insuficientes' };
    }
    
    // Deducir precio
    setPlayerCurrencies(prev => ({
      ...prev,
      [currency]: prev[currency] - price
    }));
    
    // Agregar al inventario
    setPlayerInventory(prev => {
      const newInv = new Set(prev);
      newInv.add(item.id);
      return newInv;
    });
    
    return { success: true };
  }, [playerCurrencies]);
  
  // ============================================================================
  // EQUIP COSMETIC
  // ============================================================================
  const equipCosmetic = useCallback((type, itemId) => {
    if (!playerInventory.has(itemId) && itemId !== 'none' && itemId !== 'default') {
      return { success: false, error: 'Item no desbloqueado' };
    }
    
    setEquippedCosmetics(prev => ({
      ...prev,
      [type]: itemId
    }));
    
    return { success: true };
  }, [playerInventory]);
  
  // ============================================================================
  // CLAIM DAILY REWARD
  // ============================================================================
  const claimDailyReward = useCallback(() => {
    const today = new Date().toDateString();
    
    if (dailyRewards.lastLoginDate === today && dailyRewards.todayClaimed) {
      return { success: false, error: 'Ya reclamaste hoy' };
    }
    
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const isConsecutive = dailyRewards.lastLoginDate === yesterday;
    const newStreak = isConsecutive ? dailyRewards.currentStreak + 1 : 1;
    
    // Calcular recompensa según racha
    const baseTokens = 50;
    const streakBonus = Math.min(newStreak - 1, 6) * 10;
    const reward = baseTokens + streakBonus;
    
    setDailyRewards({
      ...dailyRewards,
      lastLoginDate: today,
      currentStreak: newStreak,
      todayClaimed: true,
      gamesPlayedToday: 0,
      winsToday: 0,
      dominosToday: 0,
      pointsToday: 0
    });
    
    setPlayerCurrencies(prev => ({
      ...prev,
      tokens: prev.tokens + reward
    }));
    
    return { success: true, reward, streak: newStreak };
  }, [dailyRewards]);
  
  // ============================================================================
  // AWARD MATCH TOKENS
  // ============================================================================
  const awardMatchTokens = useCallback((matchResult) => {
    let tokens = 0;
    
    // Base por jugar
    tokens += 10;
    
    // Bonus por ganar
    if (matchResult.won) {
      tokens += 25;
    }
    
    // Bonus por dominó
    if (matchResult.type === 'domino') {
      tokens += 15;
    }
    
    // Bonus por primera victoria del día
    if (matchResult.won && !dailyRewards.firstWinToday) {
      tokens += 50;
      setDailyRewards(prev => ({ ...prev, firstWinToday: true }));
    }
    
    setPlayerCurrencies(prev => ({
      ...prev,
      tokens: prev.tokens + tokens
    }));
    
    return tokens;
  }, [dailyRewards]);
  
  // ============================================================================
  // CALCULATE MATCH REWARDS
  // ============================================================================
  const calculateMatchRewards = useCallback((won, matchData) => {
    const tokens = awardMatchTokens({ won, ...matchData });
    
    // XP para season pass
    const xp = won ? 100 : 50;
    
    setSeasonPass(prev => ({
      ...prev,
      xp: prev.xp + xp,
      tier: Math.floor((prev.xp + xp) / 1000)
    }));
    
    const rewards = {
      tokens,
      xp,
      firstWin: won && !dailyRewards.firstWinToday
    };
    
    setLastMatchRewards(rewards);
    return rewards;
  }, [awardMatchTokens, dailyRewards]);
  
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  const profile = {
    ...playerProfile,
    name: authUser?.name || playerProfile.name || 'Jugador',
    elo: playerProfile.rating,
    odId: authUser?.id || null,
    isInPlacement: (playerProfile.stats?.gamesPlayed || 0) < 10,
    placementGames: playerProfile.stats?.gamesPlayed || 0
  };
  
  // ============================================================================
  // RETURN
  // ============================================================================
  return {
    // Profile
    playerProfile,
    setPlayerProfile,
    profile,
    
    // Inventory & Currencies
    playerInventory,
    setPlayerInventory,
    playerCurrencies,
    setPlayerCurrencies,
    
    // Cosmetics
    equippedCosmetics,
    setEquippedCosmetics,
    equipCosmetic,
    
    // Season Pass
    seasonPass,
    setSeasonPass,
    
    // Daily Rewards
    dailyRewards,
    setDailyRewards,
    claimDailyReward,
    
    // Match History
    matchHistory,
    setMatchHistory,
    
    // Rewards
    lastMatchRewards,
    setLastMatchRewards,
    calculateMatchRewards,
    awardMatchTokens,
    
    // Rank
    rankChange,
    setRankChange,
    
    // Actions
    updatePlayerStats,
    updatePlayerRating,
    handlePurchase
  };
};

export default usePlayerProfile;
