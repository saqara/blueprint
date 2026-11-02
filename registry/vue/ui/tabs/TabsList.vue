<script setup lang="ts">
import type { TabsListProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { TabsList } from "reka-ui"
import { cn } from "@/lib/utils"
import { FluidHighlight } from "@/registry/vue/lib/fluid-hover"

const props = defineProps<TabsListProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")
</script>

<template>
  <TabsList
    data-slot="tabs-list"
    v-bind="delegatedProps"
    :class="cn(
      'relative isolate bg-muted shadow-track text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-0.75',
      props.class,
    )"
  >
    <FluidHighlight mode="pointer" items="[role=tab]" class="rounded-md bg-foreground/5" />
    <FluidHighlight mode="attribute" items="[role=tab]" active="[role=tab][data-state=active]" class="rounded-md bg-background shadow-thumb dark:bg-accent" />
    <slot />
  </TabsList>
</template>
