<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { CollapsibleContent } from "@/registry/vue/ui/collapsible"
import { MessageResponse } from "@/registry/vue/ui/message"
import { cn } from "@/lib/utils"

const props = defineProps<{ class?: HTMLAttributes["class"] }>()
</script>

<template>
  <CollapsibleContent
    :class="cn(
      'mt-4 text-sm',
      'data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2',
      'data-[state=open]:slide-in-from-top-2 text-muted-foreground',
      'outline-none data-[state=closed]:animate-out data-[state=open]:animate-in motion-reduce:animate-none',
      props.class,
    )"
  >
    <!-- Saqara: no markdown engine; the app passes its rendered (sanitized) HTML, styled like a message. -->
    <MessageResponse>
      <slot />
    </MessageResponse>
  </CollapsibleContent>
</template>
