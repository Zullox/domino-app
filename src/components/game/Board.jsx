// ============================================================================
// COMPONENTE: TABLERO DE JUEGO
// ============================================================================
import React, { memo, useMemo, useRef, useEffect } from 'react';
import Tile from './Tile';
import { getBoardEnds, canPlayAt } from '../../utils/gameEngine';

const Board = memo(({ 
  board, 
  selectedTile,
  isMyTurn,
  onPlayTile,
  skinSet = 'classic',
  boardTheme = 'green'
}) => {
  const boardRef = useRef(null);
  
  // Colores del tablero
  const boardColors = {
    green: { bg: 'radial-gradient(ellipse at center, #1a4a2e 0%, #0d2818 100%)', felt: '#1a4a2e' },
    blue: { bg: 'radial-gradient(ellipse at center, #1a3a5e 0%, #0d1828 100%)', felt: '#1a3a5e' },
    red: { bg: 'radial-gradient(ellipse at center, #4a1a1a 0%, #280d0d 100%)', felt: '#4a1a1a' },
    purple: { bg: 'radial-gradient(ellipse at center, #3a1a4a 0%, #1a0d28 100%)', felt: '#3a1a4a' }
  };
  
  const colors = boardColors[boardTheme] || boardColors.green;
  
  // Calcular posiciones de fichas para layout snake
  const tilesWithPositions = useMemo(() => {
    if (!board || !board.tiles || board.tiles.length === 0) return [];
    
    const tileSize = 40;
    const gap = 2;
    const positions = [];
    
    let x = 0;
    let y = 0;
    let direction = 'right'; // right, down, left, up
    const maxWidth = 280;
    const maxHeight = 200;
    
    board.tiles?.forEach((tile, index) => {
      const isDouble = tile.left === tile.right;
      const width = isDouble ? tileSize : tileSize * 2;
      const height = isDouble ? tileSize * 2 : tileSize;
      
      positions.push({
        tile,
        x,
        y,
        rotation: tile.rotation || 0,
        isDouble
      });
      
      // Avanzar posición
      if (direction === 'right') {
        x += width + gap;
        if (x > maxWidth) {
          direction = 'down';
          y += tileSize + gap;
        }
      } else if (direction === 'down') {
        y += height + gap;
        if (y > maxHeight) {
          direction = 'left';
          x -= width + gap;
        }
      }
    });
    
    return positions;
  }, [board]);
  
  // Zonas de drop
  const ends = getBoardEnds(board);
  const canDropLeft = selectedTile && isMyTurn && canPlayAt(selectedTile, 'left', board);
  const canDropRight = selectedTile && isMyTurn && canPlayAt(selectedTile, 'right', board);
  
  // Auto-scroll al centro
  useEffect(() => {
    if (boardRef.current && board.tiles?.length > 0) {
      const container = boardRef.current;
      container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
      container.scrollTop = (container.scrollHeight - container.clientHeight) / 2;
    }
  }, [board.tiles?.length]);
  
  return (
    <div
      ref={boardRef}
      style={{
        width: '100%',
        height: '100%',
        background: colors.bg,
        borderRadius: 16,
        overflow: 'auto',
        position: 'relative',
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
      }}
    >
      {/* Textura de fieltro */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`,
        pointerEvents: 'none',
        opacity: 0.3
      }} />
      
      {/* Contenedor de fichas */}
      <div style={{
        minWidth: '100%',
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40
      }}>
        {board.tiles.length === 0 ? (
          // Tablero vacío
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            color: 'rgba(255,255,255,0.3)'
          }}>
            <div style={{ fontSize: 48 }}>🎲</div>
            <div style={{ fontSize: 14 }}>Primera ficha aquí</div>
          </div>
        ) : (
          // Fichas en el tablero
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            position: 'relative'
          }}>
            {/* Zona de drop izquierda */}
            {canDropLeft && (
              <div
                onClick={() => onPlayTile(selectedTile, 'left')}
                style={{
                  position: 'absolute',
                  left: -60,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 50,
                  height: 100,
                  border: '3px dashed #10B981',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(16, 185, 129, 0.1)',
                  cursor: 'pointer',
                  animation: 'pulse 1s infinite'
                }}
              >
                <span style={{ fontSize: 20 }}>👈</span>
              </div>
            )}
            
            {/* Fichas */}
            {tilesWithPositions.map(({ tile, rotation, isDouble }, index) => (
              <div
                key={tile.id}
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: 'transform 300ms ease-out'
                }}
              >
                <Tile
                  tile={tile}
                  size={40}
                  horizontal={!isDouble}
                  skinSet={skinSet}
                />
              </div>
            ))}
            
            {/* Zona de drop derecha */}
            {canDropRight && (
              <div
                onClick={() => onPlayTile(selectedTile, 'right')}
                style={{
                  position: 'absolute',
                  right: -60,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 50,
                  height: 100,
                  border: '3px dashed #10B981',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(16, 185, 129, 0.1)',
                  cursor: 'pointer',
                  animation: 'pulse 1s infinite'
                }}
              >
                <span style={{ fontSize: 20 }}>👉</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Indicadores de extremos */}
      {(board.tiles?.length || 0) > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 16,
          padding: '4px 12px',
          background: 'rgba(0,0,0,0.5)',
          borderRadius: 8
        }}>
          <span style={{ color: '#fff', fontSize: 12 }}>
            ← {ends.left}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>|</span>
          <span style={{ color: '#fff', fontSize: 12 }}>
            {ends.right} →
          </span>
        </div>
      )}
    </div>
  );
});

Board.displayName = 'Board';

export default Board;
