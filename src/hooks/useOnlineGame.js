// ============================================================================
// useOnlineGame - Hook para integrar juego online en DominoRanked
// ============================================================================
// Usa services/socket.js como transporte. Mapea estado del servidor al formato
// que DominoRanked ya entiende (board, players, current, scores, etc.)
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import * as Socket from '../services/socket';
import { SnakeBoard } from '../utils/snakeBoard';

// ============================================================================
// HELPERS DE CONVERSIÓN
// ============================================================================

/** Convierte ficha de formato servidor {top,bottom} a formato cliente {left,right} */
const serverTileToClient = (tile, index) => ({
  id: tile.id || `server_${index}_${tile.top}_${tile.bottom}`,
  left: tile.top,
  right: tile.bottom,
  isDouble: tile.isDouble ?? (tile.top === tile.bottom)
});

/** Determina socketId de SnakeBoard para una jugada del servidor */
const getSnakeSocket = (board, clientTile, serverSide) => {
  // Si el tablero está vacío, es la primera ficha
  if (!board.snakeTop || !board.snakeBottom) return 'top';
  
  // Mapping estable: server 'left' → snakeTop, server 'right' → snakeBottom
  // Esto se establece en placeCenter donde snakeTop.value = tile.left = server leftEnd
  return serverSide === 'left' ? 'top' : 'bottom';
};

