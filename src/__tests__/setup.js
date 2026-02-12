// ============================================================================
// TEST SETUP - Configuración global para Vitest
// ============================================================================
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock Socket.io
vi.mock('../services/socket', () => ({
  default: {
    initSocket: vi.fn(),
    disconnectSocket: vi.fn(),
    isConnected: vi.fn(() => false),
    on: vi.fn(() => vi.fn()),
    identify: vi.fn(),
    searchMatch: vi.fn(),
    cancelSearch: vi.fn(),
    playTile: vi.fn(),
    passTurn: vi.fn(),
    sendEmote: vi.fn(),
    requestRematch: vi.fn(),
    respondRematch: vi.fn()
  }
}));

// Mock de timers
vi.useFakeTimers();

// Cleanup después de cada test
afterEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockReset();
  localStorageMock.setItem.mockReset();
});
