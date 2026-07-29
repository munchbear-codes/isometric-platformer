import { GameConfig } from '../config.js';

export function handleMovingBlockSupport(object, level) {
    for (const block of level.movingBlocks) {
        const playerLeft = object.x;
        const playerRight = object.x + object.w;
        const blockLeft = block.c;
        const blockRight = block.c + 1;
        const playerBottom = object.y + object.h;
        const blockTop = block.r;

        const onBlock = playerRight > blockLeft && playerLeft < blockRight && playerBottom >= blockTop - 0.2 && playerBottom <= blockTop + 0.2 && object.vy >= 0;
        if (!onBlock) {
            continue;
        }

        const dx = block.c - block.lastC;
        const dy = block.r - block.lastR;
        const proposedX = Math.max(0, Math.min(object.x + dx, level.width - object.w));
        const proposedY = Math.max(0, block.r - object.h);

        if (isPositionBlocked(object, proposedX, proposedY, level)) {
            object.grounded = false;
            object.vy = Math.max(object.vy, 0.12);
            break;
        }

        object.x = proposedX;
        object.y = proposedY;
        object.grounded = true;
        object.vy = 0;
        break;
    }
}

function isPositionBlocked(object, x, y, level) {
    const left = Math.floor(x);
    const right = Math.floor(x + object.w - 0.01);
    const top = Math.floor(y);
    const bottom = Math.floor(y + object.h - 0.01);

    for (let r = top; r <= bottom; r++) {
        for (let c = left; c <= right; c++) {
            const tile = level.getTile(c, r);
            if (tile === GameConfig.TILES.WALL) {
                return true;
            }
        }
    }
    return false;
}
