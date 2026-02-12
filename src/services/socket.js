// ============================================================================
// SERVICIO DE SOCKET - Conexión con el Servidor
// ============================================================================
// Maneja toda la conexión WebSocket con el servidor de forma centralizada.
// El cliente NUNCA calcula lógica de juego - solo muestra lo que el servidor envía.

import { io } from 'socket.io-client';
import { getIdToken } from '../firebase';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
const MAX_RECONNECT_ATTEMPTS = 5;

let socket = null;
let reconnectAttempts = 0;
let currentGameId = null;

// Callbacks registrados para cada evento
const listeners = new Map();

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

/**
 * Inicializar conexión con el servidor
 * @param {boolean} withAuth - Si debe autenticarse con Firebase token
 */
export const initSocket = async (withAuth = true) => {
  if (socket?.connected) {
    console.log('[Socket] ⚠️ Ya conectado');
    return socket;
  }
  
  let authToken = null;
  
  if (withAuth) {
    try {
      authToken = await getIdToken();
    } catch (error) {
      console.warn('[Socket] No se pudo obtener token, conectando como invitado');
    }
  }
  
  socket = io(SERVER_URL, {
    auth: authToken ? { token: authToken } : undefined,
    transports: ['websocket', 'polling'],
    timeout: 10000,
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    autoConnect: true
  });
  
  setupEventListeners();
  
  return socket;
};

/**
 * Configurar todos los listeners de eventos del servidor
 */
const setupEventListeners = () => {
  if (!socket) return;
  
  // ══════════════════════════════════════════════════════════════════════════
  // EVENTOS DE CONEXIÓN
  // ══════════════════════════════════════════════════════════════════════════
  
  socket.on('connect', () => {
    console.log('[Socket] ✅ Conectado:', socket.id);
    reconnectAttempts = 0;
    emit('onConnect', { socketId: socket.id });
  });
  
  socket.on('connected', (data) => {
    console.log('[Socket] 👤 Usuario:', data.user?.name);
    emit('onAuthenticated', data);
  });
  
  socket.on('disconnect', (reason) => {
    console.log('[Socket] ❌ Desconectado:', reason);
    emit('onDisconnect', { reason });
  });
  
  socket.on('connect_error', (error) => {
    console.error('[Socket] ⚠️ Error:', error.message);
    reconnectAttempts++;
    emit('onError', { 
      message: error.message, 
      attempts: reconnectAttempts,
      maxAttempts: MAX_RECONNECT_ATTEMPTS
    });
  });
  
  // ══════════════════════════════════════════════════════════════════════════
  // EVENTOS DE MATCHMAKING
  // ══════════════════════════════════════════════════════════════════════════
  
  socket.on('matchmaking:joined', (data) => {
    console.log('[Matchmaking] 🔍 En cola, posición:', data.position);
    emit('onMatchmakingJoined', data);
  });
  
  socket.on('matchmaking:status', (data) => {
    emit('onMatchmakingStatus', data);
  });
  
  socket.on('matchmaking:found', (data) => {
    console.log('[Matchmaking] 🎮 ¡Partida encontrada!');
    currentGameId = data.gameId;
    emit('onMatchFound', data);
  });
  
  socket.on('matchmaking:cancelled', () => {
    console.log('[Matchmaking] ❌ Búsqueda cancelada');
    emit('onMatchmakingCancelled', {});
  });
  
  socket.on('matchmaking:timeout', () => {
    console.log('[Matchmaking] ⏰ Timeout');
    emit('onMatchmakingTimeout', {});
  });
  
  // ══════════════════════════════════════════════════════════════════════════
  // EVENTOS DE JUEGO
  // ══════════════════════════════════════════════════════════════════════════
  
  socket.on('game:start', (data) => {
    console.log('[Game] 🎲 Partida iniciada');
    currentGameId = data.gameId;
    emit('onGameStart', data);
  });
  
  socket.on('game:state', (data) => {
    emit('onGameState', data);
  });
  
  socket.on('game:turn', (data) => {
    emit('onTurnChange', data);
  });
  
  socket.on('game:yourTurn', (data) => {
    emit('onMyTurn', data);
  });
  
  socket.on('game:move', (data) => {
    emit('onTilePlayed', data);
  });
  
  socket.on('game:pass', (data) => {
    emit('onPlayerPass', data);
  });
  
  socket.on('game:roundEnd', (data) => {
    emit('onRoundEnd', data);
  });
  
  socket.on('game:newRound', (data) => {
    console.log('[Game] 🔄 Nueva ronda:', data.roundNumber);
    emit('onNewRound', data);
  });
  
  socket.on('game:end', (data) => {
    console.log('[Game] 🏆 Partida terminada');
    emit('onGameEnd', data);
    currentGameId = null;
  });
  
  socket.on('game:error', (data) => {
    console.error('[Game] ❌ Error:', data.message);
    emit('onGameError', data);
  });
  
  socket.on('game:emote', (data) => {
    emit('onEmote', data);
  });
  
  socket.on('game:playerDisconnected', (data) => {
    console.log('[Game] 💔 Jugador desconectado:', data.name);
    emit('onPlayerDisconnected', data);
  });
  
  socket.on('game:playerReconnected', (data) => {
    console.log('[Game] 🔄 Jugador reconectado:', data.name);
    emit('onPlayerReconnected', data);
  });
  
  socket.on('game:playerAbandoned', (data) => {
    console.log('[Game] 🚪 Jugador abandonó:', data.name);
    emit('onPlayerAbandoned', data);
  });
  
  socket.on('game:playerSurrendered', (data) => {
    emit('onPlayerSurrendered', data);
  });
  
  // ══════════════════════════════════════════════════════════════════════════
  // EVENTOS SOCIALES
  // ══════════════════════════════════════════════════════════════════════════
  
  socket.on('social:invitation', (data) => {
    emit('onGameInvitation', data);
  });
  
  socket.on('social:inviteSent', (data) => {
    emit('onInviteSent', data);
  });
  
  socket.on('chat:message', (data) => {
    emit('onChatMessage', data);
  });
  
  // ══════════════════════════════════════════════════════════════════════════
  // ESTADÍSTICAS
  // ══════════════════════════════════════════════════════════════════════════
  
  socket.on('stats:online', (data) => {
    emit('onOnlineStats', data);
  });
  
  // Ping/Pong
  socket.on('pong', (data) => {
    emit('onPong', data);
  });
};

