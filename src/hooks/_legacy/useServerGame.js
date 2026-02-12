// ============================================================================
// useServerGame - Hook para juego SERVIDOR AUTORITATIVO
// ============================================================================
// Este hook conecta al cliente con el servidor autoritativo.
// TODA la lógica del juego está en el servidor - el cliente solo:
// 1. Envía intenciones (quiero jugar esta ficha, quiero pasar)
// 2. Recibe el estado actualizado del servidor
// 3. Renderiza lo que el servidor le dice
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import io from 'socket.io-client';

const SERVIDOR_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

/**
 * Estado inicial del juego en el cliente
 */
const initialState = {
  // Conexión
  connected: false,
  identified: false,
  error: null,
  
  // Partida
  gameId: null,
  phase: 'idle', // idle | searching | playing | roundEnd | gameOver
  
  // Mi información
  myPosition: null,
  myTeam: null,
  myHand: [],
  validMoves: [],
  isMyTurn: false,
  
  // Estado del juego (lo que el servidor me dice)
  players: [],
  board: [],
  leftEnd: null,
  rightEnd: null,
  currentPlayer: null,
  scores: { team0: 0, team1: 0 },
  handCounts: [10, 10, 10, 10],
  passCount: 0,
  roundNumber: 1,
  targetScore: 200,
  
  // Timer
  turnTimeLeft: 30,
  
  // Eventos
  lastMove: null,
  lastPass: null,
  roundResult: null,
  gameResult: null,
  
  // UI
  notification: null,
  emoteReceived: null
};

/**
 * Hook principal para juego con servidor autoritativo
 */
