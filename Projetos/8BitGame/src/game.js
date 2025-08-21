import { AUTO, Game } from "phaser";
import { PreloaderScene } from "./scenes/PreloaderScene";
import { SplashScene } from "./scenes/SplashScene";
import { GameScene } from "./scenes/GameScene";

const config = {
  type: AUTO,
  width: 1024,
  height: 1024,
  parent: "game-container",
  backgroundColor: "#000000",
  physics: {
    default: "arcade",
  },
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [PreloaderScene, SplashScene, GameScene],
};

const StartGame = (parent) => {
  return new Game({ ...config, parent });
};

export default StartGame;
