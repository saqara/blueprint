import { Button } from "@/registry/react/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/registry/react/ui/tooltip"

export default function TooltipDemo() {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-2">
        <Tooltip>
          <TooltipTrigger asChild><Button variant="outline">Score RSE</Button></TooltipTrigger>
          <TooltipContent>Moyenne des 3 derniers questionnaires</TooltipContent>
        </Tooltip>
        {/* A disabled trigger works too: it is wrapped in a focusable span. */}
        <Tooltip>
          <TooltipTrigger asChild><Button disabled>Relancer</Button></TooltipTrigger>
          <TooltipContent>Relance impossible : déjà relancée aujourd'hui</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
