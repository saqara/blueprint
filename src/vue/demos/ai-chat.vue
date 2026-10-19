<script setup lang="ts">
import { ref } from "vue"
import type { AiChatMessage } from "@/registry/vue/blocks/AiChat.vue"
import type { ChatStatus, FileUIPart } from "@/registry/vue/ui/prompt-input/types"
import AiChat from "@/registry/vue/blocks/AiChat.vue"

const answer = "Sur les 1 284 fournisseurs actifs, 412 sont basés à Lyon, 389 à Paris et 201 à Lille. Les trois villes concentrent 78 % des fournisseurs."
const messages = ref<AiChatMessage[]>([])
const status = ref<ChatStatus>("ready")
let timer: ReturnType<typeof setInterval> | undefined

function stop() {
  clearInterval(timer)
  status.value = "ready"
}

// A fake assistant: waits, then "streams" its answer word by word. The app would call its model here.
function submit({ text, files }: { text: string, files: FileUIPart[] }) {
  const id = String(Date.now())
  messages.value.push({ id, role: "user", text, attachments: files.map((f, i) => ({ ...f, id: `${id}-${i}` })) })
  status.value = "submitted"
  setTimeout(() => {
    const words = answer.split(" ")
    const reply: AiChatMessage = { id: `${id}-a`, role: "assistant", text: "" }
    messages.value.push(reply)
    status.value = "streaming"
    let n = 0
    timer = setInterval(() => {
      n++
      messages.value = messages.value.map((m) => (m.id === reply.id ? { ...m, text: words.slice(0, n).join(" ") } : m))
      if (n >= words.length) stop()
    }, 60)
  }, 900)
}
</script>

<template>
  <div class="h-[560px] bg-background">
    <AiChat :messages="messages" :status="status" attachments :on-submit="submit" :on-stop="stop"
      :suggestions="['Où sont nos fournisseurs actifs ?', 'Fournisseurs inactifs depuis 6 mois', 'Notes moyennes par catégorie']" />
  </div>
</template>
