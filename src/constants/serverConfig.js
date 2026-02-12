// ============================================================================
// SERVER CONFIG - Configuración de servidor y endpoints
// ============================================================================
// Migrado de DominoR.jsx línea 364
// Centraliza URLs y configuración de conexión
// ============================================================================

// ============================================================================
// SERVIDOR PRINCIPAL
// ============================================================================
export const SERVIDOR_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

// ============================================================================
// ENDPOINTS
// ============================================================================
export const ENDPOINTS = {
  // WebSocket
  socket: SERVIDOR_URL,
  
  // API REST (si se implementa)
  api: `${SERVIDOR_URL}/api`,
  
  // Auth
  auth: `${SERVIDOR_URL}/auth`,
  
  // Game
  matchmaking: `${SERVIDOR_URL}/matchmaking`,
  game: `${SERVIDOR_URL}/game`,
  
  // Leaderboard
  leaderboard: `${SERVIDOR_URL}/leaderboard`,
  
  // User
  profile: `${SERVIDOR_URL}/profile`,
  friends: `${SERVIDOR_URL}/friends`
};

// ============================================================================
// CONFIGURACIÓN DE CONEXIÓN
// ============================================================================
export const CONNECTION_CONFIG = {
  // Socket.io
  socket: {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    transports: ['websocket', 'polling']
  },
  
  // Fetch/API
  api: {
    timeout: 10000,
    retries: 3,
    retryDelay: 1000
  }
};

// ============================================================================
// ENVIRONMENT
// ============================================================================
export const ENV = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  isTest: import.meta.env.MODE === 'test'
};

// ============================================================================
// DEBUG
// ============================================================================
export const DEBUG = {
  enabled: ENV.isDevelopment,
  logSocket: ENV.isDevelopment,
  logState: false,
  logRender: false
};

export default {
  SERVIDOR_URL,
  ENDPOINTS,
  CONNECTION_CONFIG,
  ENV,
  DEBUG
};
