<script setup lang="ts">
import type { AppNavItem } from "@/registry/vue/blocks/AppShellHeader.vue"
import { Building2, ClipboardCheck, Download, Leaf, MoreHorizontal, RefreshCw, Star, Users } from "@lucide/vue"
import { reactive, ref } from "vue"
import { toast } from "vue-sonner"
import AppShellHeader from "@/registry/vue/blocks/AppShellHeader.vue"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/registry/vue/ui/accordion"
import { Badge } from "@/registry/vue/ui/badge"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/registry/vue/ui/breadcrumb"
import { Button } from "@/registry/vue/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/registry/vue/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/registry/vue/ui/dropdown-menu"
import { Field, FieldLabel } from "@/registry/vue/ui/field"
import { Input } from "@/registry/vue/ui/input"
import { Toaster } from "@/registry/vue/ui/sonner"
import { StatCard } from "@/registry/vue/ui/stat-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/vue/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/vue/ui/tabs"
import { Toggle } from "@/registry/vue/ui/toggle"

// Example: a supplier's detail page. Data is fictitious; the app mounts a Toaster once at its root (here, the example's own root).
const nav: AppNavItem[] = [
  { id: "annuaire", label: "Mes entreprises", icon: Building2 },
  { id: "evaluations", label: "Évaluations", icon: ClipboardCheck, badge: 3 },
  { id: "rse", label: "Demandes RSE", icon: Leaf, badge: 1 },
  { id: "organisation", label: "Organisation", icon: Users },
]
type Contact = { name: string; role: string; email: string }
const contacts = ref<Contact[]>([
  { name: "Julie Moreau", role: "Gérante", email: "j.moreau@exemple.fr" },
  { name: "Karim Benali", role: "Conducteur de travaux", email: "k.benali@exemple.fr" },
  { name: "Léa Fontaine", role: "Comptabilité", email: "l.fontaine@exemple.fr" },
])
const evaluations = [
  { date: "12/09/2026", chantier: "Résidence Les Tilleuls", note: 17, by: "Alexandre Brochot" },
  { date: "03/06/2026", chantier: "Groupe scolaire Jean Macé", note: 15, by: "Hugo Leroy" },
  { date: "18/02/2026", chantier: "Siège Rhône Habitat", note: 13, by: "Alexandre Brochot" },
]
const draft = reactive<Contact>({ name: "", role: "", email: "" })
const open = ref(false)
const favorite = ref(false)

function addContact() {
  if (!draft.name.trim() || !draft.email.trim()) return
  contacts.value.push({ ...draft })
  toast.success("Contact ajouté", { description: `${draft.name} a été ajouté à Bâti Sud SAS.` })
  Object.assign(draft, { name: "", role: "", email: "" })
  open.value = false
}
</script>

<template>
  <AppShellHeader class="min-h-full" :nav="nav" active-id="annuaire" :user="{ name: 'Alexandre Brochot', email: 'alexandre.brochot@exemple.fr' }" @sign-out="() => {}">
    <Toaster />
    <div class="mx-auto max-w-5xl space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="#/exemples/annuaire">Mes entreprises</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Bâti Sud SAS</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header class="flex flex-wrap items-start justify-between gap-4">
        <div class="space-y-1">
          <h2 class="text-2xl font-semibold">Bâti Sud SAS</h2>
          <p class="text-sm text-muted-foreground">SIREN 900 000 001 · Lyon (69) · Gros œuvre</p>
          <div class="flex gap-2 pt-1"><Badge variant="success">Qualifié</Badge><Badge variant="secondary">Note 16/20</Badge></div>
        </div>
        <div class="flex items-center gap-2">
          <Toggle v-model="favorite" variant="outline" aria-label="Favori">
            <Star :class="favorite ? 'fill-current' : undefined" />Favori
          </Toggle>
          <DropdownMenu>
            <DropdownMenuTrigger as-child><Button variant="outline"><MoreHorizontal />Actions</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><Download />Exporter la fiche</DropdownMenuItem>
              <DropdownMenuItem><RefreshCw />Demander une mise à jour</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Note qualité" value="16/20" description="3 dernières évaluations" />
        <StatCard label="Note RSE" value="14/20" description="Questionnaire 2026" />
        <StatCard label="Évaluations" value="12" description="Depuis 2021" />
        <StatCard label="Agences" value="3" description="Rhône, Isère" />
      </div>

      <Tabs default-value="infos">
        <TabsList>
          <TabsTrigger value="infos">Informations</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({{ contacts.length }})</TabsTrigger>
          <TabsTrigger value="evaluations">Évaluations</TabsTrigger>
        </TabsList>

        <TabsContent value="infos">
          <Accordion type="multiple" :default-value="['legal']">
            <AccordionItem value="legal">
              <AccordionTrigger>Informations légales</AccordionTrigger>
              <AccordionContent>
                <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
                  <dt class="text-muted-foreground">Forme</dt><dd>SAS au capital de 50 000 €</dd>
                  <dt class="text-muted-foreground">Création</dt><dd>2004</dd>
                  <dt class="text-muted-foreground">Code NAF</dt><dd>41.20B — Construction d'autres bâtiments</dd>
                </dl>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="finance">
              <AccordionTrigger>Données financières</AccordionTrigger>
              <AccordionContent>
                <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
                  <dt class="text-muted-foreground">CA 2025</dt><dd>4,2 M€</dd>
                  <dt class="text-muted-foreground">Effectif</dt><dd>38 salariés</dd>
                </dl>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="agencies">
              <AccordionTrigger>Agences</AccordionTrigger>
              <AccordionContent>
                <ul class="list-disc space-y-1 pl-5 text-sm"><li>Lyon Sud (siège)</li><li>Villeurbanne</li><li>Vienne</li></ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value="contacts" class="space-y-3">
          <div class="flex justify-end">
            <Dialog v-model:open="open">
              <DialogTrigger as-child><Button>Ajouter un contact</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau contact</DialogTitle>
                  <DialogDescription>Le contact sera visible par toute l'organisation.</DialogDescription>
                </DialogHeader>
                <form id="new-contact" class="grid gap-3" @submit.prevent="addContact">
                  <Field><FieldLabel for="c-name">Nom et prénom</FieldLabel><Input id="c-name" v-model="draft.name" required /></Field>
                  <Field><FieldLabel for="c-role">Fonction</FieldLabel><Input id="c-role" v-model="draft.role" /></Field>
                  <Field><FieldLabel for="c-email">E-mail</FieldLabel><Input id="c-email" v-model="draft.email" type="email" required /></Field>
                </form>
                <DialogFooter>
                  <DialogClose as-child><Button variant="outline">Annuler</Button></DialogClose>
                  <Button type="submit" form="new-contact">Enregistrer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Fonction</TableHead><TableHead>E-mail</TableHead></TableRow></TableHeader>
            <TableBody>
              <TableRow v-for="(c, i) in contacts" :key="`${c.email}-${i}`"><TableCell class="font-medium">{{ c.name }}</TableCell><TableCell>{{ c.role || "—" }}</TableCell><TableCell>{{ c.email }}</TableCell></TableRow>
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="evaluations">
          <ul class="divide-y rounded-md border">
            <li v-for="ev in evaluations" :key="ev.date" class="flex items-center justify-between gap-4 p-3 text-sm">
              <div><p class="font-medium">{{ ev.chantier }}</p><p class="text-muted-foreground">{{ ev.date }} · évaluée par {{ ev.by }}</p></div>
              <Badge :variant="ev.note >= 15 ? 'success' : 'warning'">{{ ev.note }}/20</Badge>
            </li>
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  </AppShellHeader>
</template>
