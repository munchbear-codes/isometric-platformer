import { GameConfig } from './config.js';

export class MultiplayerManager {
    constructor(serverUrl) {
        this.url = serverUrl;
        this.socket = null;
        this.myId = null;
        this.currentRoom = 'lobby'; 
        this.isHost = false; 
        this.peers = new Map();
        
        // Red, Blue, Red, Blue team distribution layout
        this.teamColors = ['#ff3b30', '#007aff', '#ff3b30', '#007aff']; 
        
        this.heartbeatTimer = null;
    }

    connect() {
        this.socket = new WebSocket(this.url);
        
        this.socket.onopen = () => {
            this.startHeartbeatLoop();
        };

        this.socket.onmessage = (event) => {
            try {
                const packet = JSON.parse(event.data);
                this.handleNetworkPacket(packet);
            } catch (err) {
                console.error("Net packet parsing failure");
            }
        };

        this.socket.onclose = () => {
            this.stopHeartbeatLoop();
            setTimeout(() => this.connect(), 5000);
        };
    }

    startHeartbeatLoop() {
        this.stopHeartbeatLoop();
        this.heartbeatTimer = setInterval(() => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({ type: 'ping' }));
            }
        }, 10000);
    }

    stopHeartbeatLoop() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    sendRoomTransition(levelId) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

        const targetRoomStr = levelId === 'lobby' ? 'lobby' : `level_${levelId}`;
        if (this.currentRoom === targetRoomStr) return; 

        this.currentRoom = targetRoomStr;
        this.peers.clear();

        this.socket.send(JSON.stringify({
            type: 'join-room',
            targetRoomId: this.currentRoom
        }));
    }

    /**
     * ⚡ SHOUT BROADCAST EMITTER: Packs the string buffer array and pushes 
     * it to the room channel, completely bypassing InfinityFree webhost keyword blocks
     */
    broadcastShout(messageText) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

        this.socket.send(JSON.stringify({
            type: 'shout-message',
            text: messageText
        }));
    }

    handleNetworkPacket(packet) {
        if (packet.type === 'ping') return;

        if (packet.type === 'welcome') {
            this.myId = packet.id;
            this.isHost = packet.isHost;
            
            const assignedColor = this.isHost ? this.teamColors[0] : this.teamColors[1];
            
            if (window.game && window.game.player) {
                window.game.player.color = assignedColor;
                this.broadcastState(window.game.player);
            } else {
                setTimeout(() => {
                    if (window.game && window.game.player) {
                        window.game.player.color = assignedColor;
                        this.broadcastState(window.game.player);
                    }
                }, 50);
            }
            return;
        }

        if (packet.type === 'promote-host') {
            this.isHost = packet.isHost;
            if (window.game && window.game.player) {
                window.game.player.color = this.teamColors[0]; 
                this.broadcastState(window.game.player);
            }
            console.log("Authority shift: You are now the Host.");
            return;
        }

        if (packet.type === 'peer-disconnect') {
            this.peers.delete(packet.senderId);
            this.recalculatePeerColors(); 
            return;
        }

        if (packet.type === 'room-handshake') {
            if (window.game && window.game.player) {
                this.broadcastState(window.game.player);
            }
            return;
        }

        // ⚡ NEW PACKET TYPE OBSERVER: Remote shout message has landed in your level channel mask
        if (packet.type === 'shout-message') {
            const peer = this.peers.get(packet.senderId);
            if (peer) {
                peer.activeShout = packet.text;
                peer.shoutTimer = 240; // Displays cleanly for exactly 4 seconds (240 ticks at 60Hz)
            }
            return;
        }

        if (packet.type === 'sync') {
            const standHeight = GameConfig.PLAYER_STAND_HEIGHT || 1.15;
            const crouchHeight = GameConfig.PLAYER_CROUCH_HEIGHT || 0.7;

            if (!this.peers.has(packet.senderId)) {
                this.peers.set(packet.senderId, {
                    x: packet.x, y: packet.y, width: 0.6, height: packet.crouching ? crouchHeight : standHeight,
                    w: 0.6, h: packet.crouching ? crouchHeight : standHeight, 
                    color: '#ffffff', 
                    facing: packet.facing, crouching: packet.crouching, grounded: packet.grounded,
                    invincibilityFrames: packet.invincibilityFrames, keys: { left: packet.vx < 0, right: packet.vx > 0 },
                    // Injected runtime message states for newly connecting joiners
                    activeShout: null,
                    shoutTimer: 0
                });
                
                this.recalculatePeerColors();
            } else {
                const peer = this.peers.get(packet.senderId);
                peer.x = packet.x; peer.y = packet.y; peer.facing = packet.facing;
                peer.crouching = packet.crouching; peer.grounded = packet.grounded;
                peer.invincibilityFrames = packet.invincibilityFrames;
                peer.height = peer.crouching ? crouchHeight : standHeight; peer.h = peer.height;
                peer.keys.left = packet.vx < 0; peer.keys.right = packet.vx > 0;
            }
        }

        if (packet.type === 'world-state' && !this.isHost && window.game) {
            const engine = window.game;
            if (this.currentRoom === 'lobby') return;

            packet.movingBlocks.forEach((hostBlock, i) => {
                const localBlock = engine.level.movingBlocks[i];
                if (localBlock) { localBlock.c = hostBlock.c; localBlock.r = hostBlock.r; localBlock.dir = hostBlock.dir; }
            });
            engine.physics.projectiles = packet.projectiles;
            packet.actors.forEach((hostActor, i) => {
                const localActor = engine.actorSystem.actors[i];
                if (localActor) {
                    localActor.x = hostActor.x; localActor.y = hostActor.y;
                    localActor.vx = hostActor.vx; localActor.vy = hostActor.vy;
                    localActor.facing = hostActor.facing; localActor.grounded = hostActor.grounded;
                }
            });
        }
    }

    recalculatePeerColors() {
        let index = 1; 
        this.peers.forEach((peer) => {
            peer.color = this.teamColors[index % 4];
            index++;
        });
    }

    broadcastState(localPlayer) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

        this.socket.send(JSON.stringify({
            type: 'sync',
            x: localPlayer.x, y: localPlayer.y, vx: localPlayer.vx,
            facing: localPlayer.facing, crouching: localPlayer.crouching,
            grounded: localPlayer.grounded, invincibilityFrames: localPlayer.invincibilityFrames
        }));
    }

    broadcastWorldState(level, physics, actorSystem) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN || !this.isHost) return;
        if (this.currentRoom === 'lobby') return; 

        const statePayload = {
            type: 'world-state',
            movingBlocks: level.movingBlocks.map(b => ({ c: b.c, r: b.r, dir: b.dir })),
            projectiles: physics.projectiles,
            actors: actorSystem.actors.map(a => ({ x: a.x, y: a.y, vx: a.vx, vy: a.vy, facing: a.facing, grounded: a.grounded }))
        };

        this.socket.send(JSON.stringify(statePayload));
    }
}
