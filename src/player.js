export class Player {
    constructor() {
        this.w = 0.6;
        this.h = 0.8;
        this.width = 34;
        this.height = 52;
        this.color = '#ff7f50';
        this.reset();
    }

    reset() {
        this.x = 7;
        this.y = 7.2;
        this.vx = 0;
        this.vy = 0;
        this.grounded = true;
        this.crouching = false;
        this.facing = 1;
        this.invincibilityFrames = 0;
    }
}
