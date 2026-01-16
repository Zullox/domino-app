// ============================================================================
// COMPONENTE: BADGE
// ============================================================================
import React, { memo } from 'react';

const PRESETS = {
  // Rangos
  bronze: { bg: 'linear-gradient(135deg, #cd7f32, #8b4513)', color: '#fff' },
  silver: { bg: 'linear-gradient(135deg, #c0c0c0, #808080)', color: '#000' },
  gold: { bg: 'linear-gradient(135deg, #ffd700, #daa520)', color: '#000' },
  platinum: { bg: 'linear-gradient(135deg, #00d4aa, #008b8b)', color: '#fff' },
  diamond: { bg: 'linear-gradient(135deg, #b9f2ff, #00bfff)', color: '#000' },
  master: { bg: 'linear-gradient(135deg, #9932cc, #8b008b)', color: '#fff' },
  grandmaster: { bg: 'linear-gradient(135deg, #ff4500, #dc143c)', color: '#fff' },
  legend: { bg: 'linear-gradient(135deg, #ffd700, #ff4500)', color: '#000' },
  
  // Estados
  success: { bg: '#10B981', color: '#fff' },
  warning: { bg: '#F59E0B', color: '#000' },
  danger: { bg: '#EF4444', color: '#fff' },
  info: { bg: '#3B82F6', color: '#fff' },
  
  // Rarezas
  common: { bg: '#6b7280', color: '#fff' },
  uncommon: { bg: '#22c55e', color: '#fff' },
  rare: { bg: '#3b82f6', color: '#fff' },
  epic: { bg: '#a855f7', color: '#fff' },
  legendary: { bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#000' }
};

const Badge = memo(({
  children,
  preset,
  icon,
  size = 'md',
  pill = true,
  glow = false,
  style = {}
}) => {
  const presetStyle = PRESETS[preset] || {};
  
  const sizes = {
    xs: { padding: '2px 6px', fontSize: 10 },
    sm: { padding: '4px 8px', fontSize: 11 },
    md: { padding: '6px 12px', fontSize: 12 },
    lg: { padding: '8px 16px', fontSize: 14 }
  };
  
  const sizeStyle = sizes[size] || sizes.md;
  
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: presetStyle.bg || '#2a2a3a',
        color: presetStyle.color || '#fff',
        borderRadius: pill ? 20 : 6,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        boxShadow: glow ? `0 0 12px ${presetStyle.bg || '#3B82F6'}40` : 'none',
        ...sizeStyle,
        ...style
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

export default Badge;
