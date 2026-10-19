<script setup lang="ts">
import { ref } from "vue"
import { Terminal } from "@/registry/vue/ui/terminal"

// ANSI colours from the CLI are stripped: the terminal shows (and copies) plain text.
const LOG = "$ bq query --use_legacy_sql=false < top-villes.sql\n\u001b[32m✔\u001b[0m Requête terminée en 1,8 s (2,1 Go analysés)\n\nville   fournisseurs\nLyon    412\nParis   389\nLille   201\n"
const output = ref(LOG)
</script>

<template>
  <Terminal class="w-full max-w-2xl" :output="output" @clear="output = ''" />
</template>
