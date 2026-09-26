<script setup lang="ts">
import { HorizontalScroll } from "@/registry/vue/ui/horizontal-scroll"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/vue/ui/table"

const months = ["Janv.", "Févr.", "Mars", "Avr.", "Mai", "Juin", "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc."]
const rows = ["Bâti Sud SAS", "Élec Rhône", "Plomberie Dupuis", "Carrelages Marseillais", "Ain Couverture", "Bresse Électricité", "Charpentes du Forez", "Calanques Aménagement"]
</script>

<template>
  <div class="w-full max-w-2xl rounded-md border">
    <!-- The table gives its scrolling to HorizontalScroll (:container="false"). Drag it sideways, or use the bar. -->
    <HorizontalScroll>
      <Table :container="false" class="min-w-[1100px]">
        <TableHeader>
          <TableRow><TableHead>Entreprise</TableHead><TableHead v-for="m in months" :key="m" class="text-right">{{ m }}</TableHead></TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="(r, i) in rows" :key="r">
            <TableCell class="font-medium">{{ r }}</TableCell>
            <TableCell v-for="(m, j) in months" :key="m" class="text-right tabular-nums">{{ ((i * 7 + j * 3) % 20) + 1 }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </HorizontalScroll>
  </div>
</template>
