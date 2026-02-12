// ============================================================================
// HOOKS - Exportaciones (hooks activos)
// ============================================================================
// Hooks legacy movidos a hooks/_legacy/
// ============================================================================
export { default as useShop } from './useShop';
export { default as useAchievements } from './useAchievements';
export { useTranslation, LanguageProvider, LanguageContext } from './useTranslation';
export { default as useAuth, createGuestUser } from './useAuth';
export { default as usePlayerProfile } from './usePlayerProfile';
export { default as useTurnTimer } from './useTurnTimer';
export { default as useRematch } from './useRematch';
export { useFriends } from './useFriends';

// Juego local vs IA
export { useLocalGame } from './useLocalGame';

// Servidor Autoritativo
export { useOnlineGame } from './useOnlineGame';
