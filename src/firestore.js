// ============================================================================
// FIRESTORE DATABASE - DOMINÓ CUBANO
// ============================================================================
// Base de datos en la nube usando Firebase Firestore
// Maneja: usuarios, partidas, estadísticas, tienda, amigos

import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

// Credenciales desde variables de entorno (mismas que firebase.js)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializar (reutilizar si ya existe)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

console.log('[Firestore] Inicializado');

// ============================================================================
// ESTRUCTURA DE DATOS POR DEFECTO
// ============================================================================

const DEFAULT_USER = {
  // Perfil
  name: 'Jugador',
  avatar: null,
  country: 'CU',
  bio: '',
  
  // Ranking Glicko-2
  rating: 1500,
  rd: 350,
  volatility: 0.06,
  rank: 'Bronze III',
  peakRating: 1500,
  peakRank: 'Bronze III',
  
  // Estadísticas
  stats: {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    winStreak: 0,
    maxWinStreak: 0,
    dominoes: 0,
    trancas: 0,
    capicuas: 0,
    pollonas: 0,
    totalPoints: 0,
    playTime: 0
  },
  
  // Economía
  tokens: 500,  // Moneda gratis (bono inicial)
  coins: 0,     // Moneda premium
  
  // Inventario (IDs de items desbloqueados)
  inventory: [
    'classic_white', 'classic_ivory',  // Fichas gratis
    'felt_green', 'felt_blue',          // Tableros gratis
    'default_1', 'default_2', 'default_3' // Avatares gratis
  ],
  
  // Cosméticos equipados
  equipped: {
    tile: 'classic_white',
    board: 'felt_green',
    avatar: 'default_1',
    frame: null,
    title: null
  },
  
  // Season Pass
  seasonPass: {
    season: 1,
    tier: 0,
    xp: 0,
    premium: false,
    claimedFree: [],
    claimedPremium: []
  },
  
  // Progreso
  level: 1,
  experience: 0,
  achievements: [],
  
  // Social
  friends: [],
  friendRequests: [],
  blocked: [],
  
  // Estado
  isOnline: false,
  lastLogin: null,
  lastPlayed: null,
  createdAt: null
};

// ============================================================================
// USUARIOS
// ============================================================================

/**
 * Obtener o crear usuario
 * @param {Object} authUser - Usuario de Firebase Auth
 * @returns {Object} Perfil completo del usuario
 */
export const getOrCreateUser = async (authUser) => {
  if (!authUser?.uid) return null;
  
  const userRef = doc(db, 'users', authUser.uid);
  
  try {
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      // Usuario existe - actualizar último login
      await updateDoc(userRef, {
        lastLogin: serverTimestamp(),
        isOnline: true,
        // Actualizar datos de auth si cambiaron
        ...(authUser.displayName && { name: authUser.displayName }),
        ...(authUser.photoURL && { avatar: authUser.photoURL })
      });
      
      console.log('[Firestore] 👤 Usuario cargado:', userSnap.data().name);
      return { id: userSnap.id, ...userSnap.data() };
    } else {
      // Crear nuevo usuario
      const newUser = {
        ...DEFAULT_USER,
        name: authUser.displayName || 'Jugador',
        email: authUser.email,
        avatar: authUser.photoURL || null,
        provider: authUser.providerData?.[0]?.providerId || 'unknown',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        isOnline: true
      };
      
      await setDoc(userRef, newUser);
      console.log('[Firestore] ✅ Nuevo usuario:', newUser.name);
      return { id: authUser.uid, ...newUser };
    }
  } catch (error) {
    console.error('[Firestore] Error getOrCreateUser:', error);
    throw error;
  }
};

/**
 * Obtener usuario por ID
 */
export const getUserById = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('[Firestore] Error getUserById:', error);
    return null;
  }
};

/**
 * Actualizar datos del usuario
 */
export const updateUser = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
    return true;
  } catch (error) {
    console.error('[Firestore] Error updateUser:', error);
    return false;
  }
};

