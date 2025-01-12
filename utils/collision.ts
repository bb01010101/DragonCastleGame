import { Vector3 } from 'three'

// Simple collision check - can be expanded based on game needs
export function checkCollision(position: Vector3): boolean {
  // Add collision checks here based on game objects
  // For now, just prevent going too far from origin
  const MAX_DISTANCE = 50
  return position.length() > MAX_DISTANCE
} 