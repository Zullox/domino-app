// ============================================================================
// NATIVE BRIDGE - Abstracción entre Capacitor (Android) y Web APIs
// ============================================================================
// Detecta automáticamente si estamos en Capacitor o navegador
// y usa las APIs nativas cuando están disponibles
// ============================================================================

import { Capacitor } from '@capacitor/core';

// ============================================================================
// DETECCIÓN DE PLATAFORMA
// ============================================================================

export const Platform = {
  isNative: Capacitor.isNativePlatform(),
  isAndroid: Capacitor.getPlatform() === 'android',
  isIOS: Capacitor.getPlatform() === 'ios',
  isWeb: Capacitor.getPlatform() === 'web',
  platform: Capacitor.getPlatform()
};

// ============================================================================
// HAPTICS (Vibración)
// ============================================================================

let Haptics = null;

const initHaptics = async () => {
  if (Platform.isNative && !Haptics) {
    try {
      const mod = await import('@capacitor/haptics');
      Haptics = mod.Haptics;
    } catch (e) {
      console.warn('[Native] Haptics no disponible');
    }
  }
};

export const vibrate = async (style = 'medium') => {
  await initHaptics();
  
  if (Haptics && Platform.isNative) {
    try {
      switch (style) {
        case 'light':
          await Haptics.impact({ style: 'LIGHT' });
          break;
        case 'medium':
          await Haptics.impact({ style: 'MEDIUM' });
          break;
        case 'heavy':
          await Haptics.impact({ style: 'HEAVY' });
          break;
        case 'success':
          await Haptics.notification({ type: 'SUCCESS' });
          break;
        case 'warning':
          await Haptics.notification({ type: 'WARNING' });
          break;
        case 'error':
          await Haptics.notification({ type: 'ERROR' });
          break;
        default:
          await Haptics.impact({ style: 'MEDIUM' });
      }
    } catch (e) {
      // Fallback a Web API
      webVibrate(style);
    }
  } else {
    webVibrate(style);
  }
};

const webVibrate = (style) => {
  if (!navigator.vibrate) return;
  
  const patterns = {
    light: [30],
    medium: [50],
    heavy: [100],
    success: [50, 50, 50],
    warning: [100, 50, 100],
    error: [200, 100, 200]
  };
  
  navigator.vibrate(patterns[style] || [50]);
};

// ============================================================================
// STATUS BAR
// ============================================================================

export const setStatusBarColor = async (color = '#0a0a0f') => {
  if (Platform.isNative) {
    try {
      const { StatusBar, Style } = await import('@capacitor/status-bar');
      await StatusBar.setBackgroundColor({ color });
      await StatusBar.setStyle({ style: Style.Dark });
    } catch (e) {
      // No-op en web
    }
  }
};

export const hideStatusBar = async () => {
  if (Platform.isNative) {
    try {
      const { StatusBar } = await import('@capacitor/status-bar');
      await StatusBar.hide();
    } catch (e) {}
  }
};

// ============================================================================
// SPLASH SCREEN
// ============================================================================

export const hideSplash = async () => {
  if (Platform.isNative) {
    try {
      const { SplashScreen } = await import('@capacitor/splash-screen');
      await SplashScreen.hide({ fadeOutDuration: 300 });
    } catch (e) {}
  }
};

// ============================================================================
// PUSH NOTIFICATIONS
// ============================================================================

let PushNotifications = null;

export const initPushNotifications = async (callbacks = {}) => {
  if (!Platform.isNative) {
    console.log('[Push] Solo disponible en plataformas nativas');
    return null;
  }
  
  try {
    const mod = await import('@capacitor/push-notifications');
    PushNotifications = mod.PushNotifications;
    
    // Solicitar permisos
    const permResult = await PushNotifications.requestPermissions();
    
    if (permResult.receive !== 'granted') {
      console.warn('[Push] Permisos denegados');
      return null;
    }
    
    // Registrar para push
    await PushNotifications.register();
    
    // Listeners
    PushNotifications.addListener('registration', (token) => {
      console.log('[Push] Token FCM:', token.value);
      callbacks.onToken?.(token.value);
    });
    
    PushNotifications.addListener('registrationError', (error) => {
      console.error('[Push] Error registro:', error);
      callbacks.onError?.(error);
    });
    
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[Push] Recibida:', notification);
      callbacks.onReceived?.(notification);
    });
    
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('[Push] Acción:', action);
      callbacks.onAction?.(action);
    });
    
    return PushNotifications;
  } catch (e) {
    console.error('[Push] Error inicializando:', e);
    return null;
  }
};

// ============================================================================
// SHARE (Compartir)
// ============================================================================

export const shareResult = async ({ title, text, url }) => {
  if (Platform.isNative) {
    try {
      const { Share } = await import('@capacitor/share');
      await Share.share({ title, text, url });
      return true;
    } catch (e) {
      console.error('[Share] Error:', e);
      return false;
    }
  } else {
    // Web Share API fallback
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return true;
      } catch (e) {
        return false;
      }
    }
    // Último fallback: copiar al clipboard
    try {
      await navigator.clipboard.writeText(text + (url ? `\n${url}` : ''));
      return true;
    } catch (e) {
      return false;
    }
  }
};

// ============================================================================
// APP LIFECYCLE
// ============================================================================

export const onAppStateChange = async (callback) => {
  if (Platform.isNative) {
    try {
      const { App } = await import('@capacitor/app');
      
      App.addListener('appStateChange', ({ isActive }) => {
        callback(isActive);
      });
      
      // Manejar botón atrás en Android
      App.addListener('backButton', ({ canGoBack }) => {
        callback(null, 'back', canGoBack);
      });
    } catch (e) {
      console.warn('[App] Lifecycle listener no disponible');
    }
  } else {
    // Web fallback
    document.addEventListener('visibilitychange', () => {
      callback(!document.hidden);
    });
  }
};

// ============================================================================
// KEYBOARD (para chat/inputs)
// ============================================================================

export const onKeyboardChange = async (callback) => {
  if (Platform.isNative) {
    try {
      const { Keyboard } = await import('@capacitor/keyboard');
      
      Keyboard.addListener('keyboardWillShow', (info) => {
        callback(true, info.keyboardHeight);
      });
      
      Keyboard.addListener('keyboardWillHide', () => {
        callback(false, 0);
      });
    } catch (e) {}
  }
};

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

export const initNativeBridge = async () => {
  console.log(`[Native] Plataforma: ${Platform.platform} (native: ${Platform.isNative})`);
  
  if (Platform.isNative) {
    await setStatusBarColor('#0a0a0f');
    // Splash se oculta desde el componente principal cuando esté listo
  }
  
  return Platform;
};

export default {
  Platform,
  vibrate,
  setStatusBarColor,
  hideStatusBar,
  hideSplash,
  initPushNotifications,
  shareResult,
  onAppStateChange,
  onKeyboardChange,
  initNativeBridge
};