/** Reordena jugadores para que myPosition esté en índice 0 (yo abajo) */
const remapPlayers = (serverPlayers, myPosition) => {
  if (!serverPlayers || serverPlayers.length === 0) return [];
  
  // Crear array de 4 posiciones: [yo, izquierda, enfrente (compañero), derecha]
  const mapped = new Array(4).fill(null);
  
  serverPlayers.forEach(p => {
    // Calcular posición relativa a mí
    const relPos = (p.position - myPosition + 4) % 4;
    mapped[relPos] = {
      name: p.name || 'Jugador',
      avatar: p.avatar,
      team: p.team,
      rating: p.rating,
      connected: p.connected !== false,
      tiles: [], // Solo yo tengo fichas visibles
      handCount: p.handCount || 0,
      serverPosition: p.position
    };
  });
  
  return mapped;
};

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export const useOnlineGame = (authUser) => {
  // --- Estado de conexión ---
  const [connected, setConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [connectionError, setConnectionError] = useState(null);
  
  // --- Estado de juego online ---
  const [onlinePhase, setOnlinePhase] = useState('idle'); // idle|searching|playing|roundEnd|gameOver
  const [myPosition, setMyPosition] = useState(null);
  const [myTeam, setMyTeam] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [serverPlayers, setServerPlayers] = useState([]);
  const [serverBoard, setServerBoard] = useState(() => SnakeBoard.create());
  const [serverScores, setServerScores] = useState([0, 0]);
  const [serverCurrent, setServerCurrent] = useState(0);
  const [serverHand, setServerHand] = useState([]);
  const [serverValidMoves, setServerValidMoves] = useState([]);
  const [serverMustPlay, setServerMustPlay] = useState(null);
  const [turnTimeLeft, setTurnTimeLeft] = useState(30);
  const [roundResult, setRoundResult] = useState(null);
  const [gameEndData, setGameEndData] = useState(null);
  const [targetScore, setTargetScore] = useState(200);
  const [searchTime, setSearchTime] = useState(0);
  
  // --- Refs ---
  const boardRef = useRef(SnakeBoard.create());
  const myPositionRef = useRef(null);
  const myTeamRef = useRef(null);
  const timerRef = useRef(null);
  const searchTimerRef = useRef(null);
  const cleanupFns = useRef([]);
  
  // ════════════════════════════════════════════════════════════════════════
  // INICIALIZAR SOCKET
  // ════════════════════════════════════════════════════════════════════════
  
  useEffect(() => {
    const init = async () => {
      try {
        await Socket.initSocket(!!authUser && !authUser.isGuest);
      } catch (err) {
        console.error('[Online] Error init socket:', err);
      }
    };
    init();
    
    return () => {
      // No desconectar al desmontar - el socket es singleton
    };
  }, [authUser]);
  
  // ════════════════════════════════════════════════════════════════════════
  // REGISTRAR EVENT LISTENERS
  // ════════════════════════════════════════════════════════════════════════
  
  useEffect(() => {
    // Limpiar listeners previos
    cleanupFns.current.forEach(fn => fn());
    cleanupFns.current = [];
    
    const listen = (event, handler) => {
      const unsub = Socket.on(event, handler);
      cleanupFns.current.push(unsub);
    };
    
    // --- Conexión ---
    listen('onConnect', () => {
      setConnected(true);
      setConnectionError(null);
    });
    
    listen('onDisconnect', () => {
      setConnected(false);
    });
    
    listen('onError', ({ message }) => {
      setConnectionError(message);
    });
    
    listen('onAuthenticated', () => {
      setConnected(true);
    });
    
    listen('onOnlineStats', ({ playersOnline }) => {
      setOnlineCount(playersOnline || 0);
    });
    
    // --- Matchmaking ---
    listen('onMatchmakingJoined', () => {
      setOnlinePhase('searching');
    });
    
    listen('onMatchmakingCancelled', () => {
      setOnlinePhase('idle');
      setSearchTime(0);
      if (searchTimerRef.current) clearInterval(searchTimerRef.current);
    });
    
    listen('onMatchFound', (data) => {
      setSearchTime(0);
      if (searchTimerRef.current) clearInterval(searchTimerRef.current);
      Socket.setCurrentGameId(data.gameId);
    });
    
    // --- Inicio de partida: game:state con vista del jugador ---
    listen('onGameState', (data) => {
      console.log('[Online] game:state recibido', data.gameId);
      
      const pos = data.position;
      const team = data.team;
      myPositionRef.current = pos;
      myTeamRef.current = team;
      setMyPosition(pos);
      setMyTeam(team);
      setSessionToken(data.sessionToken);
      setTargetScore(data.targetScore || 200);
      
      // Mapear jugadores (yo siempre en índice 0)
      const remapped = remapPlayers(data.players, pos);
      
      // Mi mano
      const myHand = (data.hand || []).map(serverTileToClient);
      remapped[0] = { ...remapped[0], tiles: myHand };
      setServerPlayers(remapped);
      setServerHand(myHand);
      
      // Tablero - reconstruir SnakeBoard desde las fichas del servidor
      let board = SnakeBoard.create();
      if (data.board && data.board.length > 0) {
        // Primera ficha → placeCenter
        const firstTile = serverTileToClient(data.board[0], 0);
        board = SnakeBoard.placeCenter(board, firstTile);
        
        // Fichas restantes → placeTile
        // Necesitamos reconstruir el orden. Por ahora con el board del servidor
        // simplificamos: el rendering ya muestra las fichas correctamente
        for (let i = 1; i < data.board.length; i++) {
          const tile = serverTileToClient(data.board[i], i);
          // Intentar colocar en ambos snakes
          let placed = SnakeBoard.placeTile(board, tile, 'top');
          if (!placed) {
            placed = SnakeBoard.placeTile(board, tile, 'bottom');
          }
          if (placed) {
            board = placed;
          }
        }
      }
      boardRef.current = board;
      setServerBoard({ ...board });
      
      // Scores: [mi equipo, equipo rival]
      const scores = data.scores || { team0: 0, team1: 0 };
      setServerScores(team === 0 ? [scores.team0, scores.team1] : [scores.team1, scores.team0]);
      
      // Turno relativo
      const relCurrent = ((data.currentPlayer ?? 0) - pos + 4) % 4;
      setServerCurrent(relCurrent);
      
      // Movimientos válidos y ficha obligatoria
      setServerValidMoves(data.validMoves || []);
      setServerMustPlay(data.mustPlayTileId || null);
      
      // Timer
      setTurnTimeLeft(data.turnTimeLeft || 30);
      
      setOnlinePhase('playing');
    });
    
    // --- Turno ---
    listen('onTurnChange', (data) => {
      const pos = myPositionRef.current;
      const relCurrent = ((data.currentPlayer ?? 0) - pos + 4) % 4;
      setServerCurrent(relCurrent);
      
      // Actualizar hand counts
      if (data.handCounts) {
        setServerPlayers(prev => prev.map((p, i) => {
          if (!p) return p;
          const serverPos = (i + pos) % 4;
          return { ...p, handCount: data.handCounts[serverPos] || 0 };
        }));
      }
    });
    
    // --- Mi turno ---
    listen('onMyTurn', (data) => {
      setServerValidMoves(data.validMoves || []);
      setTurnTimeLeft(data.timeLeft || 30);
      startTurnTimer(data.timeLeft || 30);
    });
    
    // --- Ficha jugada ---
    listen('onTilePlayed', (data) => {
      const pos = myPositionRef.current;
      const clientTile = serverTileToClient(data.tile, data.player);
      
      // Actualizar SnakeBoard visual
      let newBoard = boardRef.current;
      if (newBoard.tiles.length === 0) {
        // Primera ficha
        newBoard = SnakeBoard.placeCenter(newBoard, clientTile);
      } else {
        const socketId = getSnakeSocket(newBoard, clientTile, data.side);
        const placed = SnakeBoard.placeTile(newBoard, clientTile, socketId);
        if (placed) {
          newBoard = placed;
        }
      }
      boardRef.current = newBoard;
      setServerBoard({ ...newBoard });
      
      // Turno relativo
      const relCurrent = ((data.currentPlayer ?? 0) - pos + 4) % 4;
      setServerCurrent(relCurrent);
      
      // Actualizar hand counts  
      if (data.handCounts) {
        setServerPlayers(prev => prev.map((p, i) => {
          if (!p) return p;
          const serverPos = (i + pos) % 4;
          return { ...p, handCount: data.handCounts[serverPos] || 0 };
        }));
      }
      
      // Si el que jugó soy yo, quitar ficha de mi mano
      if (data.player === pos) {
        setServerHand(prev => {
          const updated = prev.filter(t => 
            !(t.left === data.tile.top && t.right === data.tile.bottom) || 
            t._removed
          );
          // Marcar la primera coincidencia como removida
          let removed = false;
          return prev.filter(t => {
            if (!removed && t.left === data.tile.top && t.right === data.tile.bottom) {
              removed = true;
              return false;
            }
            return true;
          });
        });
      }
    });
    
    // --- Pase ---
    listen('onPlayerPass', (data) => {
      const pos = myPositionRef.current;
      const relCurrent = ((data.nextPlayer ?? 0) - pos + 4) % 4;
      setServerCurrent(relCurrent);
    });
    
    // --- Fin de ronda ---
    listen('onRoundEnd', (data) => {
      clearTurnTimer();
      const team = myTeamRef.current;
      const scores = data.scores || { team0: 0, team1: 0 };
      setServerScores(team === 0 ? [scores.team0, scores.team1] : [scores.team1, scores.team0]);
      setRoundResult(data.result);
      setOnlinePhase('roundEnd');
    });
    
    // --- Nueva ronda (server sends full playerView) ---
    listen('onNewRound', (data) => {
      // My hand
      const myHand = (data.hand || []).map(serverTileToClient);
      setServerHand(myHand);
      
      // Update players hand counts
      const pos = myPositionRef.current;
      if (data.handCounts) {
        setServerPlayers(prev => prev.map((p, i) => {
          if (!p) return p;
          const serverPos = (i + pos) % 4;
          return { ...p, handCount: data.handCounts[serverPos] || 0, tiles: i === 0 ? myHand : [] };
        }));
      }
      
      // Reset board
      const newBoard = SnakeBoard.create();
      boardRef.current = newBoard;
      setServerBoard(newBoard);
      
      // Turno
      const relCurrent = ((data.currentPlayer ?? 0) - pos + 4) % 4;
      setServerCurrent(relCurrent);
      
      // Scores
      const team = myTeamRef.current;
      if (data.scores) {
        setServerScores(team === 0 ? [data.scores.team0, data.scores.team1] : [data.scores.team1, data.scores.team0]);
      }
      
      // Valid moves and must play
      setServerValidMoves(data.validMoves || []);
      setServerMustPlay(data.mustPlayTileId || null);
      
      setRoundResult(null);
      setOnlinePhase('playing');
    });
    
    // --- Fin de partida ---
    listen('onGameEnd', (data) => {
      clearTurnTimer();
      const team = myTeamRef.current;
      const scores = data.scores || { team0: 0, team1: 0 };
      setServerScores(team === 0 ? [scores.team0, scores.team1] : [scores.team1, scores.team0]);
      
      setGameEndData({
        won: data.winner === team,
        winnerTeam: data.winner,
        scores: data.scores,
        rounds: data.rounds,
        duration: data.duration,
        ratingChanges: data.ratingChanges
      });
      setOnlinePhase('gameOver');
    });
    
    // --- Errores ---
    listen('onGameError', (data) => {
      console.error('[Online] Game error:', data.error);
    });
    
    // --- Reconexión jugador ---
    listen('onPlayerDisconnected', (data) => {
      const pos = myPositionRef.current;
      const relPos = ((data.position ?? 0) - pos + 4) % 4;
      setServerPlayers(prev => prev.map((p, i) => 
        i === relPos ? { ...p, connected: false } : p
      ));
    });
    
    listen('onPlayerReconnected', (data) => {
      const pos = myPositionRef.current;
      const relPos = ((data.position ?? 0) - pos + 4) % 4;
      setServerPlayers(prev => prev.map((p, i) => 
        i === relPos ? { ...p, connected: true } : p
      ));
    });
    
    return () => {
      cleanupFns.current.forEach(fn => fn());
      cleanupFns.current = [];
      clearTurnTimer();
      if (searchTimerRef.current) clearInterval(searchTimerRef.current);
    };
  }, []); // Solo montar una vez
  
  // ════════════════════════════════════════════════════════════════════════
  // TIMER DE TURNO
  // ════════════════════════════════════════════════════════════════════════
  
  const startTurnTimer = useCallback((seconds) => {
    clearTurnTimer();
    setTurnTimeLeft(seconds);
    timerRef.current = setInterval(() => {
      setTurnTimeLeft(prev => {
        if (prev <= 1) {
          clearTurnTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);
  
  const clearTurnTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  
  // ════════════════════════════════════════════════════════════════════════
  // ACCIONES
  // ════════════════════════════════════════════════════════════════════════
  
  const searchGame = useCallback((options = {}) => {
    Socket.searchMatch({ mode: 'ranked', targetScore: 200, ...options });
    setSearchTime(0);
    searchTimerRef.current = setInterval(() => {
      setSearchTime(prev => prev + 1);
    }, 1000);
  }, []);
  
  const cancelSearchGame = useCallback(() => {
    Socket.cancelSearch();
    setOnlinePhase('idle');
    setSearchTime(0);
    if (searchTimerRef.current) clearInterval(searchTimerRef.current);
  }, []);
  
  const playTileOnline = useCallback((tile, snakeSocketId) => {
    // Convertir snakeSocketId (top/bottom) a server side (left/right)
    const serverSide = snakeSocketId === 'top' ? 'left' : 'right';
    Socket.playTile(tile.id, serverSide);
  }, []);
  
  const passOnline = useCallback(() => {
    Socket.passTurn();
  }, []);
  
  const sendEmoteOnline = useCallback((emote) => {
    Socket.sendEmote(emote);
  }, []);
  
  const surrenderOnline = useCallback(() => {
    Socket.surrender();
  }, []);
  
  const backToMenuOnline = useCallback(() => {
    setOnlinePhase('idle');
    setServerBoard(SnakeBoard.create());
    boardRef.current = SnakeBoard.create();
    setServerPlayers([]);
    setServerHand([]);
    setServerScores([0, 0]);
    setGameEndData(null);
    setRoundResult(null);
    Socket.setCurrentGameId(null);
  }, []);
  
  // ════════════════════════════════════════════════════════════════════════
  // RETURN
  // ════════════════════════════════════════════════════════════════════════
  
  return {
    // Conexión
    connected,
    onlineCount,
    connectionError,
    
    // Estado online
    onlinePhase,
    myPosition, myTeam, sessionToken,
    serverPlayers,
    serverBoard,
    serverScores,
    serverCurrent,
    serverHand,
    serverValidMoves,
    serverMustPlay,
    turnTimeLeft,
    roundResult,
    gameEndData,
    targetScore,
    searchTime,
    
    // Acciones
    searchGame,
    cancelSearch: cancelSearchGame,
    playTileOnline,
    passOnline,
    sendEmoteOnline,
    surrenderOnline,
    backToMenuOnline
  };
};
