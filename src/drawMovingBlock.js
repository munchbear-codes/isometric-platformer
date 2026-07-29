import { GameConfig } from './config.js';

export function drawMovingBlock(ctx, block, camera) {
    const x = (block.c * GameConfig.TILE_SIZE) - camera.x;
    const y = (block.r * GameConfig.TILE_SIZE) - camera.y;
    const frontX = x;
    const frontY = y - GameConfig.ISO_DEPTH;
    const size = GameConfig.TILE_SIZE;
    const depth = GameConfig.ISO_DEPTH;
    const color = block.kind === 'vertical' ? '#4fc3f7' : '#ffb74d';

    ctx.fillStyle = color;
    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(frontX, frontY);
    ctx.lineTo(frontX + size, frontY);
    ctx.lineTo(frontX + size + depth, frontY - depth);
    ctx.lineTo(frontX + depth, frontY - depth);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = block.kind === 'vertical' ? '#29b6f6' : '#ffa726';
    ctx.beginPath();
    ctx.moveTo(frontX + size, frontY);
    ctx.lineTo(frontX + size + depth, frontY - depth);
    ctx.lineTo(frontX + size + depth, frontY + size - depth);
    ctx.lineTo(frontX + size, frontY + size);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = block.kind === 'vertical' ? '#01579b' : '#ef6c00';
    ctx.fillRect(frontX, frontY, size, size);
    ctx.strokeRect(frontX, frontY, size, size);
}
