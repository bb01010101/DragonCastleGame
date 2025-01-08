'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Home, Castle, Sword, Shield } from 'lucide-react'

interface BuildingCost {
  wood?: number
  stone?: number
  food?: number
  gold?: number
}

interface BuildMenuProps {
  resources: {
    wood: number
    stone: number
    food: number
    gold: number
  }
  onBuild: (cost: BuildingCost) => void
}

const BUILDINGS = [
  {
    name: 'House',
    icon: Home,
    cost: { wood: 50, stone: 20 },
    description: 'Increases population capacity'
  },
  {
    name: 'Castle',
    icon: Castle,
    cost: { wood: 200, stone: 400, gold: 100 },
    description: 'Your main fortress'
  },
  {
    name: 'Barracks',
    icon: Sword,
    cost: { wood: 100, stone: 50, gold: 20 },
    description: 'Train military units'
  },
  {
    name: 'Tower',
    icon: Shield,
    cost: { wood: 75, stone: 150 },
    description: 'Defensive structure'
  },
]

export function BuildMenu({ resources, onBuild }: BuildMenuProps) {
  const canAfford = (cost: BuildingCost) => {
    return Object.entries(cost).every(([resource, amount]) => 
      resources[resource as keyof typeof resources] >= amount
    )
  }

  return (
    <Card className="p-4">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4">
          {BUILDINGS.map((building) => {
            const Icon = building.icon
            const affordable = canAfford(building.cost)
            
            return (
              <Button
                key={building.name}
                variant="outline"
                className="flex flex-col items-center p-4 h-auto"
                disabled={!affordable}
                onClick={() => affordable && onBuild(building.cost)}
              >
                <Icon className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">{building.name}</span>
                <span className="text-xs text-muted-foreground">{building.description}</span>
                <div className="mt-2 text-xs">
                  {Object.entries(building.cost).map(([resource, amount]) => (
                    <div key={resource} className="flex items-center gap-1">
                      <span>{resource}:</span>
                      <span className={resources[resource as keyof typeof resources] < amount ? 'text-red-500' : ''}>
                        {amount}
                      </span>
                    </div>
                  ))}
                </div>
              </Button>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Card>
  )
}
