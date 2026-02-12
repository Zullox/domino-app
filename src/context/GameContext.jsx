// ============================================================================
// GAME CONTEXT - Estado global del juego con useReducer
// ============================================================================
// Migrado de DominoRanked estados (líneas 8304-8400)
// Centraliza todo el estado del juego en un solo lugar
// ============================================================================

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { SnakeBoard } from '../utils/snakeBoard';
import { getDefaultSettings } from '../constants/gameConfig';

// ============================================================================
// ESTADO INICIAL
// ============================================================================
const createInitialPlayers = () => [
  { id: 0, name: 'Tú', tiles: [], team: 0, avatar: '😎', elo: 1500 },
  { id: 1, name: 'Oponente 1', tiles: [], team: 1, avatar: '🧔', elo: 1500 },
  { id: 2, name: 'Compañero', tiles: [], team: 0, avatar: '👩', elo: 1500 },
  { id: 3, name: 'Oponente 2', tiles: [], team: 1, avatar: '👨', elo: 1500 }
];

const INITIAL_STATE = {
  // === FASE Y NAVEGACIÓN ===
  phase: 'menu', // 'menu' | 'playing' | 'gameOver'
  currentScreen: 'home', // 'home' | 'stats' | 'ranking' | 'shop'
  menuTab: 'home',
  
  // === JUGADORES ===
  players: createInitialPlayers(),
  current: 0, // Jugador actual (0-3)
  
  // === TABLERO Y FICHAS ===
  board: SnakeBoard.create(),
  selected: null,
  showChoice: false,
  lastPlayed: null,
  mustPlay: null,
  
  // === PUNTUACIÓN ===
  scores: [0, 0], // [equipo0, equipo1]
  target: 200, // Puntos para ganar
  passes: 0, // Pases consecutivos
  
  // === ESTADO DE RONDA ===
  firstRound: true,
  lastWinner: 0,
  roundStarter: 0,
  moveCount: 0,
  strategicBonusEligible: false,
  lastPlayPositions: 1,
  doubleNextRound: false,
  
  // === TEMPORIZADOR ===
  timer: 30,
  
  // === MENSAJES Y NOTIFICACIONES ===
  msg: '',
  notification: null,
  roundResult: null,
  
  // === EFECTOS VISUALES ===
  showConfetti: false,
  screenShake: false,
  lastEvent: null,
  showTurnIndicator: false,
  playerPassed: null,
  flyingTile: null,
  
  // === INFORMACIÓN DEL TABLERO ===
  boardRect: null,
  snakePositions: null,
  passedNumbers: { 0: new Set(), 1: new Set(), 2: new Set(), 3: new Set() },
  
  // === MODO DE JUEGO ===
  gameMode: 'local', // 'local' | 'online'
  searching: false,
  eloChange: 0,
  
  // === MODALES Y UI ===
  showSettings: false,
  showProfile: false,
  selectedPlayerStats: null,
  
  // === MENÚ ===
  menuNotifications: 0,
  battlePassLevel: 1,
  battlePassProgress: 0
};

// ============================================================================
// ESTADO ONLINE (separado para claridad)
// ============================================================================
const INITIAL_ONLINE_STATE = {
  socket: null,
  conectado: false,
  identificado: false,
  miSocketId: null,
  miOdId: null,
  jugadoresOnline: 0,
  partidaOnline: null,
  miPosicionOnline: 0,
  errorConexion: null,
  
  // Emotes
  showEmoteMenu: false,
  emoteRecibido: null,
  emoteCooldown: false,
  
  // Reconexión
  reconectando: false,
  jugadorDesconectado: null
};

