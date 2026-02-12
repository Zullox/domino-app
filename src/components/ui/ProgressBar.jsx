// ============================================================================
// COMPONENTE: PROGRESS BAR
// ============================================================================
import React, { memo } from 'react';

const ProgressBar = memo(({
  value = 0,
  max = 100,
  height = 8,
  color = '#F59E0B',
  bgColor = '#2a2a3a',
  showLabel = false,
  labelPosition = 'right',
  animated = false,
  gradient = false,
  gradientColors = ['#F59E0B', '#EF4444'],
  style = {}
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const fillColor = gradient 
    ? `linear-gradient(90deg, ${gradientColors.join(', ')})`
    : color;
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', ...style }}>
      {showLabel && labelPosition === 'left' && (
        <span style={{ color: '#a0a0b0', fontSize: 12, fontWeight: 600, minWidth: 40 }}>
          {Math.round(percentage)}%
        </span>
      )}
      
      <div style={{
        flex: 1,
        height,
        background: bgColor,
        borderRadius: height / 2,
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          background: fillColor,
          borderRadius: height / 2,
          transition: 'width 300ms ease-out',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {animated && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: 'shimmer 2s infinite'
            }} />
          )}
        </div>
      </div>
      
      {showLabel && labelPosition === 'right' && (
        <span style={{ color: '#a0a0b0', fontSize: 12, fontWeight: 600, minWidth: 40 }}>
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
