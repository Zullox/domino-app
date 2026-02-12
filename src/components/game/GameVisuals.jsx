// ============================================================================
// COMPONENTES VISUALES DEL JUEGO
// ============================================================================
// Incluye: FaceDownTile, OpponentHand, GameArea, PassIndicator
// Migrado de DominoR.jsx líneas 6672-7663
// ============================================================================

import React, { memo, useRef, useState, useEffect } from 'react';
import { THEME } from '../../constants/game';
import { BOARD_CONFIG } from '../../utils/snakeBoard';
import { DotPattern } from './Tile';

const BOARD_COLS = BOARD_CONFIG.width;
const BOARD_ROWS = BOARD_CONFIG.height;

// ============================================================================
// FICHA BOCA ABAJO - Para oponentes
// ============================================================================
export const FaceDownTile = memo(({ size = 20, isVertical = true }) => {
  const width = isVertical ? size : size * 2;
  const height = isVertical ? size * 2 : size;
  
  return (
    <div style={{
      width,
      height,
      backgroundColor: '#FFFEF0',
      border: '2px solid #8B4513',
      borderRadius: 4,
      boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
      display: 'flex',
      flexDirection: isVertical ? 'column' : 'row'
    }}>
      <div style={{
        flex: 1,
        backgroundColor: '#FFF8E7',
        borderBottom: isVertical ? '2px solid #A0522D' : 'none',
        borderRight: !isVertical ? '2px solid #A0522D' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: Math.max(6, size * 0.3),
          height: Math.max(6, size * 0.3),
          borderRadius: '50%',
          backgroundColor: '#8B4513'
        }} />
      </div>
      <div style={{
        flex: 1,
        backgroundColor: '#FFF8E7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: Math.max(6, size * 0.3),
          height: Math.max(6, size * 0.3),
          borderRadius: '50%',
          backgroundColor: '#8B4513'
        }} />
      </div>
    </div>
  );
});

FaceDownTile.displayName = 'FaceDownTile';

// ============================================================================
// AVATAR DE JUGADOR
// ============================================================================
const PlayerAvatar = memo(({ player, size = 32, isCurrentTurn, onAvatarClick }) => {
  const C = THEME.colors;
  
  return (
    <button
      onClick={() => onAvatarClick?.(player)}
      className="touch-feedback"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: player.team === 0 ? C.accent.blue : C.accent.red,
        border: isCurrentTurn ? '3px solid #FFD700' : '2px solid rgba(255,255,255,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
        cursor: 'pointer',
        boxShadow: isCurrentTurn ? '0 0 10px #FFD700' : '0 2px 4px rgba(0,0,0,0.3)',
        animation: isCurrentTurn ? 'pulse 1.5s infinite' : 'none'
      }}
    >
      {player.avatar}
    </button>
  );
});

PlayerAvatar.displayName = 'PlayerAvatar';

// ============================================================================
// MANO DE OPONENTE SUPERIOR (Compañero)
// ============================================================================
export const OpponentHandTop = memo(({ count, tileSize, player, onAvatarClick, isCurrentTurn }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      padding: '4px 0',
      flexShrink: 0
    }}>
      {/* Fichas */}
      <div style={{ display: 'flex', gap: 2 }}>
        {Array(count).fill(0).map((_, i) => (
          <FaceDownTile key={i} size={tileSize} isVertical={true} />
        ))}
      </div>
      {/* Avatar y Nombre */}
      {player && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          <PlayerAvatar 
            player={player} 
            size={32} 
            isCurrentTurn={isCurrentTurn}
            onAvatarClick={onAvatarClick}
          />
          <span style={{
            fontSize: 11,
            fontWeight: 'bold',
            color: '#FFFFFF',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            maxWidth: 70,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {player.name}
          </span>
        </div>
      )}
    </div>
  );
});

OpponentHandTop.displayName = 'OpponentHandTop';