// ============================================================================
// TIPOS DE ACCIONES
// ============================================================================
export const GAME_ACTIONS = {
  // Navegación
  SET_PHASE: 'SET_PHASE',
  SET_SCREEN: 'SET_SCREEN',
  SET_MENU_TAB: 'SET_MENU_TAB',
  
  // Juego
  START_GAME: 'START_GAME',
  SET_PLAYERS: 'SET_PLAYERS',
  UPDATE_PLAYER: 'UPDATE_PLAYER',
  SET_CURRENT: 'SET_CURRENT',
  
  // Tablero
  SET_BOARD: 'SET_BOARD',
  SET_SELECTED: 'SET_SELECTED',
  SET_SHOW_CHOICE: 'SET_SHOW_CHOICE',
  SET_LAST_PLAYED: 'SET_LAST_PLAYED',
  SET_MUST_PLAY: 'SET_MUST_PLAY',
  
  // Puntuación
  SET_SCORES: 'SET_SCORES',
  ADD_SCORE: 'ADD_SCORE',
  SET_PASSES: 'SET_PASSES',
  INCREMENT_PASSES: 'INCREMENT_PASSES',
  
  // Ronda
  START_ROUND: 'START_ROUND',
  END_ROUND: 'END_ROUND',
  SET_ROUND_RESULT: 'SET_ROUND_RESULT',
  
  // Temporizador
  SET_TIMER: 'SET_TIMER',
  DECREMENT_TIMER: 'DECREMENT_TIMER',
  
  // UI
  SET_MSG: 'SET_MSG',
  SET_NOTIFICATION: 'SET_NOTIFICATION',
  SHOW_CONFETTI: 'SHOW_CONFETTI',
  SET_SCREEN_SHAKE: 'SET_SCREEN_SHAKE',
  SET_PLAYER_PASSED: 'SET_PLAYER_PASSED',
  SET_FLYING_TILE: 'SET_FLYING_TILE',
  
  // Modales
  TOGGLE_SETTINGS: 'TOGGLE_SETTINGS',
  TOGGLE_PROFILE: 'TOGGLE_PROFILE',
  SET_SELECTED_PLAYER_STATS: 'SET_SELECTED_PLAYER_STATS',
  
  // Online
  SET_GAME_MODE: 'SET_GAME_MODE',
  SET_SEARCHING: 'SET_SEARCHING',
  SET_CONECTADO: 'SET_CONECTADO',
  SET_SOCKET: 'SET_SOCKET',
  UPDATE_ONLINE_STATE: 'UPDATE_ONLINE_STATE',
  
  // Board info
  SET_BOARD_INFO: 'SET_BOARD_INFO',
  
  // Reset
  RESET_GAME: 'RESET_GAME',
  RESET_ROUND: 'RESET_ROUND'
};

