'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, Raycaster, Mesh, MeshStandardMaterial } from 'three'
import { Html } from '@react-three/drei'
import { BLOCK_SIZE } from '../constants'
import { checkCollision } from '../utils/collision'

const MOVEMENT_SPEED = 0.1
const INTERACTION_RADIUS = 6 // Same radius for both building and destroying
const BOUNDARY_RADIUS = 50
const DEATH_TIMER = 5000
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

const BLOCK_HEALTH = {
  'tree': 1,
  'rock': 3,
  'wood-block': 2,
  'stone-block': 4
}

interface Fist {
  position: Vector3
  scale: Vector3
  isPunching: boolean
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
  const [previewPosition, setPreviewPosition] = useState<Vector3 | null>(null)
  const [isInRange, setIsInRange] = useState(false)
  const [placedBlocks, setPlacedBlocks] = useState<Array<{
    position: Vector3,
    type: 'wood-block' | 'stone-block'
  }>>([])
  const [blockHealth, setBlockHealth] = useState<Record<string, number>>({})
  const [leftFist, setLeftFist] = useState<Fist>({
    position: new Vector3(-0.5, 0, -1),
    scale: new Vector3(1, 1, 1),
    isPunching: false
  })
  const [rightFist, setRightFist] = useState<Fist>({
    position: new Vector3(0.5, 0, -1),
    scale: new Vector3(1, 1, 1),
    isPunching: false
  })
  const [isLeftPunching, setIsLeftPunching] = useState(true)

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

  // Animation function for alternating fists
  const punchFist = (isLeft: boolean) => {
    const fist = isLeft ? leftFist : rightFist
    const setFist = isLeft ? setLeftFist : setRightFist
    
    // Start punch
    setFist({
      ...fist,
      position: new Vector3(fist.position.x, fist.position.y, 1.5),
      isPunching: true
    })

    // Return to normal position
    setTimeout(() => {
      setFist({
        ...fist,
        position: new Vector3(fist.position.x, fist.position.y, 1),
        isPunching: false
      })
    }, 200)
  }

