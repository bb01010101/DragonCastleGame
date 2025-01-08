'use client'

import { useState, useCallback } from 'react'

export interface Resources {
  wood: number
  stone: number
  food: number
  gold: number
}

export function useGameState() {
  const [resources, setResources] = useState<Resources>({
    wood: 0,
    stone: 0,
    food: 0,
    gold: 0
  })

  const addResources = useCallback((newResources: Partial<Resources>) => {
    setResources(prev => ({
      wood: prev.wood + (newResources.wood || 0),
      stone: prev.stone + (newResources.stone || 0),
      food: prev.food + (newResources.food || 0),
      gold: prev.gold + (newResources.gold || 0)
    }))
  }, [])

  const spendResources = useCallback((cost: Partial<Resources>) => {
    setResources(prev => ({
      wood: Math.max(0, prev.wood - (cost.wood || 0)),
      stone: Math.max(0, prev.stone - (cost.stone || 0)),
      food: Math.max(0, prev.food - (cost.food || 0)),
      gold: Math.max(0, prev.gold - (cost.gold || 0))
    }))
  }, [])

  return { resources, addResources, spendResources }
}
