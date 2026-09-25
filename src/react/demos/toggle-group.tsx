import { ToggleGroup, ToggleGroupItem } from "@/registry/react/ui/toggle-group"

export default function ToggleGroupDemo() {
  return (
    <ToggleGroup type="single" defaultValue="all" variant="outline">
      <ToggleGroupItem value="all">Toutes</ToggleGroupItem>
      <ToggleGroupItem value="qualified">Qualifiées</ToggleGroupItem>
      <ToggleGroupItem value="pending">À compléter</ToggleGroupItem>
    </ToggleGroup>
  )
}
