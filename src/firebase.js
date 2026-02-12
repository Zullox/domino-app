// ============================================================================
// CONFIGURACIÓN DE FIREBASE
// ============================================================================
// 1. Crear proyecto en https://console.firebase.google.com
// 2. Habilitar Authentication > Sign-in methods: Google, Apple, Email
// 3. Copiar las credenciales aquí

import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  OAuthProvider,
  updateProfile,
  sendPasswordResetEmail,
  linkWithCredential,
  EmailAuthProvider
} from 'firebase/auth';

// Credenciales desde variables de entorno (nunca hardcodear)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBISfbvWeqKxnqIXOJdYPBoGRsSMqdqJvU',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'domino-online-4cc5f.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'domino-online-4cc5f',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'domino-online-4cc5f.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '329019462538',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:329019462538:web:bf249ae218bee3b1dbee73'
};

// Inicializar Firebase (evitar doble inicialización)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
console.log('[Firebase] Inicializado correctamente');

// Proveedores de autenticación
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// ============================================================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================================================

// Detectar si es móvil (para usar redirect en vez de popup)
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Login con Google
export const signInWithGoogle = async () => {
  try {
    // Usar popup (más confiable)
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('[Auth] Error Google:', error);
    throw error;
  }
};

// Login con Apple
export const signInWithApple = async () => {
  try {
    if (isMobile()) {
      await signInWithRedirect(auth, appleProvider);
      return null;
    } else {
      const result = await signInWithPopup(auth, appleProvider);
      return result.user;
    }
  } catch (error) {
    console.error('[Auth] Error Apple:', error);
    throw error;
  }
};

// Login con Email/Password
export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('[Auth] Error Email:', error);
    throw error;
  }
};

// Registro con Email/Password
export const registerWithEmail = async (email, password, displayName) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Actualizar nombre de usuario
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    
    return result.user;
  } catch (error) {
    console.error('[Auth] Error Registro:', error);
    throw error;
  }
};

// Recuperar contraseña
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error('[Auth] Error Reset:', error);
    throw error;
  }
};

// Cerrar sesión
export const logOut = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error('[Auth] Error Logout:', error);
    throw error;
  }
};

// Obtener resultado de redirect (para móvil)
export const getAuthRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      return result.user;
    }
    return null;
  } catch (error) {
    console.error('[Auth] Error Redirect Result:', error);
    throw error;
  }
};

// Obtener token JWT para el servidor
export const getIdToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

// Listener de cambios de autenticación
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Obtener usuario actual
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Actualizar perfil
export const updateUserProfile = async (updates) => {
  const user = auth.currentUser;
  if (user) {
    await updateProfile(user, updates);
    return user;
  }
  return null;
};

// Vincular cuenta de invitado con email
export const linkGuestWithEmail = async (email, password) => {
  const user = auth.currentUser;
  if (user && user.isAnonymous) {
    const credential = EmailAuthProvider.credential(email, password);
    const result = await linkWithCredential(user, credential);
    return result.user;
  }
  throw new Error('No hay usuario invitado activo');
};

// ============================================================================
// HELPERS
// ============================================================================

// Traducir errores de Firebase a español
export const getErrorMessage = (errorCode) => {
  const errors = {
    'auth/invalid-email': 'Email inválido',
    'auth/user-disabled': 'Usuario deshabilitado',
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/email-already-in-use': 'Este email ya está registrado',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/operation-not-allowed': 'Operación no permitida',
    'auth/popup-closed-by-user': 'Ventana cerrada por el usuario',
    'auth/cancelled-popup-request': 'Operación cancelada',
    'auth/network-request-failed': 'Error de conexión',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/requires-recent-login': 'Debes iniciar sesión nuevamente',
    'auth/account-exists-with-different-credential': 'Ya existe una cuenta con este email'
  };
  
  return errors[errorCode] || 'Error de autenticación';
};

// Formatear datos del usuario
export const formatUser = (firebaseUser) => {
  if (!firebaseUser) return null;
  
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    name: firebaseUser.displayName || 'Jugador',
    avatar: firebaseUser.photoURL || null,
    provider: firebaseUser.providerData[0]?.providerId || 'unknown',
    isAnonymous: firebaseUser.isAnonymous,
    emailVerified: firebaseUser.emailVerified,
    createdAt: firebaseUser.metadata.creationTime,
    lastLogin: firebaseUser.metadata.lastSignInTime
  };
};

export { auth };
export default { 
  signInWithGoogle, 
  signInWithApple, 
  signInWithEmail, 
  registerWithEmail,
  resetPassword,
  logOut, 
  getIdToken, 
  onAuthChange,
  getCurrentUser,
  updateUserProfile,
  getAuthRedirectResult,
  getErrorMessage,
  formatUser
};
