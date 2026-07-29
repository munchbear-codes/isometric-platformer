import { GameConfig } from './config.js';

export class Player {
    constructor() {
        this.w = 0.6;
        this.standHeight = GameConfig.PLAYER_STAND_HEIGHT;
        this.crouchHeight = GameConfig.PLAYER_CROUCH_HEIGHT;
        this.h = this.standHeight;
        this.width = 34;
        this.height = 52;
        this.color = '#ff7f50'; // Default fallback accent
        this.reset();
    }

    reset() {
        this.x = 1;
        this.y = 1;
        this.vx = 0;
        this.vy = 0;
        this.grounded = true;
        this.crouching = false;
        this.facing = 1;
        this.invincibilityFrames = 0;
        this.h = this.standHeight;
        
        // Stacking hooks are dead.
        // We explicitly leave 'this.color' untouched so Red/Blue team assignments persist!
    }
}
