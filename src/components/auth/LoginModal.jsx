// ============================================================================
// LOGIN MODAL - Modal de autenticación multi-proveedor
// ============================================================================
// Migrado de DominoR.jsx líneas 14003-14427
// Soporta: Google, Apple, Email/Password, Invitado
// ============================================================================

import React, { memo, useState } from 'react';
import { THEME } from '../../constants/game';

// ============================================================================
// ESTILOS DEL MODAL
// ============================================================================
const createStyles = (C) => ({
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
    maxWidth: 380,
    background: C.surface || '#1e1e2e',
    borderRadius: 16,
    padding: 24,
    position: 'relative'
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
    fontSize: 22,
    fontWeight: 'bold',
    color: C.text || '#fff',
    margin: 0
  },
  subtitle: {
    fontSize: 14,
    color: C.textSecondary || '#888',
    margin: '8px 0 0'
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    background: 'transparent',
    border: 'none',
    color: C.textSecondary || '#888',
    fontSize: 24,
    cursor: 'pointer'
  },
  backBtn: {
    position: 'absolute',
    top: 12,
    left: 12,
    background: 'transparent',
    border: 'none',
    color: C.textSecondary || '#888',
    fontSize: 14,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4
  },
  btn: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 12,
    border: 'none',
    fontSize: 16,
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12
  },
  googleBtn: {
    background: '#fff',
    color: '#333'
  },
  appleBtn: {
    background: '#000',
    color: '#fff'
  },
  emailBtn: {
    background: C.bg || '#2a2a3e',
    color: C.text || '#fff',
    border: `1px solid ${C.border || '#444'}`
  },
  guestBtn: {
    background: 'transparent',
    color: C.textSecondary || '#888',
    border: `1px solid ${C.border || '#444'}`,
    marginTop: 8
  },
  submitBtn: {
    background: C.accent?.green || '#22c55e',
    color: '#fff'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '16px 0',
    color: C.textSecondary || '#888',
    fontSize: 14
  },
  line: {
    flex: 1,
    height: 1,
    background: C.border || '#444'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 12,
    border: `1px solid ${C.border || '#444'}`,
    background: C.bg || '#2a2a3e',
    color: C.text || '#fff',
    fontSize: 16,
    marginBottom: 12,
    outline: 'none',
    boxSizing: 'border-box'
  },
  error: {
    background: '#ef444420',
    border: '1px solid #ef4444',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center'
  },
  link: {
    color: C.accent?.green || '#22c55e',
    cursor: 'pointer'
  },
  footer: {
    textAlign: 'center',
    marginTop: 16,
    color: C.textSecondary || '#888',
    fontSize: 13
  }
});

// ============================================================================
// ICONOS SVG
// ============================================================================
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

// ============================================================================
// ERROR MESSAGES
// ============================================================================
const ERROR_MESSAGES = {
  'auth/invalid-email': 'Email inválido',
  'auth/user-not-found': 'Usuario no encontrado',
  'auth/wrong-password': 'Contraseña incorrecta',
  'auth/email-already-in-use': 'Este email ya está registrado',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
  'auth/invalid-credential': 'Credenciales inválidas'
};

// ============================================================================
// EMAIL FORM COMPONENT
// ============================================================================
const EmailForm = memo(({ 
  mode, 
  email, 
  setEmail, 
  password, 
  setPassword, 
  displayName, 
  setDisplayName,
  onSubmit, 
  loading, 
  styles 
}) => (
  <form onSubmit={onSubmit}>
    {mode === 'register' && (
      <input
        type="text"
        placeholder="Nombre de jugador"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        style={styles.input}
      />
    )}
    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      style={styles.input}
    />
    <input
      type="password"
      placeholder="Contraseña"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      style={styles.input}
    />
    <button 
      type="submit" 
      style={{...styles.btn, ...styles.submitBtn}}
      disabled={loading}
    >
      {loading ? '...' : (mode === 'register' ? 'Crear Cuenta' : 'Entrar')}
    </button>
  </form>
));

EmailForm.displayName = 'EmailForm';

