import { GameConfig } from './config.js';

/**
 * Shared Comic Comic Bubble Graphic Painter
 * Unifies typography placement calculations for local players and multiplayer peers alike
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Object} entity - Can be player instance or map peer object
 * @param {Object} camera 
 */
export function drawShout(ctx, entity, camera) {
    const textToDisplay = entity.activeShout || entity.shoutGhostBuffer;
    if (!textToDisplay || textToDisplay.trim() === '') return;

    // Calculate baseline spatial coordinates cleanly using the raw grid vectors
    const px = (entity.x * GameConfig.TILE_SIZE) - camera.x;
    const py = (entity.y * GameConfig.TILE_SIZE) - camera.y;
    const drawPy = py - GameConfig.ISO_DEPTH;
    const size = GameConfig.TILE_SIZE;

    // Resolve structural parity handles for property layout naming variations (.w vs .width)
    const targetW = entity.w ?? entity.width ?? 0.6;
    const targetH = entity.h ?? entity.height ?? 1.15;
    const lookupHeight = entity.height || 52;

    const pW = size * targetW;
    const pH = size * targetH;
    const pX = px + (size - pW) / 2;
    const pY = drawPy + (size - pH);

    const playerBob = entity.grounded ? Math.sin(Date.now() / 100) * 2 : 0;
    const visualHeight = lookupHeight * (entity.crouching ? 0.9 : 1);

    // ⚡ FIX: Calculate coordinates completely in clean screen space 
    // to bypass internal body scaling or face-flip transformations entirely
    ctx.save();

    ctx.font = 'bold 12px monospace';
    const textMetrics = ctx.measureText(textToDisplay);
    
    const bubblePadding = 14;
    const bubbleWidth = Math.max(45, textMetrics.width + bubblePadding * 2);
    const bubbleHeight = 26;
    
    // Anchor the box center points perfectly aligned right over the character's current height state
    const bubbleX = pX + pW / 2 - bubbleWidth / 2;
    const bubbleY = pY + pH / 2 + playerBob - visualHeight / 2 - 45;

    const isGhostState = !!entity.shoutGhostBuffer;
    
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = isGhostState ? 'rgba(0, 122, 255, 0.7)' : '#000000'; 
    ctx.lineWidth = isGhostState ? 2 : 3;

    // 1. Draw rounded outer balloon capsule
    ctx.beginPath();
    ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 8);
    ctx.fill();
    ctx.stroke();

    // 2. Draw small pointer triangle pointing down at the skull arc
    ctx.beginPath();
    ctx.moveTo(pX + pW / 2 - 6, bubbleY + bubbleHeight);
    ctx.lineTo(pX + pW / 2 + 6, bubbleY + bubbleHeight);
    ctx.lineTo(pX + pW / 2, bubbleY + bubbleHeight + 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. Print text strings inside the balloon boundaries
    ctx.fillStyle = isGhostState ? '#007aff' : '#000000'; 
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(textToDisplay, bubbleX + bubbleWidth / 2, bubbleY + bubbleHeight / 2);

    ctx.restore();
}
