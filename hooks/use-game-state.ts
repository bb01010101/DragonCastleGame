'use client'

import { useState, useCallback } from 'react'

export interface Resources {
  wood: number
  stone: number
}

export function useGameState() {
  const [resources, setResources] = useState<Resources>({
    wood: 0,
    stone: 0
  })

  const addResources = useCallback((newResources: Partial<Resources>) => {
    setResources(prev => ({
      ...prev,
      wood: prev.wood + (newResources.wood || 0),
      stone: prev.stone + (newResources.stone || 0)
    }))
  }, [])

  const spendResources = useCallback((cost: Partial<Resources>): boolean => {
    let canAfford = true
    if (cost.wood && resources.wood < cost.wood) canAfford = false
    if (cost.stone && resources.stone < cost.stone) canAfford = false

    if (canAfford) {
      setResources(prev => ({
        ...prev,
        wood: prev.wood - (cost.wood || 0),
        stone: prev.stone - (cost.stone || 0)
      }))
      return true
    }
    return false
  }, [resources])

  return { resources, addResources, spendResources }
}
