// ============================================================================
// COMPONENTE: BUTTON
// ============================================================================
import React, { memo } from 'react';

const VARIANTS = {
  primary: {
    background: 'linear-gradient(135deg, #D97706, #F59E0B)',
    color: '#0a0a0f',
    border: 'none'
  },
  secondary: {
    background: '#1a1a24',
    color: '#ffffff',
    border: '1px solid #2a2a3a'
  },
  success: {
    background: 'linear-gradient(135deg, #059669, #10B981)',
    color: '#ffffff',
    border: 'none'
  },
  danger: {
    background: 'linear-gradient(135deg, #DC2626, #EF4444)',
    color: '#ffffff',
    border: 'none'
  },
  ghost: {
    background: 'transparent',
    color: '#a0a0b0',
    border: '1px solid #2a2a3a'
  }
};

const SIZES = {
  sm: { padding: '8px 16px', fontSize: 13, borderRadius: 8 },
  md: { padding: '12px 20px', fontSize: 14, borderRadius: 12 },
  lg: { padding: '16px 24px', fontSize: 16, borderRadius: 14 },
  xl: { padding: '20px 32px', fontSize: 18, borderRadius: 16 }
};

const Button = memo(({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  iconRight,
  onClick,
  style = {},
  ...props
}) => {
  const variantStyles = VARIANTS[variant] || VARIANTS.primary;
  const sizeStyles = SIZES[size] || SIZES.md;

  return (
    <button
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      style={{
        ...variantStyles,
        ...sizeStyles,
        width: fullWidth ? '100%' : 'auto',
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'transform 150ms ease, opacity 150ms ease',
        ...style
      }}
      {...props}
    >
      {loading ? (
        <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
      ) : (
        <>
          {icon && <span style={{ fontSize: sizeStyles.fontSize + 4 }}>{icon}</span>}
          {children}
          {iconRight && <span style={{ fontSize: sizeStyles.fontSize + 4 }}>{iconRight}</span>}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
