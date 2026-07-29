import { GameConfig } from '../config.js';

export function updateProjectiles(player, level, projectiles, projectileCooldowns, onHazardReached) {
    if (player.invincibilityFrames > 0) {
        player.invincibilityFrames -= 1;
    }

    for (let r = 0; r < level.height; r++) {
        for (let c = 0; c < level.width; c++) {
            const tile = level.getTile(c, r);
            if (tile !== GameConfig.TILES.SHOOT_TRAP_VERTICAL && tile !== GameConfig.TILES.SHOOT_TRAP_HORIZONTAL) {
                continue;
            }

            const key = `${c},${r}`;
            const cooldown = projectileCooldowns.get(key) || 0;
            if (cooldown > 0) {
                projectileCooldowns.set(key, cooldown - 1);
                continue;
            }

            const horizontalDistance = Math.abs(player.x - c);
            const verticalDistance = Math.abs(player.y - r);
            const shouldFire = tile === GameConfig.TILES.SHOOT_TRAP_VERTICAL
                ? verticalDistance <= 8 && horizontalDistance <= 1.5
                : horizontalDistance <= 8 && verticalDistance <= 1.5;

            if (!shouldFire) {
                continue;
            }

            let vx = 0;
            let vy = 0;
            if (tile === GameConfig.TILES.SHOOT_TRAP_VERTICAL) {
                vy = player.y < r ? -0.18 : 0.18;
            } else {
                vx = player.x < c ? -0.18 : 0.18;
            }

            projectiles.push({
                x: c + (vx < 0 ? -0.2 : 0.8),
                y: r + (vy < 0 ? -0.2 : 0.8),
                vx,
                vy,
                life: 180,
                radius: 0.16
            });
            projectileCooldowns.set(key, 90);
        }
    }

    return projectiles.filter(projectile => {
        projectile.x += projectile.vx;
        projectile.y += projectile.vy;
        projectile.life -= 1;

        const tile = level.getTile(Math.floor(projectile.x), Math.floor(projectile.y));
        const hitWall = tile === GameConfig.TILES.WALL || tile === GameConfig.TILES.GOAL;
        if (hitWall || projectile.life <= 0) {
            return false;
        }

        if (projectile.x < player.x + player.w && projectile.x + 0.3 > player.x && projectile.y < player.y + player.h && projectile.y + 0.3 > player.y) {
            if (player.invincibilityFrames <= 0) {
                player.invincibilityFrames = 30;
                onHazardReached?.();
            }
            return false;
        }

        return true;
    });
}
