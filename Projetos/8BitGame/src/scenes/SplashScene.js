import { Scene } from "phaser";

export class SplashScene extends Scene {
  constructor() {
    super("SplashScene");
  }

  create() {
    this.add
      .image(0, 0, "intro")
      .setOrigin(0)
      .setInteractive({ cursor: "pointer" })
      .on("pointerdown", () => this.scene.start("GameScene"));
  }

  update(time) {
    if (time > 3000) this.scene.start("GameScene");
  }
}
