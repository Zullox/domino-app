// ============================================================================
// CONTEXTO DE JUEGO - ESTADO GLOBAL
// ============================================================================
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import SocketService from '../services/socket';
import { getTranslation } from '../constants/i18n';

// Estado inicial
const initialState = {
  // Conexión
  connected: false,
  socketId: null,
  connectionError: null,
  
  // Juego
  phase: 'menu', // 'menu' | 'searching' | 'dealing' | 'playing' | 'roundEnd' | 'gameOver'
  gameMode: 'offline', // 'offline' | 'online'
  
  // Jugadores
  players: [
    { id: 0, name: 'Tú', tiles: [], team: 0, avatar: '😎', rating: 1500 },
    { id: 1, name: 'Carlos', tiles: [], team: 1, avatar: '🧔', rating: 1500 },
    { id: 2, name: 'María', tiles: [], team: 0, avatar: '👩', rating: 1500 },
    { id: 3, name: 'Pedro', tiles: [], team: 1, avatar: '👨', rating: 1500 }
  ],
  currentPlayer: 0,
  myPlayerId: 0,
  
  // Tablero
  board: { tiles: [], leftEnd: null, rightEnd: null },
  
  // Puntuación
  scores: [0, 0],
  targetScore: 100,
  roundNum: 1,
  
  // Timer
  timer: 30,
  
  // UI
  selectedTile: null,
  notification: null,
  showEmotes: false,
  
  // Revancha
  rematch: {
    requested: false,
    received: false,
    accepted: false,
    declined: false,
    count: 0
  },
  
  // Resultados
  roundResult: null,
  eloChange: 0,
  lastMatchRewards: null
};

// Acciones
const ACTIONS = {
  SET_CONNECTED: 'SET_CONNECTED',
  SET_PHASE: 'SET_PHASE',
  SET_GAME_MODE: 'SET_GAME_MODE',
  SET_PLAYERS: 'SET_PLAYERS',
  SET_CURRENT_PLAYER: 'SET_CURRENT_PLAYER',
  SET_BOARD: 'SET_BOARD',
  SET_SCORES: 'SET_SCORES',
  SET_TIMER: 'SET_TIMER',
  SET_SELECTED_TILE: 'SET_SELECTED_TILE',
  SET_NOTIFICATION: 'SET_NOTIFICATION',
  SET_REMATCH: 'SET_REMATCH',
  SET_ROUND_RESULT: 'SET_ROUND_RESULT',
  SET_ELO_CHANGE: 'SET_ELO_CHANGE',
  SET_REWARDS: 'SET_REWARDS',
  UPDATE_PLAYER_TILES: 'UPDATE_PLAYER_TILES',
  RESET_GAME: 'RESET_GAME',
  SYNC_GAME_STATE: 'SYNC_GAME_STATE'
};

// Reducer
const gameReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_CONNECTED:
      return { ...state, connected: action.payload.connected, socketId: action.payload.socketId };
    
    case ACTIONS.SET_PHASE:
      return { ...state, phase: action.payload };
    
    case ACTIONS.SET_GAME_MODE:
      return { ...state, gameMode: action.payload };
    
    case ACTIONS.SET_PLAYERS:
      return { ...state, players: action.payload };
    
    case ACTIONS.SET_CURRENT_PLAYER:
      return { ...state, currentPlayer: action.payload };
    
    case ACTIONS.SET_BOARD:
      return { ...state, board: action.payload };
    
    case ACTIONS.SET_SCORES:
      return { ...state, scores: action.payload };
    
    case ACTIONS.SET_TIMER:
      return { ...state, timer: action.payload };
    
    case ACTIONS.SET_SELECTED_TILE:
      return { ...state, selectedTile: action.payload };
    
    case ACTIONS.SET_NOTIFICATION:
      return { ...state, notification: action.payload };
    
    case ACTIONS.SET_REMATCH:
      return { ...state, rematch: { ...state.rematch, ...action.payload } };
    
    case ACTIONS.SET_ROUND_RESULT:
      return { ...state, roundResult: action.payload };
    
    case ACTIONS.SET_ELO_CHANGE:
      return { ...state, eloChange: action.payload };
    
    case ACTIONS.SET_REWARDS:
      return { ...state, lastMatchRewards: action.payload };
    
    case ACTIONS.UPDATE_PLAYER_TILES:
      return {
        ...state,
        players: state.players.map((p, i) => 
          i === action.payload.playerId 
            ? { ...p, tiles: action.payload.tiles }
            : p
        )
      };
    
    case ACTIONS.RESET_GAME:
      return {
        ...initialState,
        connected: state.connected,
        socketId: state.socketId,
        gameMode: state.gameMode
      };
    
    case ACTIONS.SYNC_GAME_STATE:
      // Sincronizar estado completo desde el servidor
      return { ...state, ...action.payload };
    
    default:
      return state;
  }
};

// Contexto
const GameContext = createContext(null);

