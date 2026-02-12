// ============================================================================
// PLAYER HAND AREA - Área de la mano del jugador con Drag & Drop
// ============================================================================
// Migrado de DominoR.jsx líneas 7777-8257
// Sistema completo de arrastre y soltar fichas con soporte touch/mouse
// ============================================================================

import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { THEME } from '../../constants/game';
import { getSkinSet } from '../../constants/cosmetics';
import { Dots } from './Tile';

// ============================================================================
// DROP ZONE - Zona de soltar fichas en el tablero
// ============================================================================
const DropZone = memo(({ position, type, value, boardRect, isActive }) => {
  const C = THEME.colors;
  
  if (!position || !boardRect) return null;
  
  const size = boardRect.cellSize * 2;
  
  return (
    <div 
      className="gpu-accelerated drop-zone"
      style={{
        position: 'fixed',
        left: boardRect.x + position.screenX - size/2,
        top: boardRect.y + position.screenY - size/2,
        width: size,
        height: size,
        borderRadius: '50%',
        background: isActive 
          ? (type === 'left' ? C.accent.green : type === 'right' ? C.accent.blue : C.gold.main)
          : 'rgba(255,255,255,0.2)',
        border: `3px dashed ${isActive ? '#fff' : 'rgba(255,255,255,0.5)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        transform: isActive ? 'scale3d(1.2, 1.2, 1) translate3d(0, 0, 0)' : 'scale3d(1, 1, 1) translate3d(0, 0, 0)',
        boxShadow: isActive ? `0 0 30px ${type === 'left' ? C.accent.green : type === 'right' ? C.accent.blue : C.gold.main}` : 'none',
        pointerEvents: 'none',
        willChange: 'transform, background-color, box-shadow'
      }}
    >
      <span style={{
        color: '#fff',
        fontWeight: 900,
        fontSize: boardRect.cellSize * 0.8,
        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
      }}>
        {type === 'center' ? '🎯' : value}
      </span>
    </div>
  );
});

DropZone.displayName = 'DropZone';

// ============================================================================
// DRAGGING TILE - Ficha siendo arrastrada
// ============================================================================
const DraggingTile = memo(({ tile, dragPos, dropTarget, tileWidth, tileHeight }) => {
  const C = THEME.colors;
  
  if (!tile) return null;
  
  return (
    <div 
      className="gpu-accelerated dragging"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: tileWidth,
        height: tileHeight,
        background: dropTarget 
          ? `linear-gradient(180deg, ${C.accent.green}, #059669)`
          : `linear-gradient(180deg, ${C.tile?.highlight || '#FFF'}, ${C.tile?.base || '#FFFFF0'}, ${C.tile?.shadow || '#ccc'})`,
        border: `2px solid ${dropTarget ? '#34D399' : C.gold?.dark || '#B8860B'}`,
        borderRadius: 6,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 1001,
        pointerEvents: 'none',
        boxShadow: `0 8px 25px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.6)`,
        transform: `translate3d(${dragPos.x - tileWidth / 2}px, ${dragPos.y - tileHeight / 2}px, 0) scale3d(1.15, 1.15, 1) rotate(-3deg)`,
        willChange: 'transform'
      }}
    >
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: `1px solid ${C.tile?.shadow || '#ccc'}`,
        padding: 2
      }}>
        <Dots num={tile.left} />
      </div>
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2
      }}>
        <Dots num={tile.right} />
      </div>
    </div>
  );
});

DraggingTile.displayName = 'DraggingTile';

