// ============================================================================
// COMPONENTES DE FICHA DE DOMINÓ CUBANO (Doble 9)
// ============================================================================
import React, { memo } from 'react';
import { getSkinSet, getTileImage } from '../../constants/cosmetics';

// ============================================================================
// CONFIGURACIÓN DE PUNTOS - Cuadrícula 3x3 para Doble 9
// ============================================================================

// Posiciones base en viewBox 100x100
const DOT_GRID = {
  topLeft: [20, 20],
  topCenter: [50, 20],
  topRight: [80, 20],
  midLeft: [20, 50],
  midCenter: [50, 50],
  midRight: [80, 50],
  botLeft: [20, 80],
  botCenter: [50, 80],
  botRight: [80, 80]
};

// Patrón de puntos para cada número (0-9)
const DOT_POSITIONS = {
  0: [],
  1: [DOT_GRID.midCenter],
  2: [DOT_GRID.topRight, DOT_GRID.botLeft],
  3: [DOT_GRID.topRight, DOT_GRID.midCenter, DOT_GRID.botLeft],
  4: [DOT_GRID.topLeft, DOT_GRID.topRight, DOT_GRID.botLeft, DOT_GRID.botRight],
  5: [DOT_GRID.topLeft, DOT_GRID.topRight, DOT_GRID.midCenter, DOT_GRID.botLeft, DOT_GRID.botRight],
  6: [DOT_GRID.topLeft, DOT_GRID.topRight, DOT_GRID.midLeft, DOT_GRID.midRight, DOT_GRID.botLeft, DOT_GRID.botRight],
  7: [DOT_GRID.topLeft, DOT_GRID.topRight, DOT_GRID.midLeft, DOT_GRID.midCenter, DOT_GRID.midRight, DOT_GRID.botLeft, DOT_GRID.botRight],
  8: [DOT_GRID.topLeft, DOT_GRID.topCenter, DOT_GRID.topRight, DOT_GRID.midLeft, DOT_GRID.midRight, DOT_GRID.botLeft, DOT_GRID.botCenter, DOT_GRID.botRight],
  9: [DOT_GRID.topLeft, DOT_GRID.topCenter, DOT_GRID.topRight, DOT_GRID.midLeft, DOT_GRID.midCenter, DOT_GRID.midRight, DOT_GRID.botLeft, DOT_GRID.botCenter, DOT_GRID.botRight]
};

// ============================================================================
// COMPONENTE: Dots - Puntos del dominó con sombra
// ============================================================================
export const Dots = memo(({ num, color = '#1a1a1a', glowColor = null }) => {
  const positions = DOT_POSITIONS[num] || [];
  
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
      {/* Sombra sutil de los puntos */}
      {positions.map((p, i) => (
        <circle 
          key={`shadow-${i}`} 
          cx={p[0] + 1} 
          cy={p[1] + 1} 
          r={9} 
          fill="rgba(0,0,0,0.15)" 
        />
      ))}
      {/* Puntos principales */}
      {positions.map((p, i) => (
        <circle 
          key={i} 
          cx={p[0]} 
          cy={p[1]} 
          r={8} 
          fill={color}
          style={{ 
            filter: glowColor 
              ? `drop-shadow(0 0 3px ${glowColor}) drop-shadow(0 0 6px ${glowColor})`
              : 'drop-shadow(0 0 1px rgba(0,0,0,0.3))' 
          }} 
        />
      ))}
    </svg>
  );
});

Dots.displayName = 'Dots';

// ============================================================================
// COMPONENTE: DotPattern - Versión simplificada con SVG
// ============================================================================
export const DotPattern = memo(({ num, size = 20, color, rotate = false }) => {
  const positions = DOT_POSITIONS[num] || [];
  const dotRadius = 8;
  const dotColor = color || '#1a1a1a';
  
  return (
    <svg 
      viewBox="0 0 100 100" 
      style={{ 
        width: '100%', 
        height: '100%',
        display: 'block',
        transform: rotate ? 'rotate(90deg)' : 'none'
      }}
    >
      {positions.map((p, i) => (
        <g key={i}>
          <circle cx={p[0] + 1} cy={p[1] + 1} r={dotRadius + 1} fill="rgba(0,0,0,0.15)" />
          <circle cx={p[0]} cy={p[1]} r={dotRadius} fill={dotColor} />
        </g>
      ))}
    </svg>
  );
});

DotPattern.displayName = 'DotPattern';

