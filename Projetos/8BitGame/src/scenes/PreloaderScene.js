import { Scene } from "phaser";

export class PreloaderScene extends Scene {
  constructor() {
    super("PreloaderScene");
  }

  preload() {
    this.load.setPath("assets");
    this.load.image("intro", "intro.png");
    this.load.image("sky", "sky.png");
    this.load.image("spaceship-forward", "spaceship-forward.png");
    this.load.image("spaceship-turning", "spaceship-turning.png");
    this.load.image("missile", "missile.png");
    this.load.spritesheet("explosion", "explosion.png", {
      frameHeight: 64,
      frameWidth: 585 / 9,
    });
    for (let i = 0; i < 3; i++) {
      this.load.image(`asteroid-${i + 1}`, `asteroid-${i + 1}.png`);
    }
    this.load.audio("shoot", "shoot.wav");
    this.load.audio("explosion", "explosion.wav");
  }

  create() {
    this.scene.start("SplashScene");
  }
}
