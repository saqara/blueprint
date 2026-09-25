import { Button } from "@/registry/react/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/react/ui/popover"

export default function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild><Button variant="outline">Détail du score</Button></PopoverTrigger>
      <PopoverContent className="text-sm">Qualité 16/20 · RSE 14/20 · Délais 18/20</PopoverContent>
    </Popover>
  )
}
