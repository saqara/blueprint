<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { EyeIcon, EyeOffIcon } from "@lucide/vue"
import { ref } from "vue"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/registry/vue/ui/input-group"

// Saqara: password or secret (API key…) with a reveal toggle; attributes and v-model go to the input.
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  showLabel?: string
  hideLabel?: string
  disabled?: boolean
  class?: HTMLAttributes["class"]
}>(), { showLabel: "Afficher le mot de passe", hideLabel: "Masquer le mot de passe" })
const model = defineModel<string>()
const visible = ref(false)
</script>

<template>
  <InputGroup :class="props.class">
    <InputGroupInput v-bind="$attrs" v-model="model" :type="visible ? 'text' : 'password'" autocomplete="current-password" :disabled="disabled" />
    <InputGroupAddon align="inline-end">
      <InputGroupButton size="icon-xs" :aria-label="visible ? hideLabel : showLabel" :aria-pressed="visible" :disabled="disabled" @click="visible = !visible">
        <EyeOffIcon v-if="visible" />
        <EyeIcon v-else />
      </InputGroupButton>
    </InputGroupAddon>
  </InputGroup>
</template>
