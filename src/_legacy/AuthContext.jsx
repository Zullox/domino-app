// ============================================================================
// CONTEXTO DE AUTENTICACIÓN
// ============================================================================
// Maneja el estado del usuario en toda la aplicación

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signInWithGoogle,
  signInWithApple,
  signInWithEmail,
  registerWithEmail,
  resetPassword,
  logOut,
  getIdToken,
  onAuthChange,
  getAuthRedirectResult,
  formatUser,
  getErrorMessage,
  updateUserProfile
} from './firebase';

// Crear contexto
const AuthContext = createContext(null);

// Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

// Proveedor de autenticación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Cargar perfil guardado localmente
  const loadLocalProfile = () => {
    try {
      const saved = localStorage.getItem('dominoUserProfile');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('[Auth] Error cargando perfil local:', e);
    }
    return null;
  };
  
  // Guardar perfil localmente
  const saveLocalProfile = (profile) => {
    try {
      localStorage.setItem('dominoUserProfile', JSON.stringify(profile));
    } catch (e) {
      console.error('[Auth] Error guardando perfil local:', e);
    }
  };
  
  // Sincronizar con el servidor
  const syncWithServer = useCallback(async (firebaseUser) => {
    try {
      const token = await getIdToken();
      if (!token) return null;
      
      // Obtener o crear perfil en el servidor
      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user: formatUser(firebaseUser)
        })
      });
      
      if (response.ok) {
        const serverProfile = await response.json();
        return serverProfile;
      }
    } catch (e) {
      console.log('[Auth] Servidor no disponible, usando perfil local');
    }
    return null;
  }, []);
  
  // Escuchar cambios de autenticación
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setLoading(true);
      setError(null);
      
      if (firebaseUser) {
        const formatted = formatUser(firebaseUser);
        
        // Intentar sincronizar con servidor
        const serverProfile = await syncWithServer(firebaseUser);
        
        // Combinar datos de Firebase con servidor
        const fullProfile = {
          ...formatted,
          // Datos del servidor (ranking, stats, etc.)
          ...(serverProfile || {}),
          // Datos locales como fallback
          ...(loadLocalProfile() || {})
        };
        
        setUser(fullProfile);
        saveLocalProfile(fullProfile);
      } else {
        // No hay usuario autenticado
        // Cargar perfil local para modo offline/invitado
        const localProfile = loadLocalProfile();
        if (localProfile && !localProfile.id?.startsWith('firebase_')) {
          // Es un perfil de invitado, mantenerlo
          setUser(localProfile);
        } else {
          setUser(null);
        }
      }
      
      setLoading(false);
    });
    
    // Verificar redirect result (para móvil)
    getAuthRedirectResult().then((redirectUser) => {
      if (redirectUser) {
        console.log('[Auth] Usuario de redirect:', redirectUser.displayName);
      }
    }).catch(console.error);
    
    return () => unsubscribe();
  }, [syncWithServer]);
  
  // ========== MÉTODOS DE AUTENTICACIÓN ==========
  
  // Login con Google
  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogle();
      // El resultado puede ser null si usa redirect (móvil)
      if (result) {
        return { success: true, user: formatUser(result) };
      }
      return { success: true, redirect: true };
    } catch (e) {
      const msg = getErrorMessage(e.code);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };
  
  // Login con Apple
  const loginWithApple = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithApple();
      if (result) {
        return { success: true, user: formatUser(result) };
      }
      return { success: true, redirect: true };
    } catch (e) {
      const msg = getErrorMessage(e.code);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };
  
  // Login con Email
  const loginWithEmail = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithEmail(email, password);
      return { success: true, user: formatUser(result) };
    } catch (e) {
      const msg = getErrorMessage(e.code);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };
  
  // Registro con Email
  const register = async (email, password, displayName) => {
    setLoading(true);
    setError(null);
    try {
      const result = await registerWithEmail(email, password, displayName);
      return { success: true, user: formatUser(result) };
    } catch (e) {
      const msg = getErrorMessage(e.code);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };
  
  // Recuperar contraseña
  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      await resetPassword(email);
      return { success: true };
    } catch (e) {
      const msg = getErrorMessage(e.code);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };
  
  // Cerrar sesión
  const logout = async () => {
    setLoading(true);
    try {
      await logOut();
      // Mantener perfil de invitado si existe
      const localProfile = loadLocalProfile();
      if (localProfile && !localProfile.id?.startsWith('firebase_')) {
        setUser(localProfile);
      } else {
        setUser(null);
        localStorage.removeItem('dominoUserProfile');
      }
      return { success: true };
    } catch (e) {
      setError(getErrorMessage(e.code));
      return { success: false };
    } finally {
      setLoading(false);
    }
  };
  
  // Jugar como invitado
  const playAsGuest = (guestName = 'Invitado') => {
    const guestProfile = {
      id: `guest_${Date.now()}`,
      name: guestName,
      email: null,
      avatar: null,
      provider: 'guest',
      isGuest: true,
      createdAt: new Date().toISOString(),
      // Datos de juego por defecto
      rating: 1500,
      rd: 350,
      volatility: 0.06,
      rank: 'Bronze III',
      wins: 0,
      losses: 0,
      tokens: 500,
      coins: 0
    };
    
    setUser(guestProfile);
    saveLocalProfile(guestProfile);
    
    return { success: true, user: guestProfile };
  };
  
  // Actualizar perfil
  const updateProfile = async (updates) => {
    if (!user) return { success: false, error: 'No hay usuario' };
    
    try {
      // Actualizar en Firebase si está autenticado
      if (!user.isGuest) {
        await updateUserProfile(updates);
      }
      
      // Actualizar estado local
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      saveLocalProfile(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };
  
  // Obtener token para el servidor
  const getToken = async () => {
    if (user?.isGuest) {
      return `guest_${user.id}`;
    }
    return await getIdToken();
  };
  
  // ========== VALOR DEL CONTEXTO ==========
  
  const value = {
    // Estado
    user,
    loading,
    error,
    isAuthenticated: !!user && !user.isGuest,
    isGuest: user?.isGuest || false,
    
    // Métodos
    loginWithGoogle,
    loginWithApple,
    loginWithEmail,
    register,
    forgotPassword,
    logout,
    playAsGuest,
    updateProfile,
    getToken,
    
    // Helpers
    clearError: () => setError(null)
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
