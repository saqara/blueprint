import { useState } from "react"
import { Building2, ClipboardCheck, Download, Leaf, MoreHorizontal, RefreshCw, Star, Users } from "lucide-react"
import { toast } from "sonner"
import { AppShellHeader, type AppNavItem } from "@/registry/react/blocks/app-shell-header"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/registry/react/ui/accordion"
import { Badge } from "@/registry/react/ui/badge"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/registry/react/ui/breadcrumb"
import { Button } from "@/registry/react/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/registry/react/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/registry/react/ui/dropdown-menu"
import { Field, FieldLabel } from "@/registry/react/ui/field"
import { Input } from "@/registry/react/ui/input"
import { StatCard } from "@/registry/react/ui/stat-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/react/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/react/ui/tabs"
import { Toggle } from "@/registry/react/ui/toggle"

// Example: a supplier's detail page. Data is fictitious; the app mounts <Toaster /> once at its root.
const nav: AppNavItem[] = [
  { id: "annuaire", label: "Mes entreprises", icon: Building2 },
  { id: "evaluations", label: "Évaluations", icon: ClipboardCheck, badge: 3 },
  { id: "rse", label: "Demandes RSE", icon: Leaf, badge: 1 },
  { id: "organisation", label: "Organisation", icon: Users },
]
type Contact = { name: string; role: string; email: string }
const initialContacts: Contact[] = [
  { name: "Julie Moreau", role: "Gérante", email: "j.moreau@batisud.fr" },
  { name: "Karim Benali", role: "Conducteur de travaux", email: "k.benali@batisud.fr" },
  { name: "Léa Fontaine", role: "Comptabilité", email: "l.fontaine@batisud.fr" },
]
const evaluations = [
  { date: "12/09/2026", chantier: "Résidence Les Tilleuls", note: 17, by: "Camille Martin" },
  { date: "03/06/2026", chantier: "Groupe scolaire Jean Macé", note: 15, by: "Hugo Leroy" },
  { date: "18/02/2026", chantier: "Siège Rhône Habitat", note: 13, by: "Camille Martin" },
]

export default function FicheEntrepriseExample() {
  const [contacts, setContacts] = useState(initialContacts)
  const [draft, setDraft] = useState<Contact>({ name: "", role: "", email: "" })
  const [open, setOpen] = useState(false)
  const [favorite, setFavorite] = useState(false)
  const addContact = () => {
    if (!draft.name.trim() || !draft.email.trim()) return
    setContacts((list) => [...list, draft])
    setDraft({ name: "", role: "", email: "" })
    setOpen(false)
    toast.success("Contact ajouté", { description: `${draft.name} a été ajouté à Bâti Sud SAS.` })
  }

  return (
    <AppShellHeader className="min-h-full" nav={nav} activeId="annuaire" user={{ name: "Camille Martin", email: "camille.martin@exemple.fr" }} onSignOut={() => {}}>
      <div className="mx-auto max-w-5xl space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="#/exemples/annuaire">Mes entreprises</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Bâti Sud SAS</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Bâti Sud SAS</h2>
            <p className="text-sm text-muted-foreground">SIREN 552 100 554 · Lyon (69) · Gros œuvre</p>
            <div className="flex gap-2 pt-1"><Badge variant="success">Qualifié</Badge><Badge variant="secondary">Note 16/20</Badge></div>
          </div>
          <div className="flex items-center gap-2">
            <Toggle variant="outline" pressed={favorite} onPressedChange={setFavorite} aria-label="Favori">
              <Star className={favorite ? "fill-current" : undefined} />Favori
            </Toggle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="outline"><MoreHorizontal />Actions</Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem><Download />Exporter la fiche</DropdownMenuItem>
                <DropdownMenuItem><RefreshCw />Demander une mise à jour</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Note qualité" value="16/20" description="3 dernières évaluations" />
          <StatCard label="Note RSE" value="14/20" description="Questionnaire 2026" />
          <StatCard label="Évaluations" value="12" description="Depuis 2021" />
          <StatCard label="Agences" value="3" description="Rhône, Isère" />
        </div>

        <Tabs defaultValue="infos">
          <TabsList>
            <TabsTrigger value="infos">Informations</TabsTrigger>
            <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
            <TabsTrigger value="evaluations">Évaluations</TabsTrigger>
          </TabsList>

          <TabsContent value="infos">
            <Accordion type="multiple" defaultValue={["legal"]}>
              <AccordionItem value="legal">
                <AccordionTrigger>Informations légales</AccordionTrigger>
                <AccordionContent>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
                    <dt className="text-muted-foreground">Forme</dt><dd>SAS au capital de 50 000 €</dd>
                    <dt className="text-muted-foreground">Création</dt><dd>2004</dd>
                    <dt className="text-muted-foreground">Code NAF</dt><dd>41.20B — Construction d'autres bâtiments</dd>
                  </dl>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="finance">
                <AccordionTrigger>Données financières</AccordionTrigger>
                <AccordionContent>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
                    <dt className="text-muted-foreground">CA 2025</dt><dd>4,2 M€</dd>
                    <dt className="text-muted-foreground">Effectif</dt><dd>38 salariés</dd>
                  </dl>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="agencies">
                <AccordionTrigger>Agences</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc space-y-1 pl-5 text-sm"><li>Lyon Sud (siège)</li><li>Villeurbanne</li><li>Vienne</li></ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-3">
            <div className="flex justify-end">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild><Button>Ajouter un contact</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nouveau contact</DialogTitle>
                    <DialogDescription>Le contact sera visible par toute l'organisation.</DialogDescription>
                  </DialogHeader>
                  <form id="new-contact" className="grid gap-3" onSubmit={(e) => { e.preventDefault(); addContact() }}>
                    <Field><FieldLabel htmlFor="c-name">Nom et prénom</FieldLabel><Input id="c-name" required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
                    <Field><FieldLabel htmlFor="c-role">Fonction</FieldLabel><Input id="c-role" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} /></Field>
                    <Field><FieldLabel htmlFor="c-email">E-mail</FieldLabel><Input id="c-email" type="email" required value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></Field>
                  </form>
                  <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
                    <Button type="submit" form="new-contact">Enregistrer</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <Table>
              <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Fonction</TableHead><TableHead>E-mail</TableHead></TableRow></TableHeader>
              <TableBody>
                {contacts.map((c, i) => (
                  <TableRow key={`${c.email}-${i}`}><TableCell className="font-medium">{c.name}</TableCell><TableCell>{c.role || "—"}</TableCell><TableCell>{c.email}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="evaluations">
            <ul className="divide-y rounded-md border">
              {evaluations.map((ev) => (
                <li key={ev.date} className="flex items-center justify-between gap-4 p-3 text-sm">
                  <div><p className="font-medium">{ev.chantier}</p><p className="text-muted-foreground">{ev.date} · évaluée par {ev.by}</p></div>
                  <Badge variant={ev.note >= 15 ? "success" : "warning"}>{ev.note}/20</Badge>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </div>
    </AppShellHeader>
  )
}
