import { GameConfig } from '../config.js';

export function getStickyState(object, level) {
    const left = Math.floor(object.x);
    const right = Math.floor(object.x + object.w - 0.01);
    const top = Math.floor(object.y);
    const bottom = Math.floor(object.y + object.h - 0.01);

    let touching = false;
    let wallTouch = false;
    let side = null;

    for (let r = top; r <= bottom; r++) {
        for (let c = left; c <= right; c++) {
            if (!level.isStickyAt(c, r)) {
                continue;
            }

            const tileLeft = c;
            const tileRight = c + 1;
            const tileTop = r;
            const playerLeft = object.x;
            const playerRight = object.x + object.w;
            const playerBottom = object.y + object.h;

            const touchingFromAbove = playerBottom > tileTop && playerBottom < tileTop + 0.2 && object.vy >= 0;
            const touchingFromLeft = playerRight > tileLeft && playerRight < tileLeft + 0.2 && object.vx > 0;
            const touchingFromRight = playerLeft < tileRight && playerLeft > tileRight - 0.2 && object.vx < 0;

            touching = touching || touchingFromAbove;
            if (touchingFromLeft || touchingFromRight) {
                wallTouch = true;
                side = touchingFromLeft ? 'left' : 'right';
            }
        }
    }

    return { touching, wallTouch, side };
}
