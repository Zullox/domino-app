// ============================================================================
// SNAKE BOARD - Motor del tablero con patrón S (serpiente)
// ============================================================================
// Sistema de posicionamiento visual de fichas en el tablero de dominó
// Las fichas se colocan formando un patrón de serpiente que dobla en los bordes
// ============================================================================

// ============================================================================
// CONFIGURACIÓN DEL TABLERO
// ============================================================================

export const BOARD_CONFIG = {
  width: 13,      // Columnas
  height: 19,     // Filas
  centerX: 6,     // Columna central
  centerY: 9      // Fila central
};

// ============================================================================
// SISTEMA DE OCUPACIÓN DE CELDAS
// ============================================================================

/**
 * Crea un Set para rastrear celdas ocupadas
 */
export const createOccupancySet = () => new Set();

/**
 * Marca celdas como ocupadas
 * @param {Set} set - Set de ocupación
 * @param {number} x - Posición X
 * @param {number} y - Posición Y
 * @param {boolean} isDouble - Si es ficha doble
 * @param {boolean} isHorizontal - Si está horizontal
 */
export const markOccupied = (set, x, y, isDouble, isHorizontal) => {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  
  // Todas las fichas ocupan 2 celdas (incluyendo dobles)
  if (isHorizontal) {
    set.add(`${ix},${iy}`);
    set.add(`${ix + 1},${iy}`);
  } else {
    set.add(`${ix},${iy}`);
    set.add(`${ix},${iy + 1}`);
  }
};

/**
 * Verifica si una ficha puede colocarse en una posición
 * @param {Set} set - Set de ocupación
 * @param {number} x - Posición X
 * @param {number} y - Posición Y
 * @param {boolean} isDouble - Si es ficha doble
 * @param {boolean} isHorizontal - Si está horizontal
 * @returns {boolean} Si puede colocarse
 */
export const canPlaceTile = (set, x, y, isDouble, isHorizontal) => {
  const { width, height } = BOARD_CONFIG;
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  
  // Verificar límites
  if (ix < 0 || iy < 0) return false;
  
  // Todas las fichas ocupan 2 celdas
  if (isHorizontal) {
    if (ix + 1 >= width || iy >= height) return false;
    if (set.has(`${ix},${iy}`) || set.has(`${ix + 1},${iy}`)) return false;
  } else {
    if (ix >= width || iy + 1 >= height) return false;
    if (set.has(`${ix},${iy}`) || set.has(`${ix},${iy + 1}`)) return false;
  }
  
  return true;
};

// ============================================================================
// SNAKE BOARD - Motor principal
// ============================================================================