/**
 * Marcar usuario como offline
 */
export const setUserOffline = async (userId) => {
  if (!userId) return;
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { 
      isOnline: false,
      lastLogin: serverTimestamp()
    });
  } catch (error) {
    console.error('[Firestore] Error setUserOffline:', error);
  }
};

/**
 * Escuchar cambios en tiempo real del usuario
 */
export const subscribeToUser = (userId, callback) => {
  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  }, (error) => {
    console.error('[Firestore] Error subscribeToUser:', error);
  });
};

// ============================================================================
// ESTADÍSTICAS Y RANKING
// ============================================================================

/**
 * Actualizar estadísticas después de una partida
 * @returns {Object} Recompensas ganadas
 */
export const updateGameStats = async (userId, gameResult) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('Usuario no encontrado');
    }
    
    const user = userSnap.data();
    const won = gameResult.won;
    
    // Calcular nuevo winStreak
    const currentStreak = user.stats?.winStreak || 0;
    const newWinStreak = won ? currentStreak + 1 : 0;
    const newMaxWinStreak = Math.max(newWinStreak, user.stats?.maxWinStreak || 0);
    
    // Calcular recompensas
    const baseXP = won ? 100 : 30;
    const bonusXP = gameResult.points || 0;
    const totalXP = baseXP + bonusXP;
    
    const baseTokens = won ? 50 : 10;
    const bonusTokens = (gameResult.isDomino ? 20 : 0) + (gameResult.isTranca ? 30 : 0);
    const totalTokens = baseTokens + bonusTokens;
    
    // Calcular nivel
    let newLevel = user.level || 1;
    let newExperience = (user.experience || 0) + totalXP;
    let leveledUp = false;
    
    while (newExperience >= newLevel * 500) {
      newExperience -= newLevel * 500;
      newLevel++;
      leveledUp = true;
    }
    
    // Preparar actualizaciones
    const updates = {
      'stats.gamesPlayed': increment(1),
      'stats.wins': increment(won ? 1 : 0),
      'stats.losses': increment(won ? 0 : 1),
      'stats.winStreak': newWinStreak,
      'stats.maxWinStreak': newMaxWinStreak,
      'stats.dominoes': increment(gameResult.isDomino ? 1 : 0),
      'stats.trancas': increment(gameResult.isTranca ? 1 : 0),
      'stats.capicuas': increment(gameResult.isCapicua ? 1 : 0),
      'stats.pollonas': increment(gameResult.isPollona ? 1 : 0),
      'stats.totalPoints': increment(gameResult.points || 0),
      tokens: increment(totalTokens),
      experience: newExperience,
      level: newLevel,
      'seasonPass.xp': increment(totalXP),
      lastPlayed: serverTimestamp()
    };
    
    // Actualizar rating si viene
    if (gameResult.newRating !== undefined) {
      updates.rating = gameResult.newRating;
      updates.rd = gameResult.newRd ?? user.rd;
      updates.volatility = gameResult.newVolatility ?? user.volatility;
      
      // Peak rating
      if (gameResult.newRating > (user.peakRating || 1500)) {
        updates.peakRating = gameResult.newRating;
      }
    }
    
    if (gameResult.newRank) {
      updates.rank = gameResult.newRank;
      if (gameResult.newRating > (user.peakRating || 1500)) {
        updates.peakRank = gameResult.newRank;
      }
    }
    
    await updateDoc(userRef, updates);
    
    console.log(`[Firestore] 📊 Stats actualizadas: +${totalXP} XP, +${totalTokens} tokens`);
    
    return {
      xpGained: totalXP,
      tokensGained: totalTokens,
      leveledUp,
      newLevel,
      newWinStreak
    };
  } catch (error) {
    console.error('[Firestore] Error updateGameStats:', error);
    throw error;
  }
};

// ============================================================================
// TIENDA Y COSMÉTICOS
// ============================================================================