// ============================================================================
// COMPONENTE: TileH - Ficha Horizontal (para tablero)
// ============================================================================
export const TileH = memo(({ 
  leftNum, 
  rightNum, 
  isSelected = false, 
  isPlayable = false, 
  isMust = false,
  skinSetId = 'classic'
}) => {
  const skinSet = getSkinSet(skinSetId);
  const tileConfig = skinSet.tile;
  
  return (
    <div style={{ 
      width: 48, 
      height: 24, 
      backgroundColor: isSelected ? '#FFD700' : (tileConfig.base || '#FFFFF0'),
      boxShadow: isSelected 
        ? '0 4px 12px rgba(255,215,0,0.5)'
        : isMust 
          ? '0 0 10px rgba(239,68,68,0.5)'
          : '2px 2px 6px rgba(0,0,0,0.3)',
      border: isSelected 
        ? '2px solid #B8860B' 
        : isMust 
          ? '2px solid #EF4444'
          : isPlayable 
            ? '2px solid #22C55E'
            : `2px solid ${tileConfig.border || '#8B7355'}`, 
      display: 'flex',
      borderRadius: 4
    }}>
      <div style={{ 
        flex: 1, 
        padding: 2, 
        borderRight: `2px solid ${tileConfig.divider || '#A0522D'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Dots num={leftNum} color={tileConfig.dotColor || '#1a1a1a'} />
      </div>
      <div style={{ 
        flex: 1, 
        padding: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Dots num={rightNum} color={tileConfig.dotColor || '#1a1a1a'} />
      </div>
    </div>
  );
});

TileH.displayName = 'TileH';

// ============================================================================
// COMPONENTE: TileV - Ficha Vertical (para mano del jugador)
// ============================================================================
export const TileV = memo(({ 
  topNum, 
  bottomNum, 
  isSelected = false, 
  isPlayable = false, 
  isMust = false, 
  size = 'normal', 
  skinSetId = 'classic',
  onClick
}) => {
  const skinSet = getSkinSet(skinSetId);
  const tileConfig = skinSet.tile;
  const tileImage = getTileImage(skinSetId);
  
  // Tamaños adaptativos para móvil
  const sizes = {
    small: { w: 28, h: 56 },
    normal: { w: 36, h: 72 },
    large: { w: 44, h: 88 }
  };
  const { w, h } = sizes[size] || sizes.normal;
  
  // Determinar fondo según tipo de skin
  const backgroundStyle = (tileImage && skinSet.type === 'png')
    ? { backgroundImage: `url(${tileConfig.png})`, backgroundSize: 'cover' }
    : { backgroundColor: isSelected ? '#FFD700' : (tileConfig.base || '#FFFFF0') };
  
  return (
    <div 
      className="touch-feedback"
      onClick={onClick}
      style={{ 
        width: w, 
        height: h,
        minWidth: w,
        minHeight: h,
        ...backgroundStyle,
        boxShadow: isSelected 
          ? '0 6px 20px rgba(255,215,0,0.6)'
          : isMust 
            ? '0 0 15px rgba(239,68,68,0.6)'
            : '2px 2px 8px rgba(0,0,0,0.3)',
        border: isSelected 
          ? '3px solid #B8860B' 
          : isMust 
            ? '3px solid #EF4444'
            : isPlayable 
              ? '3px solid #22C55E'
              : `2px solid ${tileConfig.border || '#8B7355'}`, 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 6,
        transform: isSelected ? 'scale(1.1) translateY(-8px)' : 'none',
        zIndex: isSelected ? 10 : 1,
        transition: 'transform 0.15s ease',
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      <div style={{ 
        flex: 1, 
        padding: 4, 
        borderBottom: `2px solid ${tileConfig.divider || '#A0522D'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Dots num={topNum} color={tileConfig.dotColor || '#1a1a1a'} />
      </div>
      <div style={{ 
        flex: 1, 
        padding: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Dots num={bottomNum} color={tileConfig.dotColor || '#1a1a1a'} />
      </div>
    </div>
  );
});

TileV.displayName = 'TileV';

// ============================================================================
// COMPONENTE: Doble9Icon - Icono/Logo del juego
// ============================================================================
export const Doble9Icon = memo(({ size = 60, animate = false }) => {
  const dotPositions = DOT_POSITIONS[9];
  const dotRadius = 4;
  const dotColor = '#1a1a1a';
  
  return (
    <div style={{
      width: size,
      height: size * 2,
      background: 'linear-gradient(180deg, #f5f5f0 0%, #e8e8e0 50%, #d4d4cc 100%)',
      borderRadius: size * 0.12,
      border: '2px solid #8b7355',
      boxShadow: '0 4px 15px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.8)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      animation: animate ? 'float-gpu 3s ease-in-out infinite' : 'none'
    }}>
      {/* Mitad superior - 9 */}
      <div style={{ flex: 1, borderBottom: '2px solid #b8a88a', padding: 2 }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
          {dotPositions.map((p, i) => (
            <g key={`top-${i}`}>
              <circle cx={p[0] + 1} cy={p[1] + 1} r={dotRadius + 1} fill="rgba(0,0,0,0.15)" />
              <circle cx={p[0]} cy={p[1]} r={dotRadius} fill={dotColor} />
            </g>
          ))}
        </svg>
      </div>
      {/* Mitad inferior - 9 */}
      <div style={{ flex: 1, padding: 2 }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
          {dotPositions.map((p, i) => (
            <g key={`bot-${i}`}>
              <circle cx={p[0] + 1} cy={p[1] + 1} r={dotRadius + 1} fill="rgba(0,0,0,0.15)" />
              <circle cx={p[0]} cy={p[1]} r={dotRadius} fill={dotColor} />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
});

Doble9Icon.displayName = 'Doble9Icon';

// ============================================================================
// COMPONENTE PRINCIPAL: Tile - Compatible con API anterior
// ============================================================================
const Tile = memo(({ 
  tile, 
  size = 60, 
  horizontal = false,
  selected = false,
  playable = false,
  disabled = false,
  onClick,
  style = {},
  skinSet = 'classic'
}) => {
  const { left, right } = tile;
  
  if (horizontal) {
    return (
      <div style={{ opacity: disabled ? 0.5 : 1, ...style }} onClick={disabled ? undefined : onClick}>
        <TileH 
          leftNum={left} 
          rightNum={right} 
          isSelected={selected} 
          isPlayable={playable}
          skinSetId={skinSet}
        />
      </div>
    );
  }
  
  return (
    <div style={{ opacity: disabled ? 0.5 : 1, ...style }}>
      <TileV 
        topNum={left} 
        bottomNum={right} 
        isSelected={selected} 
        isPlayable={playable}
        skinSetId={skinSet}
        onClick={disabled ? undefined : onClick}
        size={size <= 40 ? 'small' : size >= 70 ? 'large' : 'normal'}
      />
    </div>
  );
});

Tile.displayName = 'Tile';

// ============================================================================
// EXPORTACIONES
// ============================================================================
export { DOT_GRID, DOT_POSITIONS };
export default Tile;
