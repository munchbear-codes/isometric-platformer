# ISOSORRY // MASTER DEVELOPMENT ROADMAP

## ADD: NEW TILES
- [ ] **ICE**
    - *Summary*: Slippery low friction tile.
- [ ] **BOUNCE BLOCK**
    - *Summary*: Platformer trope BOUNCE/JUMP block.
- [ ] **TRIGGERED/VANISHING BLOCKS (MEXICAN WAVE)**
    - *Summary*: Some simply vanish/appear on a timer. Others explode after player touch, detonating any neighbours as they go, respawning after cooldown.
- [ ] **CONVEYOR BELT**
    - *Summary*: A tile that moves the player, entity, or object on its surface.
- [ ] **CLOUD**
    - *Summary*: Can jump UP through a cloud but cannot drop DOWN through a cloud (Becomes solid from above).
- [ ] **DRAG DRAWERS/BOXES**
    - *Requirement*: Requires INTERACT action.
    - *Summary*: Player avatar grab and drag/push boxes/tiles.
- [ ] **LADDER**
    - *Requirement*: Requires INTERACT action.
    - *Summary*: Player can grab and hold a ladder indefinitely, using them to scale walls, crawl inverted along the ceiling, etc.

## ADD: SYSTEMS & AREAS
- [ ] **HALLWAYS**
    - *Status*: PARTIALLY COMPLETED.
    - *Action*: Needs design reflow/layout tweaks.
    - *Summary*: Fully Playable Level Select Menu/Sandbox Testing Play Area.
- [ ] **PLAYER**
    - *Summary*: Combat, Cooperation & Collision implementation.

## CHANGE: PHYSICS
- [ ] **PHYSICS OVERHAUL**
    - *Features*:
        - Double Jump.
        - Coyote Time.
        - Jump Buffering.

## FIX ISSUES: MOVING BLOCKS
- [ ] **VERTICAL-FUCK-OFF-BLOCKS**
    - *Issue*: Vertical moving blocks cast the player out-of-play and into oblivion upon 'squashing player' between self and wall.
    - *Impact*: This softlocks the game.
- [ ] **HORIZONTAL WATER CARRY BUG**
    - *Issue*: Horizontal moving platforms do not carry players across water.
    - *Scenario*: WATER at 2,2, HORIZONTAL MOVING BLOCK at 3,2 travelling left. The player stood upon this moving block dies upon "touching" the water in 2,2 EVEN THOUGH the horizontal moving block is 'covering' the water tile completely.
- [ ] **HORIZONTAL COLLISION LOGIC**
    - *Requirement*: Horizontal moving platforms MUST reverse direction upon impact with player or solid tile.

## FIX BUGS
- [ ] **UNSTICKY_BLOCKS**
    - *Summary*: Resolve issues with blocks not adhering to expected collision/physics states.
- [ ] **WATER COLLISION**
    - *Issue*: Collision detection is too sensitive.
- [ ] **NEVERENDING PROJECTILES**
    - *Issue*: Bullets traverse through walls eternally.
    - *Action*: Implement proper wall collision termination for projectiles.   
    
## COMPLETED: 2026-07-29

### ADDED: NETWORK & MULTIPLAYER
- [x] **Multiplayer Architecture Backbone**
    - *Summary*: Designed and engineered a fully custom WebSocket network layer from the ground up.
- [x] **Logical Multi-Room Channel Masking**
    - *Summary*: Developed a robust multi-room server isolation layout inside `server.js` for concurrent gameplay instances.
- [x] **Server Authority Watchdog System**
    - *Summary*: Implemented a background automated connection monitor to prevent solo refresh loops from deadlocking room state engines.
- [x] **4-Player Alternating Team Allocation**
    - *Summary*: Programmed a dynamic connection handshake script dividing up to 4 players into balanced Red and Blue teams.
- [x] **Real-Time Shout Messaging & Visual Balloons**
    - *Summary*: Interactive text communication (Hold Enter to type 20 chars) releasing comic-book style speech balloons on all screens.

### ADDED: PHYSICS & ENTITIES
- [x] **Loose Head-Hopping Stacking Physics**
    - *Summary*: Created an AABB intersection system treating character head surfaces as solid, walkable platforms for loose stacking.

### ADDED: LEVELS & INTERACTION
- [x] **Interactive Hallways Style Hub**
    - *Summary*: Designed a continuous, 38-column hardcoded pregame sandbox lobby map with a multi-floor zigzag drop structure.
- [x] **Dynamic JSON External Level Loader**
    - *Summary*: Configured `levels/externalLevels.json` to cache, stream, and hot-swap target level arrays on the fly.
- [x] **Opt-In Spacebar Door Interaction**
    - *Summary*: Integrated a dedicated intent-to-interact block requiring an explicit Spacebar press over a doorway to change stages.

### CHANGED: SYSTEMS & PHYSICS
- [x] **Enemy AI System Core Overhaul**
    - *Summary*: Scrapped broken prototype; reprogrammed enemies with platform edge detection, vision pursuit alerts, and automatic hazard respawning.
- [x] **Isolated Axis Physics Pass Engine**
    - *Summary*: Re-engineered `src/actors/actorPhysics.js` and `src/physics.js` to split diagonal calculations into isolated horizontal/vertical check loops (fixes wall-clipping).
- [x] **Passable Door Trigger Thresholds**
    - *Summary*: Forced tile ID `10` to register as a passable, hollow structural asset.
- [x] **Jumping Controller Profile**
    - *Summary*: Stripped `Spacebar` from player jump evaluation to free up the button for map interactions.

### FIXED: BUGS & GLITCHES
- [x] **Multiplayer Avatar Scaling Explosion Bug**
    - *Resolution*: Eliminated unit mismatch in network player creation factory (raw pixels vs grid scalars).
- [x] **Faceless Character Color Bleeding Error**
    - *Resolution*: Restructured `src/drawActor.js` draw calls to isolate team suit hex codes from eye/pupil rendering.
- [x] **The Trailing Comma JSON Crash**
    - *Resolution*: Fixed strict text formatting token error in external map data files crashing `JSON.parse()`.
- [x] **Black Placeholder Avatar Glitch**
    - *Resolution*: Corrected broken reference selector mapping full master array objects to single hex string fields.   
- [ ] **FIX SERVER.js**
    - *Summary*: Somepoint it seems i fucked the server up last night.