import { Button } from "@/registry/react/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/registry/react/ui/empty"

export function NotFound() {
  return (
    <Empty>
      <EmptyHeader><EmptyTitle>Introuvable</EmptyTitle><EmptyDescription>Cette page n'existe pas (ou plus).</EmptyDescription></EmptyHeader>
      <EmptyContent><Button asChild><a href="#/">Retour à l'accueil</a></Button></EmptyContent>
    </Empty>
  )
}
