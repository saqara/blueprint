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
import { splitBadges, toggleValue } from "./utils"

const props = withDefaults(defineProps<{
  options: MultiSelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  clearLabel?: string
  maxBadges?: number
  disabled?: boolean
  class?: HTMLAttributes["class"]
}>(), {
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
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button variant="outline" role="combobox" :aria-expanded="open" :disabled="disabled" data-slot="multi-select"
        :class="cn('h-auto min-h-9 w-full justify-between font-normal', props.class)">
        <span class="flex flex-wrap gap-1">
          <span v-if="selected.length === 0" class="text-muted-foreground">{{ placeholder }}</span>
          <Badge v-for="o in badges.shown" :key="o.value" variant="secondary">
            {{ o.label }}
            <XIcon aria-hidden="true" class="size-3 cursor-pointer" @click.stop="toggle(o.value)" />
          </Badge>
          <Badge v-if="badges.hidden > 0" variant="outline">+{{ badges.hidden }}</Badge>
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
            <CommandItem v-for="o in options" :key="o.value" :value="o.label" @select="toggle(o.value)">
              <CheckIcon :class="model.includes(o.value) ? 'opacity-100' : 'opacity-0'" />
              {{ o.label }}
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