/**
 * Comprar un item
 */
export const purchaseItem = async (userId, itemId, price, currency) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return { success: false, error: 'Usuario no encontrado' };
    }
    
    const user = userSnap.data();
    
    // Verificar si ya tiene el item
    if (user.inventory?.includes(itemId)) {
      return { success: false, error: 'Ya tienes este item' };
    }
    
    // Verificar fondos
    const balance = currency === 'tokens' ? user.tokens : user.coins;
    if ((balance || 0) < price) {
      return { success: false, error: `${currency === 'tokens' ? 'Tokens' : 'Diamantes'} insuficientes` };
    }
    
    // Realizar compra
    const updates = {
      inventory: arrayUnion(itemId),
      [currency]: increment(-price)
    };
    
    await updateDoc(userRef, updates);
    
    console.log(`[Firestore] 🛒 Compra: ${itemId} por ${price} ${currency}`);
    
    return { success: true };
  } catch (error) {
    console.error('[Firestore] Error purchaseItem:', error);
    return { success: false, error: 'Error de servidor' };
  }
};

/**
 * Equipar cosmético
 */
export const equipCosmetic = async (userId, slot, itemId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      [`equipped.${slot}`]: itemId
    });
    
    console.log(`[Firestore] 👕 Equipado: ${slot} = ${itemId}`);
    return { success: true };
  } catch (error) {
    console.error('[Firestore] Error equipCosmetic:', error);
    return { success: false, error: 'Error al equipar' };
  }
};

/**
 * Añadir monedas (para compras in-app o recompensas)
 */
export const addCurrency = async (userId, currency, amount) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      [currency]: increment(amount)
    });
    return true;
  } catch (error) {
    console.error('[Firestore] Error addCurrency:', error);
    return false;
  }
};

// ============================================================================
// LEADERBOARD
// ============================================================================

/**
 * Obtener leaderboard global
 */
export const getLeaderboard = async (limitCount = 100) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      orderBy('rating', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc, index) => ({
      position: index + 1,
      id: doc.id,
      name: doc.data().name,
      avatar: doc.data().avatar,
      country: doc.data().country,
      rating: doc.data().rating || 1500,
      rank: doc.data().rank || 'Bronze III',
      wins: doc.data().stats?.wins || 0,
      losses: doc.data().stats?.losses || 0,
      level: doc.data().level || 1
    }));
  } catch (error) {
    console.error('[Firestore] Error getLeaderboard:', error);
    return [];
  }
};

/**
 * Obtener posición del usuario
 */
export const getUserRankPosition = async (userId) => {
  try {
    const userSnap = await getDoc(doc(db, 'users', userId));
    if (!userSnap.exists()) return null;
    
    const userRating = userSnap.data().rating || 1500;
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('rating', '>', userRating));
    const snapshot = await getDocs(q);
    
    return snapshot.size + 1;
  } catch (error) {
    console.error('[Firestore] Error getUserRankPosition:', error);
    return null;
  }
};

/**
 * Leaderboard por país
 */
export const getCountryLeaderboard = async (country, limitCount = 50) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('country', '==', country),
      orderBy('rating', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc, index) => ({
      position: index + 1,
      id: doc.id,
      name: doc.data().name,
      avatar: doc.data().avatar,
      rating: doc.data().rating || 1500,
      rank: doc.data().rank || 'Bronze III',
      wins: doc.data().stats?.wins || 0,
      level: doc.data().level || 1
    }));
  } catch (error) {
    console.error('[Firestore] Error getCountryLeaderboard:', error);
    return [];
  }
};

// ============================================================================
// HISTORIAL DE PARTIDAS
// ============================================================================

/**
 * Guardar partida terminada
 */
