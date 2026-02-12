// ============================================================================
// TESTS: useOfflineGame Hook
// ============================================================================
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOfflineGame } from '../hooks/useOfflineGame';

// Mock del gameEngine
vi.mock('../utils/gameEngine', () => ({
  dealTiles: vi.fn(() => [
    // Jugador 0 (humano)
    [
      { id: 0, left: 6, right: 6 },
      { id: 1, left: 5, right: 5 },
      { id: 2, left: 4, right: 4 },
      { id: 3, left: 3, right: 3 },
      { id: 4, left: 2, right: 2 },
      { id: 5, left: 1, right: 1 },
      { id: 6, left: 0, right: 0 },
      { id: 7, left: 6, right: 5 },
      { id: 8, left: 6, right: 4 },
      { id: 9, left: 6, right: 3 }
    ],
    // Jugador 1 (IA)
    [
      { id: 10, left: 6, right: 2 },
      { id: 11, left: 6, right: 1 },
      { id: 12, left: 6, right: 0 },
      { id: 13, left: 5, right: 4 },
      { id: 14, left: 5, right: 3 },
      { id: 15, left: 5, right: 2 },
      { id: 16, left: 5, right: 1 },
      { id: 17, left: 5, right: 0 },
      { id: 18, left: 4, right: 3 },
      { id: 19, left: 4, right: 2 }
    ],
    // Jugador 2 (IA - compañero)
    [
      { id: 20, left: 4, right: 1 },
      { id: 21, left: 4, right: 0 },
      { id: 22, left: 3, right: 2 },
      { id: 23, left: 3, right: 1 },
      { id: 24, left: 3, right: 0 },
      { id: 25, left: 2, right: 1 },
      { id: 26, left: 2, right: 0 },
      { id: 27, left: 1, right: 0 },
      { id: 28, left: 9, right: 9 },
      { id: 29, left: 9, right: 8 }
    ],
    // Jugador 3 (IA)
    [
      { id: 30, left: 9, right: 7 },
      { id: 31, left: 9, right: 6 },
      { id: 32, left: 9, right: 5 },
      { id: 33, left: 9, right: 4 },
      { id: 34, left: 9, right: 3 },
      { id: 35, left: 9, right: 2 },
      { id: 36, left: 9, right: 1 },
      { id: 37, left: 9, right: 0 },
      { id: 38, left: 8, right: 8 },
      { id: 39, left: 8, right: 7 }
    ]
  ]),
  findStartingPlayer: vi.fn(() => ({
    player: 0,
    tile: { id: 0, left: 6, right: 6 }
  })),
  createBoard: vi.fn(() => ({ tiles: [], leftEnd: null, rightEnd: null })),
  placeTile: vi.fn((board, tile, pos) => ({
    tiles: [...board.tiles, tile],
    leftEnd: tile.left,
    rightEnd: tile.right
  })),
  getPlayableTiles: vi.fn((tiles, board) => {
    if (board.tiles.length === 0) return tiles;
    return tiles.filter(t => 
      t.left === board.leftEnd || t.right === board.leftEnd ||
      t.left === board.rightEnd || t.right === board.rightEnd
    );
  }),
  canPlayAt: vi.fn(() => true),
  getBoardEnds: vi.fn((board) => ({
    left: board.leftEnd,
    right: board.rightEnd
  }))
}));

