<script setup lang="ts">
import { CodeBlock, CodeBlockActions, CodeBlockCopyButton, CodeBlockFilename, CodeBlockHeader, CodeBlockTitle } from "@/registry/vue/ui/code-block"

const code = `SELECT ville, COUNT(*) AS fournisseurs
FROM entreprises
WHERE statut = 'actif'
GROUP BY ville
ORDER BY fournisseurs DESC
LIMIT 10;`
</script>

<template>
  <CodeBlock :code="code" language="sql" show-line-numbers>
    <CodeBlockHeader>
      <CodeBlockTitle><CodeBlockFilename>top-villes.sql</CodeBlockFilename></CodeBlockTitle>
      <CodeBlockActions><CodeBlockCopyButton /></CodeBlockActions>
    </CodeBlockHeader>
  </CodeBlock>
</template>