// ============================================================================
// MANO DE OPONENTE LATERAL (Izquierda/Derecha)
// ============================================================================
export const OpponentHandSide = memo(({ count, tileSize, player, onAvatarClick, side, isCurrentTurn }) => {
  const isLeft = side === 'left';
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: isLeft ? 'row' : 'row-reverse',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      padding: '0 4px',
      flexShrink: 0
    }}>
      {/* Fichas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {Array(count).fill(0).map((_, i) => (
          <FaceDownTile key={i} size={tileSize} isVertical={false} />
        ))}
      </div>
      {/* Avatar y Nombre */}
      {player && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          <PlayerAvatar 
            player={player} 
            size={30} 
            isCurrentTurn={isCurrentTurn}
            onAvatarClick={onAvatarClick}
          />
          <span style={{
            fontSize: 10,
            fontWeight: 'bold',
            color: '#FFFFFF',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            maxWidth: 60,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            writingMode: 'horizontal-tb'
          }}>
            {player.name}
          </span>
        </div>
      )}
    </div>
  );
});

OpponentHandSide.displayName = 'OpponentHandSide';

// ============================================================================
// INDICADOR DE PASE
// ============================================================================
export const PassIndicator = memo(({ position }) => {
  const C = THEME.colors;
  
  return (
    <div style={{
      position: 'absolute',
      ...position,
      background: `${C.accent.red}ee`,
      color: '#fff',
      padding: '2px 8px',
      borderRadius: 8,
      fontSize: 10,
      fontWeight: 900,
      animation: 'fadeInOut 1.5s ease-out forwards',
      zIndex: 100,
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
    }}>
      PASÓ
    </div>
  );
});

PassIndicator.displayName = 'PassIndicator';

// Posiciones del indicador según jugador
export const PASS_POSITIONS = {
  0: { bottom: 10, left: '50%', transform: 'translateX(-50%)' },
  1: { right: 40, top: '50%', transform: 'translateY(-50%)' },
  2: { top: 45, left: '50%', transform: 'translateX(-50%)' },
  3: { left: 40, top: '50%', transform: 'translateY(-50%)' }
};

