<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/vue/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/vue/ui/table"

const rows = [
  { siren: "900 000 001", name: "Bâti Sud SAS", city: "Lyon" },
  { siren: "900 000 002", name: "Élec Rhône", city: "Villeurbanne" },
]
</script>

<template>
  <div class="grid w-full max-w-2xl gap-6">
    <Table>
      <TableHeader>
        <TableRow><TableHead>SIREN</TableHead><TableHead>Raison sociale</TableHead><TableHead>Ville</TableHead></TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="r in rows" :key="r.siren"><TableCell>{{ r.siren }}</TableCell><TableCell>{{ r.name }}</TableCell><TableCell>{{ r.city }}</TableCell></TableRow>
      </TableBody>
    </Table>
    <!-- In a card, the card is the frame: :bordered="false". -->
    <Card class="gap-2 pb-2">
      <CardHeader><CardTitle>Entreprises suivies</CardTitle></CardHeader>
      <CardContent class="px-2">
        <Table :bordered="false">
          <TableHeader>
            <TableRow><TableHead>SIREN</TableHead><TableHead>Raison sociale</TableHead><TableHead>Ville</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="r in rows" :key="r.siren"><TableCell>{{ r.siren }}</TableCell><TableCell>{{ r.name }}</TableCell><TableCell>{{ r.city }}</TableCell></TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
