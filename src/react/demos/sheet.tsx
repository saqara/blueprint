import { Button } from "@/registry/react/ui/button"
import { CollapsibleSection } from "@/registry/react/ui/collapsible-section"
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/registry/react/ui/sheet"

const contacts = ["Camille Martin — Directrice", "Julien Petit — Conducteur de travaux", "Inès Morel — Comptable", "Hugo Laurent — QSE"]

export default function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild><Button variant="outline">Voir la fiche</Button></SheetTrigger>
      <SheetContent size="lg">
        <SheetHeader>
          <SheetTitle>Bâti Sud SAS</SheetTitle>
          <SheetDescription>SIREN 900 000 001 — Lyon</SheetDescription>
        </SheetHeader>
        <SheetBody scrollProgress className="grid content-start gap-4">
          <CollapsibleSection title="Contacts" actions={<Button variant="ghost" size="sm">Ajouter</Button>}>
            <ul className="grid gap-2 text-sm">{contacts.map((c) => <li key={c}>{c}</li>)}</ul>
          </CollapsibleSection>
          <CollapsibleSection title="Historique" defaultOpen={false}>
            <p className="text-sm text-muted-foreground">Aucune évaluation pour l'instant.</p>
          </CollapsibleSection>
          {Array.from({ length: 12 }, (_, i) => <p key={i} className="text-sm text-muted-foreground">Note interne {i + 1} : document à jour.</p>)}
        </SheetBody>
        <SheetFooter><Button>Enregistrer</Button></SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