// ============================================================================
// ANIMACIÓN DE FICHA VOLANDO
// ============================================================================
export const FlyingTileAnimation = memo(({ flyingTile, cellSize, containerRef }) => {
  const C = THEME.colors;
  
  if (!flyingTile) return null;
  
  const { tile, fromPlayer, targetX, targetY, isHorizontal } = flyingTile;
  
  const boardWidth = BOARD_COLS * cellSize;
  const boardHeight = BOARD_ROWS * cellSize;
  
  const containerWidth = containerRef?.current?.offsetWidth || 300;
  const containerHeight = containerRef?.current?.offsetHeight || 400;
  
  const boardOffsetX = (containerWidth - boardWidth) / 2;
  const boardOffsetY = (containerHeight - boardHeight) / 2 + 22;
  
  const finalX = boardOffsetX + (targetX * cellSize);
  const finalY = boardOffsetY + (targetY * cellSize);
  
  const getStartPosition = () => {
    switch(fromPlayer) {
      case 0: return { x: containerWidth / 2, y: containerHeight };
      case 1: return { x: containerWidth, y: containerHeight / 2 };
      case 2: return { x: containerWidth / 2, y: 0 };
      case 3: return { x: 0, y: containerHeight / 2 };
      default: return { x: containerWidth / 2, y: containerHeight / 2 };
    }
  };
  
  const startPos = getStartPosition();
  const tileWidth = isHorizontal ? cellSize * 2 : cellSize;
  const tileHeight = isHorizontal ? cellSize : cellSize * 2;
  
  return (
    <>
      <div 
        className="flying-tile-animation"
        style={{
          position: 'absolute',
          left: startPos.x - tileWidth / 2,
          top: startPos.y - tileHeight / 2,
          width: tileWidth,
          height: tileHeight,
          zIndex: 200,
          '--end-x': `${finalX - startPos.x + tileWidth / 2}px`,
          '--end-y': `${finalY - startPos.y + tileHeight / 2}px`,
          animation: 'flyToPosition 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
        }}
      >
        <div style={{
          width: '100%',
          height: '100%',
          background: `linear-gradient(180deg, ${C.tile?.highlight || '#FFF'}, ${C.tile?.base || '#FFFFF0'})`,
          border: `2px solid ${C.gold?.main || '#FFD700'}`,
          borderRadius: 4,
          display: 'flex',
          flexDirection: isHorizontal ? 'row' : 'column',
          boxShadow: `0 8px 30px rgba(0,0,0,0.6), 0 0 20px ${C.gold?.main || '#FFD700'}50`
        }}>
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            borderRight: isHorizontal ? `1px solid ${C.tile?.shadow || '#ccc'}` : 'none',
            borderBottom: isHorizontal ? 'none' : `1px solid ${C.tile?.shadow || '#ccc'}`,
            padding: 1
          }}>
            <DotPattern num={tile.left} size={cellSize} rotate={isHorizontal} />
          </div>
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: 1
          }}>
            <DotPattern num={tile.right} size={cellSize} rotate={isHorizontal} />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes flyToPosition {
          0% { transform: translate(0, 0) scale(1.2); opacity: 1; }
          70% { transform: translate(var(--end-x), var(--end-y)) scale(1.1); opacity: 1; }
          100% { transform: translate(var(--end-x), var(--end-y)) scale(1); opacity: 0; }
        }
      `}</style>
    </>
  );
});

FlyingTileAnimation.displayName = 'FlyingTileAnimation';

// ============================================================================
// ÁREA DE JUEGO COMPLETA
// ============================================================================
export const GameArea = memo(({ 
  board, 
  lastPlayed, 
  players, 
  playerPassed, 
  flyingTile, 
  onAvatarClick, 
  onBoardInfo, 
  currentPlayer = 0, 
  skinSetId = 'classic',
  BoardComponent
}) => {
  const containerRef = useRef(null);
  const boardRef = useRef(null);
  const [cellSize, setCellSize] = useState(28);
  
  useEffect(() => {
    setCellSize(28);
  }, []);
  
  // Calcular y exponer posiciones de drop
  useEffect(() => {
    if (!boardRef.current || !onBoardInfo) return;
    
    const boardRect = boardRef.current.getBoundingClientRect();
    const boardWidth = BOARD_COLS * cellSize;
    const boardHeight = BOARD_ROWS * cellSize;
    
    const snakePositions = {};
    
    // Centro (primera ficha)
    if (!board.tiles || board.tiles.length === 0) {
      snakePositions.center = {
        screenX: (BOARD_CONFIG.centerX + 0.5) * cellSize,
        screenY: (BOARD_CONFIG.centerY + 1) * cellSize
      };
    }
    
    // Extremo TOP
    if (board.snakeTop) {
      const snake = board.snakeTop;
      let dropX, dropY;
      
      if (snake.inElbow) {
        const lastX = snake.lastTileX || snake.column;
        const lastY = snake.lastTileY || snake.y;
        const lastWasHorizontal = snake.lastTileWasHorizontal || false;
        
        if (snake.side === 'top') {
          const elbowX = lastWasHorizontal ? lastX + 2 : Math.floor(lastX) + 1;
          dropX = elbowX * cellSize + cellSize;
        } else {
          const elbowX = lastWasHorizontal ? lastX - 2 : Math.floor(lastX) - 2;
          dropX = elbowX * cellSize + cellSize;
        }
        dropY = Math.floor(lastY) * cellSize + cellSize / 2;
      } else {
        dropX = (snake.column + 0.5) * cellSize;
        dropY = (snake.y + 1) * cellSize;
      }
      snakePositions.top = { screenX: dropX, screenY: dropY };
    }
    
    // Extremo BOTTOM
    if (board.snakeBottom) {
      const snake = board.snakeBottom;
      let dropX, dropY;
      
      if (snake.inElbow) {
        const lastX = snake.lastTileX || snake.column;
        const lastY = snake.lastTileY || snake.y;
        const lastWasHorizontal = snake.lastTileWasHorizontal || false;
        
        if (snake.side === 'top') {
          const elbowX = lastWasHorizontal ? lastX + 2 : Math.floor(lastX) + 1;
          dropX = elbowX * cellSize + cellSize;
        } else {
          const elbowX = lastWasHorizontal ? lastX - 2 : Math.floor(lastX) - 2;
          dropX = elbowX * cellSize + cellSize;
        }
        const elbowY = lastWasHorizontal ? Math.floor(lastY) : Math.floor(lastY) + 1;
        dropY = elbowY * cellSize + cellSize / 2;
      } else {
        dropX = (snake.column + 0.5) * cellSize;
        dropY = (snake.y + 1) * cellSize;
      }
      snakePositions.bottom = { screenX: dropX, screenY: dropY };
    }
    
    onBoardInfo({
      x: boardRect.left,
      y: boardRect.top,
      width: boardWidth,
      height: boardHeight,
      cellSize
    }, snakePositions);
  }, [board, cellSize, onBoardInfo]);
  
  const opponentTileSize = Math.max(20, cellSize);
  
  const getPlayerTileCount = (idx) => {
    if (!players || !players[idx]) return 7;
    return players[idx].tiles?.length ?? 0;
  };

  return (
    <div ref={containerRef} style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
      minHeight: 0,
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Indicadores de pase */}
      {playerPassed !== null && <PassIndicator position={PASS_POSITIONS[playerPassed]} />}
      
      {/* Ficha volando */}
      <FlyingTileAnimation flyingTile={flyingTile} cellSize={cellSize} containerRef={containerRef} />
      
      {/* Mano oponente ARRIBA (compañero - jugador 2) */}
      <OpponentHandTop 
        count={getPlayerTileCount(2)} 
        tileSize={opponentTileSize} 
        player={players[2]}
        onAvatarClick={onAvatarClick}
        isCurrentTurn={currentPlayer === 2}
      />
      
      {/* Fila central: Izquierda - Tablero - Derecha */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        width: '100%',
        minHeight: 0
      }}>
        {/* Mano oponente IZQUIERDA (jugador 3) */}
        <OpponentHandSide 
          count={getPlayerTileCount(3)} 
          tileSize={opponentTileSize} 
          player={players[3]}
          onAvatarClick={onAvatarClick}
          side="left"
          isCurrentTurn={currentPlayer === 3}
        />
        
        {/* Tablero */}
        <div ref={boardRef}>
          {BoardComponent && (
            <BoardComponent 
              board={board} 
              lastPlayed={lastPlayed} 
              cellSize={cellSize} 
              onBoardInfo={onBoardInfo} 
              skinSetId={skinSetId} 
            />
          )}
        </div>
        
        {/* Mano oponente DERECHA (jugador 1) */}
        <OpponentHandSide 
          count={getPlayerTileCount(1)} 
          tileSize={opponentTileSize} 
          player={players[1]}
          onAvatarClick={onAvatarClick}
          side="right"
          isCurrentTurn={currentPlayer === 1}
        />
      </div>
      
      {/* Estilos de animación para indicador de pase */}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(-50%) scale(0.5); }
          20% { opacity: 1; transform: translateX(-50%) scale(1.1); }
          80% { opacity: 1; transform: translateX(-50%) scale(1); }
          100% { opacity: 0; transform: translateX(-50%) scale(0.8); }
        }
      `}</style>
    </div>
  );
});

GameArea.displayName = 'GameArea';

// ============================================================================
// EXPORTACIONES
// ============================================================================
export default GameArea;
