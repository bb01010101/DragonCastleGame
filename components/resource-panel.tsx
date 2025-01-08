'use client'

import { TreesIcon as Tree, Gem, Wheat, Coins } from 'lucide-react'

interface ResourcePanelProps {
  resources: {
    wood: number
    stone: number
    food: number
    gold: number
  }
}

export function ResourcePanel({ resources }: ResourcePanelProps) {
  return (
    <div className="flex gap-4">
      <div className="flex items-center gap-2">
        <Tree className="w-4 h-4" />
        <span>{resources.wood}</span>
      </div>
      <div className="flex items-center gap-2">
        <Gem className="w-4 h-4" />
        <span>{resources.stone}</span>
      </div>
      <div className="flex items-center gap-2">
        <Wheat className="w-4 h-4" />
        <span>{resources.food}</span>
      </div>
      <div className="flex items-center gap-2">
        <Coins className="w-4 h-4" />
        <span>{resources.gold}</span>
      </div>
    </div>
  )
}
