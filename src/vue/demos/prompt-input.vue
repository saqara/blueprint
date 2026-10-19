<script setup lang="ts">
import { ref } from "vue"
import type { ChatStatus } from "@/registry/vue/ui/prompt-input/types"
import {
  PromptInput, PromptInputActionAddAttachments, PromptInputActionMenu, PromptInputActionMenuContent, PromptInputActionMenuTrigger,
  PromptInputBody, PromptInputFooter, PromptInputSubmit, PromptInputTextarea, PromptInputTools,
} from "@/registry/vue/ui/prompt-input"

const status = ref<ChatStatus>("ready")
const last = ref("")

function send({ text }: { text: string }) {
  if (!text.trim()) return
  last.value = text
  status.value = "streaming"
  setTimeout(() => (status.value = "ready"), 2000)
}
</script>

<template>
  <div class="w-full max-w-2xl space-y-2">
    <PromptInput @submit="send">
      <PromptInputBody>
        <PromptInputTextarea />
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputTools>
          <PromptInputActionMenu>
            <PromptInputActionMenuTrigger />
            <PromptInputActionMenuContent>
              <PromptInputActionAddAttachments />
            </PromptInputActionMenuContent>
          </PromptInputActionMenu>
        </PromptInputTools>
        <PromptInputSubmit :status="status" @stop="status = 'ready'" />
      </PromptInputFooter>
    </PromptInput>
    <p class="text-sm text-muted-foreground">{{ last ? `Envoyé : ${last}` : "Entrée envoie, Maj + Entrée passe à la ligne." }}</p>
  </div>
</template>
