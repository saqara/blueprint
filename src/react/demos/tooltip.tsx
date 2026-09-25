import { Button } from "@/registry/react/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/registry/react/ui/tooltip"

export default function TooltipDemo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild><Button variant="outline">Score RSE</Button></TooltipTrigger>
        <TooltipContent>Moyenne des 3 derniers questionnaires</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
