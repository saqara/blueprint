<script setup lang="ts">
import { ref } from "vue"
import type { AttachmentData } from "@/registry/vue/ui/attachments/types"
import { Attachment, AttachmentEmpty, AttachmentInfo, AttachmentPreview, AttachmentRemove, Attachments } from "@/registry/vue/ui/attachments"

const files = ref<AttachmentData[]>([
  { id: "1", type: "file", mediaType: "text/csv", filename: "fournisseurs-lyon.csv", url: "#" },
  { id: "2", type: "file", mediaType: "application/pdf", filename: "contrat-cadre-2026.pdf", url: "#" },
  { id: "3", type: "source-document", sourceId: "kbis", mediaType: "text/html", title: "Extrait Kbis – Acme SAS" },
])
</script>

<template>
  <div class="w-full max-w-md space-y-6">
    <Attachments variant="inline">
      <Attachment v-for="file in files" :key="file.id" :data="file" @remove="files = files.filter((f) => f.id !== file.id)">
        <AttachmentPreview />
        <AttachmentInfo />
        <AttachmentRemove />
      </Attachment>
    </Attachments>
    <Attachments variant="list">
      <template v-if="files.length">
        <Attachment v-for="file in files" :key="file.id" :data="file">
          <AttachmentPreview />
          <AttachmentInfo show-media-type />
        </Attachment>
      </template>
      <AttachmentEmpty v-else />
    </Attachments>
  </div>
</template>
