<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { XIcon } from "@lucide/vue"
import { computed, ref, useId } from "vue"
import { cn } from "@/lib/utils"
import { Badge } from "@/registry/vue/ui/badge"
import { addTags, filterSuggestions } from "./utils"

// Saqara: free entry (e-mails, SIRET…) or a catalogue with suggestions (tags); replaces MultiInput / TagCombobox.
// Extra attributes (aria-label, name…) belong to the input, not the wrapper.
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  suggestions?: string[]
  allowCreate?: boolean
  maxTags?: number
  placeholder?: string
  removeLabel?: string
  disabled?: boolean
  id?: string
  class?: HTMLAttributes["class"]
}>(), { allowCreate: true, placeholder: "Ajouter…", removeLabel: "Retirer", disabled: false })
const model = defineModel<string[]>({ default: () => [] })

const input = ref<HTMLInputElement>()
const listId = useId()
const query = ref("")
const open = ref(false)
const active = ref(0)
const options = computed(() => (props.suggestions ? filterSuggestions(props.suggestions, query.value, model.value) : []))
const full = computed(() => props.maxTags !== undefined && model.value.length >= props.maxTags)
const showList = computed(() => open.value && options.value.length > 0 && !full.value)

function commit(raws: string[]) {
  const next = addTags(model.value, raws, { suggestions: props.suggestions, allowCreate: props.allowCreate, maxTags: props.maxTags })
  if (next !== model.value) model.value = next
  query.value = ""
  active.value = 0
}
function onInput(event: Event) {
  // Typed or pasted commas split entries; the text after the last comma stays in the field.
  const parts = (event.target as HTMLInputElement).value.split(",")
  if (parts.length > 1) commit(parts.slice(0, -1))
  query.value = parts[parts.length - 1] ?? ""
  open.value = true
  active.value = 0
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === "Enter") {
    event.preventDefault()
    if (showList.value && (query.value.trim() || !props.allowCreate)) commit([options.value[active.value]!])
    else if (query.value.trim()) commit([query.value])
  } else if (event.key === "Backspace" && !query.value && model.value.length) {
    model.value = model.value.slice(0, -1)
  } else if (event.key === "ArrowDown" && options.value.length) {
    event.preventDefault()
    open.value = true
    active.value = Math.min(active.value + 1, options.value.length - 1)
  } else if (event.key === "ArrowUp" && options.value.length) {
    event.preventDefault()
    active.value = Math.max(active.value - 1, 0)
  } else if (event.key === "Escape") {
    open.value = false
  }
}
function onBlur() {
  open.value = false
  if (query.value.trim() && props.allowCreate) commit([query.value])
}
const remove = (tag: string) => { model.value = model.value.filter((t) => t !== tag) }
</script>

<template>
  <div data-slot="tag-input" :class="cn('relative', props.class)">
    <div
      class="flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 dark:bg-input/30"
      @click="input?.focus()"
    >
      <Badge v-for="tag in model" :key="tag" variant="secondary" class="gap-1 pr-1">
        {{ tag }}
        <button type="button" :aria-label="`${removeLabel} ${tag}`" :disabled="disabled"
          class="rounded-sm opacity-70 outline-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring" @click="remove(tag)">
          <XIcon class="size-3" />
        </button>
      </Badge>
      <input
        v-bind="$attrs"
        :id="id"
        ref="input"
        role="combobox"
        :aria-expanded="showList"
        :aria-controls="listId"
        aria-autocomplete="list"
        :aria-activedescendant="showList ? `${listId}-${active}` : undefined"
        :value="query"
        :disabled="disabled || full"
        :placeholder="model.length ? undefined : placeholder"
        class="min-w-24 flex-1 bg-transparent py-0.5 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        @input="onInput"
        @keydown="onKeydown"
        @focus="open = true"
        @blur="onBlur"
      >
    </div>
    <ul v-if="showList" :id="listId" role="listbox" class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
      <li v-for="(option, i) in options" :id="`${listId}-${i}`" :key="option" role="option" :aria-selected="i === active"
        :class="cn('cursor-pointer rounded-sm px-2 py-1.5 text-sm', i === active && 'bg-accent text-accent-foreground')"
        @mousedown.prevent="commit([option])" @mouseenter="active = i">
        {{ option }}
      </li>
    </ul>
  </div>
</template>