// Provider
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  // Conectar socket al montar
  useEffect(() => {
    const socket = SocketService.initSocket();
    
    // Registrar listeners
    const unsubConnect = SocketService.on('onConnect', (socketId) => {
      dispatch({ type: ACTIONS.SET_CONNECTED, payload: { connected: true, socketId } });
    });
    
    const unsubDisconnect = SocketService.on('onDisconnect', () => {
      dispatch({ type: ACTIONS.SET_CONNECTED, payload: { connected: false, socketId: null } });
    });
    
    const unsubGameState = SocketService.on('onGameState', (data) => {
      dispatch({ type: ACTIONS.SYNC_GAME_STATE, payload: data });
    });
    
    const unsubTilePlayed = SocketService.on('onTilePlayed', (data) => {
      dispatch({ type: ACTIONS.SET_BOARD, payload: data.board });
      dispatch({ type: ACTIONS.UPDATE_PLAYER_TILES, payload: data.player });
      dispatch({ type: ACTIONS.SET_CURRENT_PLAYER, payload: data.nextPlayer });
    });
    
    const unsubRoundEnd = SocketService.on('onRoundEnd', (data) => {
      dispatch({ type: ACTIONS.SET_ROUND_RESULT, payload: data });
      dispatch({ type: ACTIONS.SET_SCORES, payload: data.scores });
      dispatch({ type: ACTIONS.SET_PHASE, payload: 'roundEnd' });
    });
    
    const unsubGameEnd = SocketService.on('onGameEnd', (data) => {
      dispatch({ type: ACTIONS.SET_ELO_CHANGE, payload: data.eloChange });
      dispatch({ type: ACTIONS.SET_REWARDS, payload: data.rewards });
      dispatch({ type: ACTIONS.SET_PHASE, payload: 'gameOver' });
    });
    
    const unsubRematch = SocketService.on('onRematchRequest', () => {
      dispatch({ type: ACTIONS.SET_REMATCH, payload: { received: true } });
    });
    
    const unsubRematchResponse = SocketService.on('onRematchResponse', (data) => {
      if (data.accepted) {
        dispatch({ type: ACTIONS.SET_REMATCH, payload: { accepted: true } });
      } else {
        dispatch({ type: ACTIONS.SET_REMATCH, payload: { declined: true } });
      }
    });
    
    // Cleanup
    return () => {
      unsubConnect();
      unsubDisconnect();
      unsubGameState();
      unsubTilePlayed();
      unsubRoundEnd();
      unsubGameEnd();
      unsubRematch();
      unsubRematchResponse();
      SocketService.disconnectSocket();
    };
  }, []);
  
  // Acciones
  const actions = {
    setPhase: useCallback((phase) => {
      dispatch({ type: ACTIONS.SET_PHASE, payload: phase });
    }, []),
    
    setGameMode: useCallback((mode) => {
      dispatch({ type: ACTIONS.SET_GAME_MODE, payload: mode });
    }, []),
    
    setSelectedTile: useCallback((tile) => {
      dispatch({ type: ACTIONS.SET_SELECTED_TILE, payload: tile });
    }, []),
    
    showNotification: useCallback((type, message, icon, duration = 2000) => {
      dispatch({ type: ACTIONS.SET_NOTIFICATION, payload: { type, message, icon } });
      setTimeout(() => {
        dispatch({ type: ACTIONS.SET_NOTIFICATION, payload: null });
      }, duration);
    }, []),
    
    requestRematch: useCallback(() => {
      if (state.gameMode === 'online') {
        SocketService.requestRematch();
      }
      dispatch({ type: ACTIONS.SET_REMATCH, payload: { requested: true } });
    }, [state.gameMode]),
    
    acceptRematch: useCallback(() => {
      if (state.gameMode === 'online') {
        SocketService.respondRematch(true);
      }
      dispatch({ type: ACTIONS.SET_REMATCH, payload: { accepted: true } });
    }, [state.gameMode]),
    
    declineRematch: useCallback(() => {
      if (state.gameMode === 'online') {
        SocketService.respondRematch(false);
      }
      dispatch({ type: ACTIONS.SET_REMATCH, payload: { declined: true } });
    }, [state.gameMode]),
    
    resetGame: useCallback(() => {
      dispatch({ type: ACTIONS.RESET_GAME });
    }, []),
    
    playTile: useCallback((tile, position) => {
      if (state.gameMode === 'online') {
        SocketService.playTile(tile, position);
      }
      // En modo offline, la lógica se maneja en el componente de juego
    }, [state.gameMode]),
    
    passTurn: useCallback(() => {
      if (state.gameMode === 'online') {
        SocketService.passTurn();
      }
    }, [state.gameMode]),
    
    sendEmote: useCallback((emote) => {
      if (state.gameMode === 'online') {
        SocketService.sendEmote(emote);
      }
    }, [state.gameMode]),
    
    searchMatch: useCallback(() => {
      dispatch({ type: ACTIONS.SET_PHASE, payload: 'searching' });
      SocketService.searchMatch();
    }, []),
    
    cancelSearch: useCallback(() => {
      dispatch({ type: ACTIONS.SET_PHASE, payload: 'menu' });
      SocketService.cancelSearch();
    }, [])
  };
  
  return (
    <GameContext.Provider value={{ state, actions, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

// Hook para usar el contexto
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame debe usarse dentro de GameProvider');
  }
  return context;
};

export default GameContext;
