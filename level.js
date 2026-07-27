export class InputHandler {
    constructor() {
        this.keys = {};
        window.keys = this.keys;
        window.addEventListener('keydown', e => this.keys[e.code] = true);
        window.addEventListener('keyup', e => this.keys[e.code] = false);
    }

    isPressed(code) {
        return !!this.keys[code];
    }

    isMovingLeft() {
        return this.isPressed('ArrowLeft') || this.isPressed('KeyA');
    }

    isMovingRight() {
        return this.isPressed('ArrowRight') || this.isPressed('KeyD');
    }

    isJumping() {
        return this.isPressed('ArrowUp') || this.isPressed('KeyW') || this.isPressed('Space');
    }

    isCrouching() {
        return this.isPressed('ArrowDown') || this.isPressed('KeyS');
    }
}
