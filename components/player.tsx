'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, Raycaster, Mesh, MeshStandardMaterial } from 'three'
import { BLOCK_SIZE } from '../constants'
import { checkCollision } from '../utils/collision'

const MOVEMENT_SPEED = 0.1
const INTERACTION_RADIUS = 3
const BOUNDARY_RADIUS = 50
const DEATH_TIMER = 5000 // 5 seconds in milliseconds
const SPAWN_POSITION = new Vector3(0, 0, 0)
const MINING_SPEED = 1 // resources per second
const BLOCK_COSTS = {
  'wood-block': { wood: 1 },
  'stone-block': { stone: 1 }
}

const BLOCK_COLORS = {
  'wood-block': '#8B4513',
  'stone-block': '#808080'
}

export function Player({ 
  onCollectResource, 
  selectedTool,
  selectedBlockType,
  setSelectedBlockType,
  resources,
  spendResources 
}: { 
  onCollectResource: (type: string, amount: number) => void
  selectedTool: 'build' | 'gather'
  selectedBlockType: string | null
  setSelectedBlockType: (type: string | null) => void
  resources: Record<string, number>
  spendResources: (cost: Record<string, number>) => boolean
}) {
  const playerRef = useRef<Mesh>(null)
  const targetPosition = useRef(new Vector3(0, 0, 0))
  const { camera, raycaster, pointer } = useThree()
  const [outOfBoundsTime, setOutOfBoundsTime] = useState<number | null>(null)
  const [deathTimerVisible, setDeathTimerVisible] = useState(false)
  const [timeLeft, setTimeLeft] = useState(DEATH_TIMER / 1000)
  const [isPaused, setIsPaused] = useState(false)
  const [isMining, setIsMining] = useState(false)
  const [currentMiningTarget, setCurrentMiningTarget] = useState<{ object: THREE.Object3D, type: string } | null>(null)
  const lastMiningTime = useRef(Date.now())
  const [previewPosition, setPreviewPosition] = useState<Vector3 | null>(null)
  const [isInRange, setIsInRange] = useState(false)

  const ghostMaterial = useMemo(() => {
    const material = new MeshStandardMaterial({
      transparent: true,
      opacity: 0.5,
      color: selectedBlockType ? BLOCK_COLORS[selectedBlockType] : '#ffffff'
    })
    return material
  }, [selectedBlockType])

  const respawnPlayer = () => {
    if (playerRef.current) {
      playerRef.current.position.copy(SPAWN_POSITION)
      targetPosition.current.copy(SPAWN_POSITION)
      setOutOfBoundsTime(null)
      setDeathTimerVisible(false)
      setTimeLeft(DEATH_TIMER / 1000)
    }
  }

  // Handle spacebar for pausing movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsPaused(true)
        e.preventDefault()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsPaused(false)
        setIsMining(false)
        setCurrentMiningTarget(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.position.set(0, 0, 0)
    }
  }, [])

  useFrame((state, delta) => {
    if (!playerRef.current) return

    // Update target position based on mouse position
    raycaster.setFromCamera(pointer, camera)
    const intersects = raycaster.intersectObjects(state.scene.children, true)
    
    // Handle movement only if not paused
    if (!isPaused) {
      if (intersects.length > 0) {
        const point = intersects[0].point
        targetPosition.current.set(point.x, 0, point.z)
      }

      // Move player towards target position
      const direction = targetPosition.current.clone().sub(playerRef.current.position)
      if (direction.length() > 0.1) {
        direction.normalize()
        const newPosition = playerRef.current.position.clone()
        newPosition.add(direction.multiplyScalar(MOVEMENT_SPEED))
        
        if (!checkCollision(newPosition)) {
          playerRef.current.position.copy(newPosition)
        }

        // Update player rotation to face movement direction
        const angle = Math.atan2(direction.x, direction.z)
        playerRef.current.rotation.y = angle
      }
    } else {
      // Update block preview and interaction range check
      if (intersects.length > 0) {
        const intersection = intersects[0]
        const distance = intersection.point.distanceTo(playerRef.current.position)
        setIsInRange(distance <= INTERACTION_RADIUS)

        if (selectedTool === 'build' && selectedBlockType) {
          const point = intersection.point
          const blockPos = new Vector3(
            Math.round(point.x / BLOCK_SIZE) * BLOCK_SIZE,
            0,
            Math.round(point.z / BLOCK_SIZE) * BLOCK_SIZE
          )
          setPreviewPosition(blockPos)
        } else {
          setPreviewPosition(null)
        }

        // Handle mining while paused
        if (selectedTool === 'gather' && isInRange) {
          const target = intersection.object
          const resourceType = target.userData.type
          
          if (resourceType && (resourceType === 'tree' || resourceType === 'rock')) {
            if (!isMining || !currentMiningTarget || currentMiningTarget.object !== target) {
              setIsMining(true)
              setCurrentMiningTarget({ object: target, type: resourceType })
              lastMiningTime.current = Date.now()
            } else {
              const now = Date.now()
              const timeDiff = now - lastMiningTime.current
              if (timeDiff >= 1000 / MINING_SPEED) {
                onCollectResource(resourceType === 'tree' ? 'wood' : 'stone', 1)
                lastMiningTime.current = now
              }
            }
          }
        }
      }
    }

    // Check if player is outside boundary
    const distanceFromCenter = playerRef.current.position.length()
    if (distanceFromCenter > BOUNDARY_RADIUS) {
      if (!outOfBoundsTime) {
        setOutOfBoundsTime(Date.now())
        setDeathTimerVisible(true)
      } else {
        const timeOutside = Date.now() - outOfBoundsTime
        setTimeLeft(Math.max(0, Math.ceil((DEATH_TIMER - timeOutside) / 1000)))
        
        if (timeOutside >= DEATH_TIMER) {
          respawnPlayer()
        }
      }
    } else {
      if (outOfBoundsTime) {
        setOutOfBoundsTime(null)
        setDeathTimerVisible(false)
        setTimeLeft(DEATH_TIMER / 1000)
      }
    }

    // Update camera position to follow player
    camera.position.x = playerRef.current.position.x
    camera.position.z = playerRef.current.position.z + 20
    camera.lookAt(playerRef.current.position)
  })

  return (
    <>
      <mesh ref={playerRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#FF0000" />
      </mesh>
      
      {/* Interaction radius visualization */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
        <ringGeometry args={[0, INTERACTION_RADIUS, 32]} />
        <meshBasicMaterial color="#808080" opacity={0.2} transparent />
      </mesh>
      
      {/* Boundary visualization */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
        <ringGeometry args={[BOUNDARY_RADIUS - 0.1, BOUNDARY_RADIUS, 64]} />
        <meshBasicMaterial color="#FF0000" opacity={0.5} transparent />
      </mesh>

      {/* Block preview */}
      {previewPosition && selectedBlockType && (
        <mesh position={previewPosition}>
          <boxGeometry args={[1, 1, 1]} />
          <primitive object={ghostMaterial} attach="material" />
        </mesh>
      )}

      {/* Death Timer UI */}
      {deathTimerVisible && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500/80 text-white px-4 py-2 rounded-lg text-xl font-bold">
          Return to boundary! Dying in {timeLeft}s
        </div>
      )}

      {/* Mining Progress UI */}
      {isMining && currentMiningTarget && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded">
          Mining {currentMiningTarget.type}...
        </div>
      )}

      {/* Out of Range Warning */}
      {isPaused && !isInRange && (
        <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 bg-yellow-500/80 text-white px-4 py-2 rounded">
          Too far away!
        </div>
      )}
    </>
  )
}
