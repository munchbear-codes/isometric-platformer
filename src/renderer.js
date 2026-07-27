import { GameConfig } from './config.js';

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

    drawIsoCube(c, r, tileType, camera, level) {
        const x = (c * GameConfig.TILE_SIZE) - camera.x;
        const y = (r * GameConfig.TILE_SIZE) - camera.y;
        const frontX = x;
        const frontY = y - GameConfig.ISO_DEPTH;
        const size = GameConfig.TILE_SIZE;
        const depth = GameConfig.ISO_DEPTH;

        this.ctx.strokeStyle = '#3e2723';

        // 1. Top Face
        if (!level.hasSolidBlockAbove(c, r)) {
            this.ctx.fillStyle = tileType === GameConfig.TILES.GOAL ? '#27ae60' : '#8d6e63';
            this.ctx.beginPath();
            this.ctx.moveTo(frontX, frontY);
            this.ctx.lineTo(frontX + size, frontY);
            this.ctx.lineTo(frontX + size + depth, frontY - depth);
            this.ctx.lineTo(frontX + depth, frontY - depth);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        }

        // 2. Right Face
        if (!level.hasSolidBlockRight(c, r)) {
            this.ctx.fillStyle = tileType === GameConfig.TILES.GOAL ? '#1e8449' : '#5d4037';
            this.ctx.beginPath();
            this.ctx.moveTo(frontX + size, frontY);
            this.ctx.lineTo(frontX + size + depth, frontY - depth);
            this.ctx.lineTo(frontX + size + depth, frontY + size - depth);
            this.ctx.lineTo(frontX + size, frontY + size);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        }

        // 3. Front Face
        this.ctx.fillStyle = tileType === GameConfig.TILES.GOAL ? '#2ecc71' : '#d7ccc8';
        this.ctx.fillRect(frontX, frontY, size, size);
        this.ctx.strokeRect(frontX, frontY, size, size);

        if (tileType === GameConfig.TILES.GOAL) {
            this.ctx.fillStyle = '#f1c40f';
            this.ctx.fillRect(frontX + 30, frontY + 10, 4, 20);
            this.ctx.beginPath();
            this.ctx.moveTo(frontX + 34, frontY + 10);
            this.ctx.lineTo(frontX + 50, frontY + 20);
            this.ctx.lineTo(frontX + 34, frontY + 30);
            this.ctx.fill();
        }
    }

    drawMovingBlock(block, camera) {
        const x = (block.c * GameConfig.TILE_SIZE) - camera.x;
        const y = (block.r * GameConfig.TILE_SIZE) - camera.y;
        const frontX = x;
        const frontY = y - GameConfig.ISO_DEPTH;
        const size = GameConfig.TILE_SIZE;
        const depth = GameConfig.ISO_DEPTH;
        const color = block.kind === 'vertical' ? '#4fc3f7' : '#ffb74d';

        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = '#263238';
        this.ctx.lineWidth = 2;

        this.ctx.beginPath();
        this.ctx.moveTo(frontX, frontY);
        this.ctx.lineTo(frontX + size, frontY);
        this.ctx.lineTo(frontX + size + depth, frontY - depth);
        this.ctx.lineTo(frontX + depth, frontY - depth);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = block.kind === 'vertical' ? '#29b6f6' : '#ffa726';
        this.ctx.beginPath();
        this.ctx.moveTo(frontX + size, frontY);
        this.ctx.lineTo(frontX + size + depth, frontY - depth);
        this.ctx.lineTo(frontX + size + depth, frontY + size - depth);
        this.ctx.lineTo(frontX + size, frontY + size);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = block.kind === 'vertical' ? '#01579b' : '#ef6c00';
        this.ctx.fillRect(frontX, frontY, size, size);
        this.ctx.strokeRect(frontX, frontY, size, size);
    }

    drawPlayer(player, camera) {
        const px = (player.x * GameConfig.TILE_SIZE) - camera.x;
        const py = (player.y * GameConfig.TILE_SIZE) - camera.y;
        const drawPy = py - GameConfig.ISO_DEPTH;
        const size = GameConfig.TILE_SIZE;

        const pW = size * player.w;
        const pH = size * player.h;
        const pX = px + (size - pW) / 2;
        const pY = drawPy + (size - pH);

        const shouldDrawPlayer = player.invincibilityFrames <= 0 || Math.floor(player.invincibilityFrames / 6) % 2 !== 0;
        if (!shouldDrawPlayer) {
            return;
        }

        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(px + size / 2, drawPy + size - 2, 16 + (player.crouching ? 2 : 0), 7, 0, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.save();
        const playerBob = player.grounded ? Math.sin(Date.now() / 100) * 2 : 0;
        const squatOffset = player.crouching ? 10 : 0;
        const squatScale = player.crouching ? 0.82 : 1;

        this.ctx.translate(pX + pW / 2, pY + pH / 2 + playerBob + squatOffset);
        if (player.facing < 0) {
            this.ctx.scale(-1, 1);
        }
        if (player.crouching) {
            this.ctx.scale(1, squatScale);
        }

        this.ctx.fillStyle = player.color;
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 3;

        this.ctx.beginPath();
        this.ctx.roundRect(-player.width / 2, -player.height / 2 + 10, player.width, player.height - 10, 10);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(0, -player.height / 2 + 5 + playerBob, 20, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#ffffff';
        let playerLookDir = window.keys.right ? 4 : (window.keys.left ? -4 : 0);

        this.ctx.beginPath();
        this.ctx.arc(6 + playerLookDir, -player.height / 2 + 5 + playerBob, 6, 0, Math.PI * 2);
        this.ctx.arc(-6 + playerLookDir, -player.height / 2 + 5 + playerBob, 6, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(8 + playerLookDir, -player.height / 2 + 5 + playerBob, 2, 0, Math.PI * 2);
        this.ctx.arc(-4 + playerLookDir, -player.height / 2 + 5 + playerBob, 2, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = player.color;
        this.ctx.beginPath();
        this.ctx.arc(-15, 10 + playerBob, 5, 0, Math.PI * 2);
        this.ctx.arc(15, 10 + playerBob, 5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.restore();
    }
}
