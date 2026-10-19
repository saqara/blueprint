import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "@/registry/react/ui/button"
import { ButtonGroup, ButtonGroupText } from "@/registry/react/ui/button-group"

export default function ButtonGroupDemo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <ButtonGroup aria-label="Actions sur l'entreprise">
        <Button variant="outline">Modifier</Button>
        <Button variant="outline">Dupliquer</Button>
        <Button variant="outline">Archiver</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Pagination">
        <Button variant="outline" size="icon" aria-label="Page précédente"><ChevronLeftIcon /></Button>
        <ButtonGroupText>Page 2 sur 8</ButtonGroupText>
        <Button variant="outline" size="icon" aria-label="Page suivante"><ChevronRightIcon /></Button>
      </ButtonGroup>
    </div>
  )
}
