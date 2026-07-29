import { GameConfig } from './config.js';
import { LobbyConfig } from './lobbyConfig.js'; // Injected for default pregame hub map state

export class LevelManager {
    constructor(matrix = null) {
        // ⚡ MULTIPLAYER INSTANCING FIX: Fallback to the pristine unpacked LobbyConfig 
        // if no explicit level array payload is supplied at instantiation time
        const targetMatrix = matrix || LobbyConfig.getMapData();
        
        this.matrix = targetMatrix.map(row => [...row]);
        this.height = this.matrix.length;
        this.width = this.matrix[0].length;
        this.movingBlocks = [];
        this.parseMovingBlocks();
    }

    /**
     * Runtime Level Instancing Engine: Blasts out old matrix dimensions, 
     * flushes stale moving block caches, and dynamically remaps system boundaries.
     * @param {Array<Array<number>>} newMatrix 
     */
    loadNewLevelLayout(newMatrix) {
        if (!newMatrix || !newMatrix.length || !newMatrix[0].length) {
            console.error("Invalid level matrix payload rejected");
            return;
        }

        // Deep copy incoming layout dimensions cleanly
        this.matrix = newMatrix.map(row => [...row]);
        this.height = this.matrix.length;
        this.width = this.matrix[0].length;
        
        // Wipe and re-parse dynamic platforms for the target level
        this.movingBlocks = [];
        this.parseMovingBlocks();
    }

    parseMovingBlocks() {
        this.movingBlocks = [];
        for (let r = 0; r < this.height; r++) {
            for (let c = 0; c < this.width; c++) {
                const tile = this.matrix[r][c];
                if (tile === GameConfig.TILES.MOVING_BLOCK_VERTICAL || tile === GameConfig.TILES.MOVING_BLOCK_HORIZONTAL) {
                    this.movingBlocks.push({
                        c,
                        r,
                        kind: tile === GameConfig.TILES.MOVING_BLOCK_VERTICAL ? 'vertical' : 'horizontal',
                        dir: 1,
                        speed: GameConfig.MOVING_BLOCK_SPEED,
                        lastC: c,
                        lastR: r
                    });
                    this.matrix[r][c] = GameConfig.TILES.AIR;
                }
            }
        }
    }

    getTile(c, r) {
        const col = Math.floor(c);
        const row = Math.floor(r);

        if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
            return GameConfig.TILES.WALL;
        }
        return this.matrix[row][col];
    }

    getMovingBlockAt(c, r) {
        const col = Math.round(c);
        const row = Math.round(r);
        return this.movingBlocks.find(block => Math.round(block.c) === col && Math.round(block.r) === row);
    }

    isSolidAt(c, r) {
        const col = Math.floor(c);
        const row = Math.floor(r);
        const tile = this.getTile(col, row);

        // ⚡ THE DOORWAY PASS PASSTHROUGH FIX: 
        // Force the physics loop to treat tile ID 10 as completely hollow air space
        // This clears the block so players can stand in it to activate triggers!
        if (tile === 10 || tile === GameConfig.TILES.DOORWAY) {
            return false;
        }

        return tile === GameConfig.TILES.WALL
            || tile === GameConfig.TILES.GOAL
            || tile === GameConfig.TILES.STICKY_BLOCK
            || !!this.getMovingBlockAt(col, row);
    }

    isHazardAt(c, r) {
        const col = Math.floor(c);
        const row = Math.floor(r);
        const tile = this.getTile(col, row);

        if (tile === GameConfig.TILES.WATER || tile === GameConfig.TILES.SPIKE_TRAP) {
            return true;
        }

        return false;
    }

    isStickyAt(c, r) {
        const col = Math.floor(c);
        const row = Math.floor(r);
        return this.getTile(col, row) === GameConfig.TILES.STICKY_BLOCK;
    }

    updateMovingBlocks() {
        this.movingBlocks.forEach(block => {
            block.lastC = block.c;
            block.lastR = block.r;

            if (block.kind === 'horizontal') {
                const nextC = block.c + block.dir * block.speed;
                if (nextC < 0 || nextC >= this.width || this.isBlocked(nextC, block.r, block)) {
                    block.dir *= -1;
                }
                block.c += block.dir * block.speed;
            } else {
                const nextR = block.r + block.dir * block.speed;
                if (nextR < 0 || nextR >= this.height || this.isBlocked(block.c, nextR, block)) {
                    block.dir *= -1;
                }
                block.r += block.dir * block.speed;
            }
        });
    }

    isBlocked(c, r, currentBlock) {
        const col = Math.round(c);
        const row = Math.round(r);

        if (!this.getTile(col, row)) {
            return false;
        }
        return this.movingBlocks.some(block => block !== currentBlock && Math.round(block.c) === col && Math.round(block.r) === row);
    }

    hasSolidBlockAbove(c, r) {
        return r > 0 && this.getTile(c, r - 1) !== GameConfig.TILES.AIR;
    }

    hasSolidBlockRight(c, r) {
        return c < this.width - 1 && this.getTile(c + 1, r) !== GameConfig.TILES.AIR;
    }
}
