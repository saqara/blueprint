<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import type { MultiSelectOption } from "./utils"
import { CheckIcon, ChevronsUpDown, XIcon } from "@lucide/vue"
import { computed, ref } from "vue"
import { cn } from "@/lib/utils"
import { Badge } from "@/registry/vue/ui/badge"
import { Button } from "@/registry/vue/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/registry/vue/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/vue/ui/popover"
import { splitBadges, summarize, toggleValue } from "./utils"

const props = withDefaults(defineProps<{
  options: MultiSelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  clearLabel?: string
  maxBadges?: number
  /** "badges" (default) or "count": a one-line summary ("3 agences"). */
  display?: "badges" | "count"
  countLabel?: (count: number) => string
  /** Adds a first entry that selects / clears everything; also the "count" summary when all are chosen. */
  selectAllLabel?: string
  /** "select-all" (default) checks every option; "clear" means "no filter" and sends []. */
  selectAllBehavior?: "select-all" | "clear"
  /** Spoken after a checked option (aria-selected marks the keyboard highlight, not the check). */
  selectedLabel?: string
  /** Attributes for the trigger: data-testid, id, aria-label (required without a visible label)… */
  triggerProps?: Record<string, unknown>
  getOptionProps?: (option: MultiSelectOption) => Record<string, unknown>
  disabled?: boolean
  class?: HTMLAttributes["class"]
}>(), {
  display: "badges",
  selectAllBehavior: "select-all",
  selectedLabel: "sélectionné",
  countLabel: (n: number) => `${n} sélectionné${n > 1 ? "s" : ""}`,
  placeholder: "Sélectionner…",
  searchPlaceholder: "Rechercher…",
  emptyMessage: "Aucun résultat.",
  clearLabel: "Tout effacer",
  maxBadges: 3,
  disabled: false,
})
const model = defineModel<string[]>({ default: () => [] })
const open = ref(false)
const selected = computed(() => props.options.filter((o) => model.value.includes(o.value)))
const badges = computed(() => splitBadges(selected.value, props.maxBadges))
const toggle = (value: string) => { model.value = toggleValue(model.value, value) }
const reset = computed(() => props.selectAllBehavior === "clear")
const allSelected = computed(() => reset.value ? model.value.length === 0 : props.options.length > 0 && selected.value.length === props.options.length)
const toggleAll = () => { model.value = reset.value || allSelected.value ? [] : props.options.map((o) => o.value) }
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button v-bind="triggerProps" variant="outline" role="combobox" :aria-expanded="open" :disabled="disabled" data-slot="multi-select"
        :class="cn('h-auto min-h-9 w-full justify-between py-1 font-normal', props.class)">
        <span class="flex flex-wrap gap-1">
          <span v-if="selected.length === 0 && reset && selectAllLabel">{{ selectAllLabel }}</span>
          <span v-else-if="selected.length === 0" class="text-muted-foreground">{{ placeholder }}</span>
          <span v-if="display === 'count' && selected.length">{{ summarize(selected.length, options.length, countLabel, selectAllLabel) }}</span>
          <Badge v-for="o in display === 'badges' ? badges.shown : []" :key="o.value" variant="secondary">
            {{ o.label }}
            <XIcon aria-hidden="true" class="size-3 cursor-pointer" @click.stop="toggle(o.value)" />
          </Badge>
          <Badge v-if="display === 'badges' && badges.hidden > 0" variant="outline">+{{ badges.hidden }}</Badge>
        </span>
        <ChevronsUpDown class="opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-(--reka-popover-trigger-width) p-0" align="start">
      <Command>
        <CommandInput :placeholder="searchPlaceholder" />
        <CommandList>
          <CommandEmpty>{{ emptyMessage }}</CommandEmpty>
          <CommandGroup>
            <CommandItem v-if="selectAllLabel" :value="selectAllLabel" @select="toggleAll">
              <CheckIcon :class="allSelected ? 'opacity-100' : 'opacity-0'" />
              {{ selectAllLabel }}
              <span v-if="allSelected" class="sr-only">, {{ selectedLabel }}</span>
            </CommandItem>
            <CommandItem v-for="o in options" :key="o.value" v-bind="getOptionProps?.(o)" :value="o.label" @select="toggle(o.value)">
              <CheckIcon :class="model.includes(o.value) ? 'opacity-100' : 'opacity-0'" />
              {{ o.label }}
              <span v-if="model.includes(o.value)" class="sr-only">, {{ selectedLabel }}</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
        <div v-if="model.length" class="border-t p-1">
          <Button variant="ghost" size="sm" class="w-full" @click="model = []">{{ clearLabel }}</Button>
        </div>
      </Command>
    </PopoverContent>
  </Popover>
</template>
