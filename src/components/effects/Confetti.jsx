// ============================================================================
// CONFETTI - Efecto de confeti para celebraciones
// ============================================================================

import React, { memo, useEffect, useState, useCallback } from 'react';

// ============================================================================
// CONFETTI PIECE
// ============================================================================
const ConfettiPiece = memo(({ 
  color, 
  left, 
  delay, 
  duration,
  size,
  rotation 
}) => {
  const style = {
    position: 'absolute',
    left: `${left}%`,
    top: '-20px',
    width: size,
    height: size * 0.6,
    backgroundColor: color,
    borderRadius: '2px',
    animation: `confettiFall ${duration}s ease-out ${delay}s forwards`,
    transform: `rotate(${rotation}deg)`,
    opacity: 0
  };
  
  return <div style={style} />;
});

// ============================================================================
// CONFETTI CONTAINER
// ============================================================================
const Confetti = memo(({ 
  active = false, 
  count = 100,
  duration = 3,
  colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']
}) => {
  const [pieces, setPieces] = useState([]);
  
  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }
    
    const newPieces = Array.from({ length: count }, (_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: duration + Math.random() * 2,
      size: 8 + Math.random() * 8,
      rotation: Math.random() * 360
    }));
    
    setPieces(newPieces);
    
    // Limpiar después de la animación
    const timeout = setTimeout(() => {
      setPieces([]);
    }, (duration + 3) * 1000);
    
    return () => clearTimeout(timeout);
  }, [active, count, duration, colors]);
  
  if (!active && pieces.length === 0) return null;
  
  return (
    <>
      {/* Keyframes */}
      <style>
        {`
          @keyframes confettiFall {
            0% {
              opacity: 1;
              transform: translateY(0) rotate(0deg) scale(1);
            }
            25% {
              opacity: 1;
            }
            100% {
              opacity: 0;
              transform: translateY(100vh) rotate(720deg) scale(0.5);
            }
          }
        `}
      </style>
      
      {/* Container */}
      <div style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 9999
      }}>
        {pieces.map(piece => (
          <ConfettiPiece key={piece.id} {...piece} />
        ))}
      </div>
    </>
  );
});

// ============================================================================
// SCREEN SHAKE
// ============================================================================
export const ScreenShake = memo(({ active = false, intensity = 5, duration = 500 }) => {
  const [shaking, setShaking] = useState(false);
  
  useEffect(() => {
    if (active) {
      setShaking(true);
      const timeout = setTimeout(() => setShaking(false), duration);
      return () => clearTimeout(timeout);
    }
  }, [active, duration]);
  
  if (!shaking) return null;
  
  return (
    <style>
      {`
        @keyframes screenShake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-${intensity}px); }
          20%, 40%, 60%, 80% { transform: translateX(${intensity}px); }
        }
        
        body {
          animation: screenShake ${duration}ms ease-in-out;
        }
      `}
    </style>
  );
});

// ============================================================================
// VICTORY ANIMATION
// ============================================================================
export const VictoryAnimation = memo(({ active = false }) => {
  if (!active) return null;
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      zIndex: 9998
    }}>
      {/* Glow effect */}
      <div style={{
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)',
        animation: 'victoryPulse 1.5s ease-in-out infinite'
      }} />
      
      {/* Rays */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 4,
            height: 100,
            background: 'linear-gradient(to top, transparent, rgba(255,215,0,0.6))',
            transform: `rotate(${i * 45}deg)`,
            transformOrigin: 'bottom center',
            animation: `victoryRay 1s ease-out ${i * 0.1}s forwards`
          }}
        />
      ))}
      
      <style>
        {`
          @keyframes victoryPulse {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.2); opacity: 0.8; }
          }
          
          @keyframes victoryRay {
            0% { height: 0; opacity: 0; }
            50% { height: 150px; opacity: 1; }
            100% { height: 200px; opacity: 0; }
          }
        `}
      </style>
    </div>
  );
});

// ============================================================================
// FLOATING EMOTE
// ============================================================================
export const FloatingEmote = memo(({ emote, position, onComplete }) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onComplete?.();
    }, 2000);
    return () => clearTimeout(timeout);
  }, [onComplete]);
  
  const positions = {
    0: { bottom: '20%', left: '50%' },
    1: { top: '50%', left: '5%' },
    2: { top: '5%', left: '50%' },
    3: { top: '50%', right: '5%' }
  };
  
  const pos = positions[position] || positions[0];
  
  return (
    <div style={{
      position: 'fixed',
      ...pos,
      transform: 'translate(-50%, -50%)',
      fontSize: 48,
      animation: 'floatEmote 2s ease-out forwards',
      zIndex: 1000,
      pointerEvents: 'none'
    }}>
      {emote}
      
      <style>
        {`
          @keyframes floatEmote {
            0% { 
              opacity: 1; 
              transform: translate(-50%, -50%) scale(0.5); 
            }
            20% { 
              transform: translate(-50%, -50%) scale(1.2); 
            }
            40% { 
              transform: translate(-50%, -50%) scale(1); 
            }
            100% { 
              opacity: 0; 
              transform: translate(-50%, -150%) scale(0.8); 
            }
          }
        `}
      </style>
    </div>
  );
});

// ============================================================================
// DOMINO CELEBRATION
// ============================================================================
export const DominoCelebration = memo(({ active = false, type = 'domino' }) => {
  if (!active) return null;
  
  const emoji = type === 'domino' ? '🎯' : '🔒';
  const text = type === 'domino' ? '¡DOMINÓ!' : '¡TRANCA!';
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      zIndex: 9997
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        animation: 'celebrationBounce 0.5s ease-out'
      }}>
        <span style={{ fontSize: 80, marginBottom: 16 }}>{emoji}</span>
        <span style={{
          fontSize: 36,
          fontWeight: 900,
          color: '#fff',
          textShadow: '0 0 20px rgba(255,215,0,0.8), 0 0 40px rgba(255,215,0,0.5)',
          letterSpacing: 4
        }}>
          {text}
        </span>
      </div>
      
      <style>
        {`
          @keyframes celebrationBounce {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
});

// ============================================================================
// SCORE POPUP
// ============================================================================
export const ScorePopup = memo(({ points, position, team }) => {
  const isWin = team === 0;
  
  return (
    <div style={{
      position: 'fixed',
      top: '40%',
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: 32,
      fontWeight: 900,
      color: isWin ? '#22c55e' : '#ef4444',
      textShadow: `0 0 20px ${isWin ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}`,
      animation: 'scoreFloat 1.5s ease-out forwards',
      zIndex: 1000,
      pointerEvents: 'none'
    }}>
      {isWin ? '+' : ''}{points}
      
      <style>
        {`
          @keyframes scoreFloat {
            0% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-50px) scale(1.5); }
          }
        `}
      </style>
    </div>
  );
});

export default Confetti;
