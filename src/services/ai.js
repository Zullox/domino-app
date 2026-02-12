// ============================================================================
// SISTEMA DE IA AVANZADA - DOMINÓ CUBANO EN PAREJAS
// ============================================================================
// IA con 14 estrategias de juego en equipo
// Incluye memoria de pases, control de números, y coordinación con compañero
// ============================================================================

import { 
  isDouble, 
  tileValue, 
  getPlayablePositions,
  getBoardEnds
} from '../utils/gameEngine';

// ============================================================================
// FUNCIONES DE ANÁLISIS
// ============================================================================

/**
 * Cuenta cuántas veces aparece cada número en las fichas
 */
export const countNumbers = (tiles) => {
  const counts = {};
  for (let i = 0; i <= 9; i++) counts[i] = 0;
  
  tiles.forEach(tile => {
    counts[tile.left]++;
    counts[tile.right]++;
  });
  
  return counts;
};

/**
 * Analiza qué números han sido jugados en el tablero
 */
export const getPlayedNumbers = (board) => {
  const played = {};
  for (let i = 0; i <= 9; i++) played[i] = 0;
  
  if (board.tiles) {
    board.tiles?.forEach(tile => {
      played[tile.left]++;
      played[tile.right]++;
    });
  }
  
  return played;
};

/**
 * Calcula qué números están "muertos" (ya salieron todas las apariciones)
 * En dominó de 9, cada número aparece 10 veces máximo
 */
export const getDeadNumbers = (board, myTiles) => {
  const dead = new Set();
  const played = getPlayedNumbers(board);
  const mine = countNumbers(myTiles);
  
  for (let i = 0; i <= 9; i++) {
    // Si entre el tablero y mis fichas ya hay 9+, el número está casi muerto
    if (played[i] + mine[i] >= 9) {
      dead.add(i);
    }
  }
  
  return dead;
};

// ============================================================================
// SISTEMA DE PUNTUACIÓN DE JUGADAS
// ============================================================================

/**
 * Evalúa una jugada considerando 14 estrategias de juego en equipo
 * 
 * @param {Object} move - { tile, position }
 * @param {Object} player - Jugador actual con sus fichas
 * @param {Object} board - Estado del tablero
 * @param {Object} teammate - Compañero de equipo
 * @param {Array} opponents - Array de oponentes
 * @param {boolean} isFirstMove - Si es la primera jugada
 * @param {number} playerIndex - Índice del jugador (0-3)
 * @param {Object} passedNumbers - Memoria de qué números cada jugador NO tiene
 * @returns {number} Puntuación de la jugada
 */
