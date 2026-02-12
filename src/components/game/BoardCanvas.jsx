// ============================================================================
// BOARD CANVAS - Renderizado GPU-acelerado del tablero
// ============================================================================
// Migrado de DominoR.jsx líneas 6726-7031
// Versión Canvas de alto rendimiento para dispositivos móviles
// ============================================================================

import React, { memo, useRef, useEffect, useCallback } from 'react';
import { THEME } from '../../constants/game';
import { BOARD_CONFIG } from '../../utils/snakeBoard';
import { DeviceDetection } from '../../utils/deviceDetection';
import { getSkinSet, getTileImage, getBoardImage } from '../../constants/cosmetics';

const BOARD_COLS = BOARD_CONFIG.width;
const BOARD_ROWS = BOARD_CONFIG.height;

// ============================================================================
// BOARD CANVAS COMPONENT
// ============================================================================
export const BoardCanvas = memo(({ 
  board, 
  lastPlayed, 
  cellSize, 
  onBoardInfo, 
  skinSetId = 'classic' 
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const C = THEME.colors;
  const perfConfig = DeviceDetection.getPerformanceConfig();
  
  // Obtener configuración del skin
  const skinSet = getSkinSet(skinSetId);
  const tileConfig = skinSet.tile;
  const boardConfig = skinSet.board;
  const tileImage = getTileImage(skinSetId);
  const boardImage = getBoardImage(skinSetId);
  
  const boardWidth = BOARD_COLS * cellSize;
  const boardHeight = BOARD_ROWS * cellSize;
  
  // Colores del tablero según skin
  const feltColor = boardConfig.accent || '#2D5A3D';
  const feltDark = boardConfig.background || '#1a4d2e';
  const dotColor = tileConfig.dotColor || '#1a1a1a';
  
  // Posiciones de puntos para cada número (0-9)
  const getDotPositions = useCallback((num, size) => {
    const s = size * 0.2;
    const m = size * 0.5;
    const e = size * 0.8;
    const positions = {
      0: [],
      1: [[m, m]],
      2: [[e, s], [s, e]],
      3: [[e, s], [m, m], [s, e]],
      4: [[s, s], [e, s], [s, e], [e, e]],
      5: [[s, s], [e, s], [m, m], [s, e], [e, e]],
      6: [[s, s], [e, s], [s, m], [e, m], [s, e], [e, e]],
      7: [[s, s], [e, s], [s, m], [m, m], [e, m], [s, e], [e, e]],
      8: [[s, s], [m, s], [e, s], [s, m], [e, m], [s, e], [m, e], [e, e]],
      9: [[s, s], [m, s], [e, s], [s, m], [m, m], [e, m], [s, e], [m, e], [e, e]]
    };
    return positions[num] || [];
  }, []);
  
  // Dibujar un punto con sombra
  const drawDot = useCallback((ctx, cx, cy, radius, color) => {
    // Sombra del punto
    ctx.beginPath();
    ctx.arc(cx + 1, cy + 1, radius * 1.125, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fill();
    
    // Punto principal
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Brillo sutil
    if (!perfConfig.useReducedMotion) {
      ctx.beginPath();
      ctx.arc(cx - radius * 0.3, cy - radius * 0.3, radius * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fill();
    }
  }, [perfConfig.useReducedMotion]);
  
  // Dibujar una mitad de ficha
  const drawTileHalf = useCallback((ctx, x, y, size, num, isRotated = false) => {
    const dotRadius = size * 0.08;
    const positions = getDotPositions(num, size);
    
    positions.forEach(([px, py]) => {
      let dotX, dotY;
      if (isRotated) {
        dotX = x + py;
        dotY = y + (size - px);
      } else {
        dotX = x + px;
        dotY = y + py;
      }
      drawDot(ctx, dotX, dotY, dotRadius, dotColor);
    });
  }, [getDotPositions, drawDot, dotColor]);
  
  // Dibujar ficha completa
  const drawTile = useCallback((ctx, tile) => {
    const x = tile.x * cellSize;
    const y = tile.y * cellSize;
    const isHorizontal = tile.orientation === 'HORIZONTAL';
    const isCenter = tile.isCenter;
    
    const tileWidth = isHorizontal ? cellSize * 2 : cellSize;
    const tileHeight = isHorizontal ? cellSize : cellSize * 2;
    const cornerRadius = 4;
    
    // Sombra externa
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Fondo de la ficha
    ctx.beginPath();
    ctx.roundRect(x, y, tileWidth, tileHeight, cornerRadius);
    
    if (tileImage && skinSet.type === 'png') {
      ctx.save();
      ctx.clip();
      ctx.drawImage(tileImage, x, y, tileWidth, tileHeight);
      ctx.restore();
    } else {
      ctx.fillStyle = tileConfig.base || tileConfig.fallbackBase || '#FFFFF0';
      ctx.fill();
    }
    
    // Resetear sombra
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Borde
    ctx.strokeStyle = isCenter ? '#DC2626' : (tileConfig.border || '#8B7355');
    ctx.lineWidth = isCenter ? 3 : 2;
    ctx.beginPath();
    ctx.roundRect(x, y, tileWidth, tileHeight, cornerRadius);
    ctx.stroke();
    
    // Línea divisoria
    ctx.strokeStyle = tileConfig.divider || '#A0522D';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (isHorizontal) {
      ctx.moveTo(x + tileWidth / 2, y + 2);
      ctx.lineTo(x + tileWidth / 2, y + tileHeight - 2);
    } else {
      ctx.moveTo(x + 2, y + tileHeight / 2);
      ctx.lineTo(x + tileWidth - 2, y + tileHeight / 2);
    }
    ctx.stroke();
    
    // Dibujar puntos
    if (isHorizontal) {
      drawTileHalf(ctx, x, y, cellSize, tile.visualTop, true);
      drawTileHalf(ctx, x + cellSize, y, cellSize, tile.visualBottom, true);
    } else {
      drawTileHalf(ctx, x, y, cellSize, tile.visualTop, false);
      drawTileHalf(ctx, x, y + cellSize, cellSize, tile.visualBottom, false);
    }
  }, [cellSize, drawTileHalf, skinSet, tileConfig, tileImage]);
  
  // Renderizar canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    const dpr = window.devicePixelRatio || 1;
    
    // Configurar canvas para alta resolución
    canvas.width = boardWidth * dpr;
    canvas.height = boardHeight * dpr;
    canvas.style.width = `${boardWidth}px`;
    canvas.style.height = `${boardHeight}px`;
    ctx.scale(dpr, dpr);
    
    // Fondo del tablero
    if (boardImage && skinSet.type === 'png') {
      ctx.drawImage(boardImage, 0, 0, boardWidth, boardHeight);
    } else {
      // Gradiente verde fieltro
      const gradient = ctx.createLinearGradient(0, 0, boardWidth, boardHeight);
      gradient.addColorStop(0, feltDark);
      gradient.addColorStop(0.5, feltColor);
      gradient.addColorStop(1, feltDark);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, boardWidth, boardHeight);
      
      // Textura de fieltro
      ctx.globalAlpha = 0.15;
      for (let i = 0; i < 200; i++) {
        const x1 = Math.random() * boardWidth;
        const y1 = Math.random() * boardHeight;
        const length = 3 + Math.random() * 8;
        const angle = Math.random() * Math.PI * 2;
        
        ctx.strokeStyle = Math.random() > 0.5 ? '#0a3d1f' : '#2a7d4f';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + Math.cos(angle) * length, y1 + Math.sin(angle) * length);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    
    // Viñeta
    const vignette = ctx.createRadialGradient(
      boardWidth/2, boardHeight/2, Math.min(boardWidth, boardHeight) * 0.3,
      boardWidth/2, boardHeight/2, Math.max(boardWidth, boardHeight) * 0.7
    );
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.15)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, boardWidth, boardHeight);
    
    // Borde del tablero
    ctx.strokeStyle = boardConfig.border || '#0d2e1a';
    ctx.lineWidth = 3;
    ctx.strokeRect(1, 1, boardWidth - 2, boardHeight - 2);
    
    // Estado vacío
    if (!board.tiles || board.tiles.length === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = 'bold 24px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🀄', boardWidth / 2, boardHeight / 2 - 15);
      ctx.font = '12px system-ui';
      ctx.fillText('Esperando...', boardWidth / 2, boardHeight / 2 + 15);
      return;
    }
    
    // Dibujar fichas
    board.tiles.forEach(tile => drawTile(ctx, tile));
    
  }, [board, boardWidth, boardHeight, drawTile, perfConfig.useReducedMotion, feltColor, feltDark, boardImage, skinSet, boardConfig]);
  
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
  
  return (
    <div 
      ref={containerRef}
      className="gpu-layer contain-paint"
      style={{
        width: boardWidth,
        height: boardHeight,
        position: 'relative',
        border: `3px solid ${C.felt?.border || '#0d2e1a'}`,
        borderRadius: 8,
        boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        flexShrink: 0
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
});

BoardCanvas.displayName = 'BoardCanvas';

export default BoardCanvas;
