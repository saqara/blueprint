<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { ChevronDownIcon } from "@lucide/vue"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/registry/vue/ui/collapsible"

// Saqara: a titled section that folds. The heading holds the toggle button (accordion pattern);
// the `actions` slot sits next to it, so no button is nested in another.
const props = withDefaults(defineProps<{
  title: string
  defaultOpen?: boolean
  headingLevel?: 2 | 3 | 4
  class?: HTMLAttributes["class"]
}>(), { defaultOpen: true, headingLevel: 3 })
const open = defineModel<boolean | undefined>("open", { default: undefined })
const emit = defineEmits<{ openChange: [open: boolean] }>()
</script>

<template>
  <Collapsible
    data-slot="collapsible-section"
    :open="open"
    :default-open="defaultOpen"
    :class="cn('grid gap-2', props.class)"
    @update:open="(value: boolean) => { open = value; emit('openChange', value) }"
  >
    <div class="flex min-h-9 items-center gap-2">
      <component :is="`h${headingLevel}`" class="min-w-0 flex-1 text-sm font-semibold">
        <CollapsibleTrigger class="group flex w-full items-center gap-2 rounded-md text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
          <ChevronDownIcon aria-hidden="true" class="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=closed]:-rotate-90" />
          <span class="truncate">{{ title }}</span>
        </CollapsibleTrigger>
      </component>
      <div v-if="$slots.actions" class="flex shrink-0 items-center gap-1"><slot name="actions" /></div>
    </div>
    <CollapsibleContent><slot /></CollapsibleContent>
  </Collapsible>
</template>
