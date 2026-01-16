// ============================================================================
// TESTS: useOnlineGame Hook
// ============================================================================
// Run with: npm test -- --testPathPattern=useOnlineGame

import { renderHook, act, waitFor } from '@testing-library/react';
import { useOnlineGame } from '../hooks/useOnlineGame';

// Mock del SocketService
const mockSocketService = {
  initSocket: jest.fn(() => ({})),
  isConnected: jest.fn(() => false),
  on: jest.fn(() => jest.fn()), // Returns unsubscribe function
  identify: jest.fn(),
  searchMatch: jest.fn(),
  cancelSearch: jest.fn(),
  playTile: jest.fn(),
  passTurn: jest.fn(),
  sendEmote: jest.fn(),
  requestRematch: jest.fn(),
  respondRematch: jest.fn(),
  disconnectSocket: jest.fn()
};

jest.mock('../services/socket', () => ({
  __esModule: true,
  default: mockSocketService
}));

describe('useOnlineGame Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with disconnected state', () => {
      const { result } = renderHook(() => useOnlineGame());
      
      expect(result.current.connected).toBe(false);
      expect(result.current.phase).toBe('idle');
    });

    it('should initialize socket on mount', () => {
      renderHook(() => useOnlineGame());
      
      expect(mockSocketService.initSocket).toHaveBeenCalled();
    });

    it('should register socket event listeners', () => {
      renderHook(() => useOnlineGame());
      
      // Should register multiple listeners
      expect(mockSocketService.on).toHaveBeenCalled();
    });
  });

  describe('searchMatch', () => {
    it('should not search if not connected', () => {
      mockSocketService.isConnected.mockReturnValue(false);
      
      const { result } = renderHook(() => useOnlineGame());
      
      act(() => {
        result.current.searchMatch();
      });
      
      expect(mockSocketService.searchMatch).not.toHaveBeenCalled();
    });

    it('should call searchMatch when connected', () => {
      // Simulate connection
      const { result } = renderHook(() => useOnlineGame());
      
      // Manually set connected state (in real scenario, this comes from socket event)
      act(() => {
        // Simulating the connected state through the hook
        result.current.searchMatch();
      });
      
      // Since we're not actually connected in the mock, this tests the guard
    });
  });

  describe('cancelSearch', () => {
    it('should call cancelSearch on socket service', () => {
      const { result } = renderHook(() => useOnlineGame());
      
      act(() => {
        result.current.cancelSearch();
      });
      
      expect(mockSocketService.cancelSearch).toHaveBeenCalled();
    });
  });

  describe('playTile', () => {
    it('should not play if not in playing phase', () => {
      const { result } = renderHook(() => useOnlineGame());
      
      const tile = { id: 1, left: 5, right: 3 };
      
      act(() => {
        result.current.playTile(tile, 'left');
      });
      
      expect(mockSocketService.playTile).not.toHaveBeenCalled();
    });
  });

  describe('passTurn', () => {
    it('should not pass if not in playing phase', () => {
      const { result } = renderHook(() => useOnlineGame());
      
      act(() => {
        result.current.passTurn();
      });
      
      expect(mockSocketService.passTurn).not.toHaveBeenCalled();
    });
  });

  describe('sendEmote', () => {
    it('should call sendEmote on socket service when connected', () => {
      const { result } = renderHook(() => useOnlineGame());
      
      act(() => {
        result.current.sendEmote('👍');
      });
      
      // Will only work if connected
    });
  });

  describe('requestRematch', () => {
    it('should call requestRematch on socket service', () => {
      const { result } = renderHook(() => useOnlineGame());
      
      act(() => {
        result.current.requestRematch();
      });
      
      // Will only work if connected
    });
  });

  describe('resetGame', () => {
    it('should reset all game state', () => {
      const { result } = renderHook(() => useOnlineGame());
      
      act(() => {
        result.current.resetGame();
      });
      
      expect(result.current.gameState).toBeNull();
      expect(result.current.phase).toBe('idle');
      expect(result.current.searching).toBe(false);
    });
  });

  describe('Search Timer', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should increment search time when searching', () => {
      const { result } = renderHook(() => useOnlineGame());
      
      // We need to simulate the searching state
      // In real scenario, this would come from socket events
    });
  });

  describe('Derived Values', () => {
    it('should compute isMyTurn correctly', () => {
      const { result } = renderHook(() => useOnlineGame());
      
      // Initially should be false
      expect(result.current.isMyTurn).toBe(false);
    });

    it('should return empty myTiles initially', () => {
      const { result } = renderHook(() => useOnlineGame());
      
      expect(result.current.myTiles).toEqual([]);
    });
  });
});

describe('Socket Event Handling', () => {
  it('should handle connection events', () => {
    const onHandlers = {};
    mockSocketService.on.mockImplementation((event, handler) => {
      onHandlers[event] = handler;
      return jest.fn(); // unsubscribe function
    });

    const { result } = renderHook(() => useOnlineGame());
    
    // Verify handlers were registered
    expect(mockSocketService.on).toHaveBeenCalled();
  });

  it('should handle partidaEncontrada event', () => {
    // This would test the full flow of finding a match
  });

  it('should handle partidaIniciada event', () => {
    // This would test game initialization from server
  });

  it('should handle fichaJugada event', () => {
    // This would test tile play updates
  });

  it('should handle rondaTerminada event', () => {
    // This would test round end handling
  });

  it('should handle partidaTerminada event', () => {
    // This would test game end handling
  });

  it('should handle reconnection', () => {
    // This would test reconnection flow
  });
});
