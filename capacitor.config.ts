import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dominoranked.app',
  appName: 'Dominó Ranked',
  webDir: 'dist',
  
  // Servidor en desarrollo (comentar para producción)
  // server: {
  //   url: 'http://192.168.1.XXX:3000',
  //   cleartext: true
  // },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0a0a0f',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0a0f'
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  },

  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: '#0a0a0f',
    // Para fullscreen inmersivo
    overrideUserAgent: 'DominoRanked/2.2.0 Android',
    // Deep links
    appendUserAgent: 'DominoRanked'
  },

  // App Links / Deep Links
  server: {
    hostname: 'dominoranked.app'
  }
};

export default config;
