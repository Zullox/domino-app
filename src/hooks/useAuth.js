// ============================================================================
// USE AUTH HOOK - Lógica de autenticación
// ============================================================================
// Migrado de DominoR.jsx App component (líneas 13862-14000)
// Maneja estado de usuario, login, logout, y sincronización con Firestore
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// CONSTANTES
// ============================================================================
const STORAGE_KEYS = {
  USER_AUTH: 'dominoUserAuth',
  INVENTORY: 'dominoPlayerInventory',
  CURRENCIES: 'dominoPlayerCurrencies',
  EQUIPPED: 'dominoEquippedCosmetics',
  RATING: 'dominoPlayerRating',
  STATS: 'dominoPlayerStats'
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
const loadFromStorage = (key) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error(`[Storage] Error loading ${key}:`, e);
    return null;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`[Storage] Error saving ${key}:`, e);
  }
};

const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error(`[Storage] Error removing ${key}:`, e);
  }
};

// ============================================================================
// SYNC FIRESTORE DATA TO LOCAL STORAGE
// ============================================================================
const syncFirestoreToLocal = (profile) => {
  if (profile.inventory) {
    saveToStorage(STORAGE_KEYS.INVENTORY, profile.inventory);
  }
  
  if (profile.tokens !== undefined || profile.coins !== undefined) {
    saveToStorage(STORAGE_KEYS.CURRENCIES, {
      tokens: profile.tokens || 500,
      coins: profile.coins || 0
    });
  }
  
  if (profile.equipped) {
    saveToStorage(STORAGE_KEYS.EQUIPPED, profile.equipped);
  }
  
  if (profile.rating) {
    saveToStorage(STORAGE_KEYS.RATING, {
      rating: profile.rating,
      rd: profile.rd || 350,
      volatility: profile.volatility || 0.06
    });
  }
  
  if (profile.stats) {
    saveToStorage(STORAGE_KEYS.STATS, profile.stats);
  }
};

// ============================================================================
// CREATE GUEST USER
// ============================================================================
export const createGuestUser = () => ({
  id: `guest_${Date.now()}`,
  name: 'Invitado',
  isGuest: true,
  provider: 'guest'
});

// ============================================================================
// USE AUTH HOOK
// ============================================================================
export const useAuth = () => {
  const [authUser, setAuthUser] = useState(() => loadFromStorage(STORAGE_KEYS.USER_AUTH));
  const [showLogin, setShowLogin] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [firestoreReady, setFirestoreReady] = useState(false);
  
  // Save user when it changes
  useEffect(() => {
    if (authUser) {
      saveToStorage(STORAGE_KEYS.USER_AUTH, authUser);
    }
  }, [authUser]);
  
  // Handle login success
  const handleLoginSuccess = useCallback(async (user) => {
    console.log('[Auth] Login exitoso:', user.name);
    setAuthLoading(true);
    
    try {
      const { getOrCreateUser } = await import('../firestore.js');
      const firestoreProfile = await getOrCreateUser({
        uid: user.id,
        displayName: user.name,
        email: user.email,
        photoURL: user.avatar,
        providerData: [{ providerId: user.provider }]
      });
      
      if (firestoreProfile) {
        console.log('[Firestore] Perfil cargado:', firestoreProfile.name);
        
        // Combine Firebase Auth data with Firestore
        const fullUser = {
          ...user,
          ...firestoreProfile,
          id: user.id // Keep Firebase Auth ID
        };
        
        // Sync to localStorage for immediate use
        syncFirestoreToLocal(firestoreProfile);
        
        setAuthUser(fullUser);
        setFirestoreReady(true);
      } else {
        setAuthUser(user);
      }
    } catch (e) {
      console.error('[Firestore] Error cargando perfil:', e);
      // Continue with local data if Firestore fails
      setAuthUser(user);
    } finally {
      setAuthLoading(false);
      setShowLogin(false);
    }
  }, []);
  
  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      // Mark as offline in Firestore
      if (authUser?.id && !authUser.isGuest) {
        const { setUserOffline } = await import('../firestore.js');
        await setUserOffline(authUser.id);
      }
      
      // Firebase logout
      const { logOut } = await import('../firebase.js');
      await logOut();
    } catch (e) {
      console.error('[Auth] Error en logout:', e);
    }
    
    setAuthUser(null);
    setFirestoreReady(false);
    removeFromStorage(STORAGE_KEYS.USER_AUTH);
  }, [authUser]);
  
  // Handle play as guest
  const handlePlayAsGuest = useCallback(() => {
    const guestUser = createGuestUser();
    setAuthUser(guestUser);
    setShowLogin(false);
  }, []);
  
  // Request login modal
  const requestLogin = useCallback(() => {
    setShowLogin(true);
  }, []);
  
  // Close login modal
  const closeLogin = useCallback(() => {
    setShowLogin(false);
  }, []);
  
  return {
    // State
    authUser,
    showLogin,
    authLoading,
    firestoreReady,
    isAuthenticated: !!authUser,
    isGuest: authUser?.isGuest ?? false,
    
    // Actions
    handleLoginSuccess,
    handleLogout,
    handlePlayAsGuest,
    requestLogin,
    closeLogin,
    setShowLogin
  };
};

export default useAuth;
