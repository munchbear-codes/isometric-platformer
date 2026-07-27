import { GameConfig } from './config.js';
import { InputHandler } from './input.js';
import { LevelManager } from './level.js';
import { Camera } from './camera.js';
import { Player } from './player.js';
import { PhysicsEngine } from './physics.js';
import { RenderEngine } from './renderer.js';

class GameEngine {
    constructor() {
        this.renderer = new RenderEngine('gameCanvas');
        this.input = new InputHandler();
        this.level = new LevelManager(GameConfig.MAP_DATA);
        this.camera = new Camera();
        this.player = new Player();
        
        this.physics = new PhysicsEngine(this.level, () => this.handleWinState());
        this.loop = this.loop.bind(this);
    }

    start() {
        this.player.reset();
        requestAnimationFrame(this.loop);
    }

    handleWinState() {
        setTimeout(() => alert("YOU WIN! 🎉"), 10);
        this.player.reset();
    }

    update() {
        this.player.crouching = this.input.isCrouching() && this.player.grounded;
        this.player.facing = this.input.isMovingLeft() ? -1 : (this.input.isMovingRight() ? 1 : this.player.facing);

        if (this.player.invincibilityFrames > 0) {
            this.player.invincibilityFrames -= 1;
        }

        this.physics.updateObject(this.player, this.input);
        
        const pWorldX = this.player.x * GameConfig.TILE_SIZE;
        const pWorldY = this.player.y * GameConfig.TILE_SIZE;
        this.camera.update(pWorldX, pWorldY, this.renderer.canvas.width, this.renderer.canvas.height);
    }

    draw() {
        this.renderer.clear();

        let startC = Math.max(0, Math.floor(this.camera.x / GameConfig.TILE_SIZE) - 1);
        let endC = Math.min(this.level.width - 1, startC + Math.ceil(this.renderer.canvas.width / GameConfig.TILE_SIZE) + 2);
        let startR = Math.max(0, Math.floor(this.camera.y / GameConfig.TILE_SIZE) - 1);
        let endR = Math.min(this.level.height - 1, startR + Math.ceil(this.renderer.canvas.height / GameConfig.TILE_SIZE) + 2);

        for (let r = endR; r >= startR; r--) {
            for (let c = startC; c <= endC; c++) {
                const tileType = this.level.getTile(c, r);
                if (tileType !== GameConfig.TILES.AIR
                    && tileType !== GameConfig.TILES.MOVING_BLOCK_VERTICAL
                    && tileType !== GameConfig.TILES.MOVING_BLOCK_HORIZONTAL) {
                    this.renderer.drawIsoCube(c, r, tileType, this.camera, this.level);
                }
            }
        }

        for (const block of this.level.movingBlocks) {
            this.renderer.drawMovingBlock(block, this.camera);
        }

        this.renderer.drawPlayer(this.player, this.camera);
    }

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(this.loop);
    }
}

// Initialise and start the game engine
const game = new GameEngine();
game.start();
