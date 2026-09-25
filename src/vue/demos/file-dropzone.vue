<script setup lang="ts">
import { ref } from "vue"
import { toast } from "vue-sonner"
import { FileDropzone, type FileRejection } from "@/registry/vue/ui/file-dropzone"
import { Toaster } from "@/registry/vue/ui/sonner"

const reasons = { type: "format non accepté", size: "fichier trop lourd (2 Mo max.)", count: "un seul fichier à la fois" }
const files = ref<File[]>([])
const onReject = (rejections: FileRejection[]) =>
  rejections.forEach(({ file, reason }) => toast.error(`${file.name} : ${reasons[reason]}`))
</script>

<template>
  <Toaster />
  <FileDropzone v-model:files="files" class="max-w-md" accept="image/png,image/jpeg,image/webp,image/svg+xml" :max-size="2 * 1024 * 1024"
    label="Déposez votre logo (PNG, JPEG, WebP, SVG — 2 Mo max.)" @reject="onReject" />
</template>