export const saveMatch = async (matchData) => {
  try {
    const matchesRef = collection(db, 'matches');
    
    const match = {
      salaId: matchData.salaId,
      mode: matchData.mode || 'ranked',
      
      // IDs de jugadores (para queries)
      playerIds: matchData.players.map(p => p.odId),
      
      // Datos completos de jugadores
      players: matchData.players.map(p => ({
        odId: p.odId,
        name: p.name,
        team: p.team,
        position: p.position,
        ratingBefore: p.rating || 1500,
        ratingAfter: p.newRating,
        ratingChange: p.ratingChange
      })),
      
      // Resultado
      winner: matchData.winner,
      finalScore: matchData.finalScore,
      totalRounds: matchData.totalRounds,
      
      // Tiempos
      duration: matchData.duration,
      createdAt: serverTimestamp(),
      finishedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(matchesRef, match);
    console.log('[Firestore] ✅ Partida guardada:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('[Firestore] Error saveMatch:', error);
    return null;
  }
};

/**
 * Obtener historial de partidas de un jugador
 */
export const getMatchHistory = async (userId, limitCount = 20) => {
  try {
    const matchesRef = collection(db, 'matches');
    const q = query(
      matchesRef,
      where('playerIds', 'array-contains', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      const player = data.players?.find(p => p.odId === userId);
      const won = data.winner === player?.team;
      
      return {
        id: doc.id,
        date: data.createdAt?.toDate?.() || new Date(),
        mode: data.mode,
        won,
        score: `${data.finalScore?.team0 || 0} - ${data.finalScore?.team1 || 0}`,
        ratingChange: player?.ratingChange || 0,
        duration: data.duration,
        rounds: data.totalRounds
      };
    });
  } catch (error) {
    console.error('[Firestore] Error getMatchHistory:', error);
    return [];
  }
};

// ============================================================================
// SISTEMA SOCIAL - AMIGOS
// ============================================================================

/**
 * Enviar solicitud de amistad
 */
export const sendFriendRequest = async (fromUserId, toUserId) => {
  try {
    const toUserRef = doc(db, 'users', toUserId);
    await updateDoc(toUserRef, {
      friendRequests: arrayUnion(fromUserId)
    });
    
    console.log(`[Firestore] 📨 Solicitud enviada a ${toUserId}`);
    return { success: true };
  } catch (error) {
    console.error('[Firestore] Error sendFriendRequest:', error);
    return { success: false, error: 'Error al enviar solicitud' };
  }
};

/**
 * Aceptar solicitud de amistad
 */
export const acceptFriendRequest = async (userId, friendId) => {
  try {
    const batch = writeBatch(db);
    
    const userRef = doc(db, 'users', userId);
    const friendRef = doc(db, 'users', friendId);
    
    // Agregar como amigos mutuamente
    batch.update(userRef, {
      friends: arrayUnion(friendId),
      friendRequests: arrayRemove(friendId)
    });
    
    batch.update(friendRef, {
      friends: arrayUnion(userId)
    });
    
    await batch.commit();
    
    console.log(`[Firestore] ✅ Amistad aceptada: ${userId} <-> ${friendId}`);
    return { success: true };
  } catch (error) {
    console.error('[Firestore] Error acceptFriendRequest:', error);
    return { success: false, error: 'Error al aceptar' };
  }
};

/**
 * Rechazar solicitud
 */
export const rejectFriendRequest = async (userId, friendId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      friendRequests: arrayRemove(friendId)
    });
    return { success: true };
  } catch (error) {
    console.error('[Firestore] Error rejectFriendRequest:', error);
    return { success: false };
  }
};

/**
 * Eliminar amigo
 */
export const removeFriend = async (userId, friendId) => {
  try {
    const batch = writeBatch(db);
    
    const userRef = doc(db, 'users', userId);
    const friendRef = doc(db, 'users', friendId);
    
    batch.update(userRef, {
      friends: arrayRemove(friendId)
    });
    
    batch.update(friendRef, {
      friends: arrayRemove(userId)
    });
    
    await batch.commit();
    
    return { success: true };
  } catch (error) {
    console.error('[Firestore] Error removeFriend:', error);
    return { success: false };
  }
};

