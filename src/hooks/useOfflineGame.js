// ============================================================================
// HOOK: useOfflineGame - Lógica completa del juego offline
// ============================================================================
import { useState, useCallback, useEffect, useRef } from 'react';
import * as Engine from '../utils/gameEngine';

const AI_NAMES = ['Carlos', 'María', 'Pedro', 'Ana', 'Luis', 'Rosa', 'Juan', 'Elena'];
const AI_AVATARS = ['🧔', '👩', '👨', '👧', '🧑', '👵', '🧓', '👴'];

// Dificultad de la IA
const AI_THINK_TIME = {
  easy: { min: 1500, max: 3000 },
  medium: { min: 1000, max: 2000 },
  hard: { min: 500, max: 1000 }
};

export const useOfflineGame = (settings = {}) => {
  const {
    targetScore = 100,
    turnTime = 30,
    difficulty = 'medium'
  } = settings;

  // Estado del juego
  const [gameState, setGameState] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle, dealing, playing, roundEnd, gameOver
  const [timer, setTimer] = useState(turnTime);
  const [notification, setNotification] = useState(null);
  
  // Referencias
  const timerRef = useRef(null);
  const aiTimeoutRef = useRef(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // INICIAR PARTIDA
  // ═══════════════════════════════════════════════════════════════════════════
  const startGame = useCallback(() => {
    // Generar jugadores
    const shuffledNames = [...AI_NAMES].sort(() => Math.random() - 0.5);
    const shuffledAvatars = [...AI_AVATARS].sort(() => Math.random() - 0.5);
    
    const players = [
      { id: 0, name: 'Tú', tiles: [], team: 0, avatar: '😎', rating: 1500, isHuman: true },
      { id: 1, name: shuffledNames[0], tiles: [], team: 1, avatar: shuffledAvatars[0], rating: 1450 + Math.floor(Math.random() * 100), isHuman: false },
      { id: 2, name: shuffledNames[1], tiles: [], team: 0, avatar: shuffledAvatars[1], rating: 1450 + Math.floor(Math.random() * 100), isHuman: false },
      { id: 3, name: shuffledNames[2], tiles: [], team: 1, avatar: shuffledAvatars[2], rating: 1450 + Math.floor(Math.random() * 100), isHuman: false }
    ];

    // Repartir fichas
    const hands = Engine.dealTiles(4);
    players.forEach((p, i) => {
      p.tiles = hands[i];
    });

    // Encontrar quien inicia
    const starter = Engine.findStartingPlayer(players);

    const newState = {
      players,
      board: Engine.createBoard(),
      currentPlayer: starter.player,
      starterTile: starter.tile,
      scores: [0, 0],
      roundNum: 1,
      targetScore,
      passCount: 0,
      lastPlay: null,
      roundHistory: []
    };

    setGameState(newState);
    setPhase('dealing');
    setTimer(turnTime);

    // Animación de repartir y luego iniciar
    setTimeout(() => {
      setPhase('playing');
      showNotification(`${players[starter.player].name} inicia con el doble ${starter.tile.left}`, '🎲');
    }, 1500);

  }, [targetScore, turnTime]);

  // ═══════════════════════════════════════════════════════════════════════════
  // JUGAR FICHA
  // ═══════════════════════════════════════════════════════════════════════════
  const playTile = useCallback((tile, position) => {
    if (!gameState || phase !== 'playing') return;
    
    const { players, board, currentPlayer } = gameState;
    const player = players[currentPlayer];
    
    // Verificar que tiene la ficha
    const tileIndex = player.tiles.findIndex(t => t.id === tile.id);
    if (tileIndex === -1) return;

    // Verificar jugada válida
    if (!Engine.canPlayAt(tile, position, board)) {
      showNotification('Jugada inválida', '❌');
      return;
    }

    // Realizar jugada
    const newBoard = Engine.placeTile(board, tile, position);
    const newTiles = player.tiles.filter(t => t.id !== tile.id);
    
    const newPlayers = players.map((p, i) => 
      i === currentPlayer ? { ...p, tiles: newTiles } : p
    );

    const isDouble = tile.left === tile.right;
    const isDomino = newTiles.length === 0;

    // Actualizar estado
    setGameState(prev => ({
      ...prev,
      players: newPlayers,
      board: newBoard,
      currentPlayer: (currentPlayer + 1) % 4,
      passCount: 0,
      starterTile: null,
      lastPlay: {
        playerId: currentPlayer,
        tile,
        position,
        isDomino,
        isDouble
      }
    }));

    // Resetear timer
    setTimer(turnTime);

    // Verificar dominó
    if (isDomino) {
      handleRoundEnd('domino', currentPlayer);
      return;
    }

    // Notificación
    if (isDouble) {
      showNotification(`${player.name} jugó doble ${tile.left}!`, '🎯');
    }

  }, [gameState, phase, turnTime]);

  // ═══════════════════════════════════════════════════════════════════════════
  // PASAR TURNO
  // ═══════════════════════════════════════════════════════════════════════════
  const passTurn = useCallback(() => {
    if (!gameState || phase !== 'playing') return;
    
    const { players, currentPlayer, passCount } = gameState;
    const player = players[currentPlayer];
    
    const newPassCount = passCount + 1;
    
    showNotification(`${player.name} pasó`, '⏭️');
    
    // Verificar tranca (4 pases consecutivos)
    if (newPassCount >= 4) {
      handleRoundEnd('tranca', null);
      return;
    }

    setGameState(prev => ({
      ...prev,
      currentPlayer: (currentPlayer + 1) % 4,
      passCount: newPassCount
    }));

    setTimer(turnTime);

  }, [gameState, phase, turnTime]);

  // ═══════════════════════════════════════════════════════════════════════════
  // FIN DE RONDA
  // ═══════════════════════════════════════════════════════════════════════════
  const handleRoundEnd = useCallback((type, winnerId) => {
    if (!gameState) return;
    
    setPhase('roundEnd');
    clearInterval(timerRef.current);
    
    const { players, scores } = gameState;
    
    // Calcular puntos
    let points = [0, 0];
    players.forEach(p => {
      const handPoints = p.tiles.reduce((sum, t) => sum + t.left + t.right, 0);
      points[p.team] += handPoints;
    });

    let winningTeam;
    let pointsWon;

    if (type === 'domino') {
      winningTeam = players[winnerId].team;
      pointsWon = points[1 - winningTeam]; // Puntos del equipo perdedor
      showNotification(`¡DOMINÓ! ${players[winnerId].name}`, '🏆');
    } else {
      // Tranca - gana quien tiene menos puntos
      if (points[0] < points[1]) {
        winningTeam = 0;
        pointsWon = points[1];
      } else if (points[1] < points[0]) {
        winningTeam = 1;
        pointsWon = points[0];
      } else {
        // Empate
        winningTeam = -1;
        pointsWon = 0;
      }
      showNotification('¡TRANCA!', '🔒');
    }

    const newScores = [...scores];
    if (winningTeam >= 0) {
      newScores[winningTeam] += pointsWon;
    }

    setGameState(prev => ({
      ...prev,
      scores: newScores,
      roundResult: {
        type,
        winnerId,
        winningTeam,
        pointsWon,
        revealedHands: players.map(p => ({ ...p }))
      }
    }));

    // Verificar fin de partida
    setTimeout(() => {
      if (newScores[0] >= targetScore || newScores[1] >= targetScore) {
        handleGameOver(newScores);
      } else {
        // Siguiente ronda después de 4 segundos
        setTimeout(() => startNewRound(newScores), 4000);
      }
    }, 2000);

  }, [gameState, targetScore]);

  // ═══════════════════════════════════════════════════════════════════════════
  // NUEVA RONDA
  // ═══════════════════════════════════════════════════════════════════════════
  const startNewRound = useCallback((currentScores) => {
    if (!gameState) return;

    const { players, roundNum } = gameState;
    
    // Repartir nuevas fichas
    const hands = Engine.dealTiles(4);
    const newPlayers = players.map((p, i) => ({
      ...p,
      tiles: hands[i]
    }));

    // Encontrar quien inicia
    const starter = Engine.findStartingPlayer(newPlayers);

    setGameState(prev => ({
      ...prev,
      players: newPlayers,
      board: Engine.createBoard(),
      currentPlayer: starter.player,
      starterTile: starter.tile,
      scores: currentScores,
      roundNum: roundNum + 1,
      passCount: 0,
      lastPlay: null,
      roundResult: null
    }));

    setPhase('playing');
    setTimer(turnTime);
    showNotification(`Ronda ${roundNum + 1}`, '🎲');

  }, [gameState, turnTime]);

  // ═══════════════════════════════════════════════════════════════════════════
  // FIN DE PARTIDA
  // ═══════════════════════════════════════════════════════════════════════════
  const handleGameOver = useCallback((finalScores) => {
    setPhase('gameOver');
    
    const winningTeam = finalScores[0] >= targetScore ? 0 : 1;
    const playerWon = winningTeam === 0; // Jugador está en equipo 0
    
    // Calcular recompensas
    const rewards = {
      tokens: playerWon ? 50 : 20,
      xp: playerWon ? 100 : 40
    };

    // Simular cambio de ELO
    const eloChange = playerWon ? Math.floor(15 + Math.random() * 10) : -Math.floor(10 + Math.random() * 8);

    setGameState(prev => ({
      ...prev,
      gameResult: {
        winningTeam,
        playerWon,
        finalScores,
        rewards,
        eloChange
      }
    }));

    showNotification(playerWon ? '¡VICTORIA!' : 'Derrota', playerWon ? '🏆' : '😔');

  }, [targetScore]);

  // ═══════════════════════════════════════════════════════════════════════════
  // IA DEL OPONENTE
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!gameState || phase !== 'playing') return;
    
    const { players, currentPlayer, board, starterTile } = gameState;
    const player = players[currentPlayer];
    
    // Si es turno del jugador humano, no hacer nada
    if (player.isHuman) return;

    // Limpiar timeout anterior
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
    }

    // Tiempo de "pensamiento" de la IA
    const thinkTime = AI_THINK_TIME[difficulty];
    const delay = thinkTime.min + Math.random() * (thinkTime.max - thinkTime.min);

    aiTimeoutRef.current = setTimeout(() => {
      // Obtener fichas jugables
      const playableTiles = Engine.getPlayableTiles(player.tiles, board);
      
      // Si hay ficha obligatoria (inicio de ronda)
      if (starterTile) {
        const starter = player.tiles.find(t => t.id === starterTile.id);
        if (starter) {
          playTile(starter, 'center');
          return;
        }
      }

      if (playableTiles.length === 0) {
        // No puede jugar, debe pasar
        passTurn();
        return;
      }

      // Seleccionar ficha (IA básica: preferir dobles, luego fichas altas)
      let selectedTile;
      
      // Buscar dobles primero
      const doubles = playableTiles.filter(t => t.left === t.right);
      if (doubles.length > 0) {
        selectedTile = doubles.reduce((a, b) => (a.left > b.left ? a : b));
      } else {
        // Ficha con mayor suma
        selectedTile = playableTiles.reduce((a, b) => 
          (a.left + a.right) > (b.left + b.right) ? a : b
        );
      }

      // Determinar posición
      const canLeft = Engine.canPlayAt(selectedTile, 'left', board);
      const canRight = Engine.canPlayAt(selectedTile, 'right', board);
      const position = board.tiles.length === 0 ? 'center' : (canLeft ? 'left' : 'right');

      playTile(selectedTile, position);

    }, delay);

    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };

  }, [gameState?.currentPlayer, phase, difficulty, playTile, passTurn]);

  // ═══════════════════════════════════════════════════════════════════════════
  // TIMER
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (phase !== 'playing' || !gameState) return;
    
    const { players, currentPlayer } = gameState;
    
    // Solo timer para el jugador humano
    if (!players[currentPlayer].isHuman) return;

    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          // Tiempo agotado, pasar automáticamente
          passTurn();
          return turnTime;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);

  }, [phase, gameState?.currentPlayer, turnTime, passTurn]);

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILIDADES
  // ═══════════════════════════════════════════════════════════════════════════
  const showNotification = useCallback((message, icon) => {
    setNotification({ message, icon });
    setTimeout(() => setNotification(null), 2500);
  }, []);

  const resetGame = useCallback(() => {
    setGameState(null);
    setPhase('idle');
    setTimer(turnTime);
    clearInterval(timerRef.current);
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
  }, [turnTime]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RETORNO
  // ═══════════════════════════════════════════════════════════════════════════
  return {
    // Estado
    gameState,
    phase,
    timer,
    notification,
    
    // Derivados
    isMyTurn: gameState?.players?.[gameState.currentPlayer]?.isHuman ?? false,
    currentPlayerName: gameState?.players?.[gameState.currentPlayer]?.name ?? '',
    
    // Acciones
    startGame,
    playTile,
    passTurn,
    resetGame
  };
};

export default useOfflineGame;
