// ============================================================================
// USE GAME LOGIC - Lógica principal del juego
// ============================================================================
// Migrado de DominoRanked funciones de juego
// Maneja: repartir, jugar fichas, pasar, fin de ronda, puntuación
// ============================================================================

import { useCallback, useRef } from 'react';
import { SnakeBoard } from '../utils/snakeBoard';
import { Engine, AI } from '../utils/gameEngine';
import { CONFIG } from '../constants/gameConfig';

// ============================================================================
// CONSTANTES
// ============================================================================
const TEAM_NAMES = ['Equipo 1', 'Equipo 2'];

// ============================================================================
// HOOK
// ============================================================================
export const useGameLogic = ({
  // Estado
  players,
  board,
  current,
  scores,
  passes,
  target,
  gameMode,
  settings,
  firstRound,
  roundStarter,
  moveCount,
  doubleNextRound,
  
  // Setters
  setPlayers,
  setBoard,
  setCurrent,
  setScores,
  setPasses,
  setSelected,
  setShowChoice,
  setLastPlayed,
  setMustPlay,
  setFirstRound,
  setLastWinner,
  setRoundStarter,
  setMoveCount,
  setStrategicBonusEligible,
  setDoubleNextRound,
  setTimer,
  setMsg,
  setPhase,
  setPlayerPassed,
  setFlyingTile,
  setRoundResult,
  setPassedNumbers,
  
  // Callbacks
  onRoundEnd,
  onGameEnd,
  onNotification,
  onVibrate,
  onPlaySound,
  
  // Socket (para modo online)
  socket,
  miPosicionOnline
}) => {
  const playTileRef = useRef(null);
  const aiTimeoutRef = useRef(null);
  
  // ============================================================================
  // REPARTIR FICHAS
  // ============================================================================
  const dealTiles = useCallback(() => {
    // Crear todas las fichas del dominó doble 9
    const allTiles = [];
    for (let i = 0; i <= CONFIG.maxTile; i++) {
      for (let j = i; j <= CONFIG.maxTile; j++) {
        allTiles.push({ left: i, right: j, id: `${i}-${j}` });
      }
    }
    
    // Barajar
    for (let i = allTiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allTiles[i], allTiles[j]] = [allTiles[j], allTiles[i]];
    }
    
    // Repartir 10 fichas a cada jugador
    const newPlayers = players.map((p, idx) => ({
      ...p,
      tiles: allTiles.slice(idx * CONFIG.tilesPerPlayer, (idx + 1) * CONFIG.tilesPerPlayer)
    }));
    
    setPlayers(newPlayers);
    return newPlayers;
  }, [players, setPlayers]);
  
  // ============================================================================
  // ENCONTRAR JUGADOR INICIAL
  // ============================================================================
  const findStartingPlayer = useCallback((playersWithTiles, isFirstRound, lastWinnerTeam) => {
    if (isFirstRound) {
      // Primera ronda: quien tenga el doble más alto
      let highestDouble = -1;
      let startPlayer = 0;
      
      playersWithTiles.forEach((player, idx) => {
        player.tiles.forEach(tile => {
          if (tile.left === tile.right && tile.left > highestDouble) {
            highestDouble = tile.left;
            startPlayer = idx;
          }
        });
      });
      
      // Ficha obligatoria
      if (highestDouble >= 0) {
        const mustTile = { left: highestDouble, right: highestDouble, id: `${highestDouble}-${highestDouble}` };
        setMustPlay(mustTile);
      }
      
      return startPlayer;
    } else {
      // Siguientes rondas: inicia el ganador de la anterior
      return lastWinnerTeam;
    }
  }, [setMustPlay]);
  
  // ============================================================================
  // INICIAR RONDA
  // ============================================================================
  const startRound = useCallback((isFirstRound = false, lastWinnerTeam = 0) => {
    const newPlayers = dealTiles();
    const startPlayer = findStartingPlayer(newPlayers, isFirstRound, lastWinnerTeam);
    
    setBoard(SnakeBoard.create());
    setPasses(0);
    setMoveCount(0);
    setStrategicBonusEligible(false);
    setLastPlayed(null);
    setSelected(null);
    setShowChoice(false);
    setTimer(30);
    setCurrent(startPlayer);
    setRoundStarter(startPlayer);
    setPlayerPassed(null);
    setFlyingTile(null);
    setPassedNumbers({ 0: new Set(), 1: new Set(), 2: new Set(), 3: new Set() });
    
    if (isFirstRound) {
      setFirstRound(false);
    }
    
    setMsg(`Turno de ${newPlayers[startPlayer].name}`);
  }, [dealTiles, findStartingPlayer, setBoard, setPasses, setMoveCount, 
      setStrategicBonusEligible, setLastPlayed, setSelected, setShowChoice,
      setTimer, setCurrent, setRoundStarter, setPlayerPassed, setFlyingTile,
      setPassedNumbers, setFirstRound, setMsg]);
  
  // ============================================================================
  // JUGAR FICHA
  // ============================================================================
  const playTile = useCallback((tile, position) => {
    if (gameMode === 'online' && socket?.connected) {
      // Modo online: enviar al servidor
      socket.emit('jugarFicha', { ficha: tile, extremo: position });
      return;
    }
    
    // Modo local
    const playerIndex = current;
    const player = players[playerIndex];
    
    // Verificar que el jugador tiene la ficha
    const tileIndex = player.tiles.findIndex(t => t.id === tile.id);
    if (tileIndex === -1) {
      console.error('Ficha no encontrada en mano del jugador');
      return false;
    }
    
    // Intentar colocar en el tablero
    const newBoard = SnakeBoard.placeTile(board, tile, position);
    if (!newBoard) {
      console.error('No se puede colocar la ficha');
      return false;
    }
    
    // Actualizar estado
    const newTiles = [...player.tiles];
    newTiles.splice(tileIndex, 1);
    
    const updatedPlayers = players.map((p, i) => 
      i === playerIndex ? { ...p, tiles: newTiles } : p
    );
    
    setPlayers(updatedPlayers);
    setBoard(newBoard);
    setLastPlayed({ tile, position, player: playerIndex });
    setMustPlay(null);
    setSelected(null);
    setShowChoice(false);
    setPasses(0);
    setMoveCount(prev => prev + 1);
    
    // Verificar si ganó (dominó)
    if (newTiles.length === 0) {
      const winTeam = player.team;
      endRound(winTeam, 'domino', updatedPlayers);
      return true;
    }
    
    // Siguiente turno
    nextTurn(updatedPlayers);
    return true;
  }, [gameMode, socket, current, players, board, setPlayers, setBoard, 
      setLastPlayed, setMustPlay, setSelected, setShowChoice, setPasses, setMoveCount]);
  
  // ============================================================================
  // PASAR TURNO
  // ============================================================================
  const passTurn = useCallback(() => {
    if (gameMode === 'online' && socket?.connected) {
      socket.emit('pasar');
      return;
    }
    
    const newPasses = passes + 1;
    setPasses(newPasses);
    setPlayerPassed(current);
    
    // Registrar números que el jugador no tiene
    const ends = Engine.getBoardEnds(board);
    if (ends) {
      setPassedNumbers(prev => {
        const newSet = new Set(prev[current]);
        if (ends.left !== null) newSet.add(ends.left);
        if (ends.right !== null) newSet.add(ends.right);
        return { ...prev, [current]: newSet };
      });
    }
    
    // Verificar tranca (4 pases consecutivos)
    if (newPasses >= CONFIG.passesForTranca) {
      endRound(null, 'tranca', players);
      return;
    }
    
    // Regla 8: segundo jugador pasa
    if (moveCount === 1 && current === (roundStarter + 1) % 4) {
      setStrategicBonusEligible(true);
    }
    
    onVibrate?.([30]);
    nextTurn(players);
  }, [gameMode, socket, passes, current, board, players, moveCount, roundStarter,
      setPasses, setPlayerPassed, setPassedNumbers, setStrategicBonusEligible, onVibrate]);
  
  // ============================================================================
  // SIGUIENTE TURNO
  // ============================================================================
  const nextTurn = useCallback((currentPlayers) => {
    const nextPlayer = (current + 1) % 4;
    setCurrent(nextPlayer);
    setTimer(30);
    setMsg(`Turno de ${currentPlayers[nextPlayer].name}`);
    
    // Limpiar indicador de pase después de un momento
    setTimeout(() => setPlayerPassed(null), 1500);
    
    // Si es IA, programar jugada
    if (nextPlayer !== 0 && gameMode === 'local') {
      const delay = settings?.aiDelay || 1500;
      aiTimeoutRef.current = setTimeout(() => {
        playAI(nextPlayer, currentPlayers);
      }, delay);
    }
  }, [current, gameMode, settings, setCurrent, setTimer, setMsg, setPlayerPassed]);
  
  // ============================================================================
  // JUGADA DE IA
  // ============================================================================
  const playAI = useCallback((playerIndex, currentPlayers) => {
    const player = currentPlayers[playerIndex];
    const difficulty = settings?.aiDifficulty || 'medium';
    
    // Obtener jugada de la IA
    const aiMove = AI.getMove(player.tiles, board, difficulty, {
      passedNumbers: {}, // TODO: pasar info de pases
      teamMate: currentPlayers[(playerIndex + 2) % 4]
    });
    
    if (aiMove) {
      playTile(aiMove.tile, aiMove.position);
    } else {
      passTurn();
    }
  }, [board, settings, playTile, passTurn]);
  
  // ============================================================================
  // FIN DE RONDA
  // ============================================================================
  const endRound = useCallback((winTeam, type, currentPlayers) => {
    // Calcular puntos
    let points = 0;
    
    if (type === 'domino') {
      // Sumar puntos de los oponentes
      currentPlayers.forEach(p => {
        if (p.team !== winTeam) {
          p.tiles.forEach(t => {
            points += t.left + t.right;
          });
        }
      });
    } else if (type === 'tranca') {
      // Tranca: gana quien tenga menos puntos
      const teamPoints = [0, 0];
      currentPlayers.forEach(p => {
        p.tiles.forEach(t => {
          teamPoints[p.team] += t.left + t.right;
        });
      });
      
      if (teamPoints[0] < teamPoints[1]) {
        winTeam = 0;
        points = teamPoints[1];
      } else if (teamPoints[1] < teamPoints[0]) {
        winTeam = 1;
        points = teamPoints[0];
      } else {
        // Empate
        winTeam = null;
        points = 0;
        setDoubleNextRound(true);
      }
    }
    
    // Aplicar multiplicador si hubo empate anterior
    if (doubleNextRound && winTeam !== null) {
      points *= 2;
      setDoubleNextRound(false);
    }
    
    // Actualizar puntuación
    if (winTeam !== null) {
      const newScores = [...scores];
      newScores[winTeam] += points;
      setScores(newScores);
      
      // Verificar fin de partida
      if (newScores[winTeam] >= target) {
        endGame(winTeam, newScores);
        return;
      }
      
      setLastWinner(winTeam);
    }
    
    // Mostrar resultado
    setRoundResult({
      type,
      winTeam,
      points,
      teamName: winTeam !== null ? TEAM_NAMES[winTeam] : 'Empate'
    });
    
    onRoundEnd?.({ type, winTeam, points });
    
    // Iniciar siguiente ronda después de mostrar resultado
    setTimeout(() => {
      setRoundResult(null);
      startRound(false, winTeam ?? roundStarter);
    }, 3000);
  }, [scores, target, doubleNextRound, roundStarter, setScores, setDoubleNextRound,
      setLastWinner, setRoundResult, onRoundEnd, startRound]);
  
  // ============================================================================
  // FIN DE PARTIDA
  // ============================================================================
  const endGame = useCallback((winTeam, finalScores) => {
    const playerWon = winTeam === 0;
    
    setPhase('gameOver');
    onGameEnd?.({
      won: playerWon,
      winTeam,
      scores: finalScores,
      teamName: TEAM_NAMES[winTeam]
    });
    
    if (playerWon) {
      onNotification?.('success', '¡Victoria!', '🏆');
    } else {
      onNotification?.('info', 'Derrota', '😢');
    }
  }, [setPhase, onGameEnd, onNotification]);
  
  // ============================================================================
  // RESET
  // ============================================================================
  const resetGame = useCallback(() => {
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
    }
    
    setBoard(SnakeBoard.create());
    setScores([0, 0]);
    setPasses(0);
    setMoveCount(0);
    setFirstRound(true);
    setDoubleNextRound(false);
    setLastPlayed(null);
    setMustPlay(null);
    setSelected(null);
    setShowChoice(false);
    setRoundResult(null);
    setPhase('menu');
  }, [setBoard, setScores, setPasses, setMoveCount, setFirstRound,
      setDoubleNextRound, setLastPlayed, setMustPlay, setSelected,
      setShowChoice, setRoundResult, setPhase]);
  
  // ============================================================================
  // VERIFICAR JUGADAS VÁLIDAS
  // ============================================================================
  const getValidMoves = useCallback((playerTiles) => {
    if (!playerTiles || playerTiles.length === 0) return [];
    
    const ends = Engine.getBoardEnds(board);
    if (!ends || (ends.left === null && ends.right === null)) {
      // Tablero vacío: cualquier ficha es válida
      return playerTiles.map(tile => ({ tile, positions: ['center'] }));
    }
    
    const validMoves = [];
    playerTiles.forEach(tile => {
      const positions = [];
      
      // Verificar izquierda
      if (tile.left === ends.left || tile.right === ends.left) {
        positions.push('left');
      }
      
      // Verificar derecha
      if (tile.left === ends.right || tile.right === ends.right) {
        positions.push('right');
      }
      
      if (positions.length > 0) {
        validMoves.push({ tile, positions });
      }
    });
    
    return validMoves;
  }, [board]);
  
  // ============================================================================
  // RETURN
  // ============================================================================
  return {
    // Acciones principales
    startRound,
    playTile,
    passTurn,
    endRound,
    endGame,
    resetGame,
    dealTiles,
    
    // Utilidades
    getValidMoves,
    findStartingPlayer,
    nextTurn,
    playAI,
    
    // Refs
    playTileRef,
    aiTimeoutRef
  };
};

export default useGameLogic;
