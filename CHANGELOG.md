# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com),
and this project adheres to [Semantic Versioning](https://semver.org).

## - 2026-07-29

### Added
- **Multiplayer Architecture Backbone**: Designed and engineered a fully custom WebSocket network layer from the ground up, moving away from a broken, single-player offline state.
- **Logical Multi-Room Channel Masking**: Developed a robust multi-room server isolation layout inside `server.js` allowing players to segment into separate concurrent gameplay instances.
- **Server Authority Watchdog System**: Implemented a background automated connection monitor that tracks host packet intervals, preventing solo refresh loops from deadlocking room state engines.
- **4-Player Alternating Team Allocation**: Programmed a dynamic connection handshake script that automatically divides up to 4 real-time players into balanced Red and Blue team avatars.
- **Loose Head-Hopping Stacking Physics**: Created an axis-aligned bounding box (AABB) intersection system that treats character head surfaces as solid, walkable platforms for loose stacking.
- **Real-Time Shout Messaging & Visual Balloons**: Created an interactive text communication feature. Users can hold Enter to type up to 20 characters in a local ghost bubble before releasing it to blast a comic-book style speech balloon above their avatar on all connected screens.
- **Interactive Hallways Style Hub**: Designed a continuous, 38-column hardcoded pregame sandbox lobby map featuring a multi-floor zigzag drop structure for players to navigate.
- **Dynamic JSON External Level Loader**: Configured an external asset database file (`levels/externalLevels.json`) to cleanly cache, stream, and hot-swap target level arrays on the fly.
- **Opt-In Spacebar Door Interaction**: Integrated a dedicated intent-to-interact block into the physics engine, requiring an explicit Spacebar press over a doorway to change stages.

### Changed
- **Enemy AI System Core Overhaul**: Scrapped the broken, ghost-like late-night AI prototype. Reprogrammed enemies with platform edge detection, basic vision pursuit alerts, and automatic map hazard respawning.
- **Isolated Axis Physics Pass Engine**: Re-engineered `src/actors/actorPhysics.js` and `src/physics.js` to split simultaneous diagonal calculations into isolated horizontal and vertical check loops to resolve wall-clipping glitches.
- **Passable Door Trigger Thresholds**: Forced tile ID `10` to register as a passable, hollow structural asset instead of an impassable solid block face.
- **Jumping Controller Profile**: Formally stripped the `Spacebar` key string away from player jump evaluation structures to free up the button for map interactions.

### Fixed
- **Multiplayer Avatar Scaling Explosion Bug**: Eliminated a unit mismatch in the network player creation factory that was mapping raw pixel dimensions (`34`x`52`) onto grid-scale scalars, causing peers to render as giant screen-filling blue blocks.
- **Faceless Character Color Bleeding Error**: Restructured rendering draw calls inside `src/drawActor.js` to cleanly isolate custom team suit hex codes, preventing avatar eye-backings and black pupils from melting into solid blue fill silhouettes.
- **The Trailing Comma JSON Crash**: Fixed a strict text formatting token error inside the external map data files that was crashing the browser's native `JSON.parse()` engine on boot.
- **Black Placeholder Avatar Glitch**: Corrected a broken reference selector that accidentally mapped a full master array block object down to a single hex string property field.
