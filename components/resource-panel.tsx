'use client'

import { TreePine, Mountain } from 'lucide-react'

export function ResourcePanel({ resources }: { resources: Record<string, number> }) {
  return (
    <div className="flex gap-6">
      <div className="flex items-center gap-2">
        <TreePine className="w-6 h-6" />
        <span className="text-lg font-bold">{resources.wood || 0}</span>
      </div>
      <div className="flex items-center gap-2">
        <Mountain className="w-6 h-6" />
        <span className="text-lg font-bold">{resources.stone || 0}</span>
      </div>
    </div>
  )
}
