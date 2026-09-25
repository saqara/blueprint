<script setup lang="ts">
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/vue/ui/table"

const rows = [
  { siren: "900 000 001", name: "Bâti Sud SAS", city: "Lyon" },
  { siren: "900 000 002", name: "Élec Rhône", city: "Villeurbanne" },
]
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow><TableHead>SIREN</TableHead><TableHead>Raison sociale</TableHead><TableHead>Ville</TableHead></TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="r in rows" :key="r.siren"><TableCell>{{ r.siren }}</TableCell><TableCell>{{ r.name }}</TableCell><TableCell>{{ r.city }}</TableCell></TableRow>
    </TableBody>
  </Table>
</template>
