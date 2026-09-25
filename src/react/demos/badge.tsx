import { Badge } from "@/registry/react/ui/badge"

export default function BadgeDemo() {
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
    </div>
  )
}
