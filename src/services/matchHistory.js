// ============================================================================
// SISTEMA DE HISTORIAL DE PARTIDAS (localStorage)
// ============================================================================
// Almacenamiento local de partidas para modo offline y respaldo
// Para Firebase, usar firestore.js -> getMatchHistory()
// ============================================================================

const STORAGE_KEY = 'dominoMatchHistory';
const MAX_HISTORY_SIZE = 100;

export const MatchHistory = {
  // ─────────────────────────────────────────────────────────────────────────
  // Crear entrada de historial
  // ─────────────────────────────────────────────────────────────────────────
  createEntry: (match) => ({
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    date: new Date().toISOString(),
    
    // Jugadores
    player: {
      id: match.player?.id,
      name: match.player?.name,
      avatar: match.player?.avatar
    },
    partner: match.partner ? {
      id: match.partner?.id,
      name: match.partner?.name,
      avatar: match.partner?.avatar,
      isAI: match.partner?.isAI || false
    } : null,
    opponents: (match.opponents || []).map(opp => ({
      id: opp?.id,
      name: opp?.name,
      avatar: opp?.avatar,
      isAI: opp?.isAI || false
    })),
    
    // Resultado
    won: match.won,
    score: match.score || [0, 0], // [tuEquipo, otroEquipo]
    endReason: match.endReason || 'unknown', // 'domino', 'tranca', 'abandon', 'timeout'
    
    // MMR
    mmrBefore: match.mmrBefore || 1500,
    mmrAfter: match.mmrAfter || 1500,
    mmrChange: (match.mmrAfter || 1500) - (match.mmrBefore || 1500),
    
    // Estadísticas de la partida
    rounds: match.rounds || 1,
    duration: match.duration || 0, // en segundos
    
    // Metadata
    seasonId: match.seasonId || null,
    isPlacement: match.isPlacement || false,
    wasRanked: match.wasRanked ?? true,
    mode: match.mode || 'ranked' // 'ranked', 'casual', 'private', 'vs_ai'
  }),
  
  // ─────────────────────────────────────────────────────────────────────────
  // Guardar historial en localStorage
  // ─────────────────────────────────────────────────────────────────────────
  save: (history) => {
    try {
      // Mantener solo últimas N partidas
      const trimmed = history.slice(-MAX_HISTORY_SIZE);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      return true;
    } catch (e) {
      console.error('[MatchHistory] Error saving:', e);
      return false;
    }
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // Cargar historial desde localStorage
  // ─────────────────────────────────────────────────────────────────────────
  load: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('[MatchHistory] Error loading:', e);
      return [];
    }
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // Añadir nueva partida al historial
  // ─────────────────────────────────────────────────────────────────────────
  addMatch: (matchData) => {
    const history = MatchHistory.load();
    const entry = MatchHistory.createEntry(matchData);
    history.push(entry);
    MatchHistory.save(history);
    return entry;
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // Obtener últimas N partidas
  // ─────────────────────────────────────────────────────────────────────────
  getRecent: (limit = 20) => {
    const history = MatchHistory.load();
    return history.slice(-limit).reverse();
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // Obtener estadísticas del historial
  // ─────────────────────────────────────────────────────────────────────────
  getStats: () => {
    const history = MatchHistory.load();
    
    if (history.length === 0) {
      return {
        totalGames: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        avgDuration: 0,
        dominoes: 0,
        trancas: 0,
        currentStreak: 0,
        bestStreak: 0
      };
    }
    
    const wins = history.filter(m => m.won).length;
    const losses = history.length - wins;
    const dominoes = history.filter(m => m.endReason === 'domino' && m.won).length;
    const trancas = history.filter(m => m.endReason === 'tranca' && m.won).length;
    const totalDuration = history.reduce((sum, m) => sum + (m.duration || 0), 0);
    
    // Calcular racha actual
    let currentStreak = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].won) currentStreak++;
      else break;
    }
    
    // Calcular mejor racha
    let bestStreak = 0;
    let tempStreak = 0;
    history.forEach(m => {
      if (m.won) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });
    
    return {
      totalGames: history.length,
      wins,
      losses,
      winRate: Math.round((wins / history.length) * 100),
      avgDuration: Math.round(totalDuration / history.length),
      dominoes,
      trancas,
      currentStreak,
      bestStreak
    };
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // Limpiar historial
  // ─────────────────────────────────────────────────────────────────────────
  clear: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (e) {
      console.error('[MatchHistory] Error clearing:', e);
      return false;
    }
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // Obtener partidas filtradas
  // ─────────────────────────────────────────────────────────────────────────
  getFiltered: (filters = {}) => {
    let history = MatchHistory.load();
    
    if (filters.mode) {
      history = history.filter(m => m.mode === filters.mode);
    }
    
    if (filters.won !== undefined) {
      history = history.filter(m => m.won === filters.won);
    }
    
    if (filters.fromDate) {
      const fromTimestamp = new Date(filters.fromDate).getTime();
      history = history.filter(m => m.timestamp >= fromTimestamp);
    }
    
    if (filters.toDate) {
      const toTimestamp = new Date(filters.toDate).getTime();
      history = history.filter(m => m.timestamp <= toTimestamp);
    }
    
    if (filters.partnerId) {
      history = history.filter(m => m.partner?.id === filters.partnerId);
    }
    
    return history.reverse();
  }
};

export default MatchHistory;
