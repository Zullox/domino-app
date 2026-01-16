// ============================================================================
// HOOK: useSettings - Gestión de configuraciones persistentes
// ============================================================================
import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'domino_settings';

const DEFAULT_SETTINGS = {
  // Audio
  soundEnabled: true,
  musicEnabled: true,
  soundVolume: 0.8,
  musicVolume: 0.5,
  vibrationEnabled: true,
  
  // Visual
  language: 'es',
  skinSet: 'classic',
  boardTheme: 'green',
  showHints: true,
  animationsEnabled: true,
  colorBlindMode: false,
  
  // Juego
  turnTime: 30,
  targetScore: 100,
  aiDifficulty: 'medium',
  autoPass: false,
  confirmMoves: false,
  
  // Notificaciones
  pushNotifications: true,
  friendNotifications: true,
  matchNotifications: true,
  
  // Privacidad
  showOnlineStatus: true,
  allowFriendRequests: true,
  showRating: true
};

export const useSettings = () => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
      return DEFAULT_SETTINGS;
    } catch (e) {
      console.error('Error loading settings:', e);
      return DEFAULT_SETTINGS;
    }
  });
  
  const [isDirty, setIsDirty] = useState(false);

  // Guardar en localStorage cuando cambien
  useEffect(() => {
    if (isDirty) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        setIsDirty(false);
      } catch (e) {
        console.error('Error saving settings:', e);
      }
    }
  }, [settings, isDirty]);

  // Actualizar una configuración
  const updateSetting = useCallback((key, value) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      return newSettings;
    });
    setIsDirty(true);
  }, []);

  // Actualizar múltiples configuraciones
  const updateSettings = useCallback((updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);

  // Resetear a valores por defecto
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setIsDirty(true);
  }, []);

  // Resetear una categoría específica
  const resetCategory = useCallback((category) => {
    const categoryDefaults = {};
    
    switch (category) {
      case 'audio':
        categoryDefaults.soundEnabled = DEFAULT_SETTINGS.soundEnabled;
        categoryDefaults.musicEnabled = DEFAULT_SETTINGS.musicEnabled;
        categoryDefaults.soundVolume = DEFAULT_SETTINGS.soundVolume;
        categoryDefaults.musicVolume = DEFAULT_SETTINGS.musicVolume;
        categoryDefaults.vibrationEnabled = DEFAULT_SETTINGS.vibrationEnabled;
        break;
      case 'visual':
        categoryDefaults.language = DEFAULT_SETTINGS.language;
        categoryDefaults.skinSet = DEFAULT_SETTINGS.skinSet;
        categoryDefaults.boardTheme = DEFAULT_SETTINGS.boardTheme;
        categoryDefaults.showHints = DEFAULT_SETTINGS.showHints;
        categoryDefaults.animationsEnabled = DEFAULT_SETTINGS.animationsEnabled;
        categoryDefaults.colorBlindMode = DEFAULT_SETTINGS.colorBlindMode;
        break;
      case 'game':
        categoryDefaults.turnTime = DEFAULT_SETTINGS.turnTime;
        categoryDefaults.targetScore = DEFAULT_SETTINGS.targetScore;
        categoryDefaults.aiDifficulty = DEFAULT_SETTINGS.aiDifficulty;
        categoryDefaults.autoPass = DEFAULT_SETTINGS.autoPass;
        categoryDefaults.confirmMoves = DEFAULT_SETTINGS.confirmMoves;
        break;
      default:
        return;
    }
    
    setSettings(prev => ({ ...prev, ...categoryDefaults }));
    setIsDirty(true);
  }, []);

  // Exportar/Importar configuraciones
  const exportSettings = useCallback(() => {
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  const importSettings = useCallback((jsonString) => {
    try {
      const imported = JSON.parse(jsonString);
      setSettings({ ...DEFAULT_SETTINGS, ...imported });
      setIsDirty(true);
      return true;
    } catch (e) {
      console.error('Error importing settings:', e);
      return false;
    }
  }, []);

  return {
    settings,
    updateSetting,
    updateSettings,
    resetSettings,
    resetCategory,
    exportSettings,
    importSettings,
    DEFAULT_SETTINGS
  };
};

export default useSettings;
