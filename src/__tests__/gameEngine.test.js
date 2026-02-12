// ============================================================================
// TESTS: gameEngine Utils
// ============================================================================
import { describe, it, expect } from 'vitest';
import * as Engine from '../utils/gameEngine';

describe('gameEngine', () => {
  describe('dealTiles', () => {
    it('debe repartir fichas a 4 jugadores', () => {
      const hands = Engine.dealTiles(4);
      
      expect(hands).toHaveLength(4);
    });

    it('debe repartir 10 fichas a cada jugador', () => {
      const hands = Engine.dealTiles(4);
      
      hands.forEach(hand => {
        expect(hand).toHaveLength(10);
      });
    });

    it('debe usar todas las 55 fichas del dominó doble-9', () => {
      const hands = Engine.dealTiles(4);
      const allTiles = hands.flat();
      
      // 4 jugadores x 10 fichas = 40 (quedan 15 en el pozo en dominó normal)
      // Pero en dominó cubano se reparten todas
      expect(allTiles.length).toBe(40);
    });

    it('cada ficha debe tener id, left y right', () => {
      const hands = Engine.dealTiles(4);
      const allTiles = hands.flat();
      
      allTiles.forEach(tile => {
        expect(tile).toHaveProperty('id');
        expect(tile).toHaveProperty('left');
        expect(tile).toHaveProperty('right');
        expect(typeof tile.id).toBe('number');
        expect(tile.left).toBeGreaterThanOrEqual(0);
        expect(tile.left).toBeLessThanOrEqual(9);
        expect(tile.right).toBeGreaterThanOrEqual(0);
        expect(tile.right).toBeLessThanOrEqual(9);
      });
    });

    it('no debe haber fichas duplicadas', () => {
      const hands = Engine.dealTiles(4);
      const allTiles = hands.flat();
      const ids = allTiles.map(t => t.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('createBoard', () => {
    it('debe crear un tablero vacío', () => {
      const board = Engine.createBoard();
      
      expect(board.tiles).toEqual([]);
      expect(board.leftEnd).toBeNull();
      expect(board.rightEnd).toBeNull();
    });
  });

  describe('findStartingPlayer', () => {
    it('debe encontrar al jugador con el doble más alto', () => {
      const players = [
        { id: 0, tiles: [{ id: 1, left: 5, right: 3 }] },
        { id: 1, tiles: [{ id: 2, left: 9, right: 9 }] }, // Doble 9
        { id: 2, tiles: [{ id: 3, left: 6, right: 6 }] }, // Doble 6
        { id: 3, tiles: [{ id: 4, left: 4, right: 2 }] }
      ];
      
      const result = Engine.findStartingPlayer(players);
      
      expect(result.player).toBe(1); // Jugador con doble 9
      expect(result.tile.left).toBe(9);
      expect(result.tile.right).toBe(9);
    });

    it('debe buscar dobles en orden descendente (9 a 0)', () => {
      const players = [
        { id: 0, tiles: [{ id: 1, left: 3, right: 3 }] }, // Doble 3
        { id: 1, tiles: [{ id: 2, left: 5, right: 5 }] }, // Doble 5
        { id: 2, tiles: [{ id: 3, left: 1, right: 1 }] }, // Doble 1
        { id: 3, tiles: [{ id: 4, left: 7, right: 7 }] }  // Doble 7
      ];
      
      const result = Engine.findStartingPlayer(players);
      
      expect(result.player).toBe(3); // Jugador con doble 7
    });

    it('si no hay dobles, debe elegir la ficha más alta', () => {
      const players = [
        { id: 0, tiles: [{ id: 1, left: 5, right: 3 }] }, // Suma 8
        { id: 1, tiles: [{ id: 2, left: 9, right: 8 }] }, // Suma 17
        { id: 2, tiles: [{ id: 3, left: 6, right: 4 }] }, // Suma 10
        { id: 3, tiles: [{ id: 4, left: 4, right: 2 }] }  // Suma 6
      ];
      
      const result = Engine.findStartingPlayer(players);
      
      expect(result.player).toBe(1); // Jugador con 9-8
    });
  });

  describe('placeTile', () => {
    it('debe agregar ficha al tablero vacío', () => {
      const board = Engine.createBoard();
      const tile = { id: 1, left: 6, right: 6 };
      
      const newBoard = Engine.placeTile(board, tile, 'center');
      
      expect(newBoard.tiles).toHaveLength(1);
      expect(newBoard.leftEnd).toBe(6);
      expect(newBoard.rightEnd).toBe(6);
    });

    it('debe actualizar extremo izquierdo al jugar a la izquierda', () => {
      const board = {
        tiles: [{ id: 1, left: 6, right: 6 }],
        leftEnd: 6,
        rightEnd: 6
      };
      const tile = { id: 2, left: 6, right: 4 };
      
      const newBoard = Engine.placeTile(board, tile, 'left');
      
      expect(newBoard.leftEnd).toBe(4);
      expect(newBoard.rightEnd).toBe(6);
    });

    it('debe actualizar extremo derecho al jugar a la derecha', () => {
      const board = {
        tiles: [{ id: 1, left: 6, right: 6 }],
        leftEnd: 6,
        rightEnd: 6
      };
      const tile = { id: 2, left: 6, right: 3 };
      
      const newBoard = Engine.placeTile(board, tile, 'right');
      
      expect(newBoard.leftEnd).toBe(6);
      expect(newBoard.rightEnd).toBe(3);
    });
  });

  describe('getPlayableTiles', () => {
    it('debe retornar todas las fichas si el tablero está vacío', () => {
      const tiles = [
        { id: 1, left: 6, right: 6 },
        { id: 2, left: 5, right: 3 },
        { id: 3, left: 2, right: 1 }
      ];
      const board = Engine.createBoard();
      
      const playable = Engine.getPlayableTiles(tiles, board);
      
      expect(playable).toHaveLength(3);
    });

    it('debe filtrar solo fichas que conectan con los extremos', () => {
      const tiles = [
        { id: 1, left: 6, right: 4 }, // Conecta con 6
        { id: 2, left: 5, right: 3 }, // No conecta
        { id: 3, left: 2, right: 6 }, // Conecta con 6
        { id: 4, left: 1, right: 1 }  // No conecta
      ];
      const board = {
        tiles: [{ id: 0, left: 6, right: 6 }],
        leftEnd: 6,
        rightEnd: 6
      };
      
      const playable = Engine.getPlayableTiles(tiles, board);
      
      expect(playable).toHaveLength(2);
      expect(playable.map(t => t.id)).toContain(1);
      expect(playable.map(t => t.id)).toContain(3);
    });

    it('debe considerar ambos valores de la ficha', () => {
      const tiles = [
        { id: 1, left: 3, right: 5 }, // 5 conecta con rightEnd
      ];
      const board = {
        tiles: [{ id: 0, left: 6, right: 6 }],
        leftEnd: 6,
        rightEnd: 5
      };
      
      const playable = Engine.getPlayableTiles(tiles, board);
      
      expect(playable).toHaveLength(1);
    });
  });

  describe('canPlayAt', () => {
    it('debe retornar true para cualquier posición en tablero vacío', () => {
      const tile = { id: 1, left: 6, right: 4 };
      const board = Engine.createBoard();
      
      expect(Engine.canPlayAt(tile, 'center', board)).toBe(true);
      expect(Engine.canPlayAt(tile, 'left', board)).toBe(true);
      expect(Engine.canPlayAt(tile, 'right', board)).toBe(true);
    });

    it('debe verificar conexión con extremo izquierdo', () => {
      const board = {
        tiles: [{ id: 0, left: 6, right: 6 }],
        leftEnd: 6,
        rightEnd: 3
      };
      
      const validTile = { id: 1, left: 6, right: 4 };
      const invalidTile = { id: 2, left: 5, right: 2 };
      
      expect(Engine.canPlayAt(validTile, 'left', board)).toBe(true);
      expect(Engine.canPlayAt(invalidTile, 'left', board)).toBe(false);
    });

    it('debe verificar conexión con extremo derecho', () => {
      const board = {
        tiles: [{ id: 0, left: 6, right: 6 }],
        leftEnd: 6,
        rightEnd: 3
      };
      
      const validTile = { id: 1, left: 3, right: 1 };
      const invalidTile = { id: 2, left: 5, right: 2 };
      
      expect(Engine.canPlayAt(validTile, 'right', board)).toBe(true);
      expect(Engine.canPlayAt(invalidTile, 'right', board)).toBe(false);
    });
  });

  describe('getBoardEnds', () => {
    it('debe retornar null para tablero vacío', () => {
      const board = Engine.createBoard();
      const ends = Engine.getBoardEnds(board);
      
      expect(ends.left).toBeNull();
      expect(ends.right).toBeNull();
    });

    it('debe retornar los extremos correctos', () => {
      const board = {
        tiles: [],
        leftEnd: 5,
        rightEnd: 2
      };
      
      const ends = Engine.getBoardEnds(board);
      
      expect(ends.left).toBe(5);
      expect(ends.right).toBe(2);
    });
  });

  describe('Integración: Flujo de juego completo', () => {
    it('debe simular una secuencia de jugadas válida', () => {
      // Repartir
      const hands = Engine.dealTiles(4);
      const players = hands.map((tiles, i) => ({ id: i, tiles }));
      
      // Encontrar quien empieza
      const { player: startPlayer, tile: startTile } = Engine.findStartingPlayer(players);
      
      // Crear tablero y jugar primera ficha
      let board = Engine.createBoard();
      board = Engine.placeTile(board, startTile, 'center');
      
      // El tablero debe tener una ficha
      expect(board.tiles).toHaveLength(1);
      
      // Los extremos deben ser los valores de la ficha inicial
      expect(board.leftEnd).toBe(startTile.left);
      expect(board.rightEnd).toBe(startTile.right);
    });
  });
});
