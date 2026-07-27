import { GameConfig } from './config.js';

export class LevelManager {
    constructor(matrix) {
        this.matrix = matrix.map(row => [...row]);
        this.height = this.matrix.length;
        this.width = this.matrix[0].length;
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
        return this.getTile(col, row) !== GameConfig.TILES.AIR || !!this.getMovingBlockAt(col, row);
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
