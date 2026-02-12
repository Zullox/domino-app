// ============================================================================
// useLocalGame - Lógica completa del juego local vs IA
// ============================================================================
// Restaurado del monolito DominoR.jsx con todas las reglas del dominó cubano:
// - AI con 14 estrategias (via services/ai.js)
// - Memoria de pases (passedNumbers)
// - Regla 8: Salida estratégica (+20)
// - Bonus de dominó (+10/+20 por posiciones)
// - Doble puntos tras empate en tranca
// - Tranca: jugador individual con menor puntaje
// - Dominó: suma fichas de los 3 jugadores restantes
// - Timer con auto-play al agotar tiempo
// - Auto-pass cuando no puedes jugar
// - Animación de ficha volando (flyingTile)
// ============================================================================

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { SnakeBoard } from '../utils/snakeBoard';
import { CONFIG } from '../constants/gameConfig';
import { decide as aiDecide, createPassMemory, recordPass, AIByDifficulty } from '../services/ai';

// ============================================================================
// ENGINE HELPERS (compatibles con SnakeBoard)
// ============================================================================

const Engine = {
  generateTiles: () => {
    const tiles = [];
    for (let i = 0; i <= CONFIG.maxTile; i++) {
      for (let j = i; j <= CONFIG.maxTile; j++) {
        tiles.push({ left: i, right: j, id: `${i}-${j}` });
      }
    }
    return tiles;
  },

  shuffle: (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  isDouble: (t) => t.left === t.right,
  tileValue: (t) => t.left + t.right,
  tilesValue: (tiles) => tiles.reduce((s, t) => s + t.left + t.right, 0),

  // Obtener extremos del tablero (usando sockets de SnakeBoard)
  getBoardEnds: (board) => {
    if (!board.center) return { leftEnd: null, rightEnd: null };
    return {
      leftEnd: board.snakeTop?.value ?? null,
      rightEnd: board.snakeBottom?.value ?? null
    };
  },

  // Verificar si se puede jugar en una posición
  canPlayAt: (tile, pos, board) => {
    if (!board.center) return pos === 'center';
    if (pos === 'center') return false;
    const { leftEnd, rightEnd } = Engine.getBoardEnds(board);
    const endValue = pos === 'left' ? leftEnd : rightEnd;
    return tile.left === endValue || tile.right === endValue;
  },

  getValidPositions: (tile, board) => {
    if (!board.center) return ['center'];
    const pos = [];
    if (Engine.canPlayAt(tile, 'left', board)) pos.push('left');
    if (Engine.canPlayAt(tile, 'right', board)) pos.push('right');
    return pos;
  },

  canPlay: (tiles, board) => tiles.some(t => Engine.getValidPositions(t, board).length > 0),

  // Colocar ficha (deep clone + mutate para inmutabilidad)
  placeOnBoard: (board, tile, pos) => {
    const newBoard = SnakeBoard.clone(board);
    if (!newBoard.center) {
      SnakeBoard.placeCenter(newBoard, tile);
    } else {
      const socketId = pos === 'left' ? 'top' : 'bottom';
      SnakeBoard.placeTile(newBoard, tile, socketId);
    }
    return newBoard;
  },

  findHighestDouble: (players) => {
    let highest = null, idx = 0;
    players.forEach((p, i) => {
      p.tiles.forEach(t => {
        if (Engine.isDouble(t) && (!highest || t.left > highest.left)) {
          highest = t;
          idx = i;
        }
      });
    });
    return { tile: highest, playerIndex: idx };
  },

  findHighestTile: (players) => {
    let highest = null, idx = 0, maxSum = -1;
    players.forEach((p, i) => {
      p.tiles.forEach(t => {
        const sum = t.left + t.right;
        if (sum > maxSum) { maxSum = sum; highest = t; idx = i; }
      });
    });
    return { tile: highest, playerIndex: idx };
  },

  findLowestInTeam: (players, team) => {
    let minPoints = Infinity, idx = 0;
    players.forEach((p, i) => {
      if (p.team === team) {
        const pts = Engine.tilesValue(p.tiles);
        if (pts < minPoints) { minPoints = pts; idx = i; }
      }
    });
    return idx;
  },

  removeTile: (players, pIdx, tileId) => {
    return players.map((p, i) => i === pIdx
      ? { ...p, tiles: p.tiles.filter(t => t.id !== tileId) }
      : p
    );
  }
};

// ============================================================================
// DEFAULT PLAYERS
// ============================================================================
const createDefaultPlayers = () => [
  { id: 0, name: 'Tú', tiles: [], team: 0, avatar: '😎', elo: 1500 },
  { id: 1, name: 'Carlos', tiles: [], team: 1, avatar: '🧔', elo: 1500 },
  { id: 2, name: 'María', tiles: [], team: 0, avatar: '👩', elo: 1500 },
  { id: 3, name: 'Pedro', tiles: [], team: 1, avatar: '👨', elo: 1500 }
];

// ============================================================================
// HOOK
// ============================================================================
export const useLocalGame = ({ settings = {}, vibrate = () => {}, showNotification = () => {} } = {}) => {

  // === GAME STATE ===
  const [players, setPlayers] = useState(createDefaultPlayers);
  const [board, setBoard] = useState(() => SnakeBoard.create());
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState([0, 0]);
  const [passes, setPasses] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle | playing | gameOver
  const [target] = useState(CONFIG.targetScore);
  const [timer, setTimer] = useState(CONFIG.turnTimeout);

  // === ROUND STATE ===
  const [firstRound, setFirstRound] = useState(true);
  const [lastWinner, setLastWinner] = useState(0);
  const [roundStarter, setRoundStarter] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  const [strategicBonusEligible, setStrategicBonusEligible] = useState(false);
  const [lastPlayed, setLastPlayed] = useState(null);
  const [lastPlayPositions, setLastPlayPositions] = useState(1);
  const [doubleNextRound, setDoubleNextRound] = useState(false);
  const [mustPlay, setMustPlay] = useState(null);
  const [roundResult, setRoundResult] = useState(null);

  // === AI & PASS MEMORY ===
  const [passedNumbers, setPassedNumbers] = useState(createPassMemory);

  // === VISUAL STATE ===
  const [playerPassed, setPlayerPassed] = useState(null);
  const [flyingTile, setFlyingTile] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [msg, setMsg] = useState('');

  // === REFS ===
  const aiRef = useRef(null);
  const timerRef = useRef(null);
  const playTileRef = useRef(null);
  const passRef = useRef(null);

  // === AI DIFFICULTY ===
  const aiDifficulty = settings.aiDifficulty || 'hard';

  // ============================================================================
  // VALID MOVES (para el jugador humano)
  // ============================================================================
  const validMoves = useMemo(() => {
    if (current !== 0 || phase !== 'playing') return [];

    const moves = [];
    const myTiles = players[0]?.tiles || [];

    myTiles.forEach(tile => {
      if (mustPlay && tile.id !== mustPlay.id) return;

      const positions = Engine.getValidPositions(tile, board);
      if (positions.length > 0) {
        moves.push({ tile, positions });
      }
    });

    return moves;
  }, [current, phase, players, board, mustPlay]);

  const canPlayAny = useMemo(() => {
    const myTiles = players[0]?.tiles || [];
    if (mustPlay) {
      return myTiles.some(t => t.id === mustPlay.id);
    }
    return Engine.canPlay(myTiles, board);
  }, [players, board, mustPlay]);

  const isMyTurn = current === 0 && phase === 'playing';

  // ============================================================================
  // END ROUND - Full scoring from monolith
  // ============================================================================
  const endRound = useCallback((winner, type) => {
    clearInterval(timerRef.current);
    clearTimeout(aiRef.current);

    // Snapshot de fichas de cada jugador ANTES de cambios
    const playerSnapshot = players.map(p => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      team: p.team,
      tiles: [...p.tiles],
      points: Engine.tilesValue(p.tiles)
    }));

    let winTeam = -1;
    let pts = 0;
    let closedByName = null;
    let bonus = 0;
    let bonusType = null;

    if (type === 'domino') {
      // DOMINÓ: Gana el equipo del jugador que cerró
      winTeam = players[winner].team;
      closedByName = players[winner].name;

      // Se suman los puntos de los OTROS 3 jugadores (todos menos el que cerró)
      pts = playerSnapshot
        .filter(p => p.id !== winner)
        .reduce((sum, p) => sum + p.points, 0);

      // Bonificación por dominación
      if (lastPlayPositions === 1) {
        bonus = 10;
        bonusType = 'single';
      } else if (lastPlayPositions >= 2) {
        bonus = 20;
        bonusType = 'double';
      }
      pts += bonus;

      if (winTeam === 0) {
        setShowConfetti(true);
        vibrate([100, 50, 100, 50, 200]);
        setTimeout(() => setShowConfetti(false), 4000);
      }
    } else {
      // TRANCA: Gana la pareja con el JUGADOR de menor puntaje individual
      const minTeam0 = Math.min(...playerSnapshot.filter(p => p.team === 0).map(p => p.points));
      const minTeam1 = Math.min(...playerSnapshot.filter(p => p.team === 1).map(p => p.points));

      if (minTeam0 === minTeam1) {
        // Empate - nadie suma, próxima ronda vale doble
        const starterTeam = players[roundStarter].team;
        const otherTeam = starterTeam === 0 ? 1 : 0;

        // Jugador con menor puntaje del equipo contrario inicia
        let nextStarter = 0;
        let minPts = Infinity;
        playerSnapshot.forEach((p, idx) => {
          if (p.team === otherTeam && p.points < minPts) {
            minPts = p.points;
            nextStarter = idx;
          }
        });

        setRoundResult({
          type: 'tranca',
          winTeam: -1,
          points: 0,
          closedBy: null,
          playerSnapshot,
          bonus: 0,
          bonusType: null,
          isTie: true,
          isDouble: false
        });
        setDoubleNextRound(true);
        setLastWinner(nextStarter);
        setFirstRound(false);
        return; // No sumar puntos
      }

      // Encontrar el jugador con menor puntaje individual
      let minPoints = Infinity;
      let minPlayer = null;
      playerSnapshot.forEach(p => {
        if (p.points < minPoints) { minPoints = p.points; minPlayer = p; }
      });

      winTeam = minPlayer.team;
      // Se suman los puntos de TODOS los jugadores
      pts = playerSnapshot.reduce((sum, p) => sum + p.points, 0);

      setScreenShake(true);
      vibrate([200, 100, 200]);
      setTimeout(() => setScreenShake(false), 500);

      if (winTeam === 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
    }

    // Multiplicador x2 si la ronda anterior fue empate
    const isDoubleRound = doubleNextRound;
    if (isDoubleRound) {
      pts *= 2;
    }

    // Guardar resultado
    setRoundResult({
      type,
      winTeam,
      points: pts,
      closedBy: closedByName,
      playerSnapshot,
      bonus,
      bonusType,
      isDouble: isDoubleRound
    });

    setDoubleNextRound(false);

    // Actualizar scores
    const newScores = [...scores];
    if (winTeam >= 0) {
      newScores[winTeam] += pts;
    }
    setScores(newScores);

    // Determinar quién inicia la siguiente mano
    let nextStarter;
    if (type === 'domino') {
      nextStarter = winner; // El que cerró
    } else {
      // Tranca: jugador de menor puntaje del equipo ganador
      let minPts = Infinity;
      nextStarter = 0;
      playerSnapshot.forEach((p, idx) => {
        if (p.team === winTeam && p.points < minPts) {
          minPts = p.points;
          nextStarter = idx;
        }
      });
    }
    setLastWinner(nextStarter);
    setFirstRound(false);

    // Verificar si alguien ganó la partida completa
    if (winTeam >= 0 && newScores[winTeam] >= target) {
      const playerWon = winTeam === 0;
      setPhase('gameOver');
      showNotification(playerWon ? 'success' : 'info',
        playerWon ? '¡Victoria!' : 'Derrota',
        playerWon ? '🏆' : '😢', 4000);
    }
  }, [players, scores, target, vibrate, lastPlayPositions, doubleNextRound, roundStarter, showNotification]);

  // ============================================================================
  // PLAY TILE - Full logic from monolith
  // ============================================================================
  const playTile = useCallback((tile, pos, playerIdx = current) => {
    if (roundResult) return;

    // Guardar cuántas posiciones válidas tenía esta ficha
    const validPositions = Engine.getValidPositions(tile, board);
    const numPositions = validPositions.length;

    // Calcular posición destino para animación
    const previewBoard = Engine.placeOnBoard(board, tile, pos);
    const placedTile = previewBoard.tiles[previewBoard.tiles.length - 1];

    // Iniciar animación de ficha volando
    if (playerIdx === 0) {
      setFlyingTile({
        tile,
        fromPlayer: playerIdx,
        pos,
        targetX: placedTile?.x,
        targetY: placedTile?.y,
        isHorizontal: placedTile?.orientation === 'HORIZONTAL',
        inElbow: placedTile?.inElbow
      });
    }

    // Delay para animación (o inmediato para AI)
    const delay = playerIdx === 0 ? 600 : 0;

    setTimeout(() => {
      const nb = Engine.placeOnBoard(board, tile, pos);
      const np = Engine.removeTile(players, playerIdx, tile.id);

      const placed = nb.tiles[nb.tiles.length - 1];

      setBoard(nb);
      setPlayers(np);
      setLastPlayed(placed);
      setLastPlayPositions(numPositions);
      setFlyingTile(null);
      setMustPlay(null);

      // Regla 8 - Salida estratégica (+20)
      if (moveCount === 2 && strategicBonusEligible) {
        const openerTeam = players[roundStarter].team;
        const newScores = [...scores];
        newScores[openerTeam] += 20;
        setScores(newScores);
        showNotification('success', '¡Salida estratégica! +20', '🎯');
        setStrategicBonusEligible(false);
      }
      setMoveCount(m => m + 1);

      vibrate([30]);

      // Check domino
      if (np[playerIdx].tiles.length === 0) {
        endRound(playerIdx, 'domino');
        return;
      }

      setPasses(0);
      const next = (playerIdx + 1) % 4;
      setCurrent(next);
      setTimer(CONFIG.turnTimeout);
      setMsg(`Turno de ${np[next].name}`);

      if (next === 0) {
        vibrate([100, 50, 100]);
      }
    }, delay);
  }, [board, players, current, endRound, vibrate, roundResult, moveCount,
      strategicBonusEligible, roundStarter, scores, showNotification]);

  // ============================================================================
  // PASS - Full logic from monolith
  // ============================================================================
  const pass = useCallback((playerIdx = current) => {
    if (roundResult) return;

    if (mustPlay) {
      showNotification('error', `¡Debes jugar el doble ${mustPlay.left}!`, '⚠️');
      vibrate([50, 30, 50, 30, 50]);
      return;
    }

    const np = passes + 1;
    setPasses(np);

    // Registrar qué números NO tiene este jugador
    setPassedNumbers(prev => recordPass(prev, playerIdx, board));

    // Regla 8 - Salida estratégica
    if (moveCount === 1) {
      setStrategicBonusEligible(true);
    } else if (moveCount === 2 && strategicBonusEligible) {
      setStrategicBonusEligible(false);
    }
    setMoveCount(m => m + 1);

    // Indicador visual de pase
    setPlayerPassed(playerIdx);
    setTimeout(() => setPlayerPassed(null), 1500);

    vibrate([20]);

    if (np >= CONFIG.passesForTranca) {
      endRound(null, 'tranca');
      return;
    }

    const next = (playerIdx + 1) % 4;
    setCurrent(next);
    setTimer(CONFIG.turnTimeout);
    setMsg(`${players[playerIdx].name} pasa`);
  }, [mustPlay, passes, current, players, board, endRound, vibrate, roundResult,
      moveCount, strategicBonusEligible, showNotification]);

  // Update refs for timer
  useEffect(() => { playTileRef.current = playTile; }, [playTile]);
  useEffect(() => { passRef.current = pass; }, [pass]);

  // ============================================================================
  // AI TURN
  // ============================================================================
  useEffect(() => {
    if (phase !== 'playing' || current === 0 || roundResult) {
      clearTimeout(aiRef.current);
      return;
    }

    const thinkTime = CONFIG.aiDelay[aiDifficulty] || 1000;

    aiRef.current = setTimeout(() => {
      if (roundResult) return;

      let decision;
      if (aiDifficulty === 'easy') {
        decision = AIByDifficulty.easy({ players, board, mustPlayDouble: mustPlay }, current);
      } else if (aiDifficulty === 'medium') {
        decision = AIByDifficulty.medium({ players, board, mustPlayDouble: mustPlay }, current);
      } else {
        // hard / expert: usa las 14 estrategias
        decision = aiDecide({ players, board, mustPlayDouble: mustPlay }, current, passedNumbers);
      }

      if (decision.action === 'play') {
        playTile(decision.tile, decision.position, current);
      } else {
        pass(current);
      }
    }, thinkTime);

    return () => clearTimeout(aiRef.current);
  }, [current, phase, players, board, mustPlay, roundResult, passedNumbers, aiDifficulty]);

  // ============================================================================
  // TIMER - with auto-play on timeout (from monolith)
  // ============================================================================
  useEffect(() => {
    if (phase !== 'playing' || roundResult) {
      clearInterval(timerRef.current);
      return;
    }

    setTimer(CONFIG.turnTimeout);
    timerRef.current = setInterval(() => {
      setTimer(p => {
        if (p <= 1) {
          // Timeout para el jugador humano
          if (current === 0 && playTileRef.current && passRef.current) {
            const player = players[0];

            // Si tiene ficha obligatoria, jugarla
            if (mustPlay) {
              const tile = player.tiles.find(t => t.id === mustPlay.id);
              if (tile) {
                playTileRef.current(tile, 'center', 0);
                return CONFIG.turnTimeout;
              }
            }

            // Buscar fichas jugables
            const playableMoves = [];
            player.tiles.forEach(tile => {
              const positions = Engine.getValidPositions(tile, board);
              positions.forEach(pos => {
                playableMoves.push({ tile, pos });
              });
            });

            // Si hay fichas jugables, jugar una aleatoria
            if (playableMoves.length > 0) {
              const randomMove = playableMoves[Math.floor(Math.random() * playableMoves.length)];
              playTileRef.current(randomMove.tile, randomMove.pos, 0);
              showNotification('warning', '¡Tiempo agotado! Jugada automática', '⏱️');
            } else {
              passRef.current(0);
            }
          }
          return CONFIG.turnTimeout;
        }
        return p - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [current, phase, roundResult, players, mustPlay, board, showNotification]);

  // ============================================================================
  // AUTO-PASS when player can't play
  // ============================================================================
  useEffect(() => {
    if (phase !== 'playing' || current !== 0 || roundResult) return;
    if (mustPlay) return; // Must play tile, can't auto-pass
    if (canPlayAny) return; // Can play, no auto-pass

    const autoPassTimer = setTimeout(() => {
      if (passRef.current) passRef.current(0);
    }, 800);

    return () => clearTimeout(autoPassTimer);
  }, [phase, current, roundResult, canPlayAny, mustPlay]);

  // ============================================================================
  // START NEW GAME
  // ============================================================================
  const startGame = useCallback(() => {
    clearTimeout(aiRef.current);
    clearInterval(timerRef.current);

    const all = Engine.generateTiles();
    const shuffled = Engine.shuffle(all);
    const newP = createDefaultPlayers().map((p, i) => ({
      ...p,
      tiles: shuffled.slice(i * CONFIG.tilesPerPlayer, (i + 1) * CONFIG.tilesPerPlayer)
    }));

    let starter = lastWinner;
    let req = null;

    if (firstRound) {
      const { tile, playerIndex } = Engine.findHighestDouble(newP);
      if (tile) {
        starter = playerIndex;
        req = tile;
      } else {
        const { tile: highTile, playerIndex: highIdx } = Engine.findHighestTile(newP);
        starter = highIdx;
        req = highTile;
      }
    }

    setPlayers(newP);
    setCurrent(starter);
    setRoundStarter(starter);
    setBoard(SnakeBoard.create());
    setPasses(0);
    setMoveCount(0);
    setStrategicBonusEligible(false);
    setMustPlay(req);
    setLastPlayed(null);
    setLastPlayPositions(1);
    setRoundResult(null);
    setPlayerPassed(null);
    setFlyingTile(null);
    setPassedNumbers(createPassMemory());
    setShowConfetti(false);
    setScreenShake(false);
    setTimer(CONFIG.turnTimeout);
    setPhase('playing');

    const reqMsg = req
      ? (Engine.isDouble(req)
        ? `${newP[starter].name} abre con doble ${req.left}`
        : `${newP[starter].name} abre con ${req.left}|${req.right}`)
      : `Turno de ${newP[starter].name}`;
    setMsg(reqMsg);

    if (starter === 0) {
      vibrate([100, 50, 100]);
    }
  }, [firstRound, lastWinner, vibrate]);

  // ============================================================================
  // START FRESH MATCH (resets scores, firstRound, etc.)
  // ============================================================================
  const startNewMatch = useCallback(() => {
    setScores([0, 0]);
    setFirstRound(true);
    setLastWinner(0);
    setDoubleNextRound(false);
    setShowConfetti(false);
    setScreenShake(false);

    // Will be called, then startGame deals tiles
    // We need to reset firstRound BEFORE calling startGame
    // Use a slight delay to ensure state is set
    setTimeout(() => {
      // Force firstRound true for the startGame call
      const all = Engine.generateTiles();
      const shuffled = Engine.shuffle(all);
      const newP = createDefaultPlayers().map((p, i) => ({
        ...p,
        tiles: shuffled.slice(i * CONFIG.tilesPerPlayer, (i + 1) * CONFIG.tilesPerPlayer)
      }));

      const { tile, playerIndex } = Engine.findHighestDouble(newP);
      let starter, req;
      if (tile) {
        starter = playerIndex;
        req = tile;
      } else {
        const { tile: highTile, playerIndex: highIdx } = Engine.findHighestTile(newP);
        starter = highIdx;
        req = highTile;
      }

      setPlayers(newP);
      setCurrent(starter);
      setRoundStarter(starter);
      setBoard(SnakeBoard.create());
      setPasses(0);
      setMoveCount(0);
      setStrategicBonusEligible(false);
      setMustPlay(req);
      setLastPlayed(null);
      setLastPlayPositions(1);
      setRoundResult(null);
      setPlayerPassed(null);
      setFlyingTile(null);
      setPassedNumbers(createPassMemory());
      setTimer(CONFIG.turnTimeout);
      setPhase('playing');

      const reqMsg = req
        ? (Engine.isDouble(req)
          ? `${newP[starter].name} abre con doble ${req.left}`
          : `${newP[starter].name} abre con ${req.left}|${req.right}`)
        : `Turno de ${newP[starter].name}`;
      setMsg(reqMsg);
    }, 50);
  }, []);

  // ============================================================================
  // CONTINUE TO NEXT ROUND (called after roundResult is dismissed)
  // ============================================================================
  const nextRound = useCallback(() => {
    setRoundResult(null);
    startGame();
  }, [startGame]);

  // ============================================================================
  // RESET (back to idle)
  // ============================================================================
  const reset = useCallback(() => {
    clearTimeout(aiRef.current);
    clearInterval(timerRef.current);
    setScores([0, 0]);
    setFirstRound(true);
    setPhase('idle');
    setRoundResult(null);
    setShowConfetti(false);
    setScreenShake(false);
    setPlayerPassed(null);
    setFlyingTile(null);
    setMsg('');
  }, []);

  // ============================================================================
  // CLEANUP
  // ============================================================================
  useEffect(() => {
    return () => {
      clearTimeout(aiRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================
  return {
    // State
    players,
    board,
    current,
    scores,
    phase,
    timer,
    target,
    mustPlay,
    lastPlayed,
    roundResult,
    passedNumbers,
    validMoves,
    canPlayAny,
    isMyTurn,
    msg,

    // Visual state
    playerPassed,
    flyingTile,
    showConfetti,
    screenShake,

    // Actions
    startNewMatch,
    startGame,       // Start/continue round
    nextRound,       // Dismiss roundResult and start next round
    playTile: (tile, pos) => playTile(tile, pos, 0), // Human only plays as player 0
    pass: () => pass(0),
    reset,

    // Engine helpers (for external use if needed)
    Engine
  };
};

export default useLocalGame;
