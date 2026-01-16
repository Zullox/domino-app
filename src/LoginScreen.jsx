// ============================================================================
// PANTALLA DE LOGIN - DOMINÓ CUBANO
// ============================================================================
// Diseño móvil-first con soporte para Google, Apple y Email

import React, { useState } from 'react';
import { useAuth } from './AuthContext';

// Colores del tema
const COLORS = {
  bg: '#0f1419',
  card: '#1a2332',
  primary: '#10b981',
  secondary: '#3b82f6',
  accent: '#f59e0b',
  text: '#e2e8f0',
  textMuted: '#94a3b8',
  error: '#ef4444',
  google: '#ea4335',
  apple: '#ffffff',
  border: '#2d3748'
};

// Iconos SVG inline
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

const EmailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

// Componente principal
const LoginScreen = ({ onClose, onSuccess }) => {
  const { 
    loginWithGoogle, 
    loginWithApple, 
    loginWithEmail, 
    register, 
    forgotPassword,
    playAsGuest,
    loading, 
    error,
    clearError
  } = useAuth();
  
  const [mode, setMode] = useState('main'); // 'main', 'email', 'register', 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Limpiar errores al cambiar de modo
  const switchMode = (newMode) => {
    setMode(newMode);
    setLocalError('');
    setSuccessMessage('');
    clearError();
  };
  
  // Handlers
  const handleGoogleLogin = async () => {
    const result = await loginWithGoogle();
    if (result.success) {
      onSuccess?.(result.user);
    }
  };
  
  const handleAppleLogin = async () => {
    const result = await loginWithApple();
    if (result.success) {
      onSuccess?.(result.user);
    }
  };
  
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (!email || !password) {
      setLocalError('Completa todos los campos');
      return;
    }
    
    const result = await loginWithEmail(email, password);
    if (result.success) {
      onSuccess?.(result.user);
    } else {
      setLocalError(result.error);
    }
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (!email || !password || !displayName) {
      setLocalError('Completa todos los campos');
      return;
    }
    
    if (password !== confirmPassword) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }
    
    if (password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    const result = await register(email, password, displayName);
    if (result.success) {
      onSuccess?.(result.user);
    } else {
      setLocalError(result.error);
    }
  };
  
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (!email) {
      setLocalError('Ingresa tu email');
      return;
    }
    
    const result = await forgotPassword(email);
    if (result.success) {
      setSuccessMessage('Se envió un email para restablecer tu contraseña');
    } else {
      setLocalError(result.error);
    }
  };
  
  const handlePlayAsGuest = () => {
    const result = playAsGuest();
    if (result.success) {
      onSuccess?.(result.user);
    }
  };
  
  // Estilos
  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: 16
    },
    container: {
      width: '100%',
      maxWidth: 400,
      background: COLORS.card,
      borderRadius: 16,
      padding: 24,
      position: 'relative',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: 24
    },
    logo: {
      fontSize: 48,
      marginBottom: 8
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: COLORS.text,
      margin: 0
    },
    subtitle: {
      fontSize: 14,
      color: COLORS.textMuted,
      margin: '8px 0 0'
    },
    backButton: {
      position: 'absolute',
      top: 16,
      left: 16,
      background: 'transparent',
      border: 'none',
      color: COLORS.textMuted,
      cursor: 'pointer',
      padding: 8,
      borderRadius: 8,
      display: 'flex',
      alignItems: 'center',
      gap: 4
    },
    closeButton: {
      position: 'absolute',
      top: 16,
      right: 16,
      background: 'transparent',
      border: 'none',
      color: COLORS.textMuted,
      cursor: 'pointer',
      fontSize: 24,
      padding: 8,
      lineHeight: 1
    },
    socialButton: {
      width: '100%',
      padding: '14px 16px',
      borderRadius: 12,
      border: `1px solid ${COLORS.border}`,
      background: COLORS.bg,
      color: COLORS.text,
      fontSize: 16,
      fontWeight: 500,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      marginBottom: 12,
      transition: 'all 0.2s'
    },
    googleButton: {
      background: '#fff',
      color: '#333'
    },
    appleButton: {
      background: '#000',
      color: '#fff'
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      margin: '20px 0',
      color: COLORS.textMuted,
      fontSize: 14
    },
    dividerLine: {
      flex: 1,
      height: 1,
      background: COLORS.border
    },
    dividerText: {
      padding: '0 16px'
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      borderRadius: 12,
      border: `1px solid ${COLORS.border}`,
      background: COLORS.bg,
      color: COLORS.text,
      fontSize: 16,
      marginBottom: 12,
      outline: 'none',
      boxSizing: 'border-box'
    },
    submitButton: {
      width: '100%',
      padding: '14px 16px',
      borderRadius: 12,
      border: 'none',
      background: COLORS.primary,
      color: '#fff',
      fontSize: 16,
      fontWeight: 600,
      cursor: 'pointer',
      marginTop: 8
    },
    guestButton: {
      width: '100%',
      padding: '14px 16px',
      borderRadius: 12,
      border: `1px solid ${COLORS.border}`,
      background: 'transparent',
      color: COLORS.textMuted,
      fontSize: 16,
      cursor: 'pointer',
      marginTop: 16
    },
    link: {
      color: COLORS.primary,
      cursor: 'pointer',
      textDecoration: 'none'
    },
    error: {
      background: `${COLORS.error}20`,
      border: `1px solid ${COLORS.error}`,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      color: COLORS.error,
      fontSize: 14,
      textAlign: 'center'
    },
    success: {
      background: `${COLORS.primary}20`,
      border: `1px solid ${COLORS.primary}`,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      color: COLORS.primary,
      fontSize: 14,
      textAlign: 'center'
    },
    footer: {
      textAlign: 'center',
      marginTop: 20,
      color: COLORS.textMuted,
      fontSize: 14
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
      zIndex: 10
    },
    spinner: {
      width: 40,
      height: 40,
      border: '3px solid rgba(255,255,255,0.3)',
      borderTopColor: COLORS.primary,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }
  };
  
  // Renderizar contenido según el modo
  const renderContent = () => {
    switch (mode) {
      case 'email':
        return (
          <>
            <button style={styles.backButton} onClick={() => switchMode('main')}>
              <BackIcon /> Volver
            </button>
            
            <div style={styles.header}>
              <div style={styles.logo}>🎲</div>
              <h2 style={styles.title}>Iniciar Sesión</h2>
              <p style={styles.subtitle}>Ingresa con tu email</p>
            </div>
            
            {(localError || error) && (
              <div style={styles.error}>{localError || error}</div>
            )}
            
            <form onSubmit={handleEmailLogin}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                autoComplete="email"
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                autoComplete="current-password"
              />
              <button type="submit" style={styles.submitButton} disabled={loading}>
                Iniciar Sesión
              </button>
            </form>
            
            <div style={styles.footer}>
              <p>
                <span style={styles.link} onClick={() => switchMode('forgot')}>
                  ¿Olvidaste tu contraseña?
                </span>
              </p>
              <p>
                ¿No tienes cuenta?{' '}
                <span style={styles.link} onClick={() => switchMode('register')}>
                  Regístrate
                </span>
              </p>
            </div>
          </>
        );
        
      case 'register':
        return (
          <>
            <button style={styles.backButton} onClick={() => switchMode('main')}>
              <BackIcon /> Volver
            </button>
            
            <div style={styles.header}>
              <div style={styles.logo}>🎲</div>
              <h2 style={styles.title}>Crear Cuenta</h2>
              <p style={styles.subtitle}>Únete a Dominó Cubano</p>
            </div>
            
            {(localError || error) && (
              <div style={styles.error}>{localError || error}</div>
            )}
            
            <form onSubmit={handleRegister}>
              <input
                type="text"
                placeholder="Nombre de jugador"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={styles.input}
                autoComplete="name"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                autoComplete="email"
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                autoComplete="new-password"
              />
              <input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
                autoComplete="new-password"
              />
              <button type="submit" style={styles.submitButton} disabled={loading}>
                Crear Cuenta
              </button>
            </form>
            
            <div style={styles.footer}>
              <p>
                ¿Ya tienes cuenta?{' '}
                <span style={styles.link} onClick={() => switchMode('email')}>
                  Inicia sesión
                </span>
              </p>
            </div>
          </>
        );
        
      case 'forgot':
        return (
          <>
            <button style={styles.backButton} onClick={() => switchMode('email')}>
              <BackIcon /> Volver
            </button>
            
            <div style={styles.header}>
              <div style={styles.logo}>🔑</div>
              <h2 style={styles.title}>Recuperar Contraseña</h2>
              <p style={styles.subtitle}>Te enviaremos un email</p>
            </div>
            
            {successMessage && (
              <div style={styles.success}>{successMessage}</div>
            )}
            
            {(localError || error) && (
              <div style={styles.error}>{localError || error}</div>
            )}
            
            <form onSubmit={handleForgotPassword}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                autoComplete="email"
              />
              <button type="submit" style={styles.submitButton} disabled={loading}>
                Enviar Email
              </button>
            </form>
          </>
        );
        
      default: // 'main'
        return (
          <>
            {onClose && (
              <button style={styles.closeButton} onClick={onClose}>×</button>
            )}
            
            <div style={styles.header}>
              <div style={styles.logo}>🎲</div>
              <h2 style={styles.title}>Dominó Cubano</h2>
              <p style={styles.subtitle}>Inicia sesión para guardar tu progreso</p>
            </div>
            
            {(localError || error) && (
              <div style={styles.error}>{localError || error}</div>
            )}
            
            {/* Google */}
            <button 
              style={{...styles.socialButton, ...styles.googleButton}}
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <GoogleIcon />
              Continuar con Google
            </button>
            
            {/* Apple */}
            <button 
              style={{...styles.socialButton, ...styles.appleButton}}
              onClick={handleAppleLogin}
              disabled={loading}
            >
              <AppleIcon />
              Continuar con Apple
            </button>
            
            {/* Divider */}
            <div style={styles.divider}>
              <div style={styles.dividerLine}></div>
              <span style={styles.dividerText}>o</span>
              <div style={styles.dividerLine}></div>
            </div>
            
            {/* Email */}
            <button 
              style={styles.socialButton}
              onClick={() => switchMode('email')}
              disabled={loading}
            >
              <EmailIcon />
              Continuar con Email
            </button>
            
            {/* Guest */}
            <button 
              style={styles.guestButton}
              onClick={handlePlayAsGuest}
              disabled={loading}
            >
              Jugar como Invitado
            </button>
            
            <div style={styles.footer}>
              <p style={{ fontSize: 12, color: COLORS.textMuted }}>
                Al continuar, aceptas nuestros términos de servicio
              </p>
            </div>
          </>
        );
    }
  };
  
  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        {renderContent()}
        
        {loading && (
          <div style={styles.loadingOverlay}>
            <div style={styles.spinner}></div>
          </div>
        )}
      </div>
      
      {/* CSS para animación de spinner */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;
