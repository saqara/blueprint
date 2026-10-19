<script setup lang="ts">
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/registry/vue/ui/conversation"
import { Message, MessageContent, MessageResponse } from "@/registry/vue/ui/message"

const messages = [
  { role: "user", text: "Combien de fournisseurs sont actifs ?" },
  { role: "assistant", text: "1 284 fournisseurs sont actifs, soit 87 % du total." },
  { role: "user", text: "Et parmi eux, combien à Lyon ?" },
  { role: "assistant", text: "412 fournisseurs actifs sont basés à Lyon." },
  { role: "user", text: "Lesquels ont une note inférieure à 3 ?" },
  { role: "assistant", text: "23 fournisseurs lyonnais ont une note moyenne inférieure à 3. Le plus fréquent : délais de livraison." },
] as const
</script>

<template>
  <div class="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
    <div class="flex h-80 flex-col rounded-md border">
      <Conversation aria-label="Conversation avec l’assistant">
        <ConversationContent>
          <Message v-for="(m, i) in messages" :key="i" :from="m.role">
            <MessageContent><MessageResponse><p>{{ m.text }}</p></MessageResponse></MessageContent>
          </Message>
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </div>
    <div class="flex h-80 flex-col rounded-md border">
      <ConversationEmptyState />
    </div>
  </div>
</template>
