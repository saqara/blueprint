import { SearchX } from "lucide-react"
import { Button } from "@/registry/react/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/registry/react/ui/empty"

export default function EmptyDemo() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon"><SearchX /></EmptyMedia>
        <EmptyTitle>Aucune entreprise</EmptyTitle>
        <EmptyDescription>Aucun résultat ne correspond à ces filtres.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent><Button variant="outline">Réinitialiser les filtres</Button></EmptyContent>
    </Empty>
  )
}
