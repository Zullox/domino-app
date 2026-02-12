// ============================================================================
// USE REMATCH - Hook para sistema de revancha
// ============================================================================

import { useState, useCallback, useEffect, useRef } from 'react';

// ============================================================================
// CONSTANTS
// ============================================================================
const MAX_REMATCHES = 3;
const REMATCH_TIMEOUT = 30000; // 30 segundos para aceptar

// ============================================================================
// HOOK
// ============================================================================
export const useRematch = ({
  socket,
  gameMode,
  lastOpponent,
  onStartRematch,
  onNotification
}) => {
  const [rematchState, setRematchState] = useState({
    requested: false,      // Yo pedí revancha
    received: false,       // Recibí solicitud de revancha
    accepted: false,       // Revancha aceptada
    declined: false,       // Revancha rechazada
    count: 0,              // Número de revanchas en esta sesión
    opponentId: null,      // ID del oponente para revancha
    opponentName: null,    // Nombre del oponente
    waitingResponse: false // Esperando respuesta
  });
  
  const timeoutRef = useRef(null);
  
  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Escuchar eventos de socket
  useEffect(() => {
    if (!socket || gameMode !== 'online') return;
    
    const handleRematchRequest = (data) => {
      console.log('[Rematch] Solicitud recibida:', data);
      setRematchState(prev => ({
        ...prev,
        received: true,
        opponentId: data.fromId,
        opponentName: data.fromName
      }));
      
      onNotification?.('info', `${data.fromName} quiere revancha`, '🔄');
      
      // Auto-declinar después del timeout
      timeoutRef.current = setTimeout(() => {
        declineRematch();
      }, REMATCH_TIMEOUT);
    };
    
    const handleRematchAccepted = (data) => {
      console.log('[Rematch] Aceptada:', data);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      setRematchState(prev => ({
        ...prev,
        accepted: true,
        requested: false,
        waitingResponse: false
      }));
      
      onNotification?.('success', '¡Revancha aceptada!', '✅');
      
      // Iniciar revancha
      setTimeout(() => {
        startRematch();
      }, 1000);
    };
    
    const handleRematchDeclined = (data) => {
      console.log('[Rematch] Rechazada:', data);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      setRematchState(prev => ({
        ...prev,
        declined: true,
        requested: false,
        waitingResponse: false
      }));
      
      onNotification?.('warning', 'Revancha rechazada', '❌');
    };
    
    const handleRematchStarting = (data) => {
      console.log('[Rematch] Iniciando:', data);
      startRematch();
    };
    
    socket.on('rematch_request', handleRematchRequest);
    socket.on('rematch_accepted', handleRematchAccepted);
    socket.on('rematch_declined', handleRematchDeclined);
    socket.on('rematch_starting', handleRematchStarting);
    
    return () => {
      socket.off('rematch_request', handleRematchRequest);
      socket.off('rematch_accepted', handleRematchAccepted);
      socket.off('rematch_declined', handleRematchDeclined);
      socket.off('rematch_starting', handleRematchStarting);
    };
  }, [socket, gameMode, onNotification]);
  
  // ============================================================================
  // SOLICITAR REVANCHA
  // ============================================================================
  const requestRematch = useCallback(() => {
    if (rematchState.count >= MAX_REMATCHES) {
      onNotification?.('warning', 'Máximo de revanchas alcanzado', '⚠️');
      return false;
    }
    
    if (rematchState.requested || rematchState.waitingResponse) {
      return false;
    }
    
    if (gameMode === 'online' && socket?.connected) {
      // Modo online: enviar solicitud al servidor
      socket.emit('rematch_request', { 
        opponentId: lastOpponent?.id || lastOpponent?.odId 
      });
      
      setRematchState(prev => ({
        ...prev,
        requested: true,
        waitingResponse: true
      }));
      
      onNotification?.('info', 'Solicitud de revancha enviada', '📤');
      
      // Timeout si no hay respuesta
      timeoutRef.current = setTimeout(() => {
        setRematchState(prev => ({
          ...prev,
          requested: false,
          waitingResponse: false,
          declined: true
        }));
        onNotification?.('warning', 'Sin respuesta del oponente', '⏰');
      }, REMATCH_TIMEOUT);
      
      return true;
    } else {
      // Modo offline: IA siempre acepta
      setRematchState(prev => ({
        ...prev,
        requested: true,
        accepted: true
      }));
      
      onNotification?.('success', 'IA acepta revancha', '🤖');
      
      setTimeout(() => {
        startRematch();
      }, 1000);
      
      return true;
    }
  }, [gameMode, socket, lastOpponent, rematchState, onNotification]);
  
  // ============================================================================
  // ACEPTAR REVANCHA
  // ============================================================================
  const acceptRematch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (gameMode === 'online' && socket?.connected) {
      socket.emit('rematch_accept', { 
        opponentId: rematchState.opponentId 
      });
    }
    
    setRematchState(prev => ({
      ...prev,
      accepted: true,
      received: false
    }));
    
    onNotification?.('success', '¡Revancha aceptada!', '✅');
    
    setTimeout(() => {
      startRematch();
    }, 500);
  }, [gameMode, socket, rematchState.opponentId, onNotification]);
  
  // ============================================================================
  // RECHAZAR REVANCHA
  // ============================================================================
  const declineRematch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (gameMode === 'online' && socket?.connected) {
      socket.emit('rematch_decline', { 
        opponentId: rematchState.opponentId 
      });
    }
    
    setRematchState(prev => ({
      ...prev,
      declined: true,
      received: false
    }));
  }, [gameMode, socket, rematchState.opponentId]);
  
  // ============================================================================
  // INICIAR REVANCHA
  // ============================================================================
  const startRematch = useCallback(() => {
    setRematchState(prev => ({
      ...prev,
      requested: false,
      received: false,
      accepted: false,
      declined: false,
      waitingResponse: false,
      count: prev.count + 1
    }));
    
    onStartRematch?.();
  }, [onStartRematch]);
  
  // ============================================================================
  // RESETEAR ESTADO
  // ============================================================================
  const resetRematchState = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setRematchState({
      requested: false,
      received: false,
      accepted: false,
      declined: false,
      count: 0,
      opponentId: null,
      opponentName: null,
      waitingResponse: false
    });
  }, []);
  
  // ============================================================================
  // RETURN
  // ============================================================================
  return {
    // Estado
    rematchState,
    canRequestRematch: rematchState.count < MAX_REMATCHES && !rematchState.waitingResponse,
    hasRematchRequest: rematchState.received,
    isWaitingResponse: rematchState.waitingResponse,
    rematchCount: rematchState.count,
    maxRematches: MAX_REMATCHES,
    
    // Acciones
    requestRematch,
    acceptRematch,
    declineRematch,
    resetRematchState,
    
    // Info del oponente
    rematchOpponent: {
      id: rematchState.opponentId,
      name: rematchState.opponentName
    }
  };
};

export default useRematch;
