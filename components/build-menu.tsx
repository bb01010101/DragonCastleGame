'use client'

import { TreePine, Mountain } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

interface BuildMenuProps {
  resources: Record<string, number>
  onBlockSelect: (type: 'wood-block' | 'stone-block') => void
  selectedBlockType: string | null
}

export function BuildMenu({ resources, onBlockSelect, selectedBlockType }: BuildMenuProps) {
  return (
    <div className="flex justify-center gap-4 pointer-events-auto">
      <Button
        variant="outline"
        size="lg"
        className={cn(
          "flex flex-col items-center gap-2 p-4 h-auto bg-white/90 hover:bg-white border-2",
          selectedBlockType === 'wood-block' ? "border-yellow-500" : "border-transparent"
        )}
        onClick={() => onBlockSelect('wood-block')}
        disabled={!resources.wood || resources.wood < 1}
      >
        <TreePine className="w-8 h-8 text-green-800" />
        <div className="text-sm font-bold text-gray-800">
          Wood Block
          <div className="text-xs font-normal">Cost: 1 wood</div>
        </div>
      </Button>

      <Button
        variant="outline"
        size="lg"
        className={cn(
          "flex flex-col items-center gap-2 p-4 h-auto bg-white/90 hover:bg-white border-2",
          selectedBlockType === 'stone-block' ? "border-yellow-500" : "border-transparent"
        )}
        onClick={() => onBlockSelect('stone-block')}
        disabled={!resources.stone || resources.stone < 1}
      >
        <Mountain className="w-8 h-8 text-gray-700" />
        <div className="text-sm font-bold text-gray-800">
          Stone Block
          <div className="text-xs font-normal">Cost: 1 stone</div>
        </div>
      </Button>
    </div>
  )
}