// ============================================================================
// SISTEMA DE EVENTOS
// ============================================================================

/**
 * Emitir evento a todos los listeners registrados
 */
const emit = (eventName, data) => {
  const callbacks = listeners.get(eventName) || [];
  callbacks.forEach(cb => {
    try {
      cb(data);
    } catch (error) {
      console.error(`[Socket] Error en callback ${eventName}:`, error);
    }
  });
};

/**
 * Registrar callback para un evento
 * @returns {Function} Función para desregistrar
 */
export const on = (eventName, callback) => {
  if (!listeners.has(eventName)) {
    listeners.set(eventName, []);
  }
  listeners.get(eventName).push(callback);
  
  // Retornar función para desregistrar
  return () => off(eventName, callback);
};

/**
 * Desregistrar callback de un evento
 */
export const off = (eventName, callback) => {
  const callbacks = listeners.get(eventName) || [];
  listeners.set(eventName, callbacks.filter(cb => cb !== callback));
};

/**
 * Limpiar todos los listeners de un evento
 */
export const clearListeners = (eventName) => {
  if (eventName) {
    listeners.delete(eventName);
  } else {
    listeners.clear();
  }
};

// ============================================================================
// ACCIONES - MATCHMAKING
// ============================================================================

/**
 * Buscar partida
 */
export const searchMatch = (options = {}) => {
  if (!socket?.connected) {
    console.error('[Socket] No conectado');
    return false;
  }
  
  const { mode = 'ranked', targetScore = 100 } = options;
  
  socket.emit('matchmaking:join', { mode, targetScore });
  console.log('[Socket] 🔍 Buscando partida...');
  return true;
};

/**
 * Cancelar búsqueda de partida
 */
export const cancelSearch = () => {
  if (!socket?.connected) return false;
  socket.emit('matchmaking:cancel');
  return true;
};

// ============================================================================
// ACCIONES - JUEGO
// ============================================================================

/**
 * Jugar una ficha
 * @param {string} tileId - ID de la ficha a jugar
 * @param {string} side - Lado del tablero ('left' o 'right')
 */
