// ============================================================================
// HOOK: useSocket - Conexión al servidor de Dominó
// ============================================================================
// Este archivo maneja toda la comunicación con el servidor

import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

// URL del servidor (cambiar en producción)
const SERVIDOR_URL = 'http://localhost:3001';

export function useSocket() {
  // Referencia al socket (no causa re-renders)
  const socketRef = useRef(null);
  
  // Estados de conexión
  const [conectado, setConectado] = useState(false);
  const [identificado, setIdentificado] = useState(false);
  const [buscandoPartida, setBuscandoPartida] = useState(false);
  const [estadisticas, setEstadisticas] = useState({ jugadoresOnline: 0 });
  
  // Estados del juego online
  const [partidaEncontrada, setPartidaEncontrada] = useState(null);
  const [datosPartida, setDatosPartida] = useState(null);
  const [miId, setMiId] = useState(null);
  
  // Estados de errores
  const [error, setError] = useState(null);
  
  // ──────────────────────────────────────────────────────────────────────────
  // CONECTAR AL SERVIDOR
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    console.log('🔌 Conectando al servidor...');
    
    // Crear conexión
    const socket = io(SERVIDOR_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    socketRef.current = socket;
    
    // ─────────────────────────────────────────────────────────────────────
    // EVENTOS DE CONEXIÓN
    // ─────────────────────────────────────────────────────────────────────
    socket.on('connect', () => {
      console.log('✅ Conectado al servidor:', socket.id);
      setConectado(true);
      setMiId(socket.id);
      setError(null);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('❌ Desconectado:', reason);
      setConectado(false);
      setIdentificado(false);
      setBuscandoPartida(false);
    });
    
    socket.on('connect_error', (err) => {
      console.error('❌ Error de conexión:', err.message);
      setError('No se puede conectar al servidor. ¿Está corriendo?');
      setConectado(false);
    });
    
    // ─────────────────────────────────────────────────────────────────────
    // EVENTOS DEL JUEGO
    // ─────────────────────────────────────────────────────────────────────
    socket.on('identificado', (datos) => {
      console.log('👤 Identificado:', datos);
      setIdentificado(true);
      setMiId(datos.tuId);
    });
    
    socket.on('estadisticas', (datos) => {
      setEstadisticas(datos);
    });
    
    socket.on('buscando', (datos) => {
      console.log('🔍 Buscando partida, posición:', datos.posicionEnCola);
      setBuscandoPartida(true);
    });
    
    socket.on('busquedaCancelada', () => {
      console.log('❌ Búsqueda cancelada');
      setBuscandoPartida(false);
    });
    
    socket.on('partidaEncontrada', (datos) => {
      console.log('🎮 ¡PARTIDA ENCONTRADA!', datos);
      setBuscandoPartida(false);
      setPartidaEncontrada(datos);
    });
    
    socket.on('partidaIniciada', (datos) => {
      console.log('🎲 Partida iniciada:', datos);
      setDatosPartida(datos);
    });
    
    socket.on('jugadaRealizada', (datos) => {
      console.log('🎯 Jugada realizada:', datos);
      // Actualizar estado del juego
      if (datosPartida) {
        setDatosPartida(prev => ({
          ...prev,
          turnoActual: datos.turnoActual,
          // Actualizar otros datos según sea necesario
        }));
      }
    });
    
    socket.on('jugadorPaso', (datos) => {
      console.log('⏭️ Jugador pasó:', datos);
    });
    
    socket.on('rondaTerminada', (datos) => {
      console.log('🏆 Ronda terminada:', datos);
    });
    
    socket.on('partidaTerminada', (datos) => {
      console.log('🎊 Partida terminada:', datos);
    });
    
    socket.on('tusFichasActualizadas', (datos) => {
      console.log('🃏 Fichas actualizadas:', datos);
      if (datosPartida) {
        setDatosPartida(prev => ({
          ...prev,
          tusFichas: datos.fichas
        }));
      }
    });
    
    socket.on('turnoActualizado', (datos) => {
      if (datosPartida) {
        setDatosPartida(prev => ({
          ...prev,
          turnoActual: datos.turnoActual
        }));
      }
    });
    
    socket.on('error', (datos) => {
      console.error('⚠️ Error del servidor:', datos.mensaje);
      setError(datos.mensaje);
    });
    
    // Limpiar al desmontar
    return () => {
      console.log('🔌 Desconectando...');
      socket.disconnect();
    };
  }, []);
  
  // ──────────────────────────────────────────────────────────────────────────
  // FUNCIONES PARA ENVIAR EVENTOS AL SERVIDOR
  // ──────────────────────────────────────────────────────────────────────────
  
  const identificarse = useCallback((nombre, elo = 1500, avatar = '😎') => {
    if (socketRef.current && conectado) {
      socketRef.current.emit('identificarse', { nombre, elo, avatar });
    }
  }, [conectado]);
  
  const buscarPartida = useCallback(() => {
    if (socketRef.current && conectado && identificado) {
      socketRef.current.emit('buscarPartida');
    } else if (!identificado) {
      setError('Primero debes identificarte');
    }
  }, [conectado, identificado]);
  
  const cancelarBusqueda = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('cancelarBusqueda');
      setBuscandoPartida(false);
    }
  }, []);
  
  const jugarFicha = useCallback((ficha, posicion) => {
    if (socketRef.current && datosPartida) {
      socketRef.current.emit('jugar', { ficha, posicion });
    }
  }, [datosPartida]);
  
  const pasarTurno = useCallback(() => {
    if (socketRef.current && datosPartida) {
      socketRef.current.emit('pasar');
    }
  }, [datosPartida]);
  
  const salirDePartida = useCallback(() => {
    setPartidaEncontrada(null);
    setDatosPartida(null);
  }, []);
  
  // ──────────────────────────────────────────────────────────────────────────
  // RETORNAR TODO LO NECESARIO
  // ──────────────────────────────────────────────────────────────────────────
  return {
    // Estados
    conectado,
    identificado,
    buscandoPartida,
    estadisticas,
    partidaEncontrada,
    datosPartida,
    miId,
    error,
    
    // Funciones
    identificarse,
    buscarPartida,
    cancelarBusqueda,
    jugarFicha,
    pasarTurno,
    salirDePartida,
    
    // Limpiar error
    limpiarError: () => setError(null)
  };
}

export default useSocket;