describe('useOfflineGame', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  describe('Estado inicial', () => {
    it('debe iniciar en fase "idle"', () => {
      const { result } = renderHook(() => useOfflineGame());
      
      expect(result.current.phase).toBe('idle');
      expect(result.current.gameState).toBeNull();
    });

    it('debe tener timer inicial basado en configuración', () => {
      const { result } = renderHook(() => useOfflineGame({ turnTime: 45 }));
      
      expect(result.current.timer).toBe(45);
    });
  });

  describe('startGame', () => {
    it('debe cambiar la fase a "dealing" y luego a "playing"', async () => {
      const { result } = renderHook(() => useOfflineGame());
      
      act(() => {
        result.current.startGame();
      });
      
      expect(result.current.phase).toBe('dealing');
      
      // Avanzar el timer de la animación de reparto
      await act(async () => {
        vi.advanceTimersByTime(1500);
      });
      
      expect(result.current.phase).toBe('playing');
    });

    it('debe crear 4 jugadores con 10 fichas cada uno', async () => {
      const { result } = renderHook(() => useOfflineGame());
      
      act(() => {
        result.current.startGame();
      });
      
      await act(async () => {
        vi.advanceTimersByTime(1500);
      });
      
      expect(result.current.gameState.players).toHaveLength(4);
      result.current.gameState.players.forEach(player => {
        expect(player.tiles).toHaveLength(10);
      });
    });

    it('debe asignar equipos correctamente (0-2 vs 1-3)', async () => {
      const { result } = renderHook(() => useOfflineGame());
      
      act(() => {
        result.current.startGame();
      });
      
      await act(async () => {
        vi.advanceTimersByTime(1500);
      });
      
      const { players } = result.current.gameState;
      expect(players[0].team).toBe(0);
      expect(players[1].team).toBe(1);
      expect(players[2].team).toBe(0);
      expect(players[3].team).toBe(1);
    });

    it('debe marcar al jugador 0 como humano', async () => {
      const { result } = renderHook(() => useOfflineGame());
      
      act(() => {
        result.current.startGame();
      });
      
      await act(async () => {
        vi.advanceTimersByTime(1500);
      });
      
      expect(result.current.gameState.players[0].isHuman).toBe(true);
      expect(result.current.gameState.players[1].isHuman).toBe(false);
    });

    it('debe establecer el targetScore correcto', async () => {
      const { result } = renderHook(() => useOfflineGame({ targetScore: 200 }));
      
      act(() => {
        result.current.startGame();
      });
      
      await act(async () => {
        vi.advanceTimersByTime(1500);
      });
      
      expect(result.current.gameState.targetScore).toBe(200);
    });
  });

  describe('isMyTurn', () => {
    it('debe ser true cuando es turno del jugador humano', async () => {
      const { result } = renderHook(() => useOfflineGame());
      
      act(() => {
        result.current.startGame();
      });
      
      await act(async () => {
        vi.advanceTimersByTime(1500);
      });
      
      // El jugador 0 tiene el doble 6, así que inicia
      expect(result.current.isMyTurn).toBe(true);
    });
  });

  describe('playTile', () => {
    it('debe remover la ficha de la mano del jugador', async () => {
      const { result } = renderHook(() => useOfflineGame());
      
      act(() => {
        result.current.startGame();
      });
      
      await act(async () => {
        vi.advanceTimersByTime(1500);
      });
      
      const initialTileCount = result.current.gameState.players[0].tiles.length;
      const tileToPlay = result.current.gameState.players[0].tiles[0];
      
      act(() => {
        result.current.playTile(tileToPlay, 'center');
      });
      
      expect(result.current.gameState.players[0].tiles.length).toBe(initialTileCount - 1);
    });

    it('debe agregar la ficha al tablero', async () => {
      const { result } = renderHook(() => useOfflineGame());
      
      act(() => {
        result.current.startGame();
      });
      
      await act(async () => {
        vi.advanceTimersByTime(1500);
      });
      
      const tileToPlay = result.current.gameState.players[0].tiles[0];
      
      act(() => {
        result.current.playTile(tileToPlay, 'center');
      });
      
      expect(result.current.gameState.board.tiles.length).toBeGreaterThan(0);
    });

    it('debe pasar el turno al siguiente jugador', async () => {
      const { result } = renderHook(() => useOfflineGame());
      
      act(() => {
        result.current.startGame();
      });
      
      await act(async () => {
        vi.advanceTimersByTime(1500);
      });
      
      const tileToPlay = result.current.gameState.players[0].tiles[0];
      
      act(() => {
        result.current.playTile(tileToPlay, 'center');
      });
      
      expect(result.current.gameState.currentPlayer).toBe(1);
    });

    it('debe resetear el contador de pases', async () => {
      const { result } = renderHook(() => useOfflineGame());
      
      act(() => {
        result.current.startGame();
      });
      
      await act(async () => {
        vi.advanceTimersByTime(1500);
      });
      
      const tileToPlay = result.current.gameState.players[0].tiles[0];
      
      act(() => {
        result.current.playTile(tileToPlay, 'center');
      });
      
      expect(result.current.gameState.passCount).toBe(0);
    });
  });

  describe('passTurn', () => {
    it('debe incrementar el contador de pases', async () => {
      const { result } = renderHook(() => useOfflineGame());
      
      act(() => {
        result.current.startGame();
      });
      
      await act(async () => {
        vi.advanceTimersByTime(1500);
      });
      
      // Primero jugar una ficha para tener un tablero
      const tileToPlay = result.current.gameState.players[0].tiles[0];
      act(() => {
        result.current.playTile(tileToPlay, 'center');
      });
      
      // Simular que vuelve a ser turno del humano y no puede jugar
      act(() => {
        result.current.passTurn();
      });
      
      expect(result.current.gameState.passCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('resetGame', () => {
    it('debe volver al estado inicial', async () => {
      const { result } = renderHook(() => useOfflineGame());
      
      act(() => {
        result.current.startGame();
      });
      
      await act(async () => {
        vi.advanceTimersByTime(1500);
      });
      
      act(() => {
        result.current.resetGame();
      });
      
      expect(result.current.phase).toBe('idle');
      expect(result.current.gameState).toBeNull();
    });
  });

  describe('Notificaciones', () => {
    it('debe mostrar notificación al iniciar el juego', async () => {
      const { result } = renderHook(() => useOfflineGame());
      
      act(() => {
        result.current.startGame();
      });
      
      await act(async () => {
        vi.advanceTimersByTime(1500);
      });
      
      expect(result.current.notification).not.toBeNull();
    });

    it('debe limpiar la notificación después de un tiempo', async () => {
      const { result } = renderHook(() => useOfflineGame());
      
      act(() => {
        result.current.startGame();
      });
      
      await act(async () => {
        vi.advanceTimersByTime(1500);
      });
      
      expect(result.current.notification).not.toBeNull();
      
      await act(async () => {
        vi.advanceTimersByTime(3000);
      });
      
      expect(result.current.notification).toBeNull();
    });
  });
});
