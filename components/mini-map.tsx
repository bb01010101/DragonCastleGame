'use client'

import { Card } from "@/components/ui/card"

export function MiniMap() {
  return (
    <Card className="w-full h-full bg-black/10">
      {/* Mini-map implementation will go here */}
      <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
        Mini-map
      </div>
    </Card>
  )
}
