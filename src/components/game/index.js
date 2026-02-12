// Componentes de juego
export { default as Tile, Dots, DotPattern, TileH, TileV, Doble9Icon, DOT_GRID, DOT_POSITIONS } from './Tile';
export { default as Board } from './Board';
export { default as PlayerHand } from './PlayerHand';
export { default as GameHUD, EmotePanel } from './GameHUD';

// Componentes visuales del juego
export { 
  FaceDownTile, 
  OpponentHandTop, 
  OpponentHandSide, 
  PassIndicator,
  PASS_POSITIONS,
  FlyingTileAnimation,
  GameArea 
} from './GameVisuals';

// Tableros (Canvas y DOM)
export { default as BoardCanvas } from './BoardCanvas';
export { default as BoardDOM } from './BoardDOM';

// Área de mano del jugador con Drag & Drop
export { default as PlayerHandArea } from './PlayerHandArea';
