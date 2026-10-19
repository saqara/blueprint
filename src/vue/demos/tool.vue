<script setup lang="ts">
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/registry/vue/ui/tool"

const input = { query: "SELECT ville, COUNT(*) FROM entreprises GROUP BY ville LIMIT 3" }
const output = [{ ville: "Lyon", total: 412 }, { ville: "Paris", total: 389 }, { ville: "Lille", total: 201 }]
</script>

<template>
  <div class="w-full max-w-xl">
    <Tool default-open>
      <ToolHeader type="tool-run_sql" title="Requête BigQuery" state="output-available" />
      <ToolContent>
        <ToolInput :input="input" />
        <ToolOutput :output="output" :error-text="undefined" />
      </ToolContent>
    </Tool>
    <Tool>
      <ToolHeader type="tool-run_sql" title="Requête BigQuery" state="output-error" />
      <ToolContent>
        <ToolOutput :output="undefined" error-text="Table « fournisseur » introuvable." />
      </ToolContent>
    </Tool>
  </div>
</template>
