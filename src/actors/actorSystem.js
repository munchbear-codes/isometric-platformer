import { GameConfig } from '../config.js';
import { ACTOR_TYPES } from './actorTypes.js';
import { processBehavior } from './aiDecision.js';
import { moveAndCollideActor } from './actorPhysics.js';

export class ActorSystem {
  constructor(levelManager, player, physicsEngine) {
    this.level = levelManager;
    this.player = player;
    this.physics = physicsEngine;
    this.actors = [];
    this.spawnFromConfig();
  }

  spawnFromConfig() {
    const rawActors = GameConfig.ACTOR_DATA || [];
    this.actors = rawActors.map((actor, index) => {
      const definition = actor.type ? ACTOR_TYPES[actor.type] : ACTOR_TYPES.enemy;
      const spawnX = actor.x ?? 3;
      const spawnY = actor.y ?? 1;

      return {
        id: index,
        type: actor.type || 'enemy',
        x: spawnX,
        y: spawnY,
        startX: spawnX,
        startY: spawnY,
        vx: 0,
        vy: 0,
        grounded: true,
        width: definition.width,
        height: definition.height,
        color: definition.color,
        speed: definition.speed,
        jumpForce: definition.jumpForce,
        vision: definition.vision,
        aggression: definition.aggression,
        facing: actor.facing || 1,
      };
    });
  }

  update() {
    for (const actor of this.actors) {
      processBehavior(actor, this.player, this.level);
     
      moveAndCollideActor(actor, this.level, this.player, this.actors);
    }
  }
}
