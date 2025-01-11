'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Resources } from "@/hooks/use-game-state"

interface BuildMenuProps {
  resources: Resources
  onBuild: (cost: Partial<Resources>) => void
  onBlockSelect: (type: 'wood-block' | 'stone-block') => void
}

export function BuildMenu({ resources, onBuild, onBlockSelect }: BuildMenuProps) {
  const handleBuildWoodBlock = () => {
    if (resources.wood >= 20) {
      onBuild({ wood: 20 })
      onBlockSelect('wood-block')
    }
  }

  const handleBuildStoneBlock = () => {
    if (resources.stone >= 20) {
      onBuild({ stone: 20 })
      onBlockSelect('stone-block')
    }
  }

  return (
    <Card className="p-4 bg-black/50">
      <div className="flex gap-4">
        <div>
          <Button
            onClick={handleBuildWoodBlock}
            disabled={resources.wood < 20}
            variant={resources.wood >= 20 ? "default" : "secondary"}
          >
            Build Wood Block (20 Wood)
          </Button>
        </div>
        <div>
          <Button
            onClick={handleBuildStoneBlock}
            disabled={resources.stone < 20}
            variant={resources.stone >= 20 ? "default" : "secondary"}
          >
            Build Stone Block (20 Stone)
          </Button>
        </div>
      </div>
    </Card>
  )
}