// ============================================================================
// HAND TILE - Ficha individual en la mano
// ============================================================================
const HandTile = memo(({ 
  tile, 
  index, 
  isDragging, 
  isPlayable, 
  isMust,
  tileWidth,
  tileHeight,
  onDragStart,
  tileRef
}) => {
  const C = THEME.colors;
  
  return (
    <div
      ref={tileRef}
      onTouchStart={(e) => onDragStart(e, tile, index)}
      onMouseDown={(e) => onDragStart(e, tile, index)}
      className="gpu-accelerated draggable touch-feedback"
      style={{
        width: tileWidth,
        height: tileHeight,
        padding: 0,
        backgroundColor: '#FFFFF0',
        border: isMust 
          ? `3px solid ${C.gold?.main || '#FFD700'}` 
          : isPlayable
            ? '2px solid #22C55E'
            : '2px solid #8B7355',
        borderRadius: 6,
        opacity: isDragging ? 0.3 : 1,
        boxShadow: isMust 
          ? '0 0 15px rgba(255,215,0,0.6)'
          : '2px 2px 8px rgba(0,0,0,0.3)',
        cursor: 'grab',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
        userSelect: 'none',
        touchAction: 'none'
      }}
    >
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '2px solid #A0522D',
        padding: 2
      }}>
        <Dots num={tile.left} color="#1a1a1a" />
      </div>
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2
      }}>
        <Dots num={tile.right} color="#1a1a1a" />
      </div>
    </div>
  );
});

HandTile.displayName = 'HandTile';

// ============================================================================
// INSERT INDICATOR - Indicador de inserción para reordenar
// ============================================================================
const InsertIndicator = memo(({ height }) => {
  const C = THEME.colors;
  
  return (
    <div style={{
      width: 4,
      height,
      background: C.accent.blue,
      borderRadius: 2,
      boxShadow: `0 0 10px ${C.accent.blue}`
    }} />
  );
});

InsertIndicator.displayName = 'InsertIndicator';