export const playTile = (tileId, side) => {
  if (!socket?.connected || !currentGameId) {
    console.error('[Socket] No conectado o sin partida activa');
    return false;
  }
  
  socket.emit('game:playTile', { 
    gameId: currentGameId, 
    tileId, 
    side 
  });
  return true;
};

/**
 * Pasar turno
 */
export const passTurn = () => {
  if (!socket?.connected || !currentGameId) return false;
  socket.emit('game:pass', { gameId: currentGameId });
  return true;
};

/**
 * Enviar emote
 */
export const sendEmote = (emote) => {
  if (!socket?.connected || !currentGameId) return false;
  socket.emit('game:emote', { gameId: currentGameId, emote });
  return true;
};

/**
 * Rendirse
 */
export const surrender = () => {
  if (!socket?.connected || !currentGameId) return false;
  socket.emit('game:surrender', { gameId: currentGameId });
  return true;
};

/**
 * Solicitar estado del juego (para reconexión)
 */
export const requestGameState = (gameId = currentGameId) => {
  if (!socket?.connected || !gameId) return false;
  socket.emit('game:requestState', { gameId });
  return true;
};

// ============================================================================
// ACCIONES - SOCIAL
// ============================================================================

/**
 * Invitar amigo a jugar
 */
export const inviteFriend = (friendId) => {
  if (!socket?.connected) return false;
  socket.emit('social:invite', { friendId });
  return true;
};

/**
 * Aceptar invitación
 */
export const acceptInvite = (fromId) => {
  if (!socket?.connected) return false;
  socket.emit('social:acceptInvite', { fromId });
  return true;
};

/**
 * Enviar mensaje de chat
 */
export const sendChatMessage = (message) => {
  if (!socket?.connected || !currentGameId) return false;
  socket.emit('chat:message', { gameId: currentGameId, message });
  return true;
};

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Desconectar del servidor
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentGameId = null;
    console.log('[Socket] 🔌 Desconectado');
  }
};

/**
 * Reconectar al servidor
 */
export const reconnect = () => {
  if (socket && !socket.connected) {
    socket.connect();
  }
};

/**
 * Verificar si está conectado
 */
export const isConnected = () => socket?.connected ?? false;

/**
 * Obtener ID del socket
 */
export const getSocketId = () => socket?.id ?? null;

/**
 * Obtener ID de partida actual
 */
export const getCurrentGameId = () => currentGameId;

/**
 * Establecer ID de partida (usado por hooks)
 */
export const setCurrentGameId = (id) => { currentGameId = id; };

/**
 * Acciones de sala privada
 */
export const createPrivateRoom = (settings, callback) => {
  if (!socket?.connected) return false;
  socket.emit('private:create', settings, callback);
  return true;
};

export const joinPrivateRoom = (code, callback) => {
  if (!socket?.connected) return false;
  socket.emit('private:join', { code }, callback);
  return true;
};

export const leavePrivateRoom = (callback) => {
  if (!socket?.connected) return false;
  socket.emit('private:leave', callback);
  return true;
};

export const startPrivateRoom = (callback) => {
  if (!socket?.connected) return false;
  socket.emit('private:start', callback);
  return true;
};

export const inviteToRoom = (friendId, code) => {
  if (!socket?.connected) return false;
  socket.emit('private:invite', { friendId, code });
  return true;
};

/**
 * Ping al servidor
 */
export const ping = () => {
  if (!socket?.connected) return null;
  const start = Date.now();
  socket.emit('ping');
  return start;
};

/**
 * Obtener socket raw (para casos especiales)
 */
export const getSocket = () => socket;

// ============================================================================
// EXPORTAR TODO
// ============================================================================
const SocketService = {
  // Inicialización
  initSocket,
  disconnectSocket,
  reconnect,
  
  // Estado
  isConnected,
  getSocketId,
  getCurrentGameId,
  setCurrentGameId,
  getSocket,
  
  // Eventos
  on,
  off,
  clearListeners,
  
  // Matchmaking
  searchMatch,
  cancelSearch,
  
  // Juego
  playTile,
  passTurn,
  sendEmote,
  surrender,
  requestGameState,
  
  // Social
  inviteFriend,
  acceptInvite,
  sendChatMessage,
  
  // Salas privadas
  createPrivateRoom,
  joinPrivateRoom,
  leavePrivateRoom,
  startPrivateRoom,
  inviteToRoom,
  
  // Utilidades
  ping
};

export default SocketService;
