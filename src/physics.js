import { GameConfig } from './config.js';
import { LobbyConfig } from './lobbyConfig.js';
import { getStickyState } from './physics/stickyEvaluator.js';
import { handleMovingBlockSupport } from './physics/movingBlockPlatform.js';
import { updateProjectiles } from './physics/trapShooter.js';

export class PhysicsEngine {
    constructor(levelManager, onGoalReached, onHazardReached) {
        this.level = levelManager;
        this.onGoalReached = onGoalReached;
        this.onHazardReached = onHazardReached;
        this.projectiles = [];
        this.projectileCooldowns = new Map();
        this.actorSystem = null; // Filled at frame runtime context initiation
        this.gameEngine = null;  // Exposed from main.js to access network peers and level loaders
    }

    isOverlapping(object, c, r) {
        return object.x < c + 1 && object.x + object.w > c && object.y < r + 1 && object.y + object.h > r;
    }

    /**
     * Identifies which dynamic level maps match the player's current doorway position
     * @param {number} col 
     * @param {number} row 
     */
    evaluateDoorwayTrigger(col, row) {
        if (!this.gameEngine) return;

        let selectedLevelId = null;

        // Storey 1 Doorway Row Evaluation (Row index 3)
        if (row === 3) {
            if (col >= 5 && col <= 7) selectedLevelId = 1;     // Door 1 (Col 6 center)
            else if (col >= 16 && col <= 18) selectedLevelId = 2; // Door 2 (Col 17 center)
            else if (col >= 30 && col <= 32) selectedLevelId = 3; // Door 3 (Col 31 center)
        }
        // Storey 2 Doorway Row Evaluation (Row index 7)
        else if (row === 7) {
            if (col >= 3 && col <= 5) selectedLevelId = 4;     // Door 4 (Col 4 center)
            else if (col >= 14 && col <= 16) selectedLevelId = 5; // Door 5 (Col 15 center)
            else if (col >= 28 && col <= 30) selectedLevelId = 6; // Door 6 (Col 29 center)
        }
        // Storey 3 Doorway Row Evaluation (Row index 11)
        else if (row === 11) {
            if (col >= 5 && col <= 7) selectedLevelId = 7;     // Door 7 (Col 6 center)
            else if (col >= 16 && col <= 18) selectedLevelId = 8; // Door 8 (Col 17 center)
            else if (col >= 30 && col <= 32) selectedLevelId = 9; // Door 9 (Col 31 center)
        }

        // Trigger transition call to the main orchestrator if a valid door was hit
        if (selectedLevelId !== null) {
            this.gameEngine.changeGameLevelInstance(selectedLevelId);
        }
    }

    checkCollisions(object, isXAxis) {
        const r1 = Math.floor(object.y);
        const r2 = Math.floor(object.y + object.h - 0.01);
        const c1 = Math.floor(object.x);
        const c2 = Math.floor(object.x + object.w - 0.01);

        for (let r = r1; r <= r2; r++) {
            for (let c = c1; c <= c2; c++) {
                const tile = this.level.getTile(c, r);
                const isSolid = this.level.isSolidAt(c, r);
                const overlaps = this.isOverlapping(object, c, r);

                if (tile === GameConfig.TILES.GOAL && overlaps) {
                    this.onGoalReached();
                }

                if (overlaps && this.level.isHazardAt(c, r) && object.invincibilityFrames <= 0) {
                    object.invincibilityFrames = 30;
                    this.onHazardReached?.();
                }

                // ⚡ FIX: Passive auto-passthrough check has been completely erased from here
                // Walking over tile 10 will no longer yank you out of the sandbox lobby!

                if (!isSolid) continue;

                if (isXAxis) {
                    if (object.vx > 0) object.x = c - object.w - 0.001;
                    else if (object.vx < 0) object.x = c + 1.001;
                    object.vx = 0;
                } else {
                    if (object.vy > 0) {
                        object.y = r - object.h - 0.001;
                        object.grounded = true;
                        object.vy = 0;
                    } else if (object.vy < 0) {
                        object.y = r + 1.001;
                        object.vy = 0;
                    }
                }
            }
        }
    }

