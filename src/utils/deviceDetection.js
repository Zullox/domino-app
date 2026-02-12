// ============================================================================
// DETECCIÓN DE DISPOSITIVO Y RENDIMIENTO
// ============================================================================

export const DeviceDetection = {
  // Detectar si es dispositivo de gama baja
  isLowEndDevice: () => {
    if (typeof navigator === 'undefined') return false;
    const memory = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    return memory <= 2 || cores <= 2;
  },
  
  // Detectar orientación
  isPortrait: () => {
    if (typeof window === 'undefined') return true;
    return window.innerHeight > window.innerWidth;
  },
  
  // Detectar si es móvil
  isMobile: () => {
    if (typeof navigator === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  
  // Detectar si soporta touch
  hasTouch: () => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
  
  // Obtener configuración de rendimiento
  getPerformanceConfig: () => {
    const isLowEnd = DeviceDetection.isLowEndDevice();
    return {
      useReducedMotion: isLowEnd || (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches),
      animationDuration: isLowEnd ? 150 : 300,
      enableParticles: !isLowEnd,
      enableShadows: !isLowEnd,
      enableBlur: !isLowEnd,
      maxAnimatedElements: isLowEnd ? 5 : 20
    };
  },
  
  // Detectar si es iOS
  isIOS: () => {
    if (typeof navigator === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },
  
  // Detectar si es Android
  isAndroid: () => {
    if (typeof navigator === 'undefined') return false;
    return /Android/i.test(navigator.userAgent);
  },
  
  // Obtener tipo de dispositivo
  getDeviceType: () => {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }
};

export default DeviceDetection;
