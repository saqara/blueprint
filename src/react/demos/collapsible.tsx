import { ChevronsUpDown } from "lucide-react"
import { Button } from "@/registry/react/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/registry/react/ui/collapsible"

export default function CollapsibleDemo() {
  return (
    <Collapsible className="max-w-sm space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">3 agences rattachées</p>
        <CollapsibleTrigger asChild><Button variant="ghost" size="icon" aria-label="Afficher les agences"><ChevronsUpDown /></Button></CollapsibleTrigger>
      </div>
      <div className="rounded-md border px-3 py-2 text-sm">Lyon Sud</div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border px-3 py-2 text-sm">Villeurbanne</div>
        <div className="rounded-md border px-3 py-2 text-sm">Vienne</div>
      </CollapsibleContent>
    </Collapsible>
  )
}
