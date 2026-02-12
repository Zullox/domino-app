// ============================================================================
// MOTOR DE JUEGO - LÓGICA DE DOMINÓ
// ============================================================================
// IMPORTANTE: En modo ONLINE, esta lógica solo se usa para predicción visual.
// El servidor es la ÚNICA fuente de verdad para validación de jugadas.

import { CONFIG } from '../constants/game';

// ============================================================================
// GENERACIÓN DE FICHAS
// ============================================================================
export const generateAllTiles = () => {
  const tiles = [];
  for (let i = 0; i <= CONFIG.maxTile; i++) {
    for (let j = i; j <= CONFIG.maxTile; j++) {
      tiles.push({ left: i, right: j, id: `${i}-${j}` });
    }
  }
  return tiles;
};

export const shuffleTiles = (tiles) => {
  const arr = [...tiles];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const dealTiles = (numPlayers = 4) => {
  const all = shuffleTiles(generateAllTiles());
  const hands = [];
  for (let i = 0; i < numPlayers; i++) {
    hands.push(all.slice(i * CONFIG.tilesPerPlayer, (i + 1) * CONFIG.tilesPerPlayer));
  }
  return hands;
};

// ============================================================================
// VALOR DE FICHAS
// ============================================================================
export const tileValue = (tile) => tile.left + tile.right;

export const tilesValue = (tiles) => tiles.reduce((sum, t) => sum + tileValue(t), 0);

export const isDouble = (tile) => tile.left === tile.right;

// ============================================================================
// VALIDACIÓN DE JUGADAS
// ============================================================================
export const getBoardEnds = (board) => {
  if (!board || !board.tiles || board.tiles.length === 0) return { left: null, right: null };
  return { left: board.leftEnd, right: board.rightEnd };
};

export const canPlayAt = (tile, position, board) => {
  const ends = getBoardEnds(board);
  if (ends.left === null) return true; // Tablero vacío
  
  const targetEnd = position === 'left' ? ends.left : ends.right;
  return tile.left === targetEnd || tile.right === targetEnd;
};

export const canPlay = (tile, board) => {
  return canPlayAt(tile, 'left', board) || canPlayAt(tile, 'right', board);
};

export const getPlayablePositions = (tile, board) => {
  const positions = [];
  if (canPlayAt(tile, 'left', board)) positions.push('left');
  if (canPlayAt(tile, 'right', board)) positions.push('right');
  return positions;
};

export const hasPlayableTile = (tiles, board) => {
  return tiles.some(tile => canPlay(tile, board));
};

export const getPlayableTiles = (tiles, board) => {
  return tiles.filter(tile => canPlay(tile, board));
};

// ============================================================================
// TABLERO (ESTRUCTURA SNAKE)
// ============================================================================
export const createBoard = () => ({
  tiles: [],
  leftEnd: null,
  rightEnd: null,
  segments: []
});

export const placeTile = (board, tile, position) => {
  const newBoard = { ...board, tiles: [...board.tiles], segments: [...board.segments] };
  
  if (newBoard.tiles.length === 0) {
    // Primera ficha
    newBoard.leftEnd = tile.left;
    newBoard.rightEnd = tile.right;
    newBoard.tiles.push({ ...tile, rotation: 0, x: 0, y: 0 });
    return newBoard;
  }
  
  const targetEnd = position === 'left' ? newBoard.leftEnd : newBoard.rightEnd;
  let rotation = 0;
  let newEnd;
  
  // Determinar rotación y nuevo extremo
  if (tile.left === targetEnd) {
    newEnd = tile.right;
    rotation = position === 'left' ? 180 : 0;
  } else {
    newEnd = tile.left;
    rotation = position === 'left' ? 0 : 180;
  }
  
  // Actualizar extremo
  if (position === 'left') {
    newBoard.leftEnd = newEnd;
  } else {
    newBoard.rightEnd = newEnd;
  }
  
  newBoard.tiles.push({ ...tile, rotation, position });
  return newBoard;
};

// ============================================================================
// DETECCIÓN DE TRANCA
// ============================================================================
export const isBlocked = (players, board) => {
  // Tranca: ningún jugador puede jugar
  return players.every(p => !hasPlayableTile(p.tiles, board));
};

// ============================================================================
// CÁLCULO DE GANADOR EN TRANCA
// ============================================================================
export const getBlockedWinner = (players) => {
  // En parejas: suma de puntos por equipo
  const teamPoints = [0, 0];
  players.forEach(p => {
    teamPoints[p.team] += tilesValue(p.tiles);
  });
  
  if (teamPoints[0] < teamPoints[1]) return { team: 0, points: teamPoints };
  if (teamPoints[1] < teamPoints[0]) return { team: 1, points: teamPoints };
  return { team: -1, points: teamPoints }; // Empate
};

// ============================================================================
// CÁLCULO DE PUNTOS POR EQUIPO
// ============================================================================
export const getTeamPoints = (players) => {
  const points = [0, 0];
  players.forEach(p => {
    points[p.team] += tilesValue(p.tiles);
  });
  return points;
};

// ============================================================================
// ENCONTRAR MAYOR DOBLE
// ============================================================================
export const findHighestDouble = (players) => {
  let highest = null;
  let playerIndex = 0;
  
  players.forEach((player, idx) => {
    player.tiles.forEach(tile => {
      if (isDouble(tile)) {
        if (!highest || tile.left > highest.left) {
          highest = tile;
          playerIndex = idx;
        }
      }
    });
  });
  
  return { tile: highest, playerIndex };
};

// ============================================================================
// ENCONTRAR FICHA CON MAYOR SUMA (si no hay dobles)
// ============================================================================
export const findHighestTile = (players) => {
  let highest = null;
  let playerIndex = 0;
  let maxSum = -1;
  
  players.forEach((player, idx) => {
    player.tiles.forEach(tile => {
      const sum = tile.left + tile.right;
      if (sum > maxSum) {
        maxSum = sum;
        highest = tile;
        playerIndex = idx;
      }
    });
  });
  
  return { tile: highest, playerIndex };
};

// ============================================================================
// ENCONTRAR JUGADOR CON MENOS PUNTOS EN UN EQUIPO
// ============================================================================
export const findLowestInTeam = (players, team) => {
  let minPoints = Infinity;
  let playerIndex = 0;
  
  players.forEach((player, idx) => {
    if (player.team === team) {
      const points = tilesValue(player.tiles);
      if (points < minPoints) {
        minPoints = points;
        playerIndex = idx;
      }
    }
  });
  
  return playerIndex;
};

// ============================================================================
// REMOVER FICHA DE UN JUGADOR (inmutable)
// ============================================================================
export const removeTile = (players, playerIndex, tileId) => {
  return players.map((player, idx) => {
    if (idx === playerIndex) {
      return {
        ...player,
        tiles: player.tiles.filter(t => t.id !== tileId)
      };
    }
    return player;
  });
};

// ============================================================================
// ENCONTRAR FICHA INICIAL (6-6 o mayor doble)
// ============================================================================
export const findStartingPlayer = (players) => {
  // Buscar 6-6
  for (let i = 0; i < players.length; i++) {
    if (players[i].tiles.some(t => t.left === 6 && t.right === 6)) {
      return { player: i, tile: { left: 6, right: 6 } };
    }
  }
  
  // Buscar mayor doble
  for (let d = 5; d >= 0; d--) {
    for (let i = 0; i < players.length; i++) {
      if (players[i].tiles.some(t => t.left === d && t.right === d)) {
        return { player: i, tile: { left: d, right: d } };
      }
    }
  }
  
  return { player: 0, tile: null };
};

// ============================================================================
// IA BÁSICA (SOLO PARA MODO OFFLINE)
// ============================================================================
export const AI = {
  // Encontrar mejor jugada
  findBestMove: (player, board, difficulty = 'hard') => {
    const playable = getPlayableTiles(player.tiles, board);
    if (playable.length === 0) return null;
    
    if (difficulty === 'easy') {
      // IA fácil: jugada aleatoria
      const tile = playable[Math.floor(Math.random() * playable.length)];
      const positions = getPlayablePositions(tile, board);
      return { tile, position: positions[0] };
    }
    
    // IA normal/hard: priorizar dobles, luego mayor valor
    const sorted = [...playable].sort((a, b) => {
      // Priorizar dobles
      if (isDouble(a) && !isDouble(b)) return -1;
      if (!isDouble(a) && isDouble(b)) return 1;
      // Luego mayor valor
      return tileValue(b) - tileValue(a);
    });
    
    const tile = sorted[0];
    const positions = getPlayablePositions(tile, board);
    return { tile, position: positions[0] };
  }
};

// ============================================================================
// SISTEMA GLICKO-2 (SOLO PARA PREDICCIÓN VISUAL)
// ============================================================================
// IMPORTANTE: En modo online, el servidor calcula el rating real.
// Esta implementación es solo para mostrar estimaciones al jugador.

export const Glicko2 = {
  TAU: 0.5,
  SCALE: 173.7178,
  
  // Convertir a escala Glicko-2
  toGlicko2: (rating, rd) => ({
    mu: (rating - 1500) / 173.7178,
    phi: rd / 173.7178
  }),
  
  // Convertir de escala Glicko-2
  fromGlicko2: (mu, phi) => ({
    rating: Math.round(mu * 173.7178 + 1500),
    rd: Math.round(phi * 173.7178)
  }),
  
  // Función g(φ)
  g: (phi) => 1 / Math.sqrt(1 + 3 * phi * phi / (Math.PI * Math.PI)),
  
  // Expectativa de resultado
  E: (mu, muj, phij) => 1 / (1 + Math.exp(-Glicko2.g(phij) * (mu - muj))),
  
  // Estimar cambio de rating (solo visual)
  estimateRatingChange: (playerRating, opponentRating, won) => {
    const player = Glicko2.toGlicko2(playerRating, 50);
    const opponent = Glicko2.toGlicko2(opponentRating, 50);
    
    const expected = Glicko2.E(player.mu, opponent.mu, opponent.phi);
    const actual = won ? 1 : 0;
    const diff = actual - expected;
    
    // Estimación simplificada
    const change = Math.round(32 * diff);
    return Math.max(-50, Math.min(50, change));
  }
};

export default {
  generateAllTiles,
  shuffleTiles,
  dealTiles,
  tileValue,
  tilesValue,
  isDouble,
  getBoardEnds,
  canPlayAt,
  canPlay,
  getPlayablePositions,
  hasPlayableTile,
  getPlayableTiles,
  createBoard,
  placeTile,
  isBlocked,
  getBlockedWinner,
  getTeamPoints,
  findHighestDouble,
  findHighestTile,
  findLowestInTeam,
  removeTile,
  findStartingPlayer,
  AI,
  Glicko2
};