export const useServerGame = (authUser) => {
  const [state, setState] = useState(initialState);
  const socketRef = useRef(null);
  const timerRef = useRef(null);
  
  // ============================================================================
  // CONEXIÓN AL SERVIDOR
  // ============================================================================
  
  useEffect(() => {
    // Crear conexión
    const socket = io(SERVIDOR_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        token: authUser?.token || null
      }
    });
    
    socketRef.current = socket;
    
    // === EVENTOS DE CONEXIÓN ===
    socket.on('connect', () => {
      console.log('[Socket] ✅ Conectado:', socket.id);
      setState(prev => ({ ...prev, connected: true, error: null }));
    });
    
    socket.on('disconnect', (reason) => {
      console.log('[Socket] ❌ Desconectado:', reason);
      setState(prev => ({ ...prev, connected: false }));
    });
    
    socket.on('connect_error', (err) => {
      console.error('[Socket] Error:', err.message);
      setState(prev => ({ ...prev, error: 'Error de conexión' }));
    });
    
    socket.on('connected', (data) => {
      console.log('[Socket] 🎮 Identificado:', data.user?.name);
      setState(prev => ({ ...prev, identified: true }));
    });
    
    // === EVENTOS DE MATCHMAKING ===
    socket.on('matchmaking:searching', () => {
      setState(prev => ({ ...prev, phase: 'searching' }));
    });
    
    socket.on('matchmaking:cancelled', () => {
      setState(prev => ({ ...prev, phase: 'idle' }));
    });
    
    socket.on('matchmaking:found', () => {
      setState(prev => ({ 
        ...prev, 
        phase: 'loading',
        notification: { type: 'info', message: '¡Partida encontrada!' }
      }));
    });
    
    // === EVENTOS DE JUEGO ===
    
    // Inicio de partida
    socket.on('game:start', (data) => {
      console.log('[Game] 🎲 Partida iniciada:', data);
      
      setState(prev => ({
        ...prev,
        gameId: data.gameId,
        phase: 'playing',
        myPosition: data.position,
        myTeam: data.team,
        myHand: data.hand,
        validMoves: data.validMoves || [],
        isMyTurn: data.isYourTurn || false,
        players: data.players,
        board: [],
        leftEnd: null,
        rightEnd: null,
        currentPlayer: data.currentPlayer,
        scores: { team0: 0, team1: 0 },
        handCounts: data.players.map(p => p.handCount),
        roundNumber: 1,
        targetScore: data.targetScore,
        turnTimeLeft: 30,
        notification: null
      }));
    });
    
    // Mi turno
    socket.on('game:yourTurn', (data) => {
      console.log('[Game] 🎯 Mi turno:', data);
      
      setState(prev => ({
        ...prev,
        validMoves: data.validMoves,
        isMyTurn: true,
        turnTimeLeft: data.timeLeft
      }));
      
      // Iniciar countdown local
      startTurnTimer(data.timeLeft);
    });
    
    // Cambio de turno
    socket.on('game:turn', (data) => {
      setState(prev => ({
        ...prev,
        currentPlayer: data.currentPlayer,
        turnTimeLeft: data.timeLeft,
        isMyTurn: prev.myPosition === data.currentPlayer
      }));
    });
    
    // Movimiento realizado
    socket.on('game:move', (data) => {
      console.log('[Game] 🎴 Movimiento:', data);
      
      setState(prev => ({
        ...prev,
        board: data.board,
        leftEnd: data.leftEnd,
        rightEnd: data.rightEnd,
        handCounts: data.handCounts,
        currentPlayer: null, // Se actualizará con game:turn
        lastMove: {
          player: data.player,
          tile: data.tile,
          side: data.side,
          timestamp: Date.now()
        },
        // Si fui yo quien jugó, ya no es mi turno
        isMyTurn: false,
        validMoves: []
      }));
    });
    
    // Actualización de mi mano (solo para mí)
    socket.on('game:handUpdate', (data) => {
      setState(prev => ({
        ...prev,
        myHand: data.hand,
        validMoves: data.validMoves || []
      }));
    });
    
    // Pase
    socket.on('game:pass', (data) => {
      console.log('[Game] ⏭️ Pase:', data);
      
      setState(prev => ({
        ...prev,
        passCount: data.passCount,
        leftEnd: data.leftEnd,
        rightEnd: data.rightEnd,
        lastPass: {
          player: data.player,
          timestamp: Date.now()
        },
        isMyTurn: false,
        validMoves: []
      }));
    });
    
    // Timeout
    socket.on('game:timeout', (data) => {
      setState(prev => ({
        ...prev,
        notification: { 
          type: 'warning', 
          message: `${data.name} se quedó sin tiempo`,
          duration: 3000
        }
      }));
    });
    
    // Fin de ronda
    socket.on('game:roundEnd', (data) => {
      console.log('[Game] 🏁 Fin de ronda:', data);
      
      setState(prev => ({
        ...prev,
        phase: data.gameOver ? 'gameOver' : 'roundEnd',
        scores: data.scores,
        roundResult: {
          type: data.result.type,
          winner: data.result.winner,
          points: data.points,
          hands: data.hands,
          isEmpate: data.result.isEmpate
        }
      }));
    });
    
    // Nueva ronda
    socket.on('game:newRound', (data) => {
      console.log('[Game] 🔄 Nueva ronda:', data);
      
      setState(prev => ({
        ...prev,
        phase: 'playing',
        myHand: data.hand,
        validMoves: data.validMoves || [],
        isMyTurn: data.isYourTurn || false,
        board: [],
        leftEnd: null,
        rightEnd: null,
        currentPlayer: data.currentPlayer,
        handCounts: data.handCounts,
        passCount: 0,
        roundNumber: data.roundNumber,
        roundResult: null,
        lastMove: null,
        lastPass: null,
        turnTimeLeft: 30
      }));
    });
    
    // Fin de partida
    socket.on('game:end', (data) => {
      console.log('[Game] 🎮 Fin de partida:', data);
      
      setState(prev => ({
        ...prev,
        phase: 'gameOver',
        gameResult: {
          winner: data.winner,
          scores: data.scores,
          rounds: data.rounds,
          duration: data.duration,
          ratingChanges: data.ratingChanges,
          fairPlay: data.fairPlay
        }
      }));
    });
    
    // Error de juego
    socket.on('game:error', (data) => {
      console.error('[Game] ❌ Error:', data.message);
      
      setState(prev => ({
        ...prev,
        notification: { type: 'error', message: data.message, duration: 5000 }
      }));
    });
    
    // Emote recibido
    socket.on('game:emote', (data) => {
      setState(prev => ({
        ...prev,
        emoteReceived: {
          player: data.player,
          emote: data.emote,
          timestamp: Date.now()
        }
      }));
      
      // Limpiar después de 3 segundos
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          emoteReceived: prev.emoteReceived?.timestamp === data.timestamp 
            ? null 
            : prev.emoteReceived
        }));
      }, 3000);
    });
    
    // Jugador desconectado
    socket.on('game:playerDisconnected', (data) => {
      setState(prev => ({
        ...prev,
        notification: { 
          type: 'warning', 
          message: `${data.name} se desconectó`,
          duration: 5000
        },
        players: prev.players.map(p => 
          p.position === data.player ? { ...p, disconnected: true } : p
        )
      }));
    });
    
    // Stats online
    socket.on('stats:online', (data) => {
      // Podemos usar esto para mostrar jugadores online
      console.log('[Stats] Online:', data);
    });
    
    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      socket.disconnect();
    };
  }, [authUser?.token]);
  
  // ============================================================================
  // TIMER LOCAL
  // ============================================================================
  
  const startTurnTimer = useCallback((seconds) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setState(prev => {
        if (prev.turnTimeLeft <= 1) {
          clearInterval(timerRef.current);
          return { ...prev, turnTimeLeft: 0 };
        }
        return { ...prev, turnTimeLeft: prev.turnTimeLeft - 1 };
      });
    }, 1000);
  }, []);
  
  // ============================================================================
  // ACCIONES DEL JUGADOR
  // ============================================================================
  
  /**
   * Buscar partida
   */
  const searchGame = useCallback((options = {}) => {
    if (!socketRef.current?.connected) return;
    
    socketRef.current.emit('matchmaking:join', {
      mode: options.mode || 'ranked',
      targetScore: options.targetScore || 200
    });
    
    setState(prev => ({ ...prev, phase: 'searching' }));
  }, []);
  
  /**
   * Cancelar búsqueda
   */
  const cancelSearch = useCallback(() => {
    if (!socketRef.current?.connected) return;
    
    socketRef.current.emit('matchmaking:cancel');
  }, []);
  
  /**
   * Jugar ficha
   * @param {Object} tile - La ficha a jugar (solo necesitamos el id)
   * @param {string} side - 'left' o 'right'
   */
  const playTile = useCallback((tile, side) => {
    if (!socketRef.current?.connected || !state.gameId) return;
    if (!state.isMyTurn) return;
    
    // Verificar que es una jugada válida localmente (UX)
    const isValid = state.validMoves.some(
      m => m.tile.id === tile.id && m.side === side
    );
    
    if (!isValid) {
      console.warn('[Game] Jugada no válida localmente');
      return;
    }
    
    // Enviar al servidor - ÉL decide si es válida
    socketRef.current.emit('game:playTile', {
      gameId: state.gameId,
      tile: { id: tile.id }, // Solo enviamos el ID
      side
    });
    
    // Optimistic update - marcar que no es mi turno
    setState(prev => ({
      ...prev,
      isMyTurn: false,
      validMoves: []
    }));
  }, [state.gameId, state.isMyTurn, state.validMoves]);
  
  /**
   * Pasar turno
   */
  const passTurn = useCallback(() => {
    if (!socketRef.current?.connected || !state.gameId) return;
    if (!state.isMyTurn) return;
    if (state.validMoves.length > 0) return; // Tiene jugadas
    
    socketRef.current.emit('game:pass', {
      gameId: state.gameId
    });
    
    setState(prev => ({
      ...prev,
      isMyTurn: false
    }));
  }, [state.gameId, state.isMyTurn, state.validMoves]);
  
  /**
   * Enviar emote
   */
  const sendEmote = useCallback((emote) => {
    if (!socketRef.current?.connected || !state.gameId) return;
    
    socketRef.current.emit('game:emote', {
      gameId: state.gameId,
      emote
    });
  }, [state.gameId]);
  
  /**
   * Rendirse
   */
  const surrender = useCallback(() => {
    if (!socketRef.current?.connected || !state.gameId) return;
    
    socketRef.current.emit('game:surrender', {
      gameId: state.gameId
    });
  }, [state.gameId]);
  
  /**
   * Volver al menú
   */
  const returnToMenu = useCallback(() => {
    setState(prev => ({
      ...initialState,
      connected: prev.connected,
      identified: prev.identified
    }));
  }, []);
  
  /**
   * Solicitar estado (reconexión)
   */
  const requestState = useCallback((gameId) => {
    if (!socketRef.current?.connected) return;
    
    socketRef.current.emit('game:requestState', { gameId });
  }, []);
  
  /**
   * Limpiar notificación
   */
  const clearNotification = useCallback(() => {
    setState(prev => ({ ...prev, notification: null }));
  }, []);
  
  // ============================================================================
  // RETURN
  // ============================================================================
  
  return {
    // Estado
    ...state,
    
    // Estado derivado
    canPlay: state.isMyTurn && state.validMoves.length > 0,
    canPass: state.isMyTurn && state.validMoves.length === 0,
    isGameActive: state.phase === 'playing',
    isSearching: state.phase === 'searching',
    isGameOver: state.phase === 'gameOver',
    myTeamScore: state.myTeam === 0 ? state.scores.team0 : state.scores.team1,
    opponentTeamScore: state.myTeam === 0 ? state.scores.team1 : state.scores.team0,
    
    // Acciones
    searchGame,
    cancelSearch,
    playTile,
    passTurn,
    sendEmote,
    surrender,
    returnToMenu,
    requestState,
    clearNotification
  };
};

export default useServerGame;
