import Phaser from 'phaser';

// Genera las texturas por código: la plantilla funciona sin ningún asset.
// Sustitúyelas por sprites reales en public/assets/ cuando los tengas.
export class BootScene extends Phaser.Scene {
  constructor() { super('boot'); }

  create() {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0x4fd1c5).fillRoundedRect(0, 0, 48, 48, 12);
    g.generateTexture('player', 48, 48).clear();
    g.fillStyle(0xf6e05e).fillCircle(12, 12, 12);
    g.generateTexture('coin', 24, 24).clear();
    g.fillStyle(0xf56565).fillTriangle(16, 0, 32, 32, 0, 32);
    g.generateTexture('enemy', 32, 32).destroy();
    this.scene.start('game');
  }
}