export const scoreMove = (move, player, board, teammate, opponents, isFirstMove, playerIndex, passedNumbers) => {
  let score = 0;
  const tile = move.tile;
  const tileIsDouble = isDouble(tile);
  const myCounts = countNumbers(player.tiles);
  const deadNumbers = getDeadNumbers(board, player.tiles);
  const teammateIdx = (playerIndex + 2) % 4;
  
  // Obtener extremos actuales del tablero
  const ends = board.tiles?.length > 0 
    ? getBoardEnds(board)
    : { left: null, right: null };
  
  // Calcular qué número dejaré en el extremo después de jugar
  let numberILeave;
  if (move.position === 'left') {
    numberILeave = tile.left === ends.left ? tile.right : tile.left;
  } else if (move.position === 'right') {
    numberILeave = tile.left === ends.right ? tile.right : tile.left;
  } else {
    // Primera ficha (centro)
    numberILeave = tileIsDouble ? tile.left : Math.max(tile.left, tile.right);
  }
  
  const controlCount = myCounts[numberILeave] || 0;
  const played = getPlayedNumbers(board);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ESTRATEGIA 1: Control de números
  // ═══════════════════════════════════════════════════════════════════════════
  // Cuantas más fichas tenga de un número, mejor dejarlo en el extremo
  score += controlCount * 15;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ESTRATEGIA 2: Dobles - salir de ellos pronto
  // ═══════════════════════════════════════════════════════════════════════════
  // Los dobles son difíciles de jugar, mejor salir de ellos rápido
  if (tileIsDouble) {
    score += 50 + tile.left * 5; // Dobles altos valen más sacarlos
    // Pero si tengo muchas de ese número, quizás quiera guardarlo
    if (controlCount >= 3) {
      score -= 30;
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ESTRATEGIA 3: Dejar extremos que controlo
  // ═══════════════════════════════════════════════════════════════════════════
  // Ya cubierto por estrategia 1, pero reforzar si tengo muchas
  if (controlCount >= 4) {
    score += 25; // Bonus adicional por control fuerte
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ESTRATEGIA 4: Evitar números muertos
  // ═══════════════════════════════════════════════════════════════════════════
  // No dejar un número que ya casi no existe
  if (deadNumbers.has(numberILeave)) {
    score -= 40;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ESTRATEGIA 5: Bloquear oponentes
  // ═══════════════════════════════════════════════════════════════════════════
  // Si un número ha salido mucho, es bueno dejarlo (oponentes no lo tienen)
  if (played[numberILeave] >= 6) {
    score += 25;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ESTRATEGIA 6: Reducir puntos en mano
  // ═══════════════════════════════════════════════════════════════════════════
  // Preferir jugar fichas de alto valor (menos puntos si pierdo)
  score += tileValue(tile) * 2;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ESTRATEGIA 7: Mantener opciones futuras
  // ═══════════════════════════════════════════════════════════════════════════
  // Calcular cuántas fichas podré jugar después de esta jugada
  const remainingTiles = player.tiles.filter(t => t.id !== tile.id);
  const newEnds = { ...ends };
  if (move.position === 'left') {
    newEnds.left = numberILeave;
  } else if (move.position === 'right') {
    newEnds.right = numberILeave;
  }
  
  let futurePlayable = 0;
  remainingTiles.forEach(t => {
    if (t.left === newEnds.left || t.right === newEnds.left ||
        t.left === newEnds.right || t.right === newEnds.right) {
      futurePlayable++;
    }
  });
  score += futurePlayable * 10;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ESTRATEGIA 8: Primera jugada óptima
  // ═══════════════════════════════════════════════════════════════════════════
  if (isFirstMove) {
    // Preferir dobles en primera jugada
    if (tileIsDouble) {
      score += 30 + tile.left * 3;
    }
    // Preferir números que controlo
    const leftCount = myCounts[tile.left] || 0;
    const rightCount = myCounts[tile.right] || 0;
    score += (leftCount + rightCount) * 8;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ESTRATEGIA 9: JUEGO EN EQUIPO - Memoria de pases
  // ═══════════════════════════════════════════════════════════════════════════
  // Si mi compañero pasó cuando había cierto número, NO lo tiene
  if (passedNumbers && passedNumbers[teammateIdx]) {
    const teammateDoesntHave = passedNumbers[teammateIdx];
    if (teammateDoesntHave.has(numberILeave)) {
      score -= 50; // ¡No dejar un número que mi compañero no tiene!
    }
  }
  
  // Si un oponente pasó cuando había cierto número, bloquear con ese número es bueno
  const opp1 = (playerIndex + 1) % 4;
  const opp2 = (playerIndex + 3) % 4;
  if (passedNumbers) {
    if (passedNumbers[opp1]?.has(numberILeave)) {
      score += 30; // Oponente 1 no tiene este número
    }
    if (passedNumbers[opp2]?.has(numberILeave)) {
      score += 30; // Oponente 2 no tiene este número
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ESTRATEGIA 10: Ayudar al compañero
  // ═══════════════════════════════════════════════════════════════════════════
  const totalPlayed = played[numberILeave] || 0;
  const iHave = myCounts[numberILeave] || 0;
  const remainingInGame = 10 - totalPlayed - iHave;
  
  // Si quedan muchas de ese número en juego, mi compañero podría tenerlas
  if (remainingInGame >= 3) {
    score += 15;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ESTRATEGIA 11: Castigar si dejo cerrado para mi equipo
  // ═══════════════════════════════════════════════════════════════════════════
  // Si quedan pocas de ese número y yo no tengo muchas, malo
  if (remainingInGame <= 1 && controlCount <= 1) {
    score -= 20;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ESTRATEGIA 12: Preferir cerrar números que oponentes tienen
  // ═══════════════════════════════════════════════════════════════════════════
  // Si un número ha salido poco y yo tengo pocas, probablemente oponentes lo tienen
  if (totalPlayed <= 3 && iHave <= 1) {
    if (numberILeave === tile.left || numberILeave === tile.right) {
      score -= 15; // Malo dejar número fresco que oponentes probablemente tienen
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ESTRATEGIA 13: Si el compañero tiene pocas fichas, dejarlo ganar
  // ═══════════════════════════════════════════════════════════════════════════
  if (teammate && teammate.tiles && teammate.tiles.length <= 2) {
    // Compañero cerca de ganar, no cerrar el juego
    if (remainingInGame >= 2) {
      score += 20;
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ESTRATEGIA 14: Cuadrar cuando conviene
  // ═══════════════════════════════════════════════════════════════════════════
  // Si puedo cerrar (cuadrar) y mi equipo probablemente tiene menos puntos
  if (ends.left === ends.right && 
      (tile.left === ends.left && tile.right === ends.left)) {
    // Esta ficha cuadra el juego
    score += 25;
  }
  
  return score;
};

// ============================================================================
// DECISIÓN FINAL DE LA IA
// ============================================================================

/**
 * Decide la mejor jugada para un jugador CPU
 * 
 * @param {Object} state - Estado completo del juego
 * @param {number} playerIndex - Índice del jugador (0-3)
 * @param {Object} passedNumbers - Memoria de pases { [playerIdx]: Set<numbers> }
 * @returns {Object} { action: 'play'|'pass', tile?, position? }
 */
export const decide = (state, playerIndex, passedNumbers = {}) => {
  const player = state.players[playerIndex];
  const teammate = state.players[(playerIndex + 2) % 4];
  const opponents = [
    state.players[(playerIndex + 1) % 4], 
    state.players[(playerIndex + 3) % 4]
  ];
  const board = state.board;
  const isFirstMove = !board.tiles || board.tiles.length === 0;
  
  // Si debe jugar un doble específico (regla de salida)
  if (state.mustPlayDouble) {
    const mustTile = player.tiles.find(t => t.id === state.mustPlayDouble.id);
    if (mustTile) {
      return { action: 'play', tile: mustTile, position: 'center' };
    }
  }
  
  // Generar todas las jugadas posibles
  const moves = [];
  player.tiles.forEach(tile => {
    const positions = getPlayablePositions(tile, board);
    positions.forEach(pos => {
      moves.push({ tile, position: pos });
    });
  });
  
  // Si no hay jugadas, pasar
  if (moves.length === 0) {
    return { action: 'pass' };
  }
  
  // Puntuar cada jugada
  const scoredMoves = moves.map(move => ({
    ...move,
    score: scoreMove(move, player, board, teammate, opponents, isFirstMove, playerIndex, passedNumbers)
  }));
  
  // Ordenar por puntuación descendente
  scoredMoves.sort((a, b) => b.score - a.score);
  
  // Añadir variación para no ser predecible
  // Elegir aleatoriamente entre las mejores jugadas (diferencia <= 10 puntos)
  const topMoves = scoredMoves.filter(m => m.score >= scoredMoves[0].score - 10);
  const chosen = topMoves[Math.floor(Math.random() * topMoves.length)];
  
  return { 
    action: 'play', 
    tile: chosen.tile, 
    position: chosen.position,
    score: chosen.score // Para debugging
  };
};

// ============================================================================
// GESTIÓN DE MEMORIA DE PASES
// ============================================================================

/**
 * Registra que un jugador pasó cuando había ciertos números en los extremos
 * 
 * @param {Object} passedNumbers - Estado actual de memoria
 * @param {number} playerIndex - Jugador que pasó
 * @param {Object} board - Tablero actual
 * @returns {Object} Nueva memoria actualizada
 */
export const recordPass = (passedNumbers, playerIndex, board) => {
  const newMemory = { ...passedNumbers };
  if (!newMemory[playerIndex]) {
    newMemory[playerIndex] = new Set();
  }
  
  const ends = getBoardEnds(board);
  if (ends.left !== null) {
    newMemory[playerIndex].add(ends.left);
  }
  if (ends.right !== null && ends.right !== ends.left) {
    newMemory[playerIndex].add(ends.right);
  }
  
  return newMemory;
};

/**
 * Crea memoria de pases vacía
 */
export const createPassMemory = () => ({
  0: new Set(),
  1: new Set(),
  2: new Set(),
  3: new Set()
});

/**
 * Resetea la memoria de pases (al inicio de cada ronda)
 */
export const resetPassMemory = () => createPassMemory();

// ============================================================================
// IA SIMPLIFICADA PARA DIFERENTES DIFICULTADES
// ============================================================================

/**
 * IA con diferentes niveles de dificultad
 */
export const AIByDifficulty = {
  easy: (state, playerIndex) => {
    const player = state.players[playerIndex];
    const board = state.board;
    
    // IA Fácil: jugada aleatoria
    const playable = [];
    player.tiles.forEach(tile => {
      const positions = getPlayablePositions(tile, board);
      positions.forEach(pos => playable.push({ tile, position: pos }));
    });
    
    if (playable.length === 0) return { action: 'pass' };
    
    const chosen = playable[Math.floor(Math.random() * playable.length)];
    return { action: 'play', tile: chosen.tile, position: chosen.position };
  },
  
  medium: (state, playerIndex) => {
    // IA Media: priorizar dobles y fichas de alto valor
    const player = state.players[playerIndex];
    const board = state.board;
    
    const playable = [];
    player.tiles.forEach(tile => {
      const positions = getPlayablePositions(tile, board);
      positions.forEach(pos => playable.push({ tile, position: pos }));
    });
    
    if (playable.length === 0) return { action: 'pass' };
    
    // Ordenar: dobles primero, luego mayor valor
    playable.sort((a, b) => {
      const aDouble = isDouble(a.tile) ? 1 : 0;
      const bDouble = isDouble(b.tile) ? 1 : 0;
      if (aDouble !== bDouble) return bDouble - aDouble;
      return tileValue(b.tile) - tileValue(a.tile);
    });
    
    return { action: 'play', tile: playable[0].tile, position: playable[0].position };
  },
  
  hard: (state, playerIndex, passedNumbers) => {
    // IA Difícil: usa las 14 estrategias completas
    return decide(state, playerIndex, passedNumbers);
  }
};

// ============================================================================
// EXPORTACIÓN AGRUPADA
// ============================================================================

export const AdvancedAI = {
  countNumbers,
  getPlayedNumbers,
  getDeadNumbers,
  scoreMove,
  decide,
  recordPass,
  createPassMemory,
  resetPassMemory,
  byDifficulty: AIByDifficulty
};

export default AdvancedAI;