/**
 * Obtener lista de amigos con datos completos
 */
export const getFriendsList = async (userId) => {
  try {
    const userSnap = await getDoc(doc(db, 'users', userId));
    if (!userSnap.exists()) return [];
    
    const friendIds = userSnap.data().friends || [];
    if (friendIds.length === 0) return [];
    
    // Obtener datos de cada amigo
    const friends = await Promise.all(
      friendIds.map(async (friendId) => {
        const friendSnap = await getDoc(doc(db, 'users', friendId));
        if (friendSnap.exists()) {
          const data = friendSnap.data();
          return {
            id: friendId,
            name: data.name,
            avatar: data.avatar,
            rating: data.rating,
            rank: data.rank,
            level: data.level,
            isOnline: data.isOnline,
            lastLogin: data.lastLogin
          };
        }
        return null;
      })
    );
    
    return friends.filter(f => f !== null);
  } catch (error) {
    console.error('[Firestore] Error getFriendsList:', error);
    return [];
  }
};

/**
 * Obtener solicitudes pendientes
 */
export const getPendingRequests = async (userId) => {
  try {
    const userSnap = await getDoc(doc(db, 'users', userId));
    if (!userSnap.exists()) return [];
    
    const requestIds = userSnap.data().friendRequests || [];
    if (requestIds.length === 0) return [];
    
    const requests = await Promise.all(
      requestIds.map(async (reqId) => {
        const reqSnap = await getDoc(doc(db, 'users', reqId));
        if (reqSnap.exists()) {
          const data = reqSnap.data();
          return {
            id: reqId,
            name: data.name,
            avatar: data.avatar,
            rating: data.rating,
            rank: data.rank
          };
        }
        return null;
      })
    );
    
    return requests.filter(r => r !== null);
  } catch (error) {
    console.error('[Firestore] Error getPendingRequests:', error);
    return [];
  }
};

// ============================================================================
// BÚSQUEDA DE USUARIOS
// ============================================================================

/**
 * Buscar usuarios por nombre
 */
export const searchUsers = async (searchTerm, limitCount = 10) => {
  try {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      avatar: doc.data().avatar,
      rating: doc.data().rating || 1500,
      rank: doc.data().rank || 'Bronze III',
      level: doc.data().level || 1,
      isOnline: doc.data().isOnline
    }));
  } catch (error) {
    console.error('[Firestore] Error searchUsers:', error);
    return [];
  }
};

// ============================================================================
// ESTADÍSTICAS GLOBALES
// ============================================================================

/**
 * Obtener estadísticas globales
 */
export const getGlobalStats = async () => {
  try {
    // Contar usuarios
    const usersSnap = await getDocs(collection(db, 'users'));
    const totalUsers = usersSnap.size;
    
    // Contar partidas (aproximado - Firestore no tiene count nativo gratis)
    const matchesSnap = await getDocs(
      query(collection(db, 'matches'), limit(1000))
    );
    const totalMatches = matchesSnap.size;
    
    return {
      totalUsers,
      totalMatches,
      onlineNow: 0 // Se actualiza desde el servidor
    };
  } catch (error) {
    console.error('[Firestore] Error getGlobalStats:', error);
    return { totalUsers: 0, totalMatches: 0, onlineNow: 0 };
  }
};

// ============================================================================
// EXPORT
// ============================================================================

export { db };

export default {
  // Usuarios
  getOrCreateUser,
  getUserById,
  updateUser,
  setUserOffline,
  subscribeToUser,
  
  // Stats y Ranking
  updateGameStats,
  getLeaderboard,
  getUserRankPosition,
  getCountryLeaderboard,
  
  // Tienda
  purchaseItem,
  equipCosmetic,
  addCurrency,
  
  // Partidas
  saveMatch,
  getMatchHistory,
  
  // Social
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriendsList,
  getPendingRequests,
  
  // Búsqueda
  searchUsers,
  
  // Global
  getGlobalStats
};