// ============================================================================
// PLAYER HAND AREA - Componente principal
// ============================================================================
export const PlayerHandArea = memo(({ 
  tiles, 
  board, 
  selected, 
  onSelect, 
  onPlay, 
  onPass, 
  canPass, 
  isMyTurn,
  showChoice,
  onCancelChoice,
  player,
  onAvatarClick,
  boardRect,
  snakePositions,
  onReorderTiles,
  onFlipTile,
  mustPlay,
  skinSetId = 'classic'
}) => {
  const C = THEME.colors;
  const skinSet = getSkinSet(skinSetId);
  const [dragging, setDragging] = useState(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [dropTarget, setDropTarget] = useState(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [isReordering, setIsReordering] = useState(false);
  const [reorderTarget, setReorderTarget] = useState(null);
  const [lastTap, setLastTap] = useState({ id: null, time: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const tilesRef = useRef([]);
  const rafRef = useRef(null);
  const dragPosRef = useRef({ x: 0, y: 0 });
  
  // Calcular fichas jugables
  const ends = board.tiles?.length > 0 
    ? { left: board.snakeTop?.value, right: board.snakeBottom?.value }
    : { left: null, right: null };
  
  const getPlayablePositions = useCallback((tile) => {
    if (!board.tiles || board.tiles.length === 0) return ['center'];
    const positions = [];
    if (tile.left === ends.left || tile.right === ends.left) positions.push('left');
    if (tile.left === ends.right || tile.right === ends.right) positions.push('right');
    return positions;
  }, [board.tiles, ends.left, ends.right]);
  
  const isPlayable = useCallback((tile) => getPlayablePositions(tile).length > 0, [getPlayablePositions]);
  
  // Tamaño de fichas en mano
  const cellSize = 28;
  const tileWidth = cellSize;
  const tileHeight = cellSize * 2;
  
  // Doble tap para girar ficha
  const handleDoubleTap = useCallback((tile) => {
    const now = Date.now();
    if (lastTap.id === tile.id && now - lastTap.time < 300) {
      if (onFlipTile) {
        onFlipTile(tile.id);
      }
      setLastTap({ id: null, time: 0 });
    } else {
      setLastTap({ id: tile.id, time: now });
    }
  }, [lastTap, onFlipTile]);
  
  // Detectar drop target
  const detectDropTarget = useCallback((clientX, clientY) => {
    if (!boardRect || !snakePositions || !dragging) return null;
    
    const positions = getPlayablePositions(dragging);
    const dropRadius = boardRect.cellSize * 2.5;
    const dropRadiusSq = dropRadius * dropRadius;
    
    if (positions.includes('center') && snakePositions.center) {
      const dx = clientX - (boardRect.x + snakePositions.center.screenX);
      const dy = clientY - (boardRect.y + snakePositions.center.screenY);
      if (dx * dx + dy * dy < dropRadiusSq) return 'center';
    }
    
    if (positions.includes('left') && snakePositions.top) {
      const dx = clientX - (boardRect.x + snakePositions.top.screenX);
      const dy = clientY - (boardRect.y + snakePositions.top.screenY);
      if (dx * dx + dy * dy < dropRadiusSq) return 'left';
    }
    
    if (positions.includes('right') && snakePositions.bottom) {
      const dx = clientX - (boardRect.x + snakePositions.bottom.screenX);
      const dy = clientY - (boardRect.y + snakePositions.bottom.screenY);
      if (dx * dx + dy * dy < dropRadiusSq) return 'right';
    }
    
    return null;
  }, [boardRect, snakePositions, dragging, getPlayablePositions]);
  
  // Detectar reorder target
  const detectReorderTarget = useCallback((clientX, clientY) => {
    const handArea = document.getElementById('player-hand-tiles');
    if (!handArea) return null;
    
    const handRect = handArea.getBoundingClientRect();
    if (clientY < handRect.top - 20 || clientY > handRect.bottom + 20) return null;
    
    for (let i = 0; i < tilesRef.current.length; i++) {
      const el = tilesRef.current[i];
      if (!el || tiles[i]?.id === dragging?.id) continue;
      
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      
      if (clientX < centerX) return i;
    }
    return tiles.length;
  }, [tiles, dragging]);
  
  // Handler de drag start
  const handleDragStart = useCallback((e, tile, index) => {
    handleDoubleTap(tile);
    
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches ? e.touches[0] : e;
    const rect = tilesRef.current[index]?.getBoundingClientRect();
    
    const offsetX = rect ? touch.clientX - (rect.left + rect.width / 2) : 0;
    const offsetY = rect ? touch.clientY - (rect.top + rect.height / 2) : 0;
    
    setDragging(tile);
    setDragOffset({ x: offsetX, y: offsetY });
    setDragPos({ x: touch.clientX, y: touch.clientY });
    setDragStartPos({ x: touch.clientX, y: touch.clientY });
    dragPosRef.current = { x: touch.clientX, y: touch.clientY };
    setIsReordering(false);
    
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
  }, [handleDoubleTap]);
  
  // Handler de drag move
  const handleDragMove = useCallback((e) => {
    if (!dragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches ? e.touches[0] : e;
    const clientX = touch.clientX;
    const clientY = touch.clientY;
    
    dragPosRef.current = { x: clientX, y: clientY };
    
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    
    rafRef.current = requestAnimationFrame(() => {
      setDragPos({ x: clientX, y: clientY });
      
      const verticalDist = dragStartPos.y - clientY;
      const playable = isPlayable(dragging);
      
      if (verticalDist > 50 && playable && isMyTurn) {
        setIsReordering(false);
        setReorderTarget(null);
        setDropTarget(detectDropTarget(clientX, clientY));
      } else {
        setIsReordering(true);
        setDropTarget(null);
        setReorderTarget(detectReorderTarget(clientX, clientY));
      }
    });
  }, [dragging, dragStartPos, isMyTurn, isPlayable, detectDropTarget, detectReorderTarget]);
  
  // Handler de drag end
  const handleDragEnd = useCallback(() => {
    if (!dragging) return;
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    
    if (dropTarget && !isReordering) {
      onPlay(dragging, dropTarget);
    } else if (isReordering && reorderTarget !== null && onReorderTiles) {
      const currentIndex = tiles.findIndex(t => t.id === dragging.id);
      if (currentIndex !== -1 && currentIndex !== reorderTarget) {
        const newTiles = [...tiles];
        const [removed] = newTiles.splice(currentIndex, 1);
        const insertAt = reorderTarget > currentIndex ? reorderTarget - 1 : reorderTarget;
        newTiles.splice(insertAt, 0, removed);
        onReorderTiles(newTiles);
      }
    }
    
    setDragging(null);
    setDragPos({ x: 0, y: 0 });
    setDropTarget(null);
    setIsReordering(false);
    setReorderTarget(null);
    setDragOffset({ x: 0, y: 0 });
  }, [dragging, dropTarget, isReordering, reorderTarget, tiles, onPlay, onReorderTiles]);
  
  // Listeners globales
  useEffect(() => {
    if (!dragging) return;
    
    const moveHandler = (e) => handleDragMove(e);
    const endHandler = () => handleDragEnd();
    
    window.addEventListener('touchmove', moveHandler, { passive: false, capture: true });
    window.addEventListener('touchend', endHandler, { capture: true });
    window.addEventListener('touchcancel', endHandler, { capture: true });
    window.addEventListener('mousemove', moveHandler, { capture: true });
    window.addEventListener('mouseup', endHandler, { capture: true });
    
    return () => {
      window.removeEventListener('touchmove', moveHandler, { capture: true });
      window.removeEventListener('touchend', endHandler, { capture: true });
      window.removeEventListener('touchcancel', endHandler, { capture: true });
      window.removeEventListener('mousemove', moveHandler, { capture: true });
      window.removeEventListener('mouseup', endHandler, { capture: true });
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [dragging, handleDragMove, handleDragEnd]);

  return (
    <>
      {/* Zonas de drop en el tablero */}
      {dragging && boardRect && snakePositions && (
        <>
          {getPlayablePositions(dragging).includes('center') && snakePositions.center && (
            <DropZone 
              position={snakePositions.center} 
              type="center" 
              value="🎯" 
              boardRect={boardRect}
              isActive={dropTarget === 'center'}
            />
          )}
          {getPlayablePositions(dragging).includes('left') && snakePositions.top && (
            <DropZone 
              position={snakePositions.top} 
              type="left" 
              value={ends.left} 
              boardRect={boardRect}
              isActive={dropTarget === 'left'}
            />
          )}
          {getPlayablePositions(dragging).includes('right') && snakePositions.bottom && (
            <DropZone 
              position={snakePositions.bottom} 
              type="right" 
              value={ends.right} 
              boardRect={boardRect}
              isActive={dropTarget === 'right'}
            />
          )}
        </>
      )}
      
      {/* Ficha siendo arrastrada */}
      <DraggingTile 
        tile={dragging}
        dragPos={dragPos}
        dropTarget={dropTarget}
        tileWidth={tileWidth}
        tileHeight={tileHeight}
      />
      
      {/* Mano del jugador */}
      <div style={{
        flexShrink: 0,
        padding: '4px 4px 6px',
        marginTop: 8,
        background: C.bg.surface,
        borderTop: `1px solid ${C.bg.border}`
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8
        }}>
          <div 
            id="player-hand-tiles"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 6,
              overflowX: 'auto',
              padding: 0,
              margin: 0
            }}
          >
            {tiles.map((tile, index) => {
              const isDragging = dragging?.id === tile.id;
              const showInsertBefore = isReordering && reorderTarget === index;
              const playable = isPlayable(tile);
              const isMust = mustPlay?.id === tile.id;
              
              return (
                <React.Fragment key={tile.id}>
                  {showInsertBefore && <InsertIndicator height={tileHeight} />}
                  <HandTile
                    tile={tile}
                    index={index}
                    isDragging={isDragging}
                    isPlayable={playable}
                    isMust={isMust}
                    tileWidth={tileWidth}
                    tileHeight={tileHeight}
                    onDragStart={handleDragStart}
                    tileRef={el => tilesRef.current[index] = el}
                  />
                </React.Fragment>
              );
            })}
            {isReordering && reorderTarget === tiles.length && (
              <InsertIndicator height={tileHeight} />
            )}
          </div>
          
          {/* Avatar del jugador */}
          {player && (
            <button
              onClick={() => onAvatarClick?.(player)}
              className="touch-feedback"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${player.team === 0 ? C.accent.blue : C.accent.red}, ${player.team === 0 ? '#1d4ed8' : '#b91c1c'})`,
                border: `2px solid ${player.team === 0 ? '#60a5fa' : '#f87171'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                flexShrink: 0
              }}
            >
              {player.avatar}
            </button>
          )}
        </div>
      </div>
    </>
  );
});

PlayerHandArea.displayName = 'PlayerHandArea';

export default PlayerHandArea;