export const SnakeBoard = {
  /**
   * Crea un tablero vacío
   */
  create: () => ({
    tiles: [],
    center: null,
    occupiedCells: createOccupancySet(),
    snakeTop: null,
    snakeBottom: null
  }),

  /**
   * Coloca la ficha central (primera ficha)
   * @param {Object} board - Estado del tablero
   * @param {Object} tile - Ficha a colocar
   * @returns {Object} Tablero actualizado
   */
  placeCenter: (board, tile) => {
    const { centerX, centerY } = BOARD_CONFIG;
    const isDouble = tile.left === tile.right;
    
    // Si es doble, centrar con offset 0.5 (igual que en tramos verticales)
    const x = isDouble ? centerX - 0.5 : centerX;
    const y = centerY;
    const isHorizontal = isDouble;
    
    const placed = {
      id: tile.id,
      left: tile.left,
      right: tile.right,
      x,
      y,
      isDouble,
      isHorizontal,
      orientation: isHorizontal ? 'HORIZONTAL' : 'VERTICAL',
      isCenter: true,
      visualTop: tile.left,
      visualBottom: tile.right
    };

    board.tiles = [placed];
    board.center = placed;
    board.occupiedCells = createOccupancySet();
    markOccupied(board.occupiedCells, x, y, isDouble, isHorizontal);

    // Inicializar estados de serpiente
    if (isDouble) {
      // Doble horizontal - solo ocupa 1 celda de alto
      board.snakeTop = {
        column: centerX,
        y: centerY - 2,
        direction: 'UP',
        value: tile.left,
        inElbow: false,
        elbowCount: 0,
        lastTileX: x,
        lastTileY: y,
        lastTileWasHorizontal: true,
        side: 'top'
      };
      
      board.snakeBottom = {
        column: centerX,
        y: centerY + 1,
        direction: 'DOWN',
        value: tile.right,
        inElbow: false,
        elbowCount: 0,
        lastTileX: x,
        lastTileY: y,
        lastTileWasHorizontal: true,
        side: 'bottom'
      };
    } else {
      // No doble (vertical) - ocupa 2 celdas de alto
      board.snakeTop = {
        column: centerX,
        y: centerY - 2,
        direction: 'UP',
        value: tile.left,
        inElbow: false,
        elbowCount: 0,
        lastTileX: x,
        lastTileY: y,
        lastTileWasHorizontal: false,
        side: 'top'
      };
      
      board.snakeBottom = {
        column: centerX,
        y: centerY + 2,
        direction: 'DOWN',
        value: tile.right,
        inElbow: false,
        elbowCount: 0,
        lastTileX: x,
        lastTileY: y,
        lastTileWasHorizontal: false,
        side: 'bottom'
      };
    }

    return board;
  },

  /**
   * Verifica si una ficha puede conectarse con un valor de socket
   */
  canPlace: (tile, socketValue) => {
    return tile.left === socketValue || tile.right === socketValue;
  },

  /**
   * Obtiene los valores en los extremos del tablero
   */
  getEnds: (board) => {
    if (!board.center) return { left: null, right: null };
    return {
      left: board.snakeTop?.value ?? null,
      right: board.snakeBottom?.value ?? null
    };
  },

  /**
   * Coloca una ficha en el tablero
   * @param {Object} board - Estado del tablero
   * @param {Object} tile - Ficha a colocar
   * @param {string} socketId - 'top' o 'bottom'
   * @returns {Object|null} Ficha colocada o null si no es válido
   */
  placeTile: (board, tile, socketId) => {
    const snake = socketId === 'top' ? board.snakeTop : board.snakeBottom;
    if (!snake) return null;

    // Validar conexión
    if (tile.left !== snake.value && tile.right !== snake.value) {
      return null;
    }

    const isDouble = tile.left === tile.right;

    // Valores de conexión
    let valueConecta, valueExpuesto;
    if (tile.left === snake.value) {
      valueConecta = tile.left;
      valueExpuesto = tile.right;
    } else {
      valueConecta = tile.right;
      valueExpuesto = tile.left;
    }

    // Calcular posición y orientación
    let x, y, isHorizontal;
    
    if (snake.inElbow) {
      // En codo - TODAS las fichas se colocan horizontal
      const lastX = snake.lastTileX;
      const lastY = snake.lastTileY;
      const lastWasHorizontal = snake.lastTileWasHorizontal;
      
      const goingRight = snake.side === 'top';
      
      if (goingRight) {
        // TOP gira a la derecha
        if (lastWasHorizontal) {
          x = lastX + 2;
        } else {
          x = Math.floor(lastX) + 1;
        }
        if (snake.direction === 'UP') {
          y = Math.floor(lastY);
        } else {
          y = lastWasHorizontal ? Math.floor(lastY) : Math.floor(lastY) + 1;
        }
      } else {
        // BOTTOM gira a la izquierda
        if (lastWasHorizontal) {
          x = lastX - 2;
        } else {
          x = Math.floor(lastX) - 2;
        }
        if (snake.direction === 'DOWN') {
          y = lastWasHorizontal ? Math.floor(lastY) : Math.floor(lastY) + 1;
        } else {
          y = Math.floor(lastY);
        }
      }
      isHorizontal = true;
    } else {
      // En tramo vertical
      if (isDouble) {
        // Doble horizontal en tramo vertical - CENTRADO con offset 0.5
        x = snake.column - 0.5;
        if (snake.direction === 'UP') {
          y = snake.y + 1;
        } else {
          y = snake.y;
        }
        isHorizontal = true;
      } else {
        // Ficha vertical normal
        x = snake.column;
        y = snake.y;
        isHorizontal = false;
      }
    }

    // En codo, el doble se comporta como ficha normal (2 celdas)
    const effectiveIsDouble = snake.inElbow ? false : isDouble;

    // Validar que cabe
    if (!canPlaceTile(board.occupiedCells, x, y, effectiveIsDouble, isHorizontal)) {
      return null;
    }

    // Valores visuales
    let visualTop, visualBottom;
    if (!isHorizontal) {
      // Vertical
      if (snake.direction === 'UP') {
        visualTop = valueExpuesto;
        visualBottom = valueConecta;
      } else {
        visualTop = valueConecta;
        visualBottom = valueExpuesto;
      }
    } else {
      // Horizontal
      if (snake.inElbow) {
        if (socketId === 'top') {
          visualTop = valueConecta;
          visualBottom = valueExpuesto;
        } else {
          visualTop = valueExpuesto;
          visualBottom = valueConecta;
        }
      } else {
        visualTop = tile.left;
        visualBottom = tile.right;
      }
    }

    const placed = {
      id: tile.id,
      left: tile.left,
      right: tile.right,
      x,
      y,
      isDouble,
      isHorizontal,
      orientation: isHorizontal ? 'HORIZONTAL' : 'VERTICAL',
      visualTop,
      visualBottom,
      inElbow: snake.inElbow
    };

    board.tiles.push(placed);
    markOccupied(board.occupiedCells, x, y, effectiveIsDouble, isHorizontal);

    // Actualizar estado de la serpiente
    SnakeBoard.updateSnake(snake, socketId, isDouble, placed);
    snake.value = valueExpuesto;

    return placed;
  },

  /**
   * Actualiza el estado de la serpiente después de colocar una ficha
   */
  updateSnake: (snake, socketId, isDouble, placedTile) => {
    const { height, width } = BOARD_CONFIG;
    
    if (snake.inElbow) {
      // En codo - después de colocar la ficha horizontal
      snake.elbowCount++;
      
      const goingRight = snake.side === 'top';
      
      // Después de 1 ficha horizontal, volver a vertical
      if (snake.elbowCount >= 1) {
        snake.inElbow = false;
        snake.elbowCount = 0;
        
        // Invertir dirección vertical
        snake.direction = snake.direction === 'UP' ? 'DOWN' : 'UP';
        
        // Calcular columna
        if (goingRight) {
          snake.column = Math.round(placedTile.x + 1);
        } else {
          snake.column = Math.round(placedTile.x);
        }
        
        // Calcular posición Y para la siguiente ficha vertical
        if (snake.direction === 'DOWN') {
          snake.y = Math.floor(placedTile.y) + 1;
          if (snake.y + 1 >= 18) {
            snake.inElbow = true;
            snake.elbowCount = 0;
            snake.lastTileX = placedTile.x;
            snake.lastTileY = placedTile.y;
            snake.lastTileWasHorizontal = true;
          }
        } else {
          snake.y = Math.floor(placedTile.y) - 2;
          if (snake.y < 0) {
            snake.inElbow = true;
            snake.elbowCount = 0;
            snake.lastTileX = placedTile.x;
            snake.lastTileY = placedTile.y;
            snake.lastTileWasHorizontal = true;
          }
        }
      }
    } else {
      // En tramo vertical - actualizar Y para la siguiente ficha
      if (snake.direction === 'UP') {
        snake.y = Math.floor(placedTile.y) - 2;
      } else {
        if (isDouble) {
          snake.y = Math.floor(placedTile.y) + 1;
        } else {
          snake.y = Math.floor(placedTile.y) + 2;
        }
      }
      
      // Verificar bordes - activar codo si la siguiente ficha no cabe
      const needsElbowUp = snake.direction === 'UP' && snake.y < 0;
      const needsElbowDown = snake.direction === 'DOWN' && (snake.y + 1 >= 18);
      
      if (needsElbowUp || needsElbowDown) {
        snake.inElbow = true;
        snake.elbowCount = 0;
        snake.lastTileX = placedTile.x;
        snake.lastTileY = placedTile.y;
        snake.lastTileWasHorizontal = placedTile.isHorizontal;
      }
    }
  },

  /**
   * Clona el tablero (deep copy)
   */
  clone: (board) => ({
    tiles: JSON.parse(JSON.stringify(board.tiles)),
    center: board.center ? JSON.parse(JSON.stringify(board.center)) : null,
    occupiedCells: new Set(board.occupiedCells || []),
    snakeTop: board.snakeTop ? JSON.parse(JSON.stringify(board.snakeTop)) : null,
    snakeBottom: board.snakeBottom ? JSON.parse(JSON.stringify(board.snakeBottom)) : null
  }),

  /**
   * Obtiene información del estado actual
   */
  getState: (board) => ({
    tileCount: board.tiles.length,
    hasCenter: !!board.center,
    topValue: board.snakeTop?.value ?? null,
    bottomValue: board.snakeBottom?.value ?? null,
    topDirection: board.snakeTop?.direction ?? null,
    bottomDirection: board.snakeBottom?.direction ?? null,
    topInElbow: board.snakeTop?.inElbow ?? false,
    bottomInElbow: board.snakeBottom?.inElbow ?? false
  })
};

// ============================================================================
// EXPORTACIONES
// ============================================================================

export default SnakeBoard;
