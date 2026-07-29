import { GameConfig } from './config.js';

export function drawIsoCube(ctx, c, r, tileType, camera, level) {
    const x = (c * GameConfig.TILE_SIZE) - camera.x;
    const y = (r * GameConfig.TILE_SIZE) - camera.y;
    const frontX = x;
    const frontY = y - GameConfig.ISO_DEPTH;
    const size = GameConfig.TILE_SIZE;
    const depth = GameConfig.ISO_DEPTH;

    ctx.strokeStyle = '#3e2723';

    if (tileType === GameConfig.TILES.WATER) {
        const waterHeight = size * 0.75;
        const waterTop = frontY + size - waterHeight;
        
        ctx.fillStyle = '#4fc3f7';
        ctx.beginPath();
        ctx.moveTo(frontX, waterTop);
        ctx.lineTo(frontX + size, waterTop);
        ctx.lineTo(frontX + size + depth, waterTop - depth);
        ctx.lineTo(frontX + depth, waterTop - depth);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#81d4fa';
        ctx.beginPath();
        ctx.moveTo(frontX + size, waterTop);
        ctx.lineTo(frontX + size + depth, waterTop - depth);
        ctx.lineTo(frontX + size + depth, frontY + size - depth);
        ctx.lineTo(frontX + size, frontY + size);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#1976d2';
        ctx.fillRect(frontX, waterTop, size, waterHeight);
        ctx.strokeRect(frontX, waterTop, size, waterHeight);
        return;
    }

    // 1. Top Face
    if (!level.hasSolidBlockAbove(c, r)) {
        ctx.fillStyle = tileType === GameConfig.TILES.GOAL ? '#27ae60' : '#8d6e63';
        ctx.beginPath();
        ctx.moveTo(frontX, frontY);
        ctx.lineTo(frontX + size, frontY);
        ctx.lineTo(frontX + size + depth, frontY - depth);
        ctx.lineTo(frontX + depth, frontY - depth);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    // 2. Right Face
    if (!level.hasSolidBlockRight(c, r)) {
        ctx.fillStyle = tileType === GameConfig.TILES.GOAL ? '#1e8449' : '#5d4037';
        ctx.beginPath();
        ctx.moveTo(frontX + size, frontY);
        ctx.lineTo(frontX + size + depth, frontY - depth);
        ctx.lineTo(frontX + size + depth, frontY + size - depth);
        ctx.lineTo(frontX + size, frontY + size);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    // 3. Front Face
    ctx.fillStyle = tileType === GameConfig.TILES.GOAL ? '#2ecc71' : '#d7ccc8';
    ctx.fillRect(frontX, frontY, size, size);
    ctx.strokeRect(frontX, frontY, size, size);

    if (tileType === GameConfig.TILES.SPIKE_TRAP) {
        ctx.fillStyle = '#eceff1';
        const spikeY = frontY + size - 12;
        ctx.fillRect(frontX + 12, spikeY, size - 24, 10);
        ctx.fillRect(frontX + 16, spikeY - 8, 8, 8);
        ctx.fillRect(frontX + size - 24, spikeY - 8, 8, 8);
        ctx.fillStyle = '#37474f';
        ctx.fillRect(frontX + 18, spikeY - 12, 4, 12);
        ctx.fillRect(frontX + size - 22, spikeY - 12, 4, 12);
    }

    if (tileType === GameConfig.TILES.STICKY_BLOCK) {
        ctx.fillStyle = '#6d4c41';
        ctx.fillRect(frontX + 8, frontY + 8, size - 16, size - 16);
        ctx.fillStyle = '#8d6e63';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(frontX + 12 + i * 8, frontY + 12, 4, size - 24);
        }
    }

    if (tileType === GameConfig.TILES.GOAL) {
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(frontX + 30, frontY + 10, 4, 20);
        ctx.beginPath();
        ctx.moveTo(frontX + 34, frontY + 10);
        ctx.lineTo(frontX + 50, frontY + 20);
        ctx.lineTo(frontX + 34, frontY + 30);
        ctx.fill();
    }
}
