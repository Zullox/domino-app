// ============================================================================
// USE TURN TIMER - Temporizador de turno
// ============================================================================
// Maneja el countdown del turno con auto-pass cuando expira
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// HOOK
// ============================================================================
export const useTurnTimer = ({
  initialTime = 30,
  isMyTurn = false,
  isPlaying = false,
  onTimeUp,
  enabled = true
}) => {
  const [timer, setTimer] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  
  // Resetear timer
  const resetTimer = useCallback((time = initialTime) => {
    setTimer(time);
    setIsRunning(true);
  }, [initialTime]);
  
  // Pausar timer
  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  
  // Reanudar timer
  const resumeTimer = useCallback(() => {
    setIsRunning(true);
  }, []);
  
  // Effect: Countdown
  useEffect(() => {
    if (!enabled || !isPlaying || !isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    
    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          // Tiempo agotado
          if (isMyTurn) {
            onTimeUp?.();
          }
          return initialTime; // Reset para siguiente turno
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, isPlaying, isRunning, isMyTurn, initialTime, onTimeUp]);
  
  // Effect: Reset on turn change
  useEffect(() => {
    if (isPlaying) {
      resetTimer();
    }
  }, [isMyTurn, isPlaying, resetTimer]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  // Valores computados
  const percentage = (timer / initialTime) * 100;
  const isLowTime = timer <= 10;
  const isCriticalTime = timer <= 5;
  
  return {
    timer,
    setTimer,
    percentage,
    isLowTime,
    isCriticalTime,
    isRunning,
    resetTimer,
    pauseTimer,
    resumeTimer
  };
};

export default useTurnTimer;