// ============================================================================
// REDUCER
// ============================================================================
const gameReducer = (state, action) => {
  switch (action.type) {
    // === NAVEGACIÓN ===
    case GAME_ACTIONS.SET_PHASE:
      return { ...state, phase: action.payload };
      
    case GAME_ACTIONS.SET_SCREEN:
      return { ...state, currentScreen: action.payload };
      
    case GAME_ACTIONS.SET_MENU_TAB:
      return { ...state, menuTab: action.payload };
    
    // === JUEGO ===
    case GAME_ACTIONS.START_GAME:
      return {
        ...state,
        phase: 'playing',
        board: SnakeBoard.create(),
        scores: [0, 0],
        passes: 0,
        firstRound: true,
        timer: 30,
        msg: '',
        ...action.payload
      };
      
    case GAME_ACTIONS.SET_PLAYERS:
      return { ...state, players: action.payload };
      
    case GAME_ACTIONS.UPDATE_PLAYER:
      return {
        ...state,
        players: state.players.map((p, i) => 
          i === action.payload.index ? { ...p, ...action.payload.data } : p
        )
      };
      
    case GAME_ACTIONS.SET_CURRENT:
      return { ...state, current: action.payload };
    
    // === TABLERO ===
    case GAME_ACTIONS.SET_BOARD:
      return { ...state, board: action.payload };
      
    case GAME_ACTIONS.SET_SELECTED:
      return { ...state, selected: action.payload };
      
    case GAME_ACTIONS.SET_SHOW_CHOICE:
      return { ...state, showChoice: action.payload };
      
    case GAME_ACTIONS.SET_LAST_PLAYED:
      return { ...state, lastPlayed: action.payload };
      
    case GAME_ACTIONS.SET_MUST_PLAY:
      return { ...state, mustPlay: action.payload };
    
    // === PUNTUACIÓN ===
    case GAME_ACTIONS.SET_SCORES:
      return { ...state, scores: action.payload };
      
    case GAME_ACTIONS.ADD_SCORE:
      const newScores = [...state.scores];
      newScores[action.payload.team] += action.payload.points;
      return { ...state, scores: newScores };
      
    case GAME_ACTIONS.SET_PASSES:
      return { ...state, passes: action.payload };
      
    case GAME_ACTIONS.INCREMENT_PASSES:
      return { ...state, passes: state.passes + 1 };
    
    // === RONDA ===
    case GAME_ACTIONS.START_ROUND:
      return {
        ...state,
        board: SnakeBoard.create(),
        passes: 0,
        moveCount: 0,
        strategicBonusEligible: false,
        lastPlayed: null,
        mustPlay: null,
        timer: 30,
        passedNumbers: { 0: new Set(), 1: new Set(), 2: new Set(), 3: new Set() },
        ...action.payload
      };
      
    case GAME_ACTIONS.END_ROUND:
      return {
        ...state,
        roundResult: action.payload,
        lastWinner: action.payload.winnerTeam ?? state.lastWinner
      };
      
    case GAME_ACTIONS.SET_ROUND_RESULT:
      return { ...state, roundResult: action.payload };
    
    // === TEMPORIZADOR ===
    case GAME_ACTIONS.SET_TIMER:
      return { ...state, timer: action.payload };
      
    case GAME_ACTIONS.DECREMENT_TIMER:
      return { ...state, timer: Math.max(0, state.timer - 1) };
    
    // === UI ===
    case GAME_ACTIONS.SET_MSG:
      return { ...state, msg: action.payload };
      
    case GAME_ACTIONS.SET_NOTIFICATION:
      return { ...state, notification: action.payload };
      
    case GAME_ACTIONS.SHOW_CONFETTI:
      return { ...state, showConfetti: action.payload };
      
    case GAME_ACTIONS.SET_SCREEN_SHAKE:
      return { ...state, screenShake: action.payload };
      
    case GAME_ACTIONS.SET_PLAYER_PASSED:
      return { ...state, playerPassed: action.payload };
      
    case GAME_ACTIONS.SET_FLYING_TILE:
      return { ...state, flyingTile: action.payload };
    
    // === MODALES ===
    case GAME_ACTIONS.TOGGLE_SETTINGS:
      return { ...state, showSettings: action.payload ?? !state.showSettings };
      
    case GAME_ACTIONS.TOGGLE_PROFILE:
      return { ...state, showProfile: action.payload ?? !state.showProfile };
      
    case GAME_ACTIONS.SET_SELECTED_PLAYER_STATS:
      return { ...state, selectedPlayerStats: action.payload };
    
    // === ONLINE ===
    case GAME_ACTIONS.SET_GAME_MODE:
      return { ...state, gameMode: action.payload };
      
    case GAME_ACTIONS.SET_SEARCHING:
      return { ...state, searching: action.payload };
      
    case GAME_ACTIONS.SET_CONECTADO:
      return { ...state, conectado: action.payload };
      
    case GAME_ACTIONS.SET_SOCKET:
      return { ...state, socket: action.payload };
      
    case GAME_ACTIONS.UPDATE_ONLINE_STATE:
      return { ...state, ...action.payload };
    
    // === BOARD INFO ===
    case GAME_ACTIONS.SET_BOARD_INFO:
      return {
        ...state,
        boardRect: action.payload.rect,
        snakePositions: action.payload.positions
      };
    
    // === RESET ===
    case GAME_ACTIONS.RESET_GAME:
      return {
        ...INITIAL_STATE,
        ...INITIAL_ONLINE_STATE,
        // Mantener algunas cosas
        gameMode: state.gameMode,
        socket: state.socket,
        conectado: state.conectado
      };
      
    case GAME_ACTIONS.RESET_ROUND:
      return {
        ...state,
        board: SnakeBoard.create(),
        passes: 0,
        moveCount: 0,
        lastPlayed: null,
        mustPlay: null,
        selected: null,
        showChoice: false,
        timer: 30,
        playerPassed: null,
        flyingTile: null,
        roundResult: null
      };
      
    default:
      console.warn(`[GameContext] Unknown action: ${action.type}`);
      return state;
  }
};

// ============================================================================
// CONTEXT
// ============================================================================
const GameContext = createContext(null);

