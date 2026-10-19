<script setup lang="ts">
import { Archive, Download, RefreshCw, Star } from "@lucide/vue"
import RecordPage from "@/registry/vue/blocks/RecordPage.vue"
import { Button } from "@/registry/vue/ui/button"
import { CollapsibleSection } from "@/registry/vue/ui/collapsible-section"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/vue/ui/table"

const contacts = [
  { name: "Julie Moreau", role: "Gérante", email: "j.moreau@exemple.fr" },
  { name: "Karim Benali", role: "Conducteur de travaux", email: "k.benali@exemple.fr" },
  { name: "Léa Fontaine", role: "Comptabilité", email: "l.fontaine@exemple.fr" },
]
const evaluations = [
  { date: "12/09/2026", chantier: "Résidence Les Tilleuls", note: "17/20" },
  { date: "03/06/2026", chantier: "Groupe scolaire Jean Macé", note: "15/20" },
]
const noop = () => {}
</script>

<template>
  <div class="p-6">
    <RecordPage
      title="Bâti Sud SAS"
      :status="{ label: 'Qualifié', variant: 'success' }"
      :meta="['SIREN 900 000 001', 'Lyon (69)', 'Gros œuvre']"
      :menu-actions="[
        { label: 'Exporter la fiche', icon: Download, onSelect: noop },
        { label: 'Demander une mise à jour', icon: RefreshCw, onSelect: noop },
        { label: 'Archiver', icon: Archive, onSelect: noop, destructive: true },
      ]"
      :tabs="[
        { value: 'infos', label: 'Informations' },
        { value: 'contacts', label: 'Contacts', count: contacts.length },
        { value: 'evaluations', label: 'Évaluations', count: evaluations.length },
      ]"
      :facts="[
        { label: 'Note qualité', value: '16/20' },
        { label: 'Note RSE', value: '14/20' },
        { label: 'Effectif', value: '38 salariés' },
        { label: 'Dernière mise à jour', value: '12 septembre 2026' },
      ]"
    >
      <template #actions><Button variant="outline"><Star />Favori</Button></template>
      <template #tab-infos>
        <CollapsibleSection title="Informations légales" :heading-level="2" variant="card">
          <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
            <dt class="text-muted-foreground">Forme</dt><dd>SAS au capital de 50 000 €</dd>
            <dt class="text-muted-foreground">Création</dt><dd>2004</dd>
            <dt class="text-muted-foreground">Code NAF</dt><dd>41.20B — Construction d’autres bâtiments</dd>
          </dl>
        </CollapsibleSection>
        <CollapsibleSection title="Agences" :heading-level="2" variant="card" :default-open="false">
          <ul class="list-disc space-y-1 pl-5 text-sm"><li>Lyon Sud (siège)</li><li>Villeurbanne</li><li>Vienne</li></ul>
        </CollapsibleSection>
      </template>
      <template #tab-contacts>
        <Table>
          <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Fonction</TableHead><TableHead>E-mail</TableHead></TableRow></TableHeader>
          <TableBody>
            <TableRow v-for="c in contacts" :key="c.email"><TableCell class="font-medium">{{ c.name }}</TableCell><TableCell>{{ c.role }}</TableCell><TableCell>{{ c.email }}</TableCell></TableRow>
          </TableBody>
        </Table>
      </template>
      <template #tab-evaluations>
        <Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Chantier</TableHead><TableHead>Note</TableHead></TableRow></TableHeader>
          <TableBody>
            <TableRow v-for="e in evaluations" :key="e.date"><TableCell>{{ e.date }}</TableCell><TableCell>{{ e.chantier }}</TableCell><TableCell>{{ e.note }}</TableCell></TableRow>
          </TableBody>
        </Table>
      </template>
    </RecordPage>
  </div>
</template>
