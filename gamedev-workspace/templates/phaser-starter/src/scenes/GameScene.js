import Phaser from 'phaser';

const SPEED = 320;

export class GameScene extends Phaser.Scene {
  constructor() { super('game'); }

  create() {
    const { width, height } = this.scale;
    this.score = 0;
    this.alive = true;

    this.player = this.physics.add.image(width / 2, height / 2, 'player').setCollideWorldBounds(true);
    this.coins = this.physics.add.group();
    this.enemies = this.physics.add.group();

    this.scoreText = this.add.text(16, 16, 'Puntos: 0', { fontFamily: 'sans-serif', fontSize: '24px', color: '#ffffff' });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.target = null; // destino táctil / ratón
    this.input.on('pointerdown', (p) => (this.target = new Phaser.Math.Vector2(p.x, p.y)));
    this.input.on('pointermove', (p) => p.isDown && (this.target = new Phaser.Math.Vector2(p.x, p.y)));
    this.input.on('pointerup', () => (this.target = null));

    this.physics.add.overlap(this.player, this.coins, (_, coin) => this.collect(coin));
    this.physics.add.overlap(this.player, this.enemies, () => this.gameOver());

    this.time.addEvent({ delay: 900, loop: true, callback: () => this.spawnCoin() });
    this.time.addEvent({ delay: 1500, loop: true, callback: () => this.spawnEnemy() });

    this.scale.on('resize', (size) => this.physics.world.setBounds(0, 0, size.width, size.height));
  }

  spawnCoin() {
    if (!this.alive) return;
    const { width, height } = this.scale;
    this.coins.create(Phaser.Math.Between(24, width - 24), Phaser.Math.Between(64, height - 24), 'coin');
  }

  spawnEnemy() {
    if (!this.alive) return;
    const { width } = this.scale;
    const enemy = this.enemies.create(Phaser.Math.Between(16, width - 16), -32, 'enemy');
    enemy.setVelocityY(Phaser.Math.Between(120, 220) + this.score * 4);
  }

  collect(coin) {
    coin.destroy();
    this.score += 1;
    this.scoreText.setText(`Puntos: ${this.score}`);
    this.tweens.add({ targets: this.player, scale: 1.2, duration: 80, yoyo: true });
  }

  gameOver() {
    if (!this.alive) return;
    this.alive = false;
    this.physics.pause();
    this.player.setTint(0xff0000);
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2, `Fin — ${this.score} puntos\nToca para reiniciar`, {
      fontFamily: 'sans-serif', fontSize: '32px', color: '#ffffff', align: 'center',
      backgroundColor: '#000000aa', padding: { x: 24, y: 16 },
    }).setOrigin(0.5);
    this.input.once('pointerdown', () => this.scene.restart());
    this.input.keyboard.once('keydown-SPACE', () => this.scene.restart());
  }

  update() {
    if (!this.alive) return;
    const body = this.player.body;
    body.setVelocity(0);

    if (this.target) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.target.x, this.target.y);
      if (dist > 8) this.physics.moveTo(this.player, this.target.x, this.target.y, SPEED);
    } else {
      const c = this.cursors;
      body.setVelocityX((c.right.isDown - c.left.isDown) * SPEED);
      body.setVelocityY((c.down.isDown - c.up.isDown) * SPEED);
      body.velocity.normalize().scale(SPEED * (body.velocity.length() > 0 ? 1 : 0));
    }

    this.enemies.getChildren().slice().forEach((e) => { if (e.y > this.scale.height + 40) e.destroy(); });
  }
}
