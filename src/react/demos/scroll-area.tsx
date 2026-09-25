import { ScrollArea } from "@/registry/react/ui/scroll-area"
import { Separator } from "@/registry/react/ui/separator"

const lots = Array.from({ length: 30 }, (_, i) => `Lot ${String(i + 1).padStart(2, "0")}`)

export default function ScrollAreaDemo() {
  return (
    <ScrollArea className="h-48 w-56 rounded-md border">
      <div className="p-3 text-sm">
        {lots.map((lot) => (
          <div key={lot}><div className="py-1.5">{lot}</div><Separator /></div>
        ))}
      </div>
    </ScrollArea>
  )
}
