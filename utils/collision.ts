import { Vector3 } from 'three'

const BLOCK_SIZE = 1
const PLAYER_RADIUS = 0.5

export function checkCollision(position: Vector3, blocks: Array<{ position: Vector3 }>): boolean {
  // Check boundary
  const MAX_DISTANCE = 50
  if (position.length() > MAX_DISTANCE) return true

  // Check collision with blocks
  for (const block of blocks) {
    const dx = Math.abs(position.x - block.position.x)
    const dz = Math.abs(position.z - block.position.z)
    
    // If within block bounds (considering player radius)
    if (dx < (BLOCK_SIZE / 2 + PLAYER_RADIUS) && dz < (BLOCK_SIZE / 2 + PLAYER_RADIUS)) {
      return true
    }
  }

  return false
} 