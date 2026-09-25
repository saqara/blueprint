import { Button } from "@/registry/react/ui/button"

export default function ButtonDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button>Enregistrer</Button>
      <Button variant="secondary">Annuler</Button>
      <Button variant="outline">Exporter</Button>
      <Button variant="ghost">Plus d'options</Button>
      <Button variant="destructive">Supprimer</Button>
      <Button variant="link">Voir le détail</Button>
      <Button disabled>Désactivé</Button>
    </div>
  )
}
