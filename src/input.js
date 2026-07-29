export class InputHandler {
    constructor() {
        this.keys = {};
        window.keys = this.keys;

        // ⚡ SHOUT BUFFER INFRASTRUCTURE
        this.isShouting = false;
        this.shoutBuffer = "";

        this.initListeners();
    }

    initListeners() {
        window.addEventListener('keydown', e => {
            // 1. Trap and handle the Shout State machine activation mechanics
            if (e.code === 'Enter') {
                e.preventDefault();
                
                if (!this.isShouting) {
                    // Turn on typing focus and flush out stale buffer strings
                    this.isShouting = true;
                    this.shoutBuffer = "";
                    
                    // Expose the temporary typing buffer to your local player's rendering wrapper
                    if (window.game && window.game.player) {
                        window.game.player.shoutGhostBuffer = "...";
                    }
                }
                return;
            }

            // 2. Text Character Capture Loops: Process updates *only* while shouting state is focused
            if (this.isShouting) {
                e.preventDefault(); // Stop default browser hotkeys while typing

                if (e.code === 'Backspace') {
                    this.shoutBuffer = this.shoutBuffer.slice(0, -1);
                } else if (e.code === 'Escape') {
                    // Quick abort route: Cancel shouting completely and wipe the bubbles
                    this.isShouting = false;
                    this.shoutBuffer = "";
                    if (window.game && window.game.player) {
                        window.game.player.shoutGhostBuffer = null;
                    }
                } else if (e.key.length === 1 && this.shoutBuffer.length < 20) {
                    // Append raw text character string up to a maximum safety threshold of 20 elements
                    this.shoutBuffer += e.key;
                }

                // Push the real-time typing ghost string down into your local renderer avatar block
                if (window.game && window.game.player) {
                    window.game.player.shoutGhostBuffer = this.shoutBuffer || "...";
                }
                return;
            }

            // 3. Fallback Standard Gameplay input mapping assignment pass
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', e => {
            // Releasing the Enter Key commits the string and fires it over channels
            if (e.code === 'Enter') {
                e.preventDefault();
                
                if (this.isShouting) {
                    this.isShouting = false;
                    
                    if (window.game) {
                        const finalMessage = this.shoutBuffer.trim();
                        
                        if (finalMessage !== "" && window.game.network) {
                            // Blast the final text package across to your friends inside the room
                            window.game.network.broadcastShout(finalMessage);
                            
                            // Render your own committed message for exactly 4 seconds (240 ticks)
                            window.game.player.activeShout = finalMessage;
                            window.game.player.shoutTimer = 240;
                        }
                        
                        // Instantly wipe your typing ghost buffer bubble out of memory context
                        window.game.player.shoutGhostBuffer = null;
                    }
                    
                    this.shoutBuffer = "";
                }
                return;
            }

            this.keys[e.code] = false;
        });
    }

    isPressed(code) {
        // Freeze active gameplay controls completely while the user is busy typing out a text string
        if (this.isShouting) return false;
        return !!this.keys[code];
    }

    isMovingLeft() {
        return this.isPressed('ArrowLeft') || this.isPressed('KeyA');
    }

    isMovingRight() {
        return this.isPressed('ArrowRight') || this.isPressed('KeyD');
    }

    isJumping() {
        // ⚡ MODIFICATION: Spacebar has been forcefully stripped away from this list
        return this.isPressed('ArrowUp') || this.isPressed('KeyW');
    }

    isCrouching() {
        return this.isPressed('ArrowDown') || this.isPressed('KeyS');
    }

    /**
     * ⚡ DOORWAY OPT-IN PREPARATION HOOK
     * Returns true on the frame the spacebar is pressed to toggle door travel loops in the future
     * @returns {boolean}
     */
    isInteractingWithDoor() {
        return this.isPressed('Space');
    }
}
