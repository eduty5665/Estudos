import { Scene } from "phaser";

export class GameScene extends Scene {
  constructor() {
    super("GameScene");
  }

  init() {
    this.gameHeight = this.game.config.height;
    this.gameWidth = this.game.config.width;
    this.asteroidSpawnDelay = 500;
    this.spaceshipVelocityX = 1200;
    this.missileVelocity = 900;
    this.asteroidVelocity = 250;
    this.score = 0;
  }

  create() {
    this.createSky();
    this.createSpaceship();
    this.createAsteroidSpawnEventTime();
    this.createGroups();
    this.createCollisions();
    this.createAnimations();
    this.createSoundEffects();
    this.createCursors();
    this.createScore();
    this.createGameOver();
  }

  update() {
    if (!this.spaceship.body) return;

    this.sky.tilePositionY -= 24;

    const { left, right, space } = this.cursors;
    const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(space);

    if (left.isDown)
      this.spaceship
        .setVelocityX(-this.spaceshipVelocityX)
        .setTexture("spaceship-turning")
        .setFlipX(false);
    else if (right.isDown)
      this.spaceship
        .setVelocityX(this.spaceshipVelocityX)
        .setTexture("spaceship-turning")
        .setFlipX(true);
    else this.spaceship.setVelocityX(0).setTexture("spaceship-forward");

    if (isSpaceJustDown) this.createMissiles();

    this.missiles.getChildren().forEach((missile) => {
      if (missile.getBounds().bottom < 0) missile.destroy();
    });

    this.asteroids.getChildren().forEach((asteroid) => {
      if (
        asteroid.getBounds().top > this.gameHeight ||
        asteroid.getBounds().right < 0 ||
        asteroid.getBounds().left > this.gameWidth
      )
        asteroid.destroy();
    });
  }

  createSky() {
    this.sky = this.add
      .tileSprite(0, 0, this.gameWidth, this.gameHeight, "sky")
      .setOrigin(0);
  }

  createSpaceship() {
    this.spaceship = this.physics.add
      .sprite(this.gameWidth / 2, this.gameHeight - 100, "spaceship-forward")
      .setScale(1.0)
      .setCollideWorldBounds(true);
  }

  createGroups() {
    this.missiles = this.physics.add.group({
      immovable: true,
      velocityY: -this.missileVelocity,
    });
    this.asteroids = this.physics.add.group({
      immovable: true,
      velocityY: this.asteroidVelocity,
    });
  }

  createAsteroidSpawnEventTime() {
    this.asteroidSpawnEventTime = this.time.addEvent({
      delay: this.asteroidSpawnDelay,
      callback: this.createAsteroid,
      callbackScope: this,
      loop: true,
    });
  }

  createAsteroid() {
    let asteroidPositionX = Phaser.Math.Between(0, this.gameWidth);
    let asteroidTypeNumber = Phaser.Math.Between(1, 3);
    let asteroidVelocityX = Phaser.Math.Between(-15, 15);

    this.asteroids
      .create(asteroidPositionX, 0, `asteroid-${asteroidTypeNumber}`)
      .setScale(1.5)
      .setVelocityX(asteroidVelocityX);
  }

  createMissiles() {
    this.missiles
      .create(this.spaceship.x - 16, this.spaceship.body.y, "missile")
      .setScale(2);

    this.missiles
      .create(this.spaceship.x + 16, this.spaceship.body.y, "missile")
      .setScale(2);

    this.missileSound.play();
  }

  onMissileHitAsteroid(missile, asteroid) {
    missile.destroy();
    this.explosionSound.play();
    asteroid.body.enable = false;
    asteroid.anims.play("explosion").on("animationcomplete", asteroid.destroy);
    this.updateScore();
  }

  onAsteroidHitSpaceship(asteroid, spaceship) {
    asteroid.destroy();
    this.asteroidSpawnEventTime.destroy();
    this.explosionSound.play();
    this.physics.pause();
    this.sky.tilePositionY = this.gameHeight;
    spaceship.body.enable = false;
    spaceship.anims
      .play("explosion")
      .on("animationcomplete", spaceship.destroy);
    this.showGameOver();
  }

  createCollisions() {
    this.physics.add.collider(
      this.missiles,
      this.asteroids,
      this.onMissileHitAsteroid,
      null,
      this
    );

    this.physics.add.collider(
      this.asteroids,
      this.spaceship,
      this.onAsteroidHitSpaceship,
      null,
      this
    );
  }

  createAnimations() {
    this.anims.create({
      key: "explosion",
      frames: this.anims.generateFrameNumbers("explosion", {
        start: 0,
        end: 8,
      }),
      frameRate: 48,
      repeat: 1,
    });
  }

  createSoundEffects() {
    this.missileSound = this.sound.add("shoot");
    this.explosionSound = this.sound.add("explosion");
  }

  createCursors() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  createScore() {
    this.scoreText = this.add
      .text(32, 32, `Score: ${this.score}`, {
        fill: "#FFFFFF",
        fontSize: 32,
        fontStyle: "bold",
      })
      .setDepth(9999);
  }

  updateScore() {
    this.score++;
    this.scoreText.setText(`Score: ${this.score}`);
  }

  showGameOver() {
    this.gameOverText.setAlpha(1);
    this.restartMessage.setAlpha(1);
  }

  restartGame() {
    this.anims.remove("explosion");
    this.score = 0;
    this.scene.restart();
  }

  createGameOver() {
    this.gameOverText = this.add
      .text(this.gameWidth / 2, this.gameHeight / 2, "Game Over", {
        color: "#FFFFFF",
        fontSize: 128,
        fontStyle: "bold",
      })
      .setOrigin(0.5, 1)
      .setDepth(9999)
      .setAlpha(0);

    this.restartMessage = this.add
      .text(
        this.gameWidth / 2,
        this.gameHeight / 2,
        "Click here to try again!",
        {
          color: "#FFFFFF",
          fontSize: 42,
          fontStyle: "bold",
        }
      )
      .setOrigin(0.5, 0)
      .setDepth(9999)
      .setAlpha(0)
      .setInteractive({ cursor: "pointer" })
      .on("pointerdown", () => this.restartGame());
  }
}
