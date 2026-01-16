// ============================================================================
// COMPONENTE: FICHA DE DOMINÓ
// ============================================================================
import React, { memo } from 'react';

// Patrones de puntos para cada valor
const DOT_PATTERNS = {
  0: [],
  1: [[0.5, 0.5]],
  2: [[0.25, 0.25], [0.75, 0.75]],
  3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
  4: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]],
  5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
  6: [[0.25, 0.2], [0.75, 0.2], [0.25, 0.5], [0.75, 0.5], [0.25, 0.8], [0.75, 0.8]]
};

// Componente de puntos
const DotPattern = memo(({ value, size, color = '#1a1a2e' }) => {
  const dots = DOT_PATTERNS[value] || [];
  const dotSize = size * 0.15;
  
  return (
    <>
      {dots.map(([x, y], i) => (
        <circle
          key={i}
          cx={x * size}
          cy={y * size}
          r={dotSize}
          fill={color}
        />
      ))}
    </>
  );
});

// Componente de ficha
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
  const isDouble = left === right;
  
  // Dimensiones
  const width = horizontal ? size * 2 : size;
  const height = horizontal ? size : size * 2;
  const halfSize = size;
  
  // Colores según skin
  const colors = {
    classic: { bg: '#f5f5dc', border: '#8b7355', dot: '#1a1a2e', divider: '#8b7355' },
    obsidian: { bg: '#1a1a2e', border: '#4a4a6a', dot: '#ffffff', divider: '#4a4a6a' },
    jade: { bg: '#2d5a4a', border: '#1a3a2a', dot: '#ffffff', divider: '#1a3a2a' },
    gold: { bg: '#ffd700', border: '#b8860b', dot: '#1a1a2e', divider: '#b8860b' }
  };
  
  const c = colors[skinSet] || colors.classic;
  
  // Estilos de selección/jugable
  const borderColor = selected ? '#FBBF24' : playable ? '#10B981' : c.border;
  const boxShadow = selected 
    ? '0 0 20px rgba(251, 191, 36, 0.6)' 
    : playable 
      ? '0 0 10px rgba(16, 185, 129, 0.4)'
      : '0 4px 8px rgba(0,0,0,0.3)';
  
  return (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        width,
        height,
        cursor: disabled ? 'not-allowed' : onClick ? 'pointer' : 'default',
        opacity: disabled ? 0.5 : 1,
        transform: selected ? 'scale(1.1) translateY(-5px)' : 'scale(1)',
        transition: 'transform 150ms ease-out, box-shadow 150ms ease-out',
        boxShadow,
        borderRadius: 8,
        ...style
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: 'block' }}
      >
        {/* Fondo de la ficha */}
        <rect
          x={1}
          y={1}
          width={width - 2}
          height={height - 2}
          rx={6}
          ry={6}
          fill={c.bg}
          stroke={borderColor}
          strokeWidth={2}
        />
        
        {/* Primera mitad (left) */}
        <g transform={horizontal ? '' : ''}>
          <DotPattern 
            value={left} 
            size={halfSize} 
            color={c.dot}
          />
        </g>
        
        {/* Línea divisoria */}
        {horizontal ? (
          <line
            x1={halfSize}
            y1={4}
            x2={halfSize}
            y2={height - 4}
            stroke={c.divider}
            strokeWidth={2}
          />
        ) : (
          <line
            x1={4}
            y1={halfSize}
            x2={width - 4}
            y2={halfSize}
            stroke={c.divider}
            strokeWidth={2}
          />
        )}
        
        {/* Segunda mitad (right) */}
        <g transform={horizontal ? `translate(${halfSize}, 0)` : `translate(0, ${halfSize})`}>
          <DotPattern 
            value={right} 
            size={halfSize} 
            color={c.dot}
          />
        </g>
        
        {/* Efecto de brillo */}
        <rect
          x={3}
          y={3}
          width={width * 0.4}
          height={4}
          rx={2}
          fill="rgba(255,255,255,0.3)"
        />
      </svg>
    </div>
  );
});

Tile.displayName = 'Tile';

export default Tile;
