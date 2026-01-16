// ============================================================================
// HOOK: useOnlineGame - Juego Online con Servidor
// ============================================================================
// Este hook maneja toda la lógica de juego online conectándose al servidor.
// El servidor es la ÚNICA fuente de verdad - el cliente solo muestra.

import { useState, useEffect, useCallback, useRef } from 'react';
import SocketService from '../services/socket';

// Estados del juego
export const GAME_PHASES = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  SEARCHING: 'searching',
  FOUND: 'found',
  PLAYING: 'playing',
  ROUND_END: 'roundEnd',
  GAME_END: 'gameEnd',
  DISCONNECTED: 'disconnected',
  ERROR: 'error'
};

/**
 * Hook para manejar partidas online
 */
export const useOnlineGame = () => {
  // ══════════════════════════════════════════════════════════════════════════
  // ESTADO
  // ══════════════════════════════════════════════════════════════════════════
  
  // Conexión
  const [connected, setConnected] = useState(false);
  const [phase, setPhase] = useState(GAME_PHASES.IDLE);
  const [error, setError] = useState(null);
  
  // Matchmaking
  const [queuePosition, setQueuePosition] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  const [ratingRange, setRatingRange] = useState(100);
  const [playersInQueue, setPlayersInQueue] = useState(0);
  
  // Juego
  const [gameId, setGameId] = useState(null);
  const [myPosition, setMyPosition] = useState(0);
  const [myTeam, setMyTeam] = useState(0);
  const [myHand, setMyHand] = useState([]);
  const [players, setPlayers] = useState([]);
  const [board, setBoard] = useState([]);
  const [leftEnd, setLeftEnd] = useState(null);
  const [rightEnd, setRightEnd] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [scores, setScores] = useState({ team0: 0, team1: 0 });
  const [roundNumber, setRoundNumber] = useState(1);
  const [targetScore, setTargetScore] = useState(100);
  const [timeLeft, setTimeLeft] = useState(30);
  
  // Resultado
  const [roundResult, setRoundResult] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  
  // Emotes y chat
  const [lastEmote, setLastEmote] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  
  // Refs
  const searchTimerRef = useRef(null);
  const turnTimerRef = useRef(null);
  
  // ══════════════════════════════════════════════════════════════════════════
  // EFECTOS - CONEXIÓN Y EVENTOS
  // ══════════════════════════════════════════════════════════════════════════
  
  useEffect(() => {
    // Inicializar socket
    const initConnection = async () => {
      try {
        setPhase(GAME_PHASES.CONNECTING);
        await SocketService.initSocket();
      } catch (err) {
        setError('Error de conexión');
        setPhase(GAME_PHASES.ERROR);
      }
    };
    
    initConnection();
    
    // Registrar listeners
    const unsubscribers = [
      // ════════════════════════════════════════════════════════════════════
      // CONEXIÓN
      // ════════════════════════════════════════════════════════════════════
      SocketService.on('onConnect', () => {
        console.log('[Game] ✅ Conectado');
        setConnected(true);
        setPhase(GAME_PHASES.IDLE);
        setError(null);
      }),
      
      SocketService.on('onDisconnect', ({ reason }) => {
        console.log('[Game] ❌ Desconectado:', reason);
        setConnected(false);
        if (phase === GAME_PHASES.PLAYING) {
          setError('Conexión perdida');
          setPhase(GAME_PHASES.DISCONNECTED);
        }
      }),
      
      SocketService.on('onError', ({ message }) => {
        console.error('[Game] Error:', message);
        setError(message);
      }),
      
      // ════════════════════════════════════════════════════════════════════
      // MATCHMAKING
      // ════════════════════════════════════════════════════════════════════
      SocketService.on('onMatchmakingJoined', ({ position, estimatedTime }) => {
        console.log('[Game] 🔍 En cola');
        setQueuePosition(position);
        setPhase(GAME_PHASES.SEARCHING);
      }),
      
      SocketService.on('onMatchmakingStatus', ({ position, playersInQueue: piq, waitTime, ratingRange: range }) => {
        setQueuePosition(position);
        setPlayersInQueue(piq);
        setSearchTime(waitTime);
        setRatingRange(range);
      }),
      
      SocketService.on('onMatchFound', (data) => {
        console.log('[Game] 🎮 ¡Partida encontrada!');
        setPhase(GAME_PHASES.FOUND);
        setGameId(data.gameId);
        clearInterval(searchTimerRef.current);
      }),
      
      SocketService.on('onMatchmakingCancelled', () => {
        console.log('[Game] ❌ Búsqueda cancelada');
        setPhase(GAME_PHASES.IDLE);
        setSearchTime(0);
        clearInterval(searchTimerRef.current);
      }),
      
      SocketService.on('onMatchmakingTimeout', () => {
        console.log('[Game] ⏰ Timeout de búsqueda');
        setError('No se encontraron oponentes');
        setPhase(GAME_PHASES.IDLE);
        clearInterval(searchTimerRef.current);
      }),
      
      // ════════════════════════════════════════════════════════════════════
      // JUEGO
      // ════════════════════════════════════════════════════════════════════
      SocketService.on('onGameStart', (data) => {
        console.log('[Game] 🎲 Partida iniciada');
        setGameId(data.gameId);
        setMyPosition(data.position);
        setMyTeam(data.team);
        setMyHand(data.hand || []);
        setPlayers(data.players || []);
        setCurrentPlayer(data.currentPlayer);
        setTargetScore(data.targetScore || 100);
        setBoard([]);
        setLeftEnd(null);
        setRightEnd(null);
        setScores({ team0: 0, team1: 0 });
        setRoundNumber(1);
        setPhase(GAME_PHASES.PLAYING);
        setRoundResult(null);
        setGameResult(null);
        setChatMessages([]);
      }),
      
      SocketService.on('onGameState', (data) => {
        // Reconexión - recibir estado completo
        setBoard(data.board || []);
        setLeftEnd(data.leftEnd);
        setRightEnd(data.rightEnd);
        setCurrentPlayer(data.currentPlayer);
        setScores(data.scores);
        setRoundNumber(data.roundNumber);
        setMyHand(data.hand || []);
        setPlayers(data.players || []);
        setPhase(GAME_PHASES.PLAYING);
      }),
      
      SocketService.on('onTurnChange', ({ currentPlayer: cp, timeLeft: tl }) => {
        setCurrentPlayer(cp);
        setTimeLeft(tl);
      }),
      
      SocketService.on('onTilePlayed', (data) => {
        // Actualizar tablero
        setBoard(data.board);
        setLeftEnd(data.leftEnd);
        setRightEnd(data.rightEnd);
        
        // Actualizar conteo de fichas de cada jugador
        if (data.handCounts) {
          setPlayers(prev => prev.map((p, i) => ({
            ...p,
            handCount: data.handCounts[i]
          })));
        }
        
        // Si la ficha jugada es mía, removerla de mi mano
        if (data.player === myPosition) {
          setMyHand(prev => prev.filter(t => t.id !== data.tile.id));
        }
      }),
      
      SocketService.on('onPlayerPass', ({ player, passCount }) => {
        console.log(`[Game] Jugador ${player} pasó (${passCount}/4)`);
      }),
      
      SocketService.on('onRoundEnd', (data) => {
        console.log('[Game] 🔔 Fin de ronda');
        setRoundResult(data.result);
        setScores(data.scores);
        
        // Mostrar todas las manos
        if (data.hands) {
          setPlayers(prev => prev.map((p, i) => ({
            ...p,
            hand: data.hands[i],
            handCount: data.hands[i]?.length || 0
          })));
        }
        
        if (data.gameOver) {
          setPhase(GAME_PHASES.GAME_END);
        } else {
          setPhase(GAME_PHASES.ROUND_END);
        }
      }),
      
      SocketService.on('onNewRound', (data) => {
        console.log('[Game] 🔄 Nueva ronda:', data.roundNumber);
        setMyHand(data.hand || []);
        setCurrentPlayer(data.currentPlayer);
        setRoundNumber(data.roundNumber);
        setBoard([]);
        setLeftEnd(null);
        setRightEnd(null);
        setRoundResult(null);
        setPhase(GAME_PHASES.PLAYING);
        
        // Resetear conteo de fichas
        setPlayers(prev => prev.map(p => ({
          ...p,
          handCount: 7,
          hand: null
        })));
      }),
      
      SocketService.on('onGameEnd', (data) => {
        console.log('[Game] 🏆 Partida terminada');
        setGameResult(data);
        setPhase(GAME_PHASES.GAME_END);
      }),
      
      SocketService.on('onGameError', ({ message }) => {
        console.error('[Game] Error:', message);
        setError(message);
      }),
      
      SocketService.on('onPlayerDisconnected', ({ player, name }) => {
        console.log(`[Game] 💔 ${name} desconectado`);
        setPlayers(prev => prev.map(p => 
          p.position === player ? { ...p, disconnected: true } : p
        ));
      }),
      
      // ════════════════════════════════════════════════════════════════════
      // SOCIAL
      // ════════════════════════════════════════════════════════════════════
      SocketService.on('onEmote', ({ player, emote }) => {
        setLastEmote({ player, emote, timestamp: Date.now() });
        // Auto-limpiar después de 3 segundos
        setTimeout(() => setLastEmote(null), 3000);
      }),
      
      SocketService.on('onChatMessage', (data) => {
        setChatMessages(prev => [...prev.slice(-50), data]); // Mantener últimos 50
      }),
      
      // Stats
      SocketService.on('onOnlineStats', ({ players, games }) => {
        // Actualizar estadísticas globales si se necesitan
      })
    ];
    
    // Cleanup
    return () => {
      unsubscribers.forEach(unsub => unsub());
      clearInterval(searchTimerRef.current);
      clearInterval(turnTimerRef.current);
    };
  }, []);
  
  // Timer del turno
  useEffect(() => {
    if (phase === GAME_PHASES.PLAYING && currentPlayer === myPosition) {
      turnTimerRef.current = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
    } else {
      clearInterval(turnTimerRef.current);
    }
    
    return () => clearInterval(turnTimerRef.current);
  }, [phase, currentPlayer, myPosition]);
  
  // ══════════════════════════════════════════════════════════════════════════
  // ACCIONES
  // ══════════════════════════════════════════════════════════════════════════
  
  /**
   * Buscar partida
   */
  const searchGame = useCallback((options = {}) => {
    if (!connected) {
      setError('No conectado al servidor');
      return false;
    }
    
    setSearchTime(0);
    setError(null);
    setPhase(GAME_PHASES.SEARCHING);
    
    // Timer de búsqueda local
    searchTimerRef.current = setInterval(() => {
      setSearchTime(prev => prev + 1);
    }, 1000);
    
    return SocketService.searchMatch(options);
  }, [connected]);
  
  /**
   * Cancelar búsqueda
   */
  const cancelSearch = useCallback(() => {
    clearInterval(searchTimerRef.current);
    setPhase(GAME_PHASES.IDLE);
    return SocketService.cancelSearch();
  }, []);
  
  /**
   * Jugar una ficha
   */
  const playTile = useCallback((tile, side) => {
    if (phase !== GAME_PHASES.PLAYING) {
      console.warn('[Game] No está en fase de juego');
      return false;
    }
    if (currentPlayer !== myPosition) {
      console.warn('[Game] No es tu turno');
      return false;
    }
    
    return SocketService.playTile(tile, side);
  }, [phase, currentPlayer, myPosition]);
  
  /**
   * Pasar turno
   */
  const pass = useCallback(() => {
    if (phase !== GAME_PHASES.PLAYING) return false;
    if (currentPlayer !== myPosition) return false;
    
    return SocketService.passTurn();
  }, [phase, currentPlayer, myPosition]);
  
  /**
   * Enviar emote
   */
  const sendEmote = useCallback((emote) => {
    return SocketService.sendEmote(emote);
  }, []);
  
  /**
   * Enviar mensaje de chat
   */
  const sendChat = useCallback((message) => {
    return SocketService.sendChatMessage(message);
  }, []);
  
  /**
   * Rendirse
   */
  const surrender = useCallback(() => {
    return SocketService.surrender();
  }, []);
  
  /**
   * Volver al menú
   */
  const backToMenu = useCallback(() => {
    setPhase(GAME_PHASES.IDLE);
    setGameId(null);
    setGameResult(null);
    setRoundResult(null);
    setError(null);
  }, []);
  
  /**
   * Reconectar
   */
  const reconnect = useCallback(async () => {
    setPhase(GAME_PHASES.CONNECTING);
    try {
      await SocketService.initSocket();
      if (gameId) {
        SocketService.requestGameState(gameId);
      }
    } catch (err) {
      setError('Error al reconectar');
    }
  }, [gameId]);
  
  // ══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════════════════════
  
  /**
   * Verificar si una ficha puede jugarse
   */
  const canPlayTile = useCallback((tile) => {
    if (board.length === 0) return true;
    return tile.top === leftEnd || tile.bottom === leftEnd ||
           tile.top === rightEnd || tile.bottom === rightEnd;
  }, [board, leftEnd, rightEnd]);
  
  /**
   * Verificar si es mi turno
   */
  const isMyTurn = currentPlayer === myPosition && phase === GAME_PHASES.PLAYING;
  
  /**
   * Verificar si puedo jugar alguna ficha
   */
  const canPlay = myHand.some(tile => canPlayTile(tile));
  
  /**
   * Obtener movimientos válidos para una ficha
   */
  const getValidMoves = useCallback((tile) => {
    const moves = [];
    
    if (board.length === 0) {
      moves.push({ side: 'left', rotated: false });
      return moves;
    }
    
    if (tile.top === leftEnd || tile.bottom === leftEnd) {
      moves.push({ side: 'left', rotated: tile.bottom === leftEnd });
    }
    
    if (tile.top === rightEnd || tile.bottom === rightEnd) {
      moves.push({ side: 'right', rotated: tile.top === rightEnd });
    }
    
    return moves;
  }, [board, leftEnd, rightEnd]);
  
  /**
   * Obtener jugador por posición
   */
  const getPlayer = useCallback((position) => {
    return players.find(p => p.position === position);
  }, [players]);
  
  /**
   * Obtener compañero de equipo
   */
  const getTeammate = useCallback(() => {
    return players.find(p => p.team === myTeam && p.position !== myPosition);
  }, [players, myTeam, myPosition]);
  
  // ══════════════════════════════════════════════════════════════════════════
  // CONSTRUIR gameState PARA COMPATIBILIDAD CON GameScreen
  // ══════════════════════════════════════════════════════════════════════════
  
  const hasGameData = players.length > 0 && myHand.length > 0;
  const gameState = hasGameData ? {
    players: players.map((p, idx) => ({
      ...p,
      tiles: idx === myPosition ? myHand : [],
      tileCount: idx === myPosition ? myHand.length : (p.handCount || 10)
    })),
    board: {
      tiles: board,
      leftEnd,
      rightEnd
    },
    scores: [scores.team0 || 0, scores.team1 || 0],
    currentPlayer,
    roundNum: roundNumber,
    targetScore,
    starterTile: null,
    roundResult,
    gameResult
  } : null;
  
  // ══════════════════════════════════════════════════════════════════════════
  // RETORNO
  // ══════════════════════════════════════════════════════════════════════════
  
  return {
    // Estado de conexión
    connected,
    phase,
    error,
    
    // Matchmaking
    queuePosition,
    searchTime,
    ratingRange,
    playersInQueue,
    
    // Estado del juego
    gameId,
    myPosition,
    myTeam,
    myHand,
    players,
    board,
    leftEnd,
    rightEnd,
    currentPlayer,
    scores,
    roundNumber,
    targetScore,
    timeLeft,
    
    // gameState para compatibilidad con GameScreen
    gameState,
    
    // Resultados
    roundResult,
    gameResult,
    
    // Social
    lastEmote,
    chatMessages,
    
    // Helpers
    isMyTurn,
    canPlay,
    canPlayTile,
    getValidMoves,
    getPlayer,
    getTeammate,
    
    // Acciones
    searchGame,
    cancelSearch,
    playTile,
    pass,
    sendEmote,
    sendChat,
    surrender,
    backToMenu,
    reconnect,
    
    // Constantes
    GAME_PHASES
  };
};

export default useOnlineGame;
