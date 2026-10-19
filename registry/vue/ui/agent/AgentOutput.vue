<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { CodeBlock } from '@/registry/vue/ui/code-block'

const props = defineProps<{
  schema: string
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
    :class="cn('space-y-2', props.class)"
    v-bind="$attrs"
  >
    <span class="font-medium text-muted-foreground text-sm">
      Schéma de sortie
    </span>
    <div class="rounded-md bg-muted/50">
      <CodeBlock :code="props.schema" language="typescript" />
    </div>
  </div>
</template>
