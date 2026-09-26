import { useState } from "react"
import { Badge } from "@/registry/react/ui/badge"

export default function BadgeDemo() {
  const [cities, setCities] = useState(["Lyon", "Lille", "Paris"])
  return (
    <div className="flex flex-wrap gap-2">
      <Badge>Défaut</Badge>
      <Badge variant="secondary">Brouillon</Badge>
      <Badge variant="outline">Admin</Badge>
      <Badge variant="success">Qualifié</Badge>
      <Badge variant="warning">À compléter</Badge>
      <Badge variant="info">En cours</Badge>
      <Badge variant="identity">Saqara</Badge>
      <Badge variant="destructive">Refusé</Badge>
      {cities.map((c) => (
        <Badge key={c} variant="secondary" onRemove={() => setCities(cities.filter((x) => x !== c))} removeLabel={`Retirer ${c}`}>{c}</Badge>
      ))}
    </div>
  )
}
