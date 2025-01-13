// Game configuration
export const BLOCK_SIZE = 1
export const GRID_SIZE = 100
export const MAX_RESOURCES = 20
export const RESOURCE_RESPAWN_TIME = 30000 // 30 seconds

// Player settings
export const MINING_RADIUS = 4
export const BUILD_RADIUS = 6
export const PLAYER_SPEED = 0.1
export const PLAYER_HEIGHT = BLOCK_SIZE * 2

// Resource costs
export const BLOCK_COSTS = {
  'wood-block': { wood: 1 },
  'stone-block': { stone: 1 }
}

// Initial spawn position
export const SPAWN_POSITION = {
  x: 0,
  y: 0,
  z: 0
}

// Game boundaries
export const BOUNDARY_RADIUS = 50
export const DEATH_TIMER = 5000 // 5 seconds 