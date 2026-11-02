<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import type { QuestionOption } from "."
import { CornerDownLeftIcon, XIcon } from "@lucide/vue"
import { computed, getCurrentInstance, nextTick, onMounted, ref, useId, watch } from "vue"
import { cn } from "@/lib/utils"
import { FluidHighlight } from "@/registry/vue/lib/fluid-hover"
import { Button } from "@/registry/vue/ui/button"

const props = withDefaults(defineProps<{
  options: QuestionOption[]
  /** Title above the options. Without it, name the list with `aria-label`. */
  question?: string
  ariaLabel?: string
  /** "Autre réponse…": the link that hands back to the text field (shown when @other is listened to). */
  otherLabel?: string
  closeLabel?: string
  /** Takes the focus when it appears (it replaces the text field). */
  autofocus?: boolean
  disabled?: boolean
  class?: HTMLAttributes["class"]
}>(), { otherLabel: "Autre réponse…", closeLabel: "Fermer", autofocus: true, disabled: false })

const emit = defineEmits<{
  select: [option: QuestionOption]
  other: []
  /** Close button and Escape (shown when listened to). */
  close: []
}>()

// Saqara: the assistant asks the user to pick one answer, in place of the prompt input (like Claude
// Code's AskUserQuestion). Arrows move, Enter or a click picks, 1–9 pick directly, Escape closes.
const id = useId()
const listeners = getCurrentInstance()?.vnode.props ?? {}
const hasOther = !!listeners.onOther
const hasClose = !!listeners.onClose

const list = ref<HTMLUListElement>()
const enabled = computed(() => props.options.map((o, i) => (o.disabled ? -1 : i)).filter(i => i >= 0))
const active = ref(enabled.value[0] ?? -1)
// The options can change (a new question): keep the highlight on an enabled option.
const current = computed(() => (enabled.value.includes(active.value) ? active.value : (enabled.value[0] ?? -1)))

onMounted(() => {
  if (props.autofocus) list.value?.focus({ preventScroll: true })
})
watch(current, async (index) => {
  await nextTick()
  list.value?.querySelector(`[data-index="${index}"]`)?.scrollIntoView?.({ block: "nearest" })
})

function pick(index: number) {
  const option = props.options[index]
  if (!props.disabled && option && !option.disabled) emit("select", option)
}
function move(step: number) {
  const all = enabled.value
  if (!all.length) return
  active.value = all[(all.indexOf(current.value) + step + all.length) % all.length]
}
function onKeydown(event: KeyboardEvent) {
  if (props.disabled) return
  const key = event.key
  if (key === "ArrowDown" || key === "ArrowUp") move(key === "ArrowDown" ? 1 : -1)
  else if (key === "Home" || key === "End") active.value = key === "Home" ? (enabled.value[0] ?? -1) : (enabled.value[enabled.value.length - 1] ?? -1)
  else if (key === "Enter" || key === " ") pick(current.value)
  else if (/^[1-9]$/.test(key) && !event.altKey && !event.ctrlKey && !event.metaKey) pick(Number(key) - 1)
  else return
  event.preventDefault()
}
function onEscape(event: KeyboardEvent) {
  if (!hasClose) return
  event.preventDefault()
  emit("close")
}
</script>

<template>
  <div
    data-slot="question"
    :class="cn('flex flex-col overflow-hidden rounded-xl border bg-background shadow-sm animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ease-spring', disabled && 'opacity-60', props.class)"
    @keydown.esc="onEscape"
  >
    <div v-if="question || hasClose" class="flex items-start gap-2 py-2 pr-2 pl-4">
      <p v-if="question" :id="`${id}-question`" class="flex-1 py-1 text-sm font-medium">{{ question }}</p>
      <Button v-if="hasClose" type="button" variant="ghost" size="icon-sm" class="ml-auto shrink-0" :aria-label="closeLabel" @click="emit('close')">
        <XIcon />
      </Button>
    </div>
    <ul
      ref="list"
      role="listbox"
      :tabindex="disabled ? -1 : 0"
      :aria-labelledby="question ? `${id}-question` : undefined"
      :aria-label="question ? undefined : ariaLabel"
      :aria-activedescendant="current >= 0 ? `${id}-${current}` : undefined"
      :aria-disabled="disabled || undefined"
      class="relative isolate max-h-[min(31rem,60vh)] overflow-y-auto border-t p-1 outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      @keydown="onKeydown"
    >
      <FluidHighlight as="li" mode="attribute" items="[role=option]" active="[role=option][aria-selected=true]" />
      <li
        v-for="(option, index) in options"
        :id="`${id}-${index}`"
        :key="option.value"
        :data-index="index"
        role="option"
        :aria-selected="index === current"
        :aria-disabled="option.disabled || undefined"
        :class="cn(
          'flex cursor-pointer items-center gap-3 rounded-sm px-3 py-2 text-sm',
          index === current && 'text-accent-foreground',
          option.disabled && 'cursor-not-allowed opacity-50',
        )"
        @mouseenter="!option.disabled && (active = index)"
        @mousedown.prevent
        @click="pick(index)"
      >
        <span aria-hidden="true" class="w-4 shrink-0 text-center font-mono text-xs text-muted-foreground">{{ index < 9 ? index + 1 : "" }}</span>
        <span class="flex min-w-0 flex-1 flex-col">
          <span class="truncate font-medium">{{ option.label }}</span>
          <span v-if="option.description" class="truncate text-xs text-muted-foreground">{{ option.description }}</span>
        </span>
        <CornerDownLeftIcon v-if="index === current" aria-hidden="true" class="size-4 shrink-0 text-muted-foreground" />
      </li>
    </ul>
    <div v-if="hasOther" class="border-t px-1 py-1">
      <Button type="button" variant="link" size="sm" class="h-8 px-3 text-muted-foreground" :disabled="disabled" @click="emit('other')">
        {{ otherLabel }}
      </Button>
    </div>
  </div>
</template>