// ============================================================================
// PROVIDER
// ============================================================================
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, {
    ...INITIAL_STATE,
    ...INITIAL_ONLINE_STATE
  });
  
  // === ACCIONES HELPERS ===
  const actions = {
    // Navegación
    setPhase: (phase) => dispatch({ type: GAME_ACTIONS.SET_PHASE, payload: phase }),
    setScreen: (screen) => dispatch({ type: GAME_ACTIONS.SET_SCREEN, payload: screen }),
    setMenuTab: (tab) => dispatch({ type: GAME_ACTIONS.SET_MENU_TAB, payload: tab }),
    
    // Juego
    startGame: (config) => dispatch({ type: GAME_ACTIONS.START_GAME, payload: config }),
    setPlayers: (players) => dispatch({ type: GAME_ACTIONS.SET_PLAYERS, payload: players }),
    updatePlayer: (index, data) => dispatch({ type: GAME_ACTIONS.UPDATE_PLAYER, payload: { index, data } }),
    setCurrent: (current) => dispatch({ type: GAME_ACTIONS.SET_CURRENT, payload: current }),
    
    // Tablero
    setBoard: (board) => dispatch({ type: GAME_ACTIONS.SET_BOARD, payload: board }),
    setSelected: (tile) => dispatch({ type: GAME_ACTIONS.SET_SELECTED, payload: tile }),
    setShowChoice: (show) => dispatch({ type: GAME_ACTIONS.SET_SHOW_CHOICE, payload: show }),
    setLastPlayed: (tile) => dispatch({ type: GAME_ACTIONS.SET_LAST_PLAYED, payload: tile }),
    setMustPlay: (tile) => dispatch({ type: GAME_ACTIONS.SET_MUST_PLAY, payload: tile }),
    
    // Puntuación
    setScores: (scores) => dispatch({ type: GAME_ACTIONS.SET_SCORES, payload: scores }),
    addScore: (team, points) => dispatch({ type: GAME_ACTIONS.ADD_SCORE, payload: { team, points } }),
    setPasses: (passes) => dispatch({ type: GAME_ACTIONS.SET_PASSES, payload: passes }),
    incrementPasses: () => dispatch({ type: GAME_ACTIONS.INCREMENT_PASSES }),
    
    // Ronda
    startRound: (config) => dispatch({ type: GAME_ACTIONS.START_ROUND, payload: config }),
    endRound: (result) => dispatch({ type: GAME_ACTIONS.END_ROUND, payload: result }),
    setRoundResult: (result) => dispatch({ type: GAME_ACTIONS.SET_ROUND_RESULT, payload: result }),
    
    // Timer
    setTimer: (time) => dispatch({ type: GAME_ACTIONS.SET_TIMER, payload: time }),
    decrementTimer: () => dispatch({ type: GAME_ACTIONS.DECREMENT_TIMER }),
    
    // UI
    setMsg: (msg) => dispatch({ type: GAME_ACTIONS.SET_MSG, payload: msg }),
    setNotification: (notif) => dispatch({ type: GAME_ACTIONS.SET_NOTIFICATION, payload: notif }),
    showConfetti: (show) => dispatch({ type: GAME_ACTIONS.SHOW_CONFETTI, payload: show }),
    setScreenShake: (shake) => dispatch({ type: GAME_ACTIONS.SET_SCREEN_SHAKE, payload: shake }),
    setPlayerPassed: (player) => dispatch({ type: GAME_ACTIONS.SET_PLAYER_PASSED, payload: player }),
    setFlyingTile: (tile) => dispatch({ type: GAME_ACTIONS.SET_FLYING_TILE, payload: tile }),
    
    // Modales
    toggleSettings: (show) => dispatch({ type: GAME_ACTIONS.TOGGLE_SETTINGS, payload: show }),
    toggleProfile: (show) => dispatch({ type: GAME_ACTIONS.TOGGLE_PROFILE, payload: show }),
    setSelectedPlayerStats: (player) => dispatch({ type: GAME_ACTIONS.SET_SELECTED_PLAYER_STATS, payload: player }),
    
    // Online
    setGameMode: (mode) => dispatch({ type: GAME_ACTIONS.SET_GAME_MODE, payload: mode }),
    setSearching: (searching) => dispatch({ type: GAME_ACTIONS.SET_SEARCHING, payload: searching }),
    setConectado: (conectado) => dispatch({ type: GAME_ACTIONS.SET_CONECTADO, payload: conectado }),
    setSocket: (socket) => dispatch({ type: GAME_ACTIONS.SET_SOCKET, payload: socket }),
    updateOnlineState: (onlineState) => dispatch({ type: GAME_ACTIONS.UPDATE_ONLINE_STATE, payload: onlineState }),
    
    // Board info
    setBoardInfo: (rect, positions) => dispatch({ type: GAME_ACTIONS.SET_BOARD_INFO, payload: { rect, positions } }),
    
    // Reset
    resetGame: () => dispatch({ type: GAME_ACTIONS.RESET_GAME }),
    resetRound: () => dispatch({ type: GAME_ACTIONS.RESET_ROUND }),
    
    // Dispatch directo para casos especiales
    dispatch
  };
  
  return (
    <GameContext.Provider value={{ state, ...actions }}>
      {children}
    </GameContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

// ============================================================================
// SELECTORS (para optimización)
// ============================================================================
export const useGamePhase = () => {
  const { state } = useGame();
  return state.phase;
};

export const useGameBoard = () => {
  const { state } = useGame();
  return state.board;
};

export const useGamePlayers = () => {
  const { state } = useGame();
  return state.players;
};

export const useCurrentPlayer = () => {
  const { state } = useGame();
  return state.current;
};

export const useGameScores = () => {
  const { state } = useGame();
  return state.scores;
};

export const useIsMyTurn = () => {
  const { state } = useGame();
  return state.current === 0;
};

export const useOnlineState = () => {
  const { state } = useGame();
  return {
    gameMode: state.gameMode,
    socket: state.socket,
    conectado: state.conectado,
    identificado: state.identificado,
    miSocketId: state.miSocketId,
    partidaOnline: state.partidaOnline,
    miPosicionOnline: state.miPosicionOnline,
    errorConexion: state.errorConexion
  };
};

export default GameContext;
