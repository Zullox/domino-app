// ============================================================================
// COMPONENTE: MANO DEL JUGADOR
// ============================================================================
import React, { memo, useMemo } from 'react';
import Tile from './Tile';
import { getPlayableTiles, canPlay } from '../../utils/gameEngine';

const PlayerHand = memo(({ 
  tiles, 
  board,
  isMyTurn,
  selectedTile,
  onTileSelect,
  showHints = true,
  skinSet = 'classic'
}) => {
  // Calcular fichas jugables
  const playableTiles = useMemo(() => {
    if (!isMyTurn || !board) return [];
    return getPlayableTiles(tiles, board);
  }, [tiles, board, isMyTurn]);
  
  // Calcular tamaño óptimo de fichas según cantidad
  const tileSize = useMemo(() => {
    const count = tiles.length;
    if (count <= 4) return 55;
    if (count <= 6) return 50;
    return 45;
  }, [tiles.length]);
  
  // Gap entre fichas
  const gap = tiles.length > 5 ? 6 : 10;
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '12px 8px',
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '16px 16px 0 0',
      backdropFilter: 'blur(10px)'
    }}>
      {/* Indicador de turno */}
      <div style={{
        marginBottom: 8,
        padding: '4px 12px',
        borderRadius: 12,
        background: isMyTurn ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
        border: isMyTurn ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid transparent',
        color: isMyTurn ? '#10B981' : '#606070',
        fontSize: 12,
        fontWeight: 600,
        transition: 'all 300ms ease'
      }}>
        {isMyTurn ? '🎯 Tu turno' : `${tiles.length} fichas`}
      </div>
      
      {/* Fichas */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap,
        maxWidth: '100%',
        padding: '4px 8px'
      }}>
        {tiles.map((tile, index) => {
          const isPlayable = playableTiles.some(t => t.id === tile.id);
          const isSelected = selectedTile?.id === tile.id;
          
          return (
            <div
              key={tile.id}
              style={{
                transform: isSelected ? 'translateY(-8px)' : 'translateY(0)',
                transition: 'transform 150ms ease-out',
                animation: isMyTurn && isPlayable && showHints ? 'pulse 2s infinite' : 'none'
              }}
            >
              <Tile
                tile={tile}
                size={tileSize}
                selected={isSelected}
                playable={isMyTurn && showHints && isPlayable}
                disabled={isMyTurn && !isPlayable}
                onClick={() => isMyTurn && isPlayable && onTileSelect(tile)}
                skinSet={skinSet}
              />
            </div>
          );
        })}
      </div>
      
      {/* Mensaje si no puede jugar */}
      {isMyTurn && playableTiles.length === 0 && tiles.length > 0 && (
        <div style={{
          marginTop: 8,
          padding: '8px 16px',
          borderRadius: 8,
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#EF4444',
          fontSize: 13,
          fontWeight: 600
        }}>
          😔 No puedes jugar - Debes pasar
        </div>
      )}
    </div>
  );
});

PlayerHand.displayName = 'PlayerHand';

export default PlayerHand;
