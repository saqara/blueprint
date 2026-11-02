<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import type { QuestionnaireStep } from "."
import type { QuestionOption } from "@/registry/vue/ui/question"
import { ChevronLeftIcon, XIcon } from "@lucide/vue"
import { computed, getCurrentInstance, ref } from "vue"
import { cn } from "@/lib/utils"
import { Button } from "@/registry/vue/ui/button"
import { Question } from "@/registry/vue/ui/question"

const props = withDefaults(defineProps<{
  steps: QuestionnaireStep[]
  backLabel?: string
  closeLabel?: string
  /** Takes the focus when it appears. */
  autofocus?: boolean
  class?: HTMLAttributes["class"]
}>(), { backLabel: "Question précédente", closeLabel: "Fermer", autofocus: true })

const emit = defineEmits<{
  /** Every answer, by step id, once the last question is answered. */
  complete: [answers: Record<string, QuestionOption>]
  /** Close button and Escape (shown when listened to). */
  close: []
}>()

// Saqara: several questions, one at a time (a plan-mode interview, an assessment). Each answer moves
// to the next question, which slides in; the back button returns to the previous one.
const hasClose = !!getCurrentInstance()?.vnode.props?.onClose
const step = ref(0)
const answers = ref<Record<string, QuestionOption>>({})
// Later steps take the focus: the user is already in the questionnaire.
const moved = ref(false)
const current = computed(() => props.steps[step.value])

function answer(option: QuestionOption) {
  const s = current.value
  if (!s) return
  answers.value = { ...answers.value, [s.id]: option }
  moved.value = true
  if (step.value === props.steps.length - 1) emit("complete", answers.value)
  else step.value++
}
function back() {
  moved.value = true
  step.value--
}
function onEscape(event: KeyboardEvent) {
  if (!hasClose) return
  event.preventDefault()
  emit("close")
}
</script>

<template>
  <div
    v-if="current"
    data-slot="questionnaire"
    :class="cn('flex flex-col overflow-hidden rounded-xl border bg-background shadow-sm animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ease-spring', props.class)"
    @keydown.esc="onEscape"
  >
    <div class="flex items-center gap-2 py-2 pr-2 pl-2">
      <Button type="button" variant="ghost" size="icon-sm" :aria-label="backLabel" :disabled="step === 0" @click="back">
        <ChevronLeftIcon />
      </Button>
      <span class="text-xs text-muted-foreground tabular-nums" aria-live="polite">Question {{ step + 1 }} sur {{ steps.length }}</span>
      <span aria-hidden="true" class="ml-auto flex gap-1">
        <span
          v-for="(s, i) in steps"
          :key="s.id"
          :class="cn('h-1 w-5 rounded-full bg-muted transition-colors duration-240 ease-tail', i < step && 'bg-primary', i === step && 'bg-foreground/40')"
        />
      </span>
      <Button v-if="hasClose" type="button" variant="ghost" size="icon-sm" :aria-label="closeLabel" @click="emit('close')">
        <XIcon />
      </Button>
    </div>
    <Question
      :key="current.id"
      class="rounded-none border-0 border-t shadow-none"
      :question="current.question"
      :options="current.options"
      :autofocus="autofocus || moved"
      @select="answer"
    />
  </div>
</template>
