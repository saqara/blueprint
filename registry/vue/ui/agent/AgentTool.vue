<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/registry/vue/ui/accordion'
import { cn } from '@/lib/utils'
import { computed } from 'vue'
import { CodeBlock } from '@/registry/vue/ui/code-block'

type AgentToolProps = InstanceType<typeof AccordionItem>['$props']

// Saqara: the part of the `ai` SDK's Tool the component reads, without depending on it.
interface AgentToolDefinition { description?: string, inputSchema?: unknown, jsonSchema?: unknown }

interface Props extends /* @vue-ignore */ AgentToolProps {
  tool: AgentToolDefinition
  value: string
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const schema = computed(() => {
  return 'jsonSchema' in props.tool && props.tool.jsonSchema
    ? props.tool.jsonSchema
    : props.tool.inputSchema
})

const schemaString = computed(() => JSON.stringify(schema.value, null, 2))
</script>

<template>
  <AccordionItem
    :class="cn('border-b last:border-b-0', props.class)"
    :value="props.value"
    v-bind="$attrs"
  >
    <AccordionTrigger class="px-3 py-2 text-sm hover:no-underline">
      {{ props.tool.description ?? "Sans description" }}
    </AccordionTrigger>
    <AccordionContent class="px-3 pb-3">
      <div class="rounded-md bg-muted/50">
        <CodeBlock :code="schemaString" language="json" />
      </div>
    </AccordionContent>
  </AccordionItem>
</template>
