<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import type { FileRejection } from "./utils"
import { UploadIcon, XIcon } from "@lucide/vue"
import { ref } from "vue"
import { cn } from "@/lib/utils"
import { Button } from "@/registry/vue/ui/button"
import { limitFiles, partitionFiles } from "./utils"

// Saqara: selection + validation only; the app uploads and shows its own progress.
const props = withDefaults(defineProps<{
  accept?: string
  maxSize?: number
  multiple?: boolean
  disabled?: boolean
  label?: string
  removeLabel?: string
  class?: HTMLAttributes["class"]
}>(), {
  multiple: false,
  disabled: false,
  label: "Glissez un fichier ici ou cliquez pour parcourir",
  removeLabel: "Retirer",
})
const files = defineModel<File[]>("files", { default: () => [] })
const emit = defineEmits<{ reject: [rejections: FileRejection[]] }>()
const input = ref<HTMLInputElement>()
const dragging = ref(false)

function add(list: FileList | null | undefined) {
  if (!list || props.disabled) return
  const { accepted, rejected } = partitionFiles([...list], { accept: props.accept, maxSize: props.maxSize })
  const { kept, rejected: extra } = limitFiles(accepted, props.multiple)
  if (rejected.length || extra.length) emit("reject", [...rejected, ...extra])
  if (kept.length) files.value = props.multiple ? [...files.value, ...kept] : kept
}
function onChange(event: Event) {
  const target = event.target as HTMLInputElement
  add(target.files)
  target.value = ""
}
function onDrop(event: DragEvent) {
  dragging.value = false
  add(event.dataTransfer?.files)
}
</script>

<template>
  <div data-slot="file-dropzone" :class="cn('grid gap-2', props.class)">
    <button
      type="button"
      :disabled="disabled"
      :data-dragging="dragging ? '' : undefined"
      class="flex min-h-28 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-input p-6 text-sm text-muted-foreground transition-colors outline-none hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[dragging]:border-primary data-[dragging]:bg-accent"
      @click="input?.click()"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="onDrop"
    >
      <UploadIcon class="size-5" />
      {{ label }}
    </button>
    <input ref="input" type="file" hidden :accept="accept" :multiple="multiple" :disabled="disabled" @change="onChange">
    <ul v-if="files.length" class="grid gap-1 text-sm">
      <li v-for="(file, i) in files" :key="`${file.name}-${i}`" class="flex items-center justify-between gap-2 rounded-md border px-3 py-1.5">
        <span class="truncate">{{ file.name }}</span>
        <Button type="button" variant="ghost" size="icon" class="size-7" :aria-label="`${removeLabel} ${file.name}`" @click="files = files.filter((_, j) => j !== i)">
          <XIcon />
        </Button>
      </li>
    </ul>
  </div>
</template>
