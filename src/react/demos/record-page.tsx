import { Archive, Download, RefreshCw, Star } from "lucide-react"
import { RecordPage } from "@/registry/react/blocks/record-page"
import { Button } from "@/registry/react/ui/button"
import { CollapsibleSection } from "@/registry/react/ui/collapsible-section"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/react/ui/table"

const contacts = [
  { name: "Julie Moreau", role: "Gérante", email: "j.moreau@exemple.fr" },
  { name: "Karim Benali", role: "Conducteur de travaux", email: "k.benali@exemple.fr" },
  { name: "Léa Fontaine", role: "Comptabilité", email: "l.fontaine@exemple.fr" },
]
const evaluations = [
  { date: "12/09/2026", chantier: "Résidence Les Tilleuls", note: "17/20" },
  { date: "03/06/2026", chantier: "Groupe scolaire Jean Macé", note: "15/20" },
]

export default function RecordPageDemo() {
  return (
    <div className="p-6">
      <RecordPage
        title="Bâti Sud SAS"
        status={{ label: "Qualifié", variant: "success" }}
        meta={["SIREN 900 000 001", "Lyon (69)", "Gros œuvre"]}
        actions={<Button variant="outline"><Star />Favori</Button>}
        menuActions={[
          { label: "Exporter la fiche", icon: <Download />, onSelect: () => {} },
          { label: "Demander une mise à jour", icon: <RefreshCw />, onSelect: () => {} },
          { label: "Archiver", icon: <Archive />, onSelect: () => {}, destructive: true },
        ]}
        tabs={[
          {
            value: "infos", label: "Informations", content: (
              <>
                <CollapsibleSection title="Informations légales" headingLevel={2} variant="card">
                  <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
                    <dt className="text-muted-foreground">Forme</dt><dd>SAS au capital de 50 000 €</dd>
                    <dt className="text-muted-foreground">Création</dt><dd>2004</dd>
                    <dt className="text-muted-foreground">Code NAF</dt><dd>41.20B — Construction d’autres bâtiments</dd>
                  </dl>
                </CollapsibleSection>
                <CollapsibleSection title="Agences" headingLevel={2} variant="card" defaultOpen={false}>
                  <ul className="list-disc space-y-1 pl-5 text-sm"><li>Lyon Sud (siège)</li><li>Villeurbanne</li><li>Vienne</li></ul>
                </CollapsibleSection>
              </>
            ),
          },
          {
            value: "contacts", label: "Contacts", count: contacts.length, content: (
              <Table>
                <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Fonction</TableHead><TableHead>E-mail</TableHead></TableRow></TableHeader>
                <TableBody>
                  {contacts.map((c) => <TableRow key={c.email}><TableCell className="font-medium">{c.name}</TableCell><TableCell>{c.role}</TableCell><TableCell>{c.email}</TableCell></TableRow>)}
                </TableBody>
              </Table>
            ),
          },
          {
            value: "evaluations", label: "Évaluations", count: evaluations.length, content: (
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Chantier</TableHead><TableHead>Note</TableHead></TableRow></TableHeader>
                <TableBody>
                  {evaluations.map((e) => <TableRow key={e.date}><TableCell>{e.date}</TableCell><TableCell>{e.chantier}</TableCell><TableCell>{e.note}</TableCell></TableRow>)}
                </TableBody>
              </Table>
            ),
          },
        ]}
        facts={[
          { label: "Note qualité", value: "16/20" },
          { label: "Note RSE", value: "14/20" },
          { label: "Effectif", value: "38 salariés" },
          { label: "Dernière mise à jour", value: "12 septembre 2026" },
        ]}
      />
    </div>
  )
}
