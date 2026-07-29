import { GameConfig } from './config.js';

export function drawPlayer(ctx, player, camera) {
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

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(px + size / 2, drawPy + size - 2, 16 + (player.crouching ? 2 : 0), 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    const playerBob = player.grounded ? Math.sin(Date.now() / 100) * 2 : 0;
    const visualHeight = player.height * (player.crouching ? 0.9 : 1);

    ctx.translate(pX + pW / 2, pY + pH / 2 + playerBob);
    if (player.facing < 0) {
        ctx.scale(-1, 1);
    }
    if (player.crouching) {
        ctx.scale(1, 0.9);
    }

    ctx.fillStyle = player.color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.roundRect(-player.width / 2, -visualHeight / 2 + 10, player.width, visualHeight - 10, 10);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -visualHeight / 2 + 5 + playerBob, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    let playerLookDir = window.keys.right ? 4 : (window.keys.left ? -4 : 0);

    ctx.beginPath();
    ctx.arc(6 + playerLookDir, -visualHeight / 2 + 5 + playerBob, 6, 0, Math.PI * 2);
    ctx.arc(-6 + playerLookDir, -visualHeight / 2 + 5 + playerBob, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(8 + playerLookDir, -visualHeight / 2 + 5 + playerBob, 2, 0, Math.PI * 2);
    ctx.arc(-4 + playerLookDir, -visualHeight / 2 + 5 + playerBob, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(-15, 10 + playerBob, 5, 0, Math.PI * 2);
    ctx.arc(15, 10 + playerBob, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
}
