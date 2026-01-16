// ============================================================================
// COMPONENTE: CARD
// ============================================================================
import React, { memo } from 'react';

const Card = memo(({
  children,
  title,
  subtitle,
  icon,
  headerAction,
  padding = 16,
  gradient = false,
  gradientColors = ['#D97706', '#F59E0B'],
  onClick,
  style = {},
  bodyStyle = {},
  ...props
}) => {
  const baseStyles = {
    background: gradient 
      ? `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`
      : '#1a1a24',
    borderRadius: 16,
    border: gradient ? 'none' : '1px solid #2a2a3a',
    overflow: 'hidden',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'transform 150ms ease, box-shadow 150ms ease',
    ...style
  };

  return (
    <div 
      onClick={onClick}
      style={baseStyles}
      {...props}
    >
      {/* Header opcional */}
      {(title || icon) && (
        <div style={{
          padding: `${padding}px ${padding}px ${title ? '12px' : padding + 'px'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: title ? '1px solid #2a2a3a' : 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
            <div>
              {title && (
                <h3 style={{ 
                  color: gradient ? '#0a0a0f' : '#ffffff', 
                  fontSize: 14, 
                  fontWeight: 700,
                  margin: 0
                }}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p style={{ 
                  color: gradient ? 'rgba(0,0,0,0.6)' : '#606070', 
                  fontSize: 11, 
                  margin: '2px 0 0'
                }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {headerAction && headerAction}
        </div>
      )}
      
      {/* Body */}
      <div style={{ padding, ...bodyStyle }}>
        {children}
      </div>
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
