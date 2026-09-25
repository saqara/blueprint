import { Badge } from "@/registry/react/ui/badge"
import { Button } from "@/registry/react/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/registry/react/ui/hover-card"

export default function HoverCardDemo() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild><Button variant="link">Bâti Sud SAS</Button></HoverCardTrigger>
      <HoverCardContent className="space-y-1 text-sm">
        <p className="font-medium">Bâti Sud SAS</p>
        <p className="text-muted-foreground">SIREN 552 100 554 — Lyon</p>
        <Badge variant="success">Qualifié · 16/20</Badge>
      </HoverCardContent>
    </HoverCard>
  )
}
