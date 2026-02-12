// ============================================================================
// SISTEMA DE AMIGOS
// ============================================================================
// Gestión de amigos, solicitudes y estados de conexión
// ============================================================================

// ============================================================================
// CONSTANTES
// ============================================================================

export const REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  BLOCKED: 'blocked'
};

export const ONLINE_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  IN_GAME: 'in_game',
  AWAY: 'away'
};

// Límites del sistema
export const FRIENDS_LIMITS = {
  MAX_FRIENDS: 100,
  MAX_PENDING_REQUESTS: 50,
  MAX_BLOCKED: 50
};

// ============================================================================
// GENERADORES DE DEMO (para desarrollo/testing)
// ============================================================================

// Datos de ejemplo
const DEMO_NAMES = [
  'DominoMaster', 'ElCubano', 'LaReina', 'TrankeroX', 'CapicuaKing',
  'DobleNueve', 'FichaLoca', 'ElProfesional', 'MesaVIP', 'PartidaRápida',
  'JugadorPro', 'ElInvicto', 'DominoLegend', 'CampeonMundial', 'ElEstratega'
];

const DEMO_AVATARS = ['😎', '🤓', '😊', '🔥', '⭐', '👑', '💎', '🎯', '🏆', '🎮'];
const DEMO_TIERS = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'];
const DEMO_STATUSES = ['online', 'offline', 'in_game', 'offline', 'offline', 'online'];

/**
 * Generar amigos de ejemplo (para demo)
 */
export const generateDemoFriends = (count = 8) => {
  return DEMO_NAMES.slice(0, count).map((name, i) => ({
    id: `friend_${i}_${Date.now()}`,
    name,
    avatar: DEMO_AVATARS[i % DEMO_AVATARS.length],
    rating: 1000 + Math.floor(Math.random() * 1500),
    tier: DEMO_TIERS[Math.floor(i / 2) % DEMO_TIERS.length],
    status: DEMO_STATUSES[i % DEMO_STATUSES.length],
    lastSeen: Date.now() - Math.floor(Math.random() * 86400000 * 7),
    gamesPlayed: Math.floor(50 + Math.random() * 500),
    winRate: Math.floor(40 + Math.random() * 30),
    addedAt: Date.now() - Math.floor(Math.random() * 86400000 * 30)
  }));
};

/**
 * Generar solicitudes de ejemplo
 */
export const generateDemoRequests = () => {
  const names = ['NuevoRetador', 'ProPlayer99', 'ElMejor2024'];
  const avatars = ['🎲', '🃏', '🎰'];
  
  return names.map((name, i) => ({
    id: `request_${i}_${Date.now()}`,
    name,
    avatar: avatars[i],
    rating: 1200 + Math.floor(Math.random() * 800),
    tier: ['silver', 'gold', 'platinum'][i],
    sentAt: Date.now() - Math.floor(Math.random() * 86400000 * 3),
    message: ['¡Juguemos!', 'Buena partida, agrégame', ''][i]
  }));
};

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Formatear tiempo desde última conexión
 */
export const formatLastSeen = (timestamp) => {
  if (!timestamp) return 'Desconocido';
  
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Ahora mismo';
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours}h`;
  if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`;
  return `Hace más de una semana`;
};

/**
 * Obtener color de estado
 */
export const getStatusColor = (status) => {
  const colors = {
    [ONLINE_STATUS.ONLINE]: '#22c55e',    // verde
    [ONLINE_STATUS.IN_GAME]: '#f59e0b',   // naranja
    [ONLINE_STATUS.AWAY]: '#eab308',      // amarillo
    [ONLINE_STATUS.OFFLINE]: '#6b7280'    // gris
  };
  return colors[status] || colors[ONLINE_STATUS.OFFLINE];
};

/**
 * Obtener texto de estado
 */
export const getStatusText = (status) => {
  const texts = {
    [ONLINE_STATUS.ONLINE]: 'En línea',
    [ONLINE_STATUS.IN_GAME]: 'En partida',
    [ONLINE_STATUS.AWAY]: 'Ausente',
    [ONLINE_STATUS.OFFLINE]: 'Desconectado'
  };
  return texts[status] || 'Desconocido';
};

/**
 * Ordenar amigos por estado (online primero)
 */
export const sortFriendsByStatus = (friends) => {
  const statusOrder = {
    [ONLINE_STATUS.ONLINE]: 0,
    [ONLINE_STATUS.IN_GAME]: 1,
    [ONLINE_STATUS.AWAY]: 2,
    [ONLINE_STATUS.OFFLINE]: 3
  };
  
  return [...friends].sort((a, b) => {
    const orderA = statusOrder[a.status] ?? 4;
    const orderB = statusOrder[b.status] ?? 4;
    if (orderA !== orderB) return orderA - orderB;
    // Si mismo estado, ordenar por rating
    return (b.rating || 0) - (a.rating || 0);
  });
};

/**
 * Filtrar amigos por búsqueda
 */
export const filterFriends = (friends, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') return friends;
  
  const term = searchTerm.toLowerCase().trim();
  return friends.filter(friend => 
    friend.name.toLowerCase().includes(term)
  );
};

/**
 * Obtener amigos online
 */
export const getOnlineFriends = (friends) => {
  return friends.filter(f => 
    f.status === ONLINE_STATUS.ONLINE || 
    f.status === ONLINE_STATUS.IN_GAME
  );
};

/**
 * Verificar si puede añadir más amigos
 */
export const canAddMoreFriends = (currentCount) => {
  return currentCount < FRIENDS_LIMITS.MAX_FRIENDS;
};

/**
 * Verificar si puede enviar más solicitudes
 */
export const canSendMoreRequests = (pendingCount) => {
  return pendingCount < FRIENDS_LIMITS.MAX_PENDING_REQUESTS;
};

// ============================================================================
// EXPORTACIÓN AGRUPADA
// ============================================================================

export const FriendsSystem = {
  REQUEST_STATUS,
  ONLINE_STATUS,
  LIMITS: FRIENDS_LIMITS,
  generateDemoFriends,
  generateDemoRequests,
  formatLastSeen,
  getStatusColor,
  getStatusText,
  sortFriendsByStatus,
  filterFriends,
  getOnlineFriends,
  canAddMoreFriends,
  canSendMoreRequests
};

export default FriendsSystem;
