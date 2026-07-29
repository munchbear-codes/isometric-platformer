import { GameConfig } from './config.js';
import { LobbyConfig } from './lobbyConfig.js'; 
import { InputHandler } from './input.js';
import { LevelManager } from './level.js';
import { Camera } from './camera.js';
import { Player } from './player.js';
import { PhysicsEngine } from './physics.js';
import { RenderEngine } from './renderer.js';
import { ActorSystem } from './actors/actorSystem.js';
import { MultiplayerManager } from './multiplayer.js'; 
import { drawShout } from './drawShout.js'; // Shared bubble painter helper module

class GameEngine {
    constructor() {
        window.game = this;
        this.renderer = new RenderEngine('gameCanvas');
        this.input = new InputHandler();
        
        this.level = new LevelManager(LobbyConfig.getMapData());
        this.camera = new Camera();
        this.player = new Player();

        this.physics = new PhysicsEngine(this.level, () => this.handleWinState(), () => this.handleHazard());
        this.actorSystem = new ActorSystem(this.level, this.player, this.physics);
        
        this.physics.gameEngine = this;

this.network = new MultiplayerManager('wss://kpctws.onrender.com');
        this.network.connect();

        this.cachedExternalLevels = [];
        this.fetchExternalLevelsJson();

        this.loop = this.loop.bind(this);
    }

    async fetchExternalLevelsJson() {
        try {
            const response = await fetch('./levels/externalLevels.json');
            this.cachedExternalLevels = await response.json();
        } catch (err) {
            console.error("Critical: Failed to load externalLevels.json payload database", err);
        }
    }

    changeGameLevelInstance(levelId) {
        let targetMapMatrix = null;
        let targetActorData = [];
        let spawnX = LobbyConfig.SPAWN_X;
        let spawnY = LobbyConfig.SPAWN_Y;

        if (levelId === 'lobby') {
            targetMapMatrix = LobbyConfig.getMapData();
            GameConfig.ACTOR_DATA = []; 
        } else {
            const levelData = this.cachedExternalLevels.find(lvl => lvl.id === levelId);
            if (!levelData) {
                console.warn(`Level entry index ID ${levelId} not found in database array bucket.`);
                return;
            }
            targetMapMatrix = levelData.MAP_DATA;
            targetActorData = levelData.ACTOR_DATA || [];
            
            spawnX = levelData.spawnX ?? 1;
            spawnY = levelData.spawnY ?? 1;
            
            GameConfig.ACTOR_DATA = targetActorData;
        }

        this.network.sendRoomTransition(levelId);
        this.level.loadNewLevelLayout(targetMapMatrix);

        this.physics.projectiles = [];
        this.physics.projectileCooldowns.clear();

        this.actorSystem.spawnFromConfig();

        this.player.reset();
        this.player.x = spawnX;
        this.player.y = spawnY;
    }

    start() {
        this.player.reset();
        this.player.x = LobbyConfig.SPAWN_X;
        this.player.y = LobbyConfig.SPAWN_Y;
        requestAnimationFrame(this.loop);
    }

    handleWinState() {
        this.changeGameLevelInstance('lobby');
    }

    handleHazard() {
        if (this.network.currentRoom !== 'lobby') {
            const numericId = parseInt(this.network.currentRoom.replace('level_', ''));
            const levelData = this.cachedExternalLevels.find(lvl => lvl.id === numericId);
            if (levelData) {
                this.player.reset();
                this.player.x = levelData.spawnX ?? 1;
                this.player.y = levelData.spawnY ?? 1;
                this.player.invincibilityFrames = 30;
                return;
            }
        }
        
        this.player.reset();
        this.player.x = LobbyConfig.SPAWN_X;
        this.player.y = LobbyConfig.SPAWN_Y;
        this.player.invincibilityFrames = 30;
    }

    update() {
        this.player.crouching = this.input.isCrouching();
        this.player.facing = this.input.isMovingLeft() ? -1 : (this.input.isMovingRight() ? 1 : this.player.facing);

        if (this.network.currentRoom === 'lobby') {
            this.physics.updateObject(this.player, this.input);
            this.actorSystem.update();
        } else {
            if (this.network.isHost) {
                this.physics.updateObject(this.player, this.input);
                this.actorSystem.update();
                this.network.broadcastWorldState(this.level, this.physics, this.actorSystem);
            } else {
                this.physics.updateObject(this.player, this.input);
            }
        }

        this.network.broadcastState(this.player);

        const pWorldX = this.player.x * GameConfig.TILE_SIZE;
        const pWorldY = this.player.y * GameConfig.TILE_SIZE;
        this.camera.update(pWorldX, pWorldY, this.renderer.canvas.width, this.renderer.canvas.height);

        // 1. Tick down local player text expiration clocks
        if (this.player.shoutTimer > 0) {
            this.player.shoutTimer -= 1;
            if (this.player.shoutTimer <= 0) {
                this.player.activeShout = null;
            }
        }

        // 2. Tick down multi-client companion expiration clocks
        if (this.network && this.network.peers) {
            this.network.peers.forEach(peer => {
                if (peer.shoutTimer > 0) {
                    peer.shoutTimer -= 1;
                    if (peer.shoutTimer <= 0) {
                        peer.activeShout = null;
                    }
                }
            });
        }
    }

    draw() {
        this.renderer.clear();

        let startC = Math.max(0, Math.floor(this.camera.x / GameConfig.TILE_SIZE) - 1);
        let endC = Math.min(this.level.width - 1, startC + Math.ceil(this.renderer.canvas.width / GameConfig.TILE_SIZE) + 2);
        let startR = Math.max(0, Math.floor(this.camera.y / GameConfig.TILE_SIZE) - 1);
        let endR = Math.min(this.level.height - 1, startR + Math.ceil(this.renderer.canvas.height / GameConfig.TILE_SIZE) + 2);

        for (let r = endR; r >= startR; r--) {
            for (let c = startC; c <= endC; c++) {
                const tileType = this.level.getTile(c, r);
                if (tileType !== GameConfig.TILES.AIR
                    && tileType !== GameConfig.TILES.MOVING_BLOCK_VERTICAL
                    && tileType !== GameConfig.TILES.MOVING_BLOCK_HORIZONTAL) {
                    this.renderer.drawIsoCube(c, r, tileType, this.camera, this.level);
                }
            }
        }

        for (const block of this.level.movingBlocks) {
            this.renderer.drawMovingBlock(block, this.camera);
        }

        this.physics.projectiles.forEach(projectile => this.renderer.drawProjectile(projectile, this.camera));
        this.actorSystem.actors.forEach(actor => this.renderer.drawActor(actor, this.camera));
        
        // ⚡ FIXED: Bracket scopes checked and fully synchronized
        this.network.peers.forEach(peer => {
            this.renderer.drawActor(peer, this.camera);
            drawShout(this.renderer.ctx, peer, this.camera);
        });

        this.renderer.drawPlayer(this.player, this.camera);
        drawShout(this.renderer.ctx, this.player, this.camera);
    }

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(this.loop);
    }
}

const game = new GameEngine();
game.start();
