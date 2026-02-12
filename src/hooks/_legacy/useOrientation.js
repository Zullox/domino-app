// ============================================================================
// HOOK: useOrientation - Detectar y reaccionar a cambios de orientación
// ============================================================================
import { useState, useEffect } from 'react';
import { DeviceDetection } from '../utils/deviceDetection';

export const useOrientation = () => {
  const [orientation, setOrientation] = useState(() => ({
    isPortrait: DeviceDetection.isPortrait(),
    angle: typeof window !== 'undefined' ? window.screen?.orientation?.angle || 0 : 0
  }));
  
  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation({
        isPortrait: DeviceDetection.isPortrait(),
        angle: window.screen?.orientation?.angle || 0
      });
    };
    
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);
  
  return orientation;
};

export default useOrientation;
