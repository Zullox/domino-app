// ============================================================================
// USE GAME SOCKET - Hook para conexión Socket.io
// ============================================================================
// Migrado de DominoRanked (líneas 8415-8600)
// Maneja conexión, eventos y reconexión al servidor
// ============================================================================

import { useEffect, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import { SERVIDOR_URL } from '../constants/serverConfig';

// ============================================================================
// EMOTES DISPONIBLES
// ============================================================================
export const EMOTES = ['👍', '👎', '👏', '😂', '😢', '😡', '🤔', '😎', '🔥', '💪', '🎯', '🎲'];
export const EMOTE_FRASES = ['¡Buena!', '¡Vamos!', '¡Suerte!', 'GG', '¡Tranca!', '¡Dominó!'];

// ============================================================================
// HOOK
// ============================================================================
export const useGameSocket = ({
  // Callbacks para eventos
  onConnect,
  onDisconnect,
  onError,
  onIdentificado,
  onReconectado,
  onJugadoresOnline,
  onPartidaEncontrada,
  onFichaJugada,
  onTusFichas,
  onJugadorPaso,
  onTurnoActualizado,
  onRondaTerminada,
  onNuevaRonda,
  onPartidaTerminada,
  onJugadorDesconectado,
  onJugadorReconectado,
  onJugadorAbandono,
  onEmoteRecibido,
  onErrorServidor,
  // Estado
  playerProfile,
  enabled = true
}) => {
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);
  
  // === CONECTAR ===
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;
    
    console.log('🔌 Conectando al servidor...');
    
    const newSocket = io(SERVIDOR_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true
    });
    
    // === EVENTOS DE CONEXIÓN ===
    newSocket.on('connect', () => {
      console.log('✅ Conectado:', newSocket.id);
      reconnectAttempts.current = 0;
      onConnect?.(newSocket.id);
      
      // Identificarse automáticamente
      const nombre = localStorage.getItem('dominoPlayerName') || 'Jugador';
      const odId = localStorage.getItem('dominoOdId');
      
      newSocket.emit('identificarse', { 
        nombre,
        elo: playerProfile?.rating || 1500,
        odId // Para reconexión
      });
    });
    
    newSocket.on('disconnect', (reason) => {
      console.log('❌ Desconectado:', reason);
      onDisconnect?.(reason);
    });
    
    newSocket.on('connect_error', (err) => {
      console.log('⚠️ Error de conexión:', err.message);
      reconnectAttempts.current++;
      onError?.(err.message);
    });
    
    // === EVENTOS DEL SERVIDOR ===
    newSocket.on('identificado', (datos) => {
      console.log('👤 Identificado:', datos);
      if (datos.odId) {
        localStorage.setItem('dominoOdId', datos.odId);
      }
      onIdentificado?.(datos);
    });
    
    newSocket.on('reconectado', (datos) => {
      console.log('🔄 Reconectado a partida:', datos);
      if (datos.odId) {
        localStorage.setItem('dominoOdId', datos.odId);
      }
      onReconectado?.(datos);
    });
    
    newSocket.on('jugadoresOnline', (count) => {
      onJugadoresOnline?.(count);
    });
    
    newSocket.on('partidaEncontrada', (datos) => {
      console.log('🎮 Partida encontrada:', datos);
      onPartidaEncontrada?.(datos);
    });
    
    newSocket.on('fichaJugada', (datos) => {
      onFichaJugada?.(datos);
    });
    
    newSocket.on('tusFichas', (fichas) => {
      onTusFichas?.(fichas);
    });
    
    newSocket.on('jugadorPaso', (datos) => {
      onJugadorPaso?.(datos);
    });
    
    newSocket.on('turnoActualizado', (datos) => {
      onTurnoActualizado?.(datos);
    });
    
    newSocket.on('rondaTerminada', (datos) => {
      console.log('📊 Ronda terminada:', datos);
      onRondaTerminada?.(datos);
    });
    
    newSocket.on('nuevaRonda', (datos) => {
      console.log('🆕 Nueva ronda:', datos);
      onNuevaRonda?.(datos);
    });
    
    newSocket.on('partidaTerminada', (datos) => {
      console.log('🏆 Partida terminada:', datos);
      onPartidaTerminada?.(datos);
    });
    
    newSocket.on('jugadorDesconectado', (datos) => {
      console.log('⚠️ Jugador desconectado:', datos);
      onJugadorDesconectado?.(datos);
    });
    
    newSocket.on('jugadorReconectado', (datos) => {
      console.log('✅ Jugador reconectado:', datos);
      onJugadorReconectado?.(datos);
    });
    
    newSocket.on('jugadorAbandono', (datos) => {
      console.log('🚪 Jugador abandonó:', datos);
      onJugadorAbandono?.(datos);
    });
    
    newSocket.on('emote', (datos) => {
      onEmoteRecibido?.(datos);
    });
    
    newSocket.on('error', (datos) => {
      console.error('❌ Error del servidor:', datos);
      onErrorServidor?.(datos);
    });
    
    socketRef.current = newSocket;
    return newSocket;
  }, [playerProfile, onConnect, onDisconnect, onError, onIdentificado, onReconectado,
      onJugadoresOnline, onPartidaEncontrada, onFichaJugada, onTusFichas,
      onJugadorPaso, onTurnoActualizado, onRondaTerminada, onNuevaRonda,
      onPartidaTerminada, onJugadorDesconectado, onJugadorReconectado,
      onJugadorAbandono, onEmoteRecibido, onErrorServidor]);
  
  // === DESCONECTAR ===
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);
  
  // === EMITIR EVENTOS ===
  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
      return true;
    }
    console.warn('[Socket] No conectado, no se puede emitir:', event);
    return false;
  }, []);
  
  // === ACCIONES DEL JUEGO ===
  const buscarPartida = useCallback((config = {}) => {
    return emit('buscarPartida', {
      modo: config.modo || 'ranked',
      ...config
    });
  }, [emit]);
  
  const cancelarBusqueda = useCallback(() => {
    return emit('cancelarBusqueda');
  }, [emit]);
  
  const jugarFicha = useCallback((ficha, extremo) => {
    return emit('jugarFicha', { ficha, extremo });
  }, [emit]);
  
  const pasarTurno = useCallback(() => {
    return emit('pasar');
  }, [emit]);
  
  const enviarEmote = useCallback((emote) => {
    return emit('emote', { emote });
  }, [emit]);
  
  const abandonarPartida = useCallback(() => {
    return emit('abandonar');
  }, [emit]);
  
  const solicitarRevancha = useCallback(() => {
    return emit('solicitarRevancha');
  }, [emit]);
  
  // === EFFECT: AUTO-CONNECT ===
  useEffect(() => {
    if (enabled) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);
  
  // === RETURN ===
  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected ?? false,
    
    // Conexión
    connect,
    disconnect,
    
    // Acciones
    emit,
    buscarPartida,
    cancelarBusqueda,
    jugarFicha,
    pasarTurno,
    enviarEmote,
    abandonarPartida,
    solicitarRevancha,
    
    // Constantes
    EMOTES,
    EMOTE_FRASES
  };
};

export default useGameSocket;
