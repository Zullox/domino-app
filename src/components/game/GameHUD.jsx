// ============================================================================
// COMPONENTE: HUD DEL JUEGO
// ============================================================================
import React, { memo } from 'react';
import { THEME, TIER_COLORS, getRank } from '../../constants/game';
import { EMOTES } from '../../constants/game';

const C = THEME.colors;

// Componente de avatar de oponente
const OpponentAvatar = memo(({ player, isCurrentTurn, tileCount, position }) => {
  const rank = getRank(player.rating);
  const tierColor = TIER_COLORS[rank.tier]?.primary || '#666';
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: position === 'top' ? 'column' : 'row',
      alignItems: 'center',
      gap: 6
    }}>
      {/* Avatar */}
      <div style={{
        position: 'relative',
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: C.bg.elevated,
        border: `2px solid ${isCurrentTurn ? C.gold.main : tierColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        boxShadow: isCurrentTurn ? `0 0 15px ${C.gold.main}50` : 'none',
        transition: 'all 300ms ease'
      }}>
        {player.avatar}
        
        {/* Indicador de turno */}
        {isCurrentTurn && (
          <div style={{
            position: 'absolute',
            top: -4,
            right: -4,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: C.gold.main,
            border: `2px solid ${C.bg.surface}`,
            animation: 'pulse 1s infinite'
          }} />
        )}
        
        {/* Contador de fichas */}
        <div style={{
          position: 'absolute',
          bottom: -4,
          right: -4,
          minWidth: 18,
          height: 18,
          borderRadius: 9,
          background: C.bg.surface,
          border: `1px solid ${C.bg.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          fontWeight: 700,
          color: C.text.primary
        }}>
          {tileCount}
        </div>
      </div>
      
      {/* Info */}
      <div style={{
        textAlign: position === 'top' ? 'center' : 'left'
      }}>
        <div style={{
          color: isCurrentTurn ? C.gold.main : C.text.primary,
          fontSize: 11,
          fontWeight: 700,
          maxWidth: 70,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {player.name}
        </div>
        <div style={{
          color: C.text.muted,
          fontSize: 9
        }}>
          {player.rating} MMR
        </div>
      </div>
    </div>
  );
});

// Componente principal HUD
const GameHUD = memo(({ 
  scores, 
  timer, 
  currentPlayer, 
  players,
  roundNum,
  targetScore,
  onPause,
  onEmote,
  isOnline
}) => {
  const timerColor = timer <= 5 ? C.accent.red : timer <= 10 ? C.gold.main : C.text.primary;
  const timerUrgent = timer <= 5;
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: '8px 12px'
    }}>
      {/* Fila superior: Marcador y Timer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Marcador Equipo 1 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          borderRadius: 12,
          background: 'rgba(59, 130, 246, 0.2)',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}>
          <span style={{ fontSize: 16 }}>🔵</span>
          <span style={{ 
            color: '#fff', 
            fontSize: 20, 
            fontWeight: 800,
            fontFamily: 'monospace'
          }}>
            {scores[0]}
          </span>
        </div>
        
        {/* Timer Central */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: 11,
            color: C.text.muted,
            marginBottom: 2
          }}>
            Ronda {roundNum} • Meta {targetScore}
          </div>
          <div style={{
            padding: '6px 16px',
            borderRadius: 12,
            background: timerUrgent ? 'rgba(239, 68, 68, 0.2)' : C.bg.elevated,
            border: `2px solid ${timerUrgent ? C.accent.red : C.bg.border}`,
            animation: timerUrgent ? 'pulse 0.5s infinite' : 'none'
          }}>
            <span style={{
              fontSize: 24,
              fontWeight: 800,
              fontFamily: 'monospace',
              color: timerColor
            }}>
              {timer}
            </span>
          </div>
        </div>
        
        {/* Marcador Equipo 2 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          borderRadius: 12,
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}>
          <span style={{ 
            color: '#fff', 
            fontSize: 20, 
            fontWeight: 800,
            fontFamily: 'monospace'
          }}>
            {scores[1]}
          </span>
          <span style={{ fontSize: 16 }}>🔴</span>
        </div>
      </div>
      
      {/* Fila de oponentes */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Oponente izquierdo */}
        <OpponentAvatar 
          player={players[3]}
          isCurrentTurn={currentPlayer === 3}
          tileCount={players[3]?.tiles?.length || 0}
          position="left"
        />
        
        {/* Compañero (arriba) */}
        <OpponentAvatar 
          player={players[2]}
          isCurrentTurn={currentPlayer === 2}
          tileCount={players[2]?.tiles?.length || 0}
          position="top"
        />
        
        {/* Oponente derecho */}
        <OpponentAvatar 
          player={players[1]}
          isCurrentTurn={currentPlayer === 1}
          tileCount={players[1]?.tiles?.length || 0}
          position="right"
        />
      </div>
      
      {/* Botones de acción */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 8
      }}>
        <button
          onClick={onPause}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            border: `1px solid ${C.bg.border}`,
            background: C.bg.elevated,
            color: C.text.secondary,
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          ⏸️ Pausa
        </button>
        
        {isOnline && (
          <button
            onClick={onEmote}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: `1px solid ${C.bg.border}`,
              background: C.bg.elevated,
              color: C.text.secondary,
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            😄 Emote
          </button>
        )}
      </div>
    </div>
  );
});

// Panel de emotes
export const EmotePanel = memo(({ onSelect, onClose }) => (
  <div style={{
    position: 'fixed',
    bottom: 200,
    left: '50%',
    transform: 'translateX(-50%)',
    background: C.bg.surface,
    border: `1px solid ${C.bg.border}`,
    borderRadius: 16,
    padding: 12,
    display: 'flex',
    gap: 8,
    zIndex: 100,
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
  }}>
    {EMOTES.map((emote, i) => (
      <button
        key={i}
        onClick={() => { onSelect(emote); onClose(); }}
        style={{
          width: 50,
          height: 50,
          borderRadius: 12,
          border: `1px solid ${C.bg.border}`,
          background: C.bg.elevated,
          fontSize: 28,
          cursor: 'pointer',
          transition: 'transform 100ms ease'
        }}
      >
        {emote}
      </button>
    ))}
    <button
      onClick={onClose}
      style={{
        width: 50,
        height: 50,
        borderRadius: 12,
        border: `1px solid ${C.accent.red}`,
        background: 'transparent',
        color: C.accent.red,
        fontSize: 20,
        cursor: 'pointer'
      }}
    >
      ✕
    </button>
  </div>
));

GameHUD.displayName = 'GameHUD';
EmotePanel.displayName = 'EmotePanel';

export default GameHUD;
