// ============================================================================
// BOARD DOM - Renderizado DOM del tablero
// ============================================================================
// Migrado de DominoR.jsx líneas 7048-7210
// Versión DOM para desktop con mejor calidad visual
// ============================================================================

import React, { memo, useRef, useEffect } from 'react';
import { THEME } from '../../constants/game';
import { BOARD_CONFIG } from '../../utils/snakeBoard';
import { getSkinSet, getTileImage, getBoardImage } from '../../constants/cosmetics';
import { Dots, Doble9Icon } from './Tile';

const BOARD_COLS = BOARD_CONFIG.width;
const BOARD_ROWS = BOARD_CONFIG.height;

// ============================================================================
// BOARD DOM COMPONENT
// ============================================================================
export const BoardDOM = memo(({ 
  board, 
  lastPlayed, 
  cellSize, 
  onBoardInfo, 
  skinSetId = 'classic' 
}) => {
  const C = THEME.colors;
  const containerRef = useRef(null);
  
  // Obtener configuración del skin
  const skinSet = getSkinSet(skinSetId);
  const tileConfig = skinSet.tile;
  const boardConfig = skinSet.board;
  const tileImage = getTileImage(skinSetId);
  
  const boardWidth = BOARD_COLS * cellSize;
  const boardHeight = BOARD_ROWS * cellSize;
  
  // Reportar posición del tablero
  useEffect(() => {
    if (!containerRef.current || !onBoardInfo) return;
    
    const updatePosition = () => {
      const rect = containerRef.current.getBoundingClientRect();
      
      let topSocket = null, bottomSocket = null, centerSocket = null;
      
      if (board.snakeTop) {
        topSocket = {
          x: board.snakeTop.column,
          y: board.snakeTop.y,
          screenX: board.snakeTop.column * cellSize + cellSize / 2,
          screenY: board.snakeTop.y * cellSize + cellSize
        };
      }
      
      if (board.snakeBottom) {
        bottomSocket = {
          x: board.snakeBottom.column,
          y: board.snakeBottom.y,
          screenX: board.snakeBottom.column * cellSize + cellSize / 2,
          screenY: board.snakeBottom.y * cellSize + cellSize
        };
      }
      
      if (!board.tiles || board.tiles.length === 0) {
        centerSocket = {
          x: BOARD_CONFIG.centerX,
          y: BOARD_CONFIG.centerY,
          screenX: BOARD_CONFIG.centerX * cellSize + cellSize / 2,
          screenY: BOARD_CONFIG.centerY * cellSize + cellSize
        };
      }
      
      onBoardInfo(
        { x: rect.left, y: rect.top, width: rect.width, height: rect.height, cellSize },
        { top: topSocket, bottom: bottomSocket, center: centerSocket }
      );
    };
    
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [board, cellSize, onBoardInfo]);
  
  // Renderizar ficha individual
  const RenderTile = ({ tile }) => {
    const isCenter = tile.isCenter;
    const left = tile.x * cellSize;
    const top = tile.y * cellSize;
    const isHorizontal = tile.orientation === 'HORIZONTAL';
    
    const tileWidth = isHorizontal ? cellSize * 2 : cellSize;
    const tileHeight = isHorizontal ? cellSize : cellSize * 2;
    
    // Determinar fondo según tipo de skin
    const backgroundStyle = (tileImage && skinSet.type === 'png')
      ? { backgroundImage: `url(${tileConfig.png})`, backgroundSize: 'cover' }
      : { backgroundColor: tileConfig.base || '#FFFFF0' };
    
    return (
      <div 
        className="gpu-layer"
        style={{
          position: 'absolute',
          left,
          top,
          width: tileWidth,
          height: tileHeight,
          display: 'flex',
          flexDirection: isHorizontal ? 'row' : 'column',
          ...backgroundStyle,
          border: isCenter 
            ? '2px solid #DC2626' 
            : `2px solid ${tileConfig.border || '#8B7355'}`,
          borderRadius: 4,
          boxShadow: '2px 2px 6px rgba(0,0,0,0.4)'
        }}
      >
        {/* Mitad superior/izquierda */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRight: isHorizontal ? `2px solid ${tileConfig.divider || '#A0522D'}` : 'none',
          borderBottom: !isHorizontal ? `2px solid ${tileConfig.divider || '#A0522D'}` : 'none'
        }}>
          <Dots num={tile.visualTop} color={tileConfig.dotColor || '#1a1a1a'} />
        </div>
        {/* Mitad inferior/derecha */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Dots num={tile.visualBottom} color={tileConfig.dotColor || '#1a1a1a'} />
        </div>
      </div>
    );
  };

  // Determinar fondo del tablero
  const boardImage = getBoardImage(skinSetId);
  const boardBackgroundStyle = (boardImage && skinSet.type === 'png')
    ? { backgroundImage: `url(${boardConfig.png})`, backgroundSize: 'cover' }
    : { background: `linear-gradient(145deg, ${boardConfig.background || '#1a4d2e'} 0%, ${boardConfig.accent || '#2D5A3D'} 50%, ${boardConfig.background || '#1a4d2e'} 100%)` };

  return (
    <div 
      ref={containerRef}
      className="gpu-layer contain-paint"
      style={{
        width: boardWidth,
        height: boardHeight,
        position: 'relative',
        ...boardBackgroundStyle,
        border: `3px solid ${boardConfig.border || '#0d2e1a'}`,
        borderRadius: 8,
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4), 0 4px 15px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        flexShrink: 0
      }}
    >
      {/* Estado vacío */}
      {(!board.tiles || board.tiles.length === 0) && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ marginBottom: 8, opacity: 0.5 }}>
            <Doble9Icon size={30} />
          </div>
          <p style={{ color: C.accent?.slate || '#94a3b8', fontSize: 12, fontWeight: 500 }}>
            Esperando...
          </p>
        </div>
      )}
      
      {/* Fichas */}
      {board.tiles && board.tiles.map(tile => (
        <RenderTile key={tile.id} tile={tile} />
      ))}
    </div>
  );
});

BoardDOM.displayName = 'BoardDOM';

export default BoardDOM;
