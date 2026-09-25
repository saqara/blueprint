import { Button } from "@/registry/react/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/registry/react/ui/tooltip"

export default function TooltipDemo() {
  return (
    <Tooltip>
      <TooltipTrigger asChild><Button variant="outline">Score RSE</Button></TooltipTrigger>
      <TooltipContent>Moyenne des 3 derniers questionnaires</TooltipContent>
    </Tooltip>
  )
}
