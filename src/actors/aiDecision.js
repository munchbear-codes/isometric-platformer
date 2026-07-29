import { GameConfig } from '../config.js';

export function processBehavior(actor, player, level) {
    const dx = player.x - actor.x;
    const dy = player.y - actor.y;
    const horizontalDistance = Math.abs(dx);
    const verticalDistance = Math.abs(dy);

    // Vision-based target tracking
    if (horizontalDistance <= actor.vision) {
        actor.facing = dx < 0 ? -1 : 1;
        if (horizontalDistance > 0.35) {
            actor.vx = dx < 0 ? -actor.speed : actor.speed;
        } else {
            actor.vx *= 0.85;
        }
    } else {
        actor.vx *= 0.9;
    }

    // Evaluate jumping requirements
    if (shouldJump(actor, dy, horizontalDistance, verticalDistance, level) && actor.grounded) {
        actor.vy = actor.jumpForce;
        actor.grounded = false;
    }
}

function shouldJump(actor, dy, horizontalDistance, verticalDistance, level) {
    if (verticalDistance > 2.4) {
        return false;
    }

    const colCheck = actor.facing > 0 
        ? Math.floor(actor.x + actor.width + 0.2) 
        : Math.floor(actor.x - 0.2);
    const rowCheck = Math.floor(actor.y + actor.height * 0.5);
    
    const ahead = level.getTile(colCheck, rowCheck);
    const hazardAhead = ahead === GameConfig.TILES.SPIKE_TRAP || ahead === GameConfig.TILES.WATER;
    const playerNearby = horizontalDistance < 1.5 && verticalDistance < 1.5;
    
    const floorCheckCol = Math.floor(actor.x + actor.facing);
    const floorCheckRow = Math.floor(actor.y + actor.height);
    const needPlatform = horizontalDistance < 2.2 && Math.abs(dy) < 1.5 && level.getTile(floorCheckCol, floorCheckRow) === GameConfig.TILES.AIR;

    return hazardAhead || playerNearby || needPlatform;
}
