import { GameConfig } from './config.js';

export function drawProjectile(ctx, projectile, camera) {
    const x = (projectile.x * GameConfig.TILE_SIZE) - camera.x;
    const y = (projectile.y * GameConfig.TILE_SIZE) - camera.y;
    const frontX = x;
    const frontY = y - GameConfig.ISO_DEPTH;

    ctx.fillStyle = '#ff8f00';
    ctx.beginPath();
    ctx.arc(frontX + GameConfig.TILE_SIZE * 0.5, frontY + GameConfig.TILE_SIZE * 0.5, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ff3d00';
    ctx.stroke();
}
