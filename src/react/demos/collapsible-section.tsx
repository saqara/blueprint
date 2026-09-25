import { CopyIcon } from "lucide-react"
import { Button } from "@/registry/react/ui/button"
import { CollapsibleSection } from "@/registry/react/ui/collapsible-section"

export default function CollapsibleSectionDemo() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <CollapsibleSection title="Contacts (2)" actions={<Button variant="outline" size="sm">Ajouter un contact</Button>}>
        <ul className="grid gap-1 text-sm"><li>Camille Martin — Directrice</li><li>Julien Petit — Conducteur de travaux</li></ul>
      </CollapsibleSection>
      <CollapsibleSection title="Coordonnées bancaires" defaultOpen={false}
        actions={<Button variant="ghost" size="icon-sm" aria-label="Copier l'IBAN"><CopyIcon /></Button>}>
        <p className="font-mono text-sm">FR76 0000 0000 0000 0000 0000 000</p>
      </CollapsibleSection>
    </div>
  )
}
