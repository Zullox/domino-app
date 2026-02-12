// ============================================================================
// SEARCHING OVERLAY - Overlay de búsqueda de partida
// ============================================================================

import React, { memo, useMemo } from 'react';
import { THEME } from '../../constants/game';

const C = THEME.colors;

// ============================================================================
// ANIMATED DOTS
// ============================================================================
const AnimatedDots = memo(() => (
  <span style={{ display: 'inline-flex', gap: 4 }}>
    {[0, 1, 2].map(i => (
      <span
        key={i}
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: C.text.primary,
          animation: `dotPulse 1.4s infinite ${i * 0.2}s`
        }}
      />
    ))}
    <style>
      {`
        @keyframes dotPulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}
    </style>
  </span>
));

// ============================================================================
// SPINNING TILE
// ============================================================================
const SpinningTile = memo(() => (
  <div style={{
    width: 80,
    height: 40,
    background: `linear-gradient(135deg, ${C.bg.card}, ${C.bg.surface})`,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 8,
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    animation: 'tileRotate 2s ease-in-out infinite'
  }}>
    {/* Dots */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: C.gold.main }} />
      ))}
    </div>
    <div style={{ width: 2, height: 20, background: C.bg.border }} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: C.gold.main }} />
      ))}
    </div>
    
    <style>
      {`
        @keyframes tileRotate {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(180deg); }
        }
      `}
    </style>
  </div>
));

// ============================================================================
// SEARCHING OVERLAY
// ============================================================================
const SearchingOverlay = memo(({
  isSearching = false,
  searchTime = 0,
  eloRange = 100,
  playersInQueue = 0,
  playerElo = 1500,
  onCancel
}) => {
  const formattedTime = useMemo(() => {
    const mins = Math.floor(searchTime / 60);
    const secs = searchTime % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [searchTime]);
  
  const eloRangeText = useMemo(() => {
    const min = Math.max(0, playerElo - eloRange);
    const max = playerElo + eloRange;
    return `${min} - ${max}`;
  }, [playerElo, eloRange]);
  
  if (!isSearching) return null;
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.9)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 24
    }}>
      {/* Animated Tile */}
      <div style={{ marginBottom: 32, perspective: 200 }}>
        <SpinningTile />
      </div>
      
      {/* Title */}
      <h2 style={{
        color: C.text.primary,
        fontSize: 24,
        fontWeight: 700,
        marginBottom: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        Buscando partida
        <AnimatedDots />
      </h2>
      
      {/* Timer */}
      <div style={{
        fontSize: 48,
        fontWeight: 300,
        color: C.gold.main,
        marginBottom: 24,
        fontFamily: 'monospace'
      }}>
        {formattedTime}
      </div>
      
      {/* Info Cards */}
      <div style={{
        display: 'flex',
        gap: 16,
        marginBottom: 32,
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {/* ELO Range */}
        <div style={{
          background: C.bg.card,
          borderRadius: 12,
          padding: '12px 20px',
          textAlign: 'center',
          minWidth: 120
        }}>
          <div style={{ fontSize: 12, color: C.text.muted, marginBottom: 4 }}>
            Rango ELO
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.text.primary }}>
            {eloRangeText}
          </div>
        </div>
        
        {/* Players in Queue */}
        {playersInQueue > 0 && (
          <div style={{
            background: C.bg.card,
            borderRadius: 12,
            padding: '12px 20px',
            textAlign: 'center',
            minWidth: 120
          }}>
            <div style={{ fontSize: 12, color: C.text.muted, marginBottom: 4 }}>
              En cola
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.accent.green }}>
              {playersInQueue} jugadores
            </div>
          </div>
        )}
      </div>
      
      {/* Progress Indicator */}
      <div style={{
        width: '100%',
        maxWidth: 300,
        marginBottom: 32
      }}>
        <div style={{
          height: 4,
          background: C.bg.card,
          borderRadius: 2,
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            background: `linear-gradient(90deg, ${C.accent.green}, ${C.gold.main})`,
            borderRadius: 2,
            animation: 'searchProgress 2s ease-in-out infinite'
          }} />
        </div>
        
        <style>
          {`
            @keyframes searchProgress {
              0% { width: 0%; margin-left: 0%; }
              50% { width: 50%; margin-left: 25%; }
              100% { width: 0%; margin-left: 100%; }
            }
          `}
        </style>
      </div>
      
      {/* Tips */}
      <p style={{
        color: C.text.muted,
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 32,
        maxWidth: 300
      }}>
        💡 El rango de búsqueda se expande automáticamente para encontrar oponentes más rápido
      </p>
      
      {/* Cancel Button */}
      <button
        onClick={onCancel}
        style={{
          padding: '14px 48px',
          borderRadius: 12,
          border: `2px solid ${C.bg.border}`,
          background: 'transparent',
          color: C.text.secondary,
          fontSize: 16,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}
      >
        ✕ Cancelar búsqueda
      </button>
    </div>
  );
});

export default SearchingOverlay;