// ============================================================================
// LOGIN MODAL COMPONENT
// ============================================================================
export const LoginModal = memo(({ onClose, onSuccess, onPlayAsGuest }) => {
  const C = THEME.colors;
  const styles = createStyles(C);
  
  const [mode, setMode] = useState('main'); // 'main', 'email', 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Google Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { signInWithGoogle } = await import('../../firebase.js');
      const { getOrCreateUser } = await import('../../firestore.js');
      
      const result = await signInWithGoogle();
      if (result) {
        console.log('[Auth] Google login exitoso:', result.displayName);
        
        const firestoreProfile = await getOrCreateUser({
          uid: result.uid,
          displayName: result.displayName,
          email: result.email,
          photoURL: result.photoURL,
          providerData: result.providerData
        });
        
        const fullUser = {
          id: result.uid,
          name: result.displayName || 'Jugador',
          email: result.email,
          avatar: result.photoURL,
          provider: 'google.com',
          ...(firestoreProfile || {})
        };
        
        onSuccess(fullUser);
      }
    } catch (e) {
      console.error('Error Google login:', e);
      setError('Error al conectar con Google: ' + (e.message || e.code || 'desconocido'));
    } finally {
      setLoading(false);
    }
  };
  
  // Apple Login
  const handleAppleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { signInWithApple } = await import('../../firebase.js');
      const { getOrCreateUser } = await import('../../firestore.js');
      
      const result = await signInWithApple();
      if (result) {
        console.log('[Auth] Apple login exitoso:', result.displayName);
        
        const firestoreProfile = await getOrCreateUser({
          uid: result.uid,
          displayName: result.displayName,
          email: result.email,
          photoURL: result.photoURL,
          providerData: result.providerData
        });
        
        const fullUser = {
          id: result.uid,
          name: result.displayName || 'Jugador',
          email: result.email,
          avatar: result.photoURL,
          provider: 'apple.com',
          ...(firestoreProfile || {})
        };
        
        onSuccess(fullUser);
      }
    } catch (e) {
      console.error('Error Apple login:', e);
      setError('Error al conectar con Apple: ' + (e.message || e.code || 'desconocido'));
    } finally {
      setLoading(false);
    }
  };
  
  // Email Submit
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Completa todos los campos');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { signInWithEmail, registerWithEmail } = await import('../../firebase.js');
      const { getOrCreateUser } = await import('../../firestore.js');
      
      let result;
      if (mode === 'register') {
        result = await registerWithEmail(email, password, displayName);
      } else {
        result = await signInWithEmail(email, password);
      }
      
      console.log('[Auth] Email login exitoso:', result.displayName || email);
      
      const firestoreProfile = await getOrCreateUser({
        uid: result.uid,
        displayName: result.displayName || displayName || email.split('@')[0],
        email: result.email,
        photoURL: result.photoURL,
        providerData: result.providerData
      });
      
      const fullUser = {
        id: result.uid,
        name: result.displayName || displayName || email.split('@')[0],
        email: result.email,
        avatar: result.photoURL,
        provider: 'password',
        ...(firestoreProfile || {})
      };
      
      onSuccess(fullUser);
    } catch (e) {
      console.error('Error email auth:', e);
      setError(ERROR_MESSAGES[e.code] || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };
  
  // Email/Register Mode
  if (mode === 'email' || mode === 'register') {
    return (
      <div style={styles.overlay}>
        <div style={styles.container}>
          <button style={styles.backBtn} onClick={() => setMode('main')}>
            ← Volver
          </button>
          
          <div style={styles.header}>
            <div style={styles.logo}>🎲</div>
            <h2 style={styles.title}>{mode === 'register' ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
          </div>
          
          {error && <div style={styles.error}>{error}</div>}
          
          <EmailForm
            mode={mode}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            displayName={displayName}
            setDisplayName={setDisplayName}
            onSubmit={handleEmailSubmit}
            loading={loading}
            styles={styles}
          />
          
          <div style={styles.footer}>
            {mode === 'email' ? (
              <p>¿No tienes cuenta? <span style={styles.link} onClick={() => setMode('register')}>Regístrate</span></p>
            ) : (
              <p>¿Ya tienes cuenta? <span style={styles.link} onClick={() => setMode('email')}>Inicia sesión</span></p>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Main Screen
  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <button style={styles.closeBtn} onClick={onClose}>×</button>
        
        <div style={styles.header}>
          <div style={styles.logo}>🎲</div>
          <h2 style={styles.title}>Dominó Cubano</h2>
          <p style={styles.subtitle}>Inicia sesión para guardar tu progreso</p>
        </div>
        
        {error && <div style={styles.error}>{error}</div>}
        
        {/* Google */}
        <button 
          style={{...styles.btn, ...styles.googleBtn}}
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <GoogleIcon />
          Continuar con Google
        </button>
        
        {/* Apple */}
        <button 
          style={{...styles.btn, ...styles.appleBtn}}
          onClick={handleAppleLogin}
          disabled={loading}
        >
          <AppleIcon />
          Continuar con Apple
        </button>
        
        {/* Divider */}
        <div style={styles.divider}>
          <div style={styles.line}></div>
          <span style={{ padding: '0 12px' }}>o</span>
          <div style={styles.line}></div>
        </div>
        
        {/* Email */}
        <button 
          style={{...styles.btn, ...styles.emailBtn}}
          onClick={() => setMode('email')}
        >
          ✉️ Continuar con Email
        </button>
        
        {/* Guest */}
        <button 
          style={{...styles.btn, ...styles.guestBtn}}
          onClick={onPlayAsGuest}
        >
          Jugar como Invitado
        </button>
        
        <div style={styles.footer}>
          <p style={{ fontSize: 11 }}>Al continuar, aceptas nuestros términos de servicio</p>
        </div>
      </div>
    </div>
  );
});

LoginModal.displayName = 'LoginModal';

export default LoginModal;
