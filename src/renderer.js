import { drawIsoCube } from './drawIsoCube.js';
import { drawMovingBlock } from './drawMovingBlock.js';
import { drawProjectile } from './drawProjectile.js';
import { drawActor } from './drawActor.js';
import { drawPlayer } from './drawPlayer.js';

export class RenderEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Proxy Core Mapping Methods
    drawIsoCube(c, r, tileType, camera, level) {
        drawIsoCube(this.ctx, c, r, tileType, camera, level);
    }

    drawMovingBlock(block, camera) {
        drawMovingBlock(this.ctx, block, camera);
    }

    drawProjectile(projectile, camera) {
        drawProjectile(this.ctx, projectile, camera);
    }

    drawActor(actor, camera) {
        drawActor(this.ctx, actor, camera);
    }

    drawPlayer(player, camera) {
        drawPlayer(this.ctx, player, camera);
    }
}
