import { GameConfig } from './config.js';

export class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
    }

    update(targetX, targetY, viewportW, viewportH) {
        const destX = targetX - viewportW / 2;
        const destY = targetY - viewportH / 2;
        this.x += (destX - this.x) * GameConfig.CAMERA_LERP;
        this.y += (destY - this.y) * GameConfig.CAMERA_LERP;
    }
}