    checkPlayerLooseStacking(player, isXAxis) {
        if (this.actorSystem && this.actorSystem.actors) {
            for (const actor of this.actorSystem.actors) {
                const overlaps = player.x < actor.x + actor.width &&
                                 player.x + player.w > actor.x &&
                                 player.y < actor.y + actor.height &&
                                 player.y + player.h > actor.y;

                if (!overlaps) continue;

                if (isXAxis) {
                    const playerMidX = player.x + player.w / 2;
                    const actorMidX = actor.x + actor.width / 2;

                    if (playerMidX < actorMidX) player.x = actor.x - player.w - 0.001;
                    else player.x = actor.x + actor.width + 0.001;
                    player.vx = 0;
                } else {
                    if (player.vy > 0 && (player.y + player.h - player.vy * 0.12) <= actor.y + 0.2) {
                        player.y = actor.y - player.h - 0.001;
                        player.grounded = true;
                        player.vy = 0;
                    } else if (player.vy < 0) {
                        player.y = actor.y + actor.height + 0.001;
                        player.vy = 0;
                    }
                }
            }
        }

        if (this.gameEngine && this.gameEngine.network && this.gameEngine.network.peers) {
            this.gameEngine.network.peers.forEach(peer => {
                const overlaps = player.x < peer.x + peer.w &&
                                 player.x + player.w > peer.x &&
                                 player.y < peer.y + peer.h &&
                                 player.y + peer.h > peer.y;

                if (!overlaps) return;

                if (isXAxis) {
                    const playerMidX = player.x + player.w / 2;
                    const peerMidX = peer.x + peer.w / 2;

                    if (playerMidX < peerMidX) player.x = peer.x - player.w - 0.001;
                    else player.x = peer.x + peer.w + 0.001;
                    player.vx = 0;
                } else {
                    if (player.vy > 0 && (player.y + player.h - player.vy * 0.12) <= peer.y + 0.2) {
                        player.y = peer.y - player.h - 0.001;
                        player.grounded = true;
                        player.vy = 0;
                    } else if (player.vy < 0) {
                        player.y = peer.y + peer.h + 0.001;
                        player.vy = 0;
                    }
                }
            });
        }
    }

    updateObject(object, input) {
        this.level.updateMovingBlocks();
        this.projectiles = updateProjectiles(object, this.level, this.projectiles, this.projectileCooldowns, this.onHazardReached);

        const stickyState = getStickyState(object, this.level);
        const moveScale = stickyState.touching ? 0.55 : 1;

        const desiredHeight = object.crouching ? object.crouchHeight : object.standHeight;
        if (object.h !== desiredHeight) {
            object.y += object.h - desiredHeight;
            object.h = desiredHeight;
        }

        const inputAxis = (input.isMovingRight() ? 1 : 0) - (input.isMovingLeft() ? 1 : 0);
        if (!object.crouching) {
            object.vx += inputAxis * (GameConfig.MOVE_SPEED * moveScale);
        }

        if (input.isJumping() && (object.grounded || stickyState.wallTouch)) {
            object.vy = GameConfig.JUMP_FORCE;
            object.grounded = false;
            if (stickyState.wallTouch) {
                object.vx = stickyState.side === 'left' ? -0.08 : 0.08;
            }
        }

        const frictionFactor = stickyState.touching ? 0.92 : (object.crouching ? 0.97 : GameConfig.FRICTION);
        object.vx *= frictionFactor;
        object.x += object.vx * 0.1;
        
        this.checkCollisions(object, true);
        this.checkPlayerLooseStacking(object, true);

        object.vy += GameConfig.GRAVITY;
        object.y += object.vy * (GameConfig.VERTICAL_STEP ?? 0.12);
        object.grounded = false;
        
        this.checkCollisions(object, false);
        this.checkPlayerLooseStacking(object, false);
        handleMovingBlockSupport(object, this.level);

        if ((stickyState.touching || stickyState.wallTouch) && !object.grounded && object.vy > 0) {
            object.vy = Math.min(object.vy, stickyState.wallTouch ? 0.16 : 0.1);
        }

        // ⚡ NEW ACTIVE INTENT-TO-INTERACT HANDLER:
        // Evaluates door entry triggers only if the user explicitly presses Spacebar
        if (input.isInteractingWithDoor()) {
            const centerCol = Math.floor(object.x + object.w / 2);
            const centerRow = Math.floor(object.y + object.h / 2);
            const currentTile = this.level.getTile(centerCol, centerRow);

            if (currentTile === LobbyConfig.DOOR_TILE_ID || currentTile === GameConfig.TILES.DOORWAY) {
                this.evaluateDoorwayTrigger(centerCol, centerRow);
            }
        }
    }
}
