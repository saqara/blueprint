import { useState } from "react"
import { Label } from "@/registry/react/ui/label"
import { TagInput } from "@/registry/react/ui/tag-input"

const LOTS = ["Gros œuvre", "Électricité", "Plomberie", "Menuiserie", "Peinture", "Charpente", "Couverture", "Carrelage"]

export default function TagInputDemo() {
  const [emails, setEmails] = useState(["alexandre.brochot@saqara.com"])
  const [lots, setLots] = useState(["Plomberie"])
  return (
    <div className="grid w-full max-w-md gap-6">
      <div className="grid gap-2">
        <Label htmlFor="tag-emails">Destinataires (saisie libre)</Label>
        <TagInput id="tag-emails" value={emails} onValueChange={setEmails} placeholder="Ajouter une adresse…" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="tag-lots">Lots (catalogue, création autorisée)</Label>
        <TagInput id="tag-lots" value={lots} onValueChange={setLots} suggestions={LOTS} placeholder="Rechercher un lot…" />
      </div>
    </div>
  )
}
