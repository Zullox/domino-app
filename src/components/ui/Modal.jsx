// ============================================================================
// COMPONENTE: MODAL
// ============================================================================
import React, { memo, useEffect } from 'react';

const Modal = memo(({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
  closeOnOverlay = true,
  footer,
  style = {}
}) => {
  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: { width: '90%', maxWidth: 320 },
    md: { width: '90%', maxWidth: 420 },
    lg: { width: '95%', maxWidth: 600 },
    full: { width: '100%', maxWidth: '100%', height: '100%', borderRadius: 0 }
  };

  const sizeStyle = sizes[size] || sizes.md;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: size === 'full' ? 0 : 20,
        backdropFilter: 'blur(4px)'
      }}
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div
        style={{
          background: '#12121a',
          borderRadius: size === 'full' ? 0 : 20,
          border: size === 'full' ? 'none' : '1px solid #2a2a3a',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: size === 'full' ? '100%' : '90vh',
          ...sizeStyle,
          ...style
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showClose) && (
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #2a2a3a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}>
            <h2 style={{ 
              color: '#ffffff', 
              fontSize: 18, 
              fontWeight: 700,
              margin: 0
            }}>
              {title}
            </h2>
            {showClose && (
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#606070',
                  fontSize: 24,
                  cursor: 'pointer',
                  padding: 4,
                  lineHeight: 1
                }}
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div style={{
          padding: 20,
          flex: 1,
          overflowY: 'auto'
        }}>
          {children}
        </div>

        {/* Footer opcional */}
        {footer && (
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid #2a2a3a',
            display: 'flex',
            gap: 10,
            justifyContent: 'flex-end',
            flexShrink: 0
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';

export default Modal;
