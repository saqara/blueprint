<script setup lang="ts">
import { CardContent } from '@/registry/vue/ui/card'
import { CollapsibleContent } from '@/registry/vue/ui/collapsible'
</script>

<template>
  <CollapsibleContent as-child>
    <CardContent data-slot="plan-content">
      <slot />
    </CardContent>
  </CollapsibleContent>
</template>
