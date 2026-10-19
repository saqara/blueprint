<script setup lang="ts">
import { ref } from "vue"
import { FileTree, FileTreeFile, FileTreeFolder } from "@/registry/vue/ui/file-tree"

const selected = ref("exports/2026-10/fournisseurs-actifs.csv")
const expanded = new Set(["exports", "exports/2026-10"])
</script>

<template>
  <div class="w-full max-w-sm space-y-2">
    <FileTree v-model:selected-path="selected" aria-label="Exports de la conversation" :default-expanded="expanded">
      <FileTreeFolder path="exports" name="exports">
        <FileTreeFolder path="exports/2026-10" name="2026-10">
          <FileTreeFile path="exports/2026-10/fournisseurs-actifs.csv" name="fournisseurs-actifs.csv" />
          <FileTreeFile path="exports/2026-10/notes-par-ville.csv" name="notes-par-ville.csv" />
        </FileTreeFolder>
        <FileTreeFolder path="exports/requetes" name="requetes">
          <FileTreeFile path="exports/requetes/top-villes.sql" name="top-villes.sql" />
        </FileTreeFolder>
      </FileTreeFolder>
    </FileTree>
    <p class="text-sm text-muted-foreground">Sélection : {{ selected }}</p>
  </div>
</template>
