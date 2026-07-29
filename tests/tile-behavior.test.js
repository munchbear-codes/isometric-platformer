import assert from 'node:assert/strict';
import { LevelManager } from '../src/level.js';
import { GameConfig } from '../src/config.js';

const spikeLevel = new LevelManager([
  [0, 0, 0],
  [0, 4, 0],
  [0, 0, 0],
]);
assert.equal(spikeLevel.isHazardAt(1, 1), true);

const stickyLevel = new LevelManager([
  [0, 5],
]);
assert.equal(stickyLevel.isSolidAt(0, 0), true);
assert.equal(stickyLevel.isStickyAt(0, 0), true);

const waterLevel = new LevelManager([
  [8],
]);
assert.equal(waterLevel.getTile(0, 0), GameConfig.TILES.WATER);
assert.equal(waterLevel.isHazardAt(0, 0), true);

console.log('tile behavior tests passed');
