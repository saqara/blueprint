<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { XIcon } from "@lucide/vue"
import { cn } from "@/lib/utils"
import { Button } from "@/registry/vue/ui/button"
import AlertAction from "./AlertAction.vue"

// Saqara: close button of a dismissible alert; @click and other attributes go to the button.
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ label?: string; class?: HTMLAttributes["class"] }>(), { label: "Fermer" })
</script>

<template>
  <AlertAction>
    <Button v-bind="$attrs" type="button" variant="ghost" size="icon-sm" :aria-label="label"
      :class="cn('-mr-2 size-6 text-current opacity-70 hover:opacity-100', props.class)">
      <XIcon />
    </Button>
  </AlertAction>
</template>
