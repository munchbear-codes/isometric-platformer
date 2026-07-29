import { GameConfig } from './config.js';

export function drawActor(ctx, actor, camera) {
    if (actor.invincibilityFrames > 0 && Math.floor(actor.invincibilityFrames / 6) % 2 === 0) {
        return;
    }

    const px = (actor.x * GameConfig.TILE_SIZE) - camera.x;
    const py = (actor.y * GameConfig.TILE_SIZE) - camera.y;
    const drawPy = py - GameConfig.ISO_DEPTH;
    const size = GameConfig.TILE_SIZE;

    const targetW = actor.width ?? actor.w ?? 0.6;
    const targetH = actor.height ?? actor.h ?? 1.15;
    
    const pW = size * targetW;
    const pH = size * targetH;
    const pX = px + (size - pW) / 2;
    const pY = drawPy + (size - pH);

    const isCrouching = !!actor.crouching;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(px + size / 2, drawPy + size - 2, 16 + (isCrouching ? 2 : 0), 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    const actorBob = actor.grounded ? Math.sin(Date.now() / 100) * 2 : 0;
    const visualHeight = pH * (isCrouching ? 0.9 : 1);

    ctx.translate(pX + pW / 2, pY + pH / 2 + actorBob);
    
    // Save current transformation metrics before determining if the avatar flips left
    ctx.save();
    if (actor.facing < 0) {
        ctx.scale(-1, 1);
    }
    if (isCrouching) {
        ctx.scale(1, 0.9);
    }

    // Torso Pass
    ctx.fillStyle = actor.color || '#ffffff'; 
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.roundRect(-pW / 2, -visualHeight / 2 + 10, pW, visualHeight - 10, 10);
    ctx.fill();
    ctx.stroke();

    // Head Arc Pass
    ctx.beginPath();
    ctx.arc(0, -visualHeight / 2 + 5, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // White Eyes Backing
    ctx.fillStyle = '#ffffff'; 
    let lookLeft = actor.keys ? actor.keys.left : (actor.facing < 0);
    let lookRight = actor.keys ? actor.keys.right : (actor.facing > 0);
    const actorLookDir = lookRight ? 4 : (lookLeft ? -4 : 0);

    ctx.beginPath();
    ctx.arc(6 + actorLookDir, -visualHeight / 2 + 5, 6, 0, Math.PI * 2);
    ctx.arc(-6 + actorLookDir, -visualHeight / 2 + 5, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Black Pupils Pass
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(8 + actorLookDir, -visualHeight / 2 + 5, 2, 0, Math.PI * 2);
    ctx.arc(-4 + actorLookDir, -visualHeight / 2 + 5, 2, 0, Math.PI * 2);
    ctx.fill();

    // Hands Pass
    ctx.fillStyle = actor.color || '#ffffff'; 
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-15, 10, 5, 0, Math.PI * 2);
    ctx.arc(15, 10, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Restore back to the spine translation layer center, peeling away the mirror-left scaling effects
    ctx.restore();

    // Stale overlay logic fully wiped to prioritize modular drawShout.js pipeline tracking

    ctx.restore();
}
