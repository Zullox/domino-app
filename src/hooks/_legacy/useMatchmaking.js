// ============================================================================
// USE MATCHMAKING - Hook para búsqueda de partidas online
// ============================================================================

import { useState, useCallback, useEffect, useRef } from 'react';

// ============================================================================
// CONSTANTS
// ============================================================================
const SEARCH_TIMEOUT = 60000; // 60 segundos máximo de búsqueda
const ELO_RANGE_INITIAL = 100;
const ELO_RANGE_INCREMENT = 50;
const ELO_RANGE_MAX = 500;

// ============================================================================
// HOOK
// ============================================================================
export const useMatchmaking = ({
  socket,
  playerProfile,
  onMatchFound,
  onNotification
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [eloRange, setEloRange] = useState(ELO_RANGE_INITIAL);
  const [playersInQueue, setPlayersInQueue] = useState(0);
  const [estimatedWait, setEstimatedWait] = useState(null);
  const [matchData, setMatchData] = useState(null);
  
  const searchIntervalRef = useRef(null);
  const timeoutRef = useRef(null);
  
  // ============================================================================
  // CLEANUP
  // ============================================================================
  useEffect(() => {
    return () => {
      if (searchIntervalRef.current) clearInterval(searchIntervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  
  // ============================================================================
  // SOCKET EVENTS
  // ============================================================================
  useEffect(() => {
    if (!socket) return;
    
    const handleMatchFound = (data) => {
      console.log('[Matchmaking] ¡Partida encontrada!', data);
      stopSearch();
      setMatchData(data);
      onMatchFound?.(data);
      onNotification?.('success', '¡Partida encontrada!', '🎮');
    };
    
    const handleQueueUpdate = (data) => {
      setPlayersInQueue(data.playersInQueue || 0);
      setEstimatedWait(data.estimatedWait || null);
    };
    
    const handleSearchCancelled = () => {
      console.log('[Matchmaking] Búsqueda cancelada por el servidor');
      stopSearch();
      onNotification?.('info', 'Búsqueda cancelada', '❌');
    };
    
    const handleNoMatch = (data) => {
      console.log('[Matchmaking] No se encontró partida:', data.reason);
      // Expandir rango de ELO
      setEloRange(prev => Math.min(prev + ELO_RANGE_INCREMENT, ELO_RANGE_MAX));
    };
    
    socket.on('partidaEncontrada', handleMatchFound);
    socket.on('queueUpdate', handleQueueUpdate);
    socket.on('searchCancelled', handleSearchCancelled);
    socket.on('noMatch', handleNoMatch);
    
    return () => {
      socket.off('partidaEncontrada', handleMatchFound);
      socket.off('queueUpdate', handleQueueUpdate);
      socket.off('searchCancelled', handleSearchCancelled);
      socket.off('noMatch', handleNoMatch);
    };
  }, [socket, onMatchFound, onNotification]);
  
  // ============================================================================
  // START SEARCH
  // ============================================================================
  const startSearch = useCallback((options = {}) => {
    if (!socket?.connected) {
      onNotification?.('error', 'No conectado al servidor', '⚠️');
      return false;
    }
    
    if (isSearching) return false;
    
    setIsSearching(true);
    setSearchTime(0);
    setEloRange(ELO_RANGE_INITIAL);
    setMatchData(null);
    
    // Enviar solicitud al servidor
    socket.emit('buscarPartida', {
      elo: playerProfile?.rating || playerProfile?.elo || 1500,
      eloRange: ELO_RANGE_INITIAL,
      gameMode: options.gameMode || 'ranked',
      ...options
    });
    
    onNotification?.('info', 'Buscando partida...', '🔍');
    
    // Contador de tiempo
    searchIntervalRef.current = setInterval(() => {
      setSearchTime(prev => {
        const newTime = prev + 1;
        
        // Expandir rango cada 15 segundos
        if (newTime % 15 === 0) {
          const newRange = Math.min(eloRange + ELO_RANGE_INCREMENT, ELO_RANGE_MAX);
          setEloRange(newRange);
          socket.emit('expandirBusqueda', { eloRange: newRange });
        }
        
        return newTime;
      });
    }, 1000);
    
    // Timeout de búsqueda
    timeoutRef.current = setTimeout(() => {
      stopSearch();
      onNotification?.('warning', 'No se encontró partida', '⏰');
    }, SEARCH_TIMEOUT);
    
    return true;
  }, [socket, playerProfile, isSearching, eloRange, onNotification]);
  
  // ============================================================================
  // STOP SEARCH
  // ============================================================================
  const stopSearch = useCallback(() => {
    if (searchIntervalRef.current) {
      clearInterval(searchIntervalRef.current);
      searchIntervalRef.current = null;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setIsSearching(false);
  }, []);
  
  // ============================================================================
  // CANCEL SEARCH
  // ============================================================================
  const cancelSearch = useCallback(() => {
    if (!isSearching) return;
    
    if (socket?.connected) {
      socket.emit('cancelarBusqueda');
    }
    
    stopSearch();
    onNotification?.('info', 'Búsqueda cancelada', '❌');
  }, [socket, isSearching, stopSearch, onNotification]);
  
  // ============================================================================
  // FORMAT TIME
  // ============================================================================
  const formatSearchTime = useCallback(() => {
    const mins = Math.floor(searchTime / 60);
    const secs = searchTime % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [searchTime]);
  
  // ============================================================================
  // RETURN
  // ============================================================================
  return {
    // Estado
    isSearching,
    searchTime,
    searchTimeFormatted: formatSearchTime(),
    eloRange,
    playersInQueue,
    estimatedWait,
    matchData,
    
    // Acciones
    startSearch,
    cancelSearch,
    stopSearch,
    
    // Constantes
    maxSearchTime: SEARCH_TIMEOUT / 1000,
    initialEloRange: ELO_RANGE_INITIAL,
    maxEloRange: ELO_RANGE_MAX
  };
};

export default useMatchmaking;
