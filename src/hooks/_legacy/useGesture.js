// ============================================================================
// HOOK: useGesture - Gestor de gestos robusto para móvil
// Distingue entre scroll, tap, drag y long-press
// ============================================================================
import { useCallback, useEffect, useRef } from 'react';

export const useGesture = (elementRef, callbacks = {}) => {
  const {
    onDragStart,
    onDragMove,
    onDragEnd,
    onTap,
    onDoubleTap,
    onLongPress,
    dragThreshold = 10,
    longPressDelay = 400,
    doubleTapDelay = 300
  } = callbacks;
  
  const stateRef = useRef({
    isDragging: false,
    startPos: { x: 0, y: 0 },
    currentPos: { x: 0, y: 0 },
    startTime: 0,
    lastTapTime: 0,
    longPressTimer: null,
    rafId: null,
    touchId: null,
    velocity: { x: 0, y: 0 },
    lastMoveTime: 0
  });
  
  const clearTimers = useCallback(() => {
    const state = stateRef.current;
    if (state.longPressTimer) {
      clearTimeout(state.longPressTimer);
      state.longPressTimer = null;
    }
    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
  }, []);
  
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    const state = stateRef.current;
    
    state.touchId = touch.identifier;
    state.startPos = { x: touch.clientX, y: touch.clientY };
    state.currentPos = { x: touch.clientX, y: touch.clientY };
    state.startTime = Date.now();
    state.isDragging = false;
    state.velocity = { x: 0, y: 0 };
    state.lastMoveTime = Date.now();
    
    if (onLongPress) {
      state.longPressTimer = setTimeout(() => {
        if (!state.isDragging) {
          onLongPress({ x: state.startPos.x, y: state.startPos.y });
        }
      }, longPressDelay);
    }
  }, [onLongPress, longPressDelay]);
  
  const handleTouchMove = useCallback((e) => {
    const state = stateRef.current;
    const touch = Array.from(e.touches).find(t => t.identifier === state.touchId);
    if (!touch) return;
    
    const now = Date.now();
    const dt = now - state.lastMoveTime;
    
    if (dt > 0) {
      state.velocity = {
        x: (touch.clientX - state.currentPos.x) / dt,
        y: (touch.clientY - state.currentPos.y) / dt
      };
    }
    
    state.currentPos = { x: touch.clientX, y: touch.clientY };
    state.lastMoveTime = now;
    
    const dx = touch.clientX - state.startPos.x;
    const dy = touch.clientY - state.startPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (!state.isDragging && distance > dragThreshold) {
      state.isDragging = true;
      clearTimers();
      
      if (onDragStart) {
        onDragStart({
          x: touch.clientX,
          y: touch.clientY,
          startX: state.startPos.x,
          startY: state.startPos.y,
          direction: Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical'
        });
      }
    }
    
    if (state.isDragging && onDragMove) {
      if (state.rafId) cancelAnimationFrame(state.rafId);
      
      state.rafId = requestAnimationFrame(() => {
        onDragMove({
          x: touch.clientX,
          y: touch.clientY,
          deltaX: dx,
          deltaY: dy,
          velocityX: state.velocity.x,
          velocityY: state.velocity.y
        });
      });
    }
  }, [onDragStart, onDragMove, dragThreshold, clearTimers]);
  
  const handleTouchEnd = useCallback((e) => {
    const state = stateRef.current;
    clearTimers();
    
    const now = Date.now();
    const duration = now - state.startTime;
    
    if (state.isDragging) {
      if (onDragEnd) {
        onDragEnd({
          x: state.currentPos.x,
          y: state.currentPos.y,
          startX: state.startPos.x,
          startY: state.startPos.y,
          velocityX: state.velocity.x,
          velocityY: state.velocity.y,
          duration
        });
      }
    } else if (duration < 300) {
      if (now - state.lastTapTime < doubleTapDelay && onDoubleTap) {
        onDoubleTap({ x: state.startPos.x, y: state.startPos.y });
        state.lastTapTime = 0;
      } else {
        if (onTap) {
          onTap({ x: state.startPos.x, y: state.startPos.y });
        }
        state.lastTapTime = now;
      }
    }
    
    state.isDragging = false;
    state.touchId = null;
  }, [onDragEnd, onTap, onDoubleTap, doubleTapDelay, clearTimers]);
  
  const handleTouchCancel = useCallback(() => {
    clearTimers();
    stateRef.current.isDragging = false;
    stateRef.current.touchId = null;
  }, [clearTimers]);
  
  useEffect(() => {
    const element = elementRef?.current;
    if (!element) return;
    
    const options = { passive: false };
    
    element.addEventListener('touchstart', handleTouchStart, options);
    element.addEventListener('touchmove', handleTouchMove, options);
    element.addEventListener('touchend', handleTouchEnd, options);
    element.addEventListener('touchcancel', handleTouchCancel, options);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
      clearTimers();
    };
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel, clearTimers]);
  
  return {
    isDragging: stateRef.current.isDragging
  };
};

export default useGesture;
