<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import type { AutocompleteOption } from "./utils"
import { computed, ref, useId } from "vue"
import { cn } from "@/lib/utils"
import { Input } from "@/registry/vue/ui/input"
import { Spinner } from "@/registry/vue/ui/spinner"

// Saqara: a normal Input with a suggestion list (address search…). Focus never leaves the field;
// the app owns fetching, debouncing and what a selection does (@select). Attributes go to the input.
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  /** Suggestions for the current text: the app fetches them (async) and passes them back. */
  suggestions: AutocompleteOption[]
  loading?: boolean
  loadingMessage?: string
  /** Shown when a search returns nothing. None by default. */
  emptyMessage?: string
  inputClass?: HTMLAttributes["class"]
  /** Minimum length before the list (or its messages) shows. */
  minChars?: number
  onSelect?: (option: AutocompleteOption) => void
  class?: HTMLAttributes["class"]
}>(), { loading: false, loadingMessage: "Recherche…", minChars: 1 })
/** v-model:value — the typed text. */
const value = defineModel<string>("value", { default: "" })
/** #icon: leading icon inside the field (search, map pin…). */
const slots = defineSlots<{ suggestion?: (props: { option: AutocompleteOption }) => unknown, icon?: () => unknown }>()

const listId = useId()
const open = ref(false)
const active = ref(0)
const enough = computed(() => value.value.trim().length >= props.minChars)
// The previous suggestions stay visible while the next search runs (spinner in the field).
const showList = computed(() => open.value && enough.value && props.suggestions.length > 0)
const status = computed(() => open.value && enough.value && props.suggestions.length === 0 ? (props.loading ? props.loadingMessage : props.emptyMessage) ?? "" : "")

function pick(option: AutocompleteOption) {
  props.onSelect?.(option)
  open.value = false
  active.value = 0
}
function onInput(event: Event) {
  value.value = (event.target as HTMLInputElement).value
  open.value = true
  active.value = 0
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowDown" && props.suggestions.length) {
    event.preventDefault()
    if (!open.value) open.value = true
    else active.value = Math.min(active.value + 1, props.suggestions.length - 1)
  } else if (event.key === "ArrowUp" && props.suggestions.length) {
    event.preventDefault()
    active.value = Math.max(active.value - 1, 0)
  } else if (event.key === "Enter" && showList.value) {
    event.preventDefault()
    pick(props.suggestions[active.value]!)
  } else if (event.key === "Escape") {
    open.value = false
  }
}
</script>

<template>
  <div data-slot="autocomplete" :class="cn('relative', props.class)">
    <Input
      v-bind="$attrs"
      role="combobox"
      :aria-expanded="showList"
      :aria-controls="listId"
      aria-autocomplete="list"
      :aria-activedescendant="showList ? `${listId}-${active}` : undefined"
      autocomplete="off"
      :model-value="value"
      :class="cn(slots.icon && 'pl-9', loading && 'pr-8', inputClass)"
      @input="onInput"
      @keydown="onKeydown"
      @focus="open = true"
      @blur="open = false"
    />
    <span v-if="$slots.icon" aria-hidden="true" class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground [&>svg]:size-4"><slot name="icon" /></span>
    <Spinner v-if="loading" aria-hidden="true" role="presentation" class="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground" />
    <ul v-if="showList" :id="listId" role="listbox" class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
      <li v-for="(option, i) in suggestions" :id="`${listId}-${i}`" :key="option.value" role="option" :aria-selected="i === active"
        :class="cn('cursor-pointer rounded-sm px-2 py-1.5 text-sm', i === active && 'bg-accent text-accent-foreground')"
        @mousedown.prevent="pick(option)" @mouseenter="active = i">
        <slot name="suggestion" :option="option">
          <span class="block">{{ option.label }}</span>
          <span v-if="option.description" class="block text-xs text-muted-foreground">{{ option.description }}</span>
        </slot>
      </li>
    </ul>
    <div v-if="status" role="status" class="absolute z-50 mt-1 w-full rounded-md border bg-popover px-3 py-2 text-sm text-muted-foreground shadow-md">
      {{ status }}
    </div>
  </div>
</template>
