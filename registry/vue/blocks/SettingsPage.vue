<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed, onBeforeUnmount, ref, useId, watch } from "vue"
import { cn } from "@/lib/utils"
import { Button } from "@/registry/vue/ui/button"

export interface SettingsSection {
  id: string
  label: string
  /** Under the section title. */
  description?: string
}

// Saqara block: presentational settings screen. The app owns the values, compares them to decide `dirty`,
// saves on `onSave` and drives `status`. Each section's fields go in the slot named after its id (#compte…).
// Every section stays mounted (hidden), so switching keeps what was typed.
const props = withDefaults(defineProps<{
  title?: string
  description?: string
  sections: SettingsSection[]
  /** Shown section (v-model:active-section). Default: the first, then the one clicked. */
  activeSection?: string
  /** The form differs from what is saved: the app compares, the block shows the save bar. */
  dirty?: boolean
  status?: "idle" | "saving" | "saved" | "error"
  /** Message when `status` is "error". */
  error?: string
  /** Asks the browser to confirm leaving the page (reload, close, external link) while `dirty`. In-app navigation is the app's router guard. */
  warnOnLeave?: boolean
  saveLabel?: string
  cancelLabel?: string
  onSave?: () => void
  onCancel?: () => void
  class?: HTMLAttributes["class"]
}>(), {
  title: "Paramètres",
  dirty: false,
  status: "idle",
  warnOnLeave: true,
  saveLabel: "Enregistrer",
  cancelLabel: "Annuler",
})
const emit = defineEmits<{ "update:activeSection": [id: string] }>()

const id = useId()
const localActive = ref(props.sections[0]?.id)
const active = computed(() => props.activeSection ?? localActive.value)
const saving = computed(() => props.status === "saving")
const barShown = computed(() => props.dirty || saving.value || props.status === "error")
const message = computed(() =>
  props.status === "saving" ? "Enregistrement…"
  : props.status === "error" ? (props.error ?? "L’enregistrement a échoué. Réessayez.")
  : props.status === "saved" && !props.dirty ? "Modifications enregistrées."
  : props.dirty ? "Modifications non enregistrées."
  : "")

function select(next: string) {
  localActive.value = next
  emit("update:activeSection", next)
}

function submit() {
  if (props.dirty && !saving.value) props.onSave?.()
}

const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault()
watch(() => props.warnOnLeave && props.dirty, (guard) => {
  if (typeof window === "undefined") return
  if (guard) window.addEventListener("beforeunload", onBeforeUnload)
  else window.removeEventListener("beforeunload", onBeforeUnload)
}, { immediate: true })
onBeforeUnmount(() => window.removeEventListener("beforeunload", onBeforeUnload))
</script>

<template>
  <form data-slot="settings-page" :class="cn('flex min-h-full flex-col', props.class)" novalidate @submit.prevent="submit">
    <header class="space-y-1 px-4 pt-6 sm:px-6">
      <h1 class="font-heading text-2xl font-semibold">{{ title }}</h1>
      <p v-if="description" class="text-sm text-muted-foreground">{{ description }}</p>
    </header>
    <div class="flex flex-1 flex-col gap-6 p-4 sm:px-6 md:flex-row md:gap-10">
      <!-- Below md the same list becomes a scrolling row of tabs-like buttons (one DOM). -->
      <nav aria-label="Sections des paramètres" class="shrink-0 md:w-56">
        <ul class="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 md:flex-col md:overflow-visible md:pb-0">
          <li v-for="section in sections" :key="section.id" class="shrink-0">
            <Button
              type="button"
              variant="ghost"
              :aria-current="section.id === active ? 'page' : undefined"
              :aria-controls="`${id}-${section.id}`"
              class="w-full justify-start aria-[current=page]:bg-muted aria-[current=page]:font-semibold"
              @click="select(section.id)"
            >
              {{ section.label }}
            </Button>
          </li>
        </ul>
      </nav>
      <div class="min-w-0 flex-1">
        <section
          v-for="section in sections"
          :id="`${id}-${section.id}`"
          :key="section.id"
          :aria-labelledby="`${id}-${section.id}-title`"
          :hidden="section.id !== active"
          class="max-w-2xl space-y-6"
        >
          <div class="space-y-1">
            <h2 :id="`${id}-${section.id}-title`" class="text-lg font-semibold">{{ section.label }}</h2>
            <p v-if="section.description" class="text-sm text-muted-foreground">{{ section.description }}</p>
          </div>
          <slot :name="section.id" />
        </section>
      </div>
    </div>
    <!-- Always mounted, so screen readers hear each change of state. -->
    <p role="status" class="sr-only">{{ message }}</p>
    <div
      data-slot="settings-save-bar"
      :hidden="!barShown"
      class="sticky bottom-0 z-10 border-t bg-background/95 px-4 py-3 backdrop-blur-sm sm:px-6"
    >
      <div class="flex flex-wrap items-center justify-end gap-3">
        <p aria-hidden="true" :class="cn('basis-full text-sm sm:mr-auto sm:basis-auto', status === 'error' ? 'text-destructive' : 'text-muted-foreground')">{{ message }}</p>
        <Button type="button" variant="outline" :disabled="saving" @click="onCancel?.()">{{ cancelLabel }}</Button>
        <Button type="submit" :loading="saving" :disabled="!dirty">{{ saveLabel }}</Button>
      </div>
    </div>
  </form>
</template>
