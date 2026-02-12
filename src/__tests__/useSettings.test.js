// ============================================================================
// TESTS: useSettings Hook
// ============================================================================
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettings } from '../hooks/useSettings';

describe('useSettings', () => {
  beforeEach(() => {
    localStorage.getItem.mockReturnValue(null);
  });

  describe('Inicialización', () => {
    it('debe cargar valores por defecto si no hay datos guardados', () => {
      const { result } = renderHook(() => useSettings());
      
      expect(result.current.settings.language).toBe('es');
      expect(result.current.settings.soundEnabled).toBe(true);
      expect(result.current.settings.turnTime).toBe(30);
      expect(result.current.settings.targetScore).toBe(100);
    });

    it('debe cargar valores guardados de localStorage', () => {
      const savedSettings = {
        language: 'en',
        soundEnabled: false,
        turnTime: 45
      };
      localStorage.getItem.mockReturnValue(JSON.stringify(savedSettings));
      
      const { result } = renderHook(() => useSettings());
      
      expect(result.current.settings.language).toBe('en');
      expect(result.current.settings.soundEnabled).toBe(false);
      expect(result.current.settings.turnTime).toBe(45);
    });

    it('debe manejar JSON inválido en localStorage', () => {
      localStorage.getItem.mockReturnValue('invalid json');
      
      const { result } = renderHook(() => useSettings());
      
      // Debe usar valores por defecto
      expect(result.current.settings.language).toBe('es');
    });
  });

  describe('updateSetting', () => {
    it('debe actualizar una configuración individual', () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.updateSetting('language', 'en');
      });
      
      expect(result.current.settings.language).toBe('en');
    });

    it('debe guardar en localStorage después de actualizar', async () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.updateSetting('soundEnabled', false);
      });
      
      // Esperar al efecto de guardado
      await vi.runAllTimersAsync();
      
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('updateSettings', () => {
    it('debe actualizar múltiples configuraciones a la vez', () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.updateSettings({
          language: 'pt',
          turnTime: 60,
          targetScore: 200
        });
      });
      
      expect(result.current.settings.language).toBe('pt');
      expect(result.current.settings.turnTime).toBe(60);
      expect(result.current.settings.targetScore).toBe(200);
    });
  });

  describe('resetSettings', () => {
    it('debe restaurar todas las configuraciones a valores por defecto', () => {
      const { result } = renderHook(() => useSettings());
      
      // Cambiar algunas configuraciones
      act(() => {
        result.current.updateSettings({
          language: 'fr',
          soundEnabled: false,
          turnTime: 15
        });
      });
      
      // Resetear
      act(() => {
        result.current.resetSettings();
      });
      
      expect(result.current.settings.language).toBe('es');
      expect(result.current.settings.soundEnabled).toBe(true);
      expect(result.current.settings.turnTime).toBe(30);
    });
  });

  describe('Validación de valores', () => {
    it('debe mantener la estructura correcta de settings', () => {
      const { result } = renderHook(() => useSettings());
      
      const requiredKeys = [
        'soundEnabled',
        'musicEnabled',
        'language',
        'skinSet',
        'boardTheme',
        'showHints',
        'turnTime',
        'targetScore',
        'aiDifficulty'
      ];
      
      requiredKeys.forEach(key => {
        expect(result.current.settings).toHaveProperty(key);
      });
    });
  });
});