  // Handle click events for building and destroying
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!playerRef.current || !isPaused || e.button !== 0) return

      const localRaycaster = new Raycaster()
      localRaycaster.setFromCamera(pointer, camera)
      const intersects = localRaycaster.intersectObjects(camera.parent?.children || [], true)

      if (intersects.length > 0) {
        const intersection = intersects[0]
        const distance = intersection.point.distanceTo(playerRef.current.position)

        if (distance <= INTERACTION_RADIUS) {
          if (selectedTool === 'build' && selectedBlockType) {
            const point = intersection.point
            const blockPos = new Vector3(
              Math.round(point.x / BLOCK_SIZE) * BLOCK_SIZE,
              0,
              Math.round(point.z / BLOCK_SIZE) * BLOCK_SIZE
            )

            const cost = BLOCK_COSTS[selectedBlockType]
            if (cost && spendResources(cost)) {
              setPlacedBlocks(prev => [...prev, {
                position: blockPos.clone(),
                type: selectedBlockType as 'wood-block' | 'stone-block'
              }])
              punchFist(false) // Right fist punches when building
            }
          } else if (selectedTool === 'gather') {
            const target = intersection.object
            const targetParent = target.parent
            const blockId = `${targetParent?.position.x || target.position.x},${targetParent?.position.z || target.position.z}`
            const blockType = targetParent?.userData?.type || target.userData?.type

            // Check if it's a placed block
            const isPlacedBlock = placedBlocks.some(block => 
              block.position.x === (targetParent?.position.x || target.position.x) &&
              block.position.z === (targetParent?.position.z || target.position.z)
            )

            if ((blockType && BLOCK_HEALTH[blockType]) || isPlacedBlock) {
              setBlockHealth(prev => {
                const currentHealth = prev[blockId] || BLOCK_HEALTH[blockType] || 50
                const newHealth = currentHealth - 1
                
                if (newHealth <= 0) {
                  // Handle resource collection for all types
                  if (blockType === 'tree' || blockType === 'wood-block') {
                    onCollectResource('wood', 1)
                  } else if (blockType === 'rock' || blockType === 'stone-block') {
                    onCollectResource('stone', 1)
                  }

                  // Remove block if it's a placed block
                  if (blockType === 'wood-block' || blockType === 'stone-block' || isPlacedBlock) {
                    setPlacedBlocks(prev => prev.filter(block => 
                      block.position.x !== (targetParent?.position.x || target.position.x) || 
                      block.position.z !== (targetParent?.position.z || target.position.z)
                    ))
                  }

                  const newHealthState = { ...prev }
                  delete newHealthState[blockId]
                  return newHealthState
                }
                
                return { ...prev, [blockId]: newHealth }
              })
              // Alternate fists when destroying
              punchFist(isLeftPunching)
              setIsLeftPunching(!isLeftPunching)
            }
          }
        }
      }
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [camera, pointer, isPaused, selectedTool, selectedBlockType, spendResources, onCollectResource, isLeftPunching])

  useFrame((state, delta) => {
    if (!playerRef.current) return

    raycaster.setFromCamera(pointer, camera)
    const intersects = raycaster.intersectObjects(state.scene.children, true)
    
    if (!isPaused) {
      // Clear preview when moving
      setPreviewPosition(null)
      setIsInRange(false)

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
        
        // Check collisions with blocks and boundary
        if (!checkCollision(newPosition, [...placedBlocks])) {
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

    // Update fist positions to point at cursor
    if (intersects.length > 0) {
      const point = intersects[0].point
      const direction = point.clone().sub(playerRef.current.position).normalize()
      const angle = Math.atan2(direction.x, direction.z)
      
      // Update player rotation
      playerRef.current.rotation.y = angle

      // Position fists on the side facing the cursor
      const leftPos = new Vector3(-0.5, 0, 1)
      const rightPos = new Vector3(0.5, 0, 1)

      setLeftFist(prev => ({
        ...prev,
        position: leftPos
      }))
      setRightFist(prev => ({
        ...prev,
        position: rightPos
      }))
    }
  })

  return (
    <>
      <mesh ref={playerRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#FF0000" />
        
        {/* Left Fist */}
        <mesh
          position={leftFist.position}
          scale={leftFist.scale}
        >
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#FFA07A" />
        </mesh>

        {/* Right Fist */}
        <mesh
          position={rightFist.position}
          scale={rightFist.scale}
        >
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#FFA07A" />
        </mesh>
      </mesh>
      
      {/* Interaction radius visualization */}
      {selectedTool === 'build' ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
          <ringGeometry args={[0, INTERACTION_RADIUS, 64]} />
          <meshBasicMaterial color="#4A90E2" opacity={0.5} transparent />
        </mesh>
      ) : (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
          <ringGeometry args={[0, INTERACTION_RADIUS, 64]} />
          <meshBasicMaterial color="#F5A623" opacity={0.5} transparent />
        </mesh>
      )}
      
      {/* Boundary visualization */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
        <ringGeometry args={[BOUNDARY_RADIUS - 0.1, BOUNDARY_RADIUS, 64]} />
        <meshBasicMaterial color="#FF0000" opacity={0.5} transparent />
      </mesh>

      {/* Placed blocks */}
      {placedBlocks.map((block, index) => (
        <mesh key={index} position={block.position}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={BLOCK_COLORS[block.type]} />
        </mesh>
      ))}

      {/* Block preview */}
      {previewPosition && selectedBlockType && isInRange && (
        <mesh position={previewPosition}>
          <boxGeometry args={[1, 1, 1]} />
          <primitive object={ghostMaterial} attach="material" />
        </mesh>
      )}

      {/* Death Timer UI */}
      {deathTimerVisible && (
        <Html center position={[0, 2, 0]}>
          <div className="bg-red-500/80 text-white px-4 py-2 rounded-lg text-xl font-bold whitespace-nowrap">
            Return to boundary! Dying in {timeLeft}s
          </div>
        </Html>
      )}
    </>
  )
}
