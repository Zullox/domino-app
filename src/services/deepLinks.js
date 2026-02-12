// ============================================================================
// DEEP LINK HANDLER
// ============================================================================
// Procesa deep links cuando el usuario abre un enlace de la app:
//   dominoranked://join/ABC123  → unirse a sala privada
//   dominoranked://profile/uid  → ver perfil
//   dominoranked://invite/uid   → aceptar invitación de amigo
//   https://servidor.com/join/ABC123 → web deep link
// ============================================================================

import { Platform } from './native';

let appUrlListener = null;

// ============================================================================
// INICIALIZAR LISTENER
// ============================================================================

/**
 * Configura el listener de deep links
 * @param {Function} onDeepLink - Callback con { action, params }
 */
export const initDeepLinks = async (onDeepLink) => {
  if (Platform.isNative) {
    try {
      const { App } = await import('@capacitor/app');
      
      // Link recibido mientras la app estaba abierta
      appUrlListener = App.addListener('appUrlOpen', (event) => {
        const parsed = parseDeepLink(event.url);
        if (parsed) {
          console.log('[DeepLink] Recibido:', parsed);
          onDeepLink(parsed);
        }
      });
      
      // Verificar si la app fue abierta con un deep link
      const launchUrl = await App.getLaunchUrl();
      if (launchUrl?.url) {
        const parsed = parseDeepLink(launchUrl.url);
        if (parsed) {
          console.log('[DeepLink] Launch URL:', parsed);
          // Pequeño delay para que la app esté lista
          setTimeout(() => onDeepLink(parsed), 500);
        }
      }
      
      console.log('[DeepLink] ✅ Listener configurado');
    } catch (e) {
      console.warn('[DeepLink] No disponible:', e.message);
    }
  } else {
    // Web: verificar URL parameters
    const url = window.location.href;
    const parsed = parseDeepLink(url);
    if (parsed) {
      console.log('[DeepLink] Web URL:', parsed);
      onDeepLink(parsed);
      // Limpiar URL
      window.history.replaceState({}, '', '/');
    }
  }
};

// ============================================================================
// PARSER
// ============================================================================

/**
 * Parsea una URL de deep link y retorna acción + parámetros
 */
const parseDeepLink = (url) => {
  if (!url) return null;
  
  try {
    // Custom scheme: dominoranked://join/ABC123
    if (url.startsWith('dominoranked://')) {
      const path = url.replace('dominoranked://', '');
      return parsePath(path);
    }
    
    // HTTPS deep link: https://servidor.com/join/ABC123
    const urlObj = new URL(url);
    return parsePath(urlObj.pathname.replace(/^\//, ''));
  } catch (e) {
    return null;
  }
};

const parsePath = (path) => {
  const segments = path.split('/').filter(Boolean);
  
  if (segments.length === 0) return null;
  
  switch (segments[0]) {
    case 'join':
      if (segments[1]) {
        return { action: 'join_room', params: { code: segments[1].toUpperCase() } };
      }
      break;
    case 'profile':
      if (segments[1]) {
        return { action: 'view_profile', params: { userId: segments[1] } };
      }
      break;
    case 'invite':
      if (segments[1]) {
        return { action: 'friend_invite', params: { fromUserId: segments[1] } };
      }
      break;
    default:
      return null;
  }
  
  return null;
};

// ============================================================================
// GENERAR DEEP LINKS
// ============================================================================

/**
 * Genera URL para invitar a una sala privada
 */
export const generateRoomLink = (code, serverUrl) => {
  return `${serverUrl || ''}/join/${code}`;
};

/**
 * Genera URL para compartir perfil
 */
export const generateProfileLink = (userId, serverUrl) => {
  return `${serverUrl || ''}/profile/${userId}`;
};

// ============================================================================
// CLEANUP
// ============================================================================

export const removeDeepLinkListener = () => {
  if (appUrlListener) {
    appUrlListener.remove();
    appUrlListener = null;
  }
};

export default {
  initDeepLinks,
  removeDeepLinkListener,
  generateRoomLink,
  generateProfileLink
};
