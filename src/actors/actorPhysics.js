import { GameConfig } from '../config.js';

export function moveAndCollideActor(actor, level, player, allActors) {
    // 1. Horizontal Pass
    actor.x += actor.vx;
    checkActorAxisCollision(actor, level, true);
    resolveActorMutualStacking(actor, player, allActors, true);

    // 2. Vertical Pass (Mismatched 0.08 tick speed preserved from legacy setup)
    actor.vy += GameConfig.GRAVITY * 0.6;
    actor.y += actor.vy * 0.08; 
    actor.grounded = false;
    checkActorAxisCollision(actor, level, false);
    resolveActorMutualStacking(actor, player, allActors, false);

    // 3. Hazard Boundary Reset
    const centerCol = Math.floor(actor.x + actor.width / 2);
    const centerRow = Math.floor(actor.y + actor.height / 2);
    if (level.isHazardAt(centerCol, centerRow) || actor.y > level.height + 2) {
        actor.x = actor.startX;
        actor.y = actor.startY;
        actor.vx = 0;
        actor.vy = 0;
        actor.grounded = true;
    }
}

function checkActorAxisCollision(actor, level, isXAxis) {
    const r1 = Math.floor(actor.y);
    const r2 = Math.floor(actor.y + actor.height - 0.01);
    const c1 = Math.floor(actor.x);
    const c2 = Math.floor(actor.x + actor.width - 0.01);

    for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
            if (!level.isSolidAt(c, r)) continue;

            if (isXAxis) {
                if (actor.vx > 0) actor.x = c - actor.width - 0.001;
                else if (actor.vx < 0) actor.x = c + 1.001;
                actor.vx = 0;
            } else {
                if (actor.vy > 0) {
                    actor.y = r - actor.height - 0.001;
                    actor.grounded = true;
                    actor.vy = 0;
                } else if (actor.vy < 0) {
                    actor.y = r + 1.001;
                    actor.vy = 0;
                }
            }
        }
    }
}

function resolveActorMutualStacking(actor, player, allActors, isXAxis) {
    const targets = [player, ...allActors.filter(a => a !== actor)];

    for (const target of targets) {
        const tw = target.w ?? target.width;
        const th = target.h ?? target.height;

        const overlaps = actor.x < target.x + tw &&
                         actor.x + actor.width > target.x &&
                         actor.y < target.y + th &&
                         actor.y + actor.height > target.y;

        if (!overlaps) continue;

        if (isXAxis) {
            const actorMidX = actor.x + actor.width / 2;
            const targetMidX = target.x + tw / 2;

            if (actorMidX < targetMidX) actor.x = target.x - actor.width - 0.001;
            else actor.x = target.x + tw + 0.001;
            actor.vx = 0;
        } else {
            if (actor.vy > 0 && (actor.y + actor.height - actor.vy * 0.08) <= target.y + 0.2) {
                // Land loosely on head from above
                actor.y = target.y - actor.height - 0.001;
                actor.grounded = true;
                actor.vy = 0;
            } else if (actor.vy < 0) {
                // Bump from below
                actor.y = target.y + th + 0.001;
                actor.vy = 0;
            }
        }
    }
}
