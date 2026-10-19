<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { CheckIcon, CircleAlertIcon, CircleCheckIcon } from "@lucide/vue"
import { computed, nextTick, ref, useId, useSlots, watch } from "vue"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/registry/vue/ui/alert"
import { Button } from "@/registry/vue/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/registry/vue/ui/card"
import { Spinner } from "@/registry/vue/ui/spinner"
import { Stepper, StepperDescription, StepperIndicator, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from "@/registry/vue/ui/stepper"

export interface WizardStep {
  title: string
  description?: string
}

// Saqara block: presentational multi-step form. The app owns the fields and their values; the block runs the
// steps (1-based), asks `validate` before going forward, and says what to fix.
// Each step's content goes in the #step-1, #step-2… slots; a #review slot adds a last step to re-read the
// answers; #done replaces the form once `status` is "done".
const props = withDefaults(defineProps<{
  title?: string
  description?: string
  steps: WizardStep[]
  /** Checks a step before moving forward (Suivant, a later step in the stepper, or the final submit).
   *  Return the messages to fix (shown in a summary that takes the focus); nothing or [] lets the user through. */
  validate?: (step: number) => string[] | undefined | void
  reviewTitle?: string
  reviewDescription?: string
  /** "submitting" locks the controls and spins the submit button; "done" replaces the form with #done. */
  status?: "idle" | "submitting" | "done"
  submitLabel?: string
  /** False keeps the final button disabled (e.g. terms not accepted yet). */
  canSubmit?: boolean
  onSubmit?: () => void
  onStepChange?: (step: number) => void
  doneTitle?: string
  class?: HTMLAttributes["class"]
}>(), {
  reviewTitle: "Récapitulatif",
  reviewDescription: "Vérifiez avant d’envoyer",
  status: "idle",
  submitLabel: "Envoyer",
  canSubmit: true,
  doneTitle: "C’est envoyé",
})

const slots = useSlots()
const id = useId()
const all = computed<WizardStep[]>(() => slots.review ? [...props.steps, { title: props.reviewTitle, description: props.reviewDescription }] : props.steps)
const step = ref(1)
const errors = ref<string[]>([])
const heading = ref<HTMLElement>()
const summary = ref<InstanceType<typeof Alert>>()
const doneHeading = ref<HTMLElement>()
const submitting = computed(() => props.status === "submitting")
const last = computed(() => step.value === all.value.length)

// Focus follows the user's action only (not the first render): the new step's heading, or the summary.
async function focus(target: "heading" | "summary") {
  await nextTick()
  const el = target === "heading" ? heading.value : (summary.value?.$el as HTMLElement | undefined)
  el?.focus()
}

// Once sent, the confirmation takes the focus (it replaces the button the user just pressed).
watch(() => props.status, async (status) => {
  if (status !== "done") return
  await nextTick()
  doneHeading.value?.focus()
}, { immediate: true })

// Forward moves check every step on the way (a later step in the stepper skips none).
function check(from: number, to: number) {
  for (let s = from; s < to; s++) {
    const found = (s <= props.steps.length && props.validate?.(s)) || []
    if (found.length) {
      if (s !== step.value) props.onStepChange?.(s)
      step.value = s
      errors.value = found
      focus("summary")
      return false
    }
  }
  return true
}
function goTo(next: number | undefined) {
  if (next === undefined || next === step.value || submitting.value || (next > step.value && !check(step.value, next))) return
  errors.value = []
  step.value = next
  focus("heading")
  props.onStepChange?.(next)
}
function submit() {
  if (check(1, all.value.length + 1)) props.onSubmit?.()
}
</script>

<template>
  <Card v-if="status === 'done'" data-slot="wizard" :class="cn('w-full max-w-2xl', props.class)">
    <CardHeader class="items-center text-center">
      <CircleCheckIcon aria-hidden="true" class="mx-auto size-10 text-success" />
      <!-- The page has one heading: the card title is an h1, each step's title an h2 (CardTitle is a div). -->
      <h1 ref="doneHeading" tabindex="-1" class="font-heading text-xl leading-none font-semibold outline-none">{{ doneTitle }}</h1>
    </CardHeader>
    <CardContent v-if="slots.done" class="text-center text-sm text-muted-foreground">
      <slot name="done" />
    </CardContent>
  </Card>

  <Card v-else data-slot="wizard" :class="cn('w-full max-w-2xl', props.class)">
    <CardHeader v-if="title || description">
      <h1 v-if="title" class="font-heading text-xl leading-none font-semibold">{{ title }}</h1>
      <CardDescription v-if="description">{{ description }}</CardDescription>
    </CardHeader>
    <CardContent class="space-y-6">
      <Stepper :model-value="step" class="w-full items-start" aria-label="Étapes" @update:model-value="goTo">
        <StepperItem v-for="(s, i) in all" :key="i" :step="i + 1" :disabled="submitting" class="relative flex-1 flex-col">
          <StepperTrigger>
            <StepperIndicator>
              <CheckIcon v-if="i + 1 < step" class="size-4" aria-hidden="true" />
              <template v-else>{{ i + 1 }}</template>
            </StepperIndicator>
            <StepperTitle class="max-sm:sr-only">{{ s.title }}</StepperTitle>
            <StepperDescription v-if="s.description" class="max-sm:hidden">{{ s.description }}</StepperDescription>
          </StepperTrigger>
          <StepperSeparator v-if="i + 1 < all.length" class="absolute top-5 right-[calc(-50%+20px)] left-[calc(50%+30px)] h-0.5" />
        </StepperItem>
      </Stepper>

      <section :aria-labelledby="`${id}-step`" class="space-y-4">
        <div>
          <p class="text-xs text-muted-foreground">Étape {{ step }} sur {{ all.length }}</p>
          <h2 :id="`${id}-step`" ref="heading" tabindex="-1" class="text-lg font-semibold outline-none">{{ all[step - 1]?.title }}</h2>
        </div>
        <Alert v-if="errors.length" ref="summary" variant="destructive" tabindex="-1" data-slot="wizard-errors" class="outline-none focus-visible:ring-[3px] focus-visible:ring-destructive/30">
          <CircleAlertIcon />
          <AlertTitle>{{ errors.length > 1 ? `${errors.length} points à corriger` : "Un point à corriger" }}</AlertTitle>
          <AlertDescription>
            <ul class="list-disc pl-4">
              <li v-for="e in errors" :key="e">{{ e }}</li>
            </ul>
          </AlertDescription>
        </Alert>
        <!-- Keyed on the step: a dynamic slot name alone does not swap the content of compiled (stable) slots. -->
        <div :key="step">
          <slot v-if="step > steps.length" name="review" />
          <slot v-else :name="`step-${step}`" />
        </div>
      </section>
    </CardContent>
    <CardFooter class="justify-between gap-2">
      <Button variant="outline" :disabled="step === 1 || submitting" @click="goTo(step - 1)">Précédent</Button>
      <Button v-if="last" :disabled="!canSubmit || submitting" @click="submit">
        <Spinner v-if="submitting" aria-hidden="true" />{{ submitting ? "Envoi…" : submitLabel }}
      </Button>
      <Button v-else @click="goTo(step + 1)">Suivant</Button>
    </CardFooter>
  </Card>
</template>
