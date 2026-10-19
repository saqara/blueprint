<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import type { AttachmentData } from "@/registry/vue/ui/attachments/types"
import type { ChatStatus, FileUIPart } from "@/registry/vue/ui/prompt-input/types"
import { CheckIcon, CopyIcon } from "@lucide/vue"
import { computed, ref } from "vue"
import { cn } from "@/lib/utils"
import { Attachment, AttachmentInfo, AttachmentPreview, AttachmentRemove, Attachments } from "@/registry/vue/ui/attachments"
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/registry/vue/ui/conversation"
import { Message, MessageAction, MessageActions, MessageContent, MessageResponse } from "@/registry/vue/ui/message"
import {
  PromptInput, PromptInputActionAddAttachments, PromptInputActionMenu, PromptInputActionMenuContent, PromptInputActionMenuTrigger,
  PromptInputBody, PromptInputFooter, PromptInputHeader, PromptInputSubmit, PromptInputTextarea, PromptInputTools,
} from "@/registry/vue/ui/prompt-input"
import { Shimmer } from "@/registry/vue/ui/shimmer"
import { Suggestion, Suggestions } from "@/registry/vue/ui/suggestion"

export interface AiChatMessage {
  id: string
  role: "user" | "assistant"
  /** Plain text: copied by the copy action, shown when the #content slot is not used. */
  text: string
  attachments?: AttachmentData[]
}

// Saqara block: a complete chat screen (conversation, suggestions, input with attachments). Presentational:
// the app owns the messages, calls its model, and drives `status`. Give it a height (it fills its parent).
// The #content="{ message }" slot renders a message the app's way (its markdown, sanitized), styled by MessageResponse.
const props = withDefaults(defineProps<{
  messages: AiChatMessage[]
  /** "submitted": waiting for the first token (a "Réflexion…" line shows); "streaming": the last message grows. */
  status?: ChatStatus
  /** Questions offered while the conversation is empty. */
  suggestions?: string[]
  emptyTitle?: string
  emptyDescription?: string
  placeholder?: string
  /** Shows the "+" menu to attach files (drop and paste always work, and attached files always show). */
  attachments?: boolean
  accept?: string
  /** Names the conversation log for screen readers. */
  label?: string
  onSubmit: (message: { text: string, files: FileUIPart[] }) => void
  /** Turns the send button into "stop" while generating. */
  onStop?: () => void
  class?: HTMLAttributes["class"]
}>(), {
  status: "ready",
  suggestions: () => [],
  emptyTitle: "Comment puis-je vous aider ?",
  emptyDescription: "Posez une question sur vos données.",
  placeholder: "Posez votre question…",
  attachments: false,
  label: "Conversation avec l’assistant",
})

const busy = computed(() => props.status === "submitted" || props.status === "streaming")
function send(text: string, files: FileUIPart[] = []) {
  if (busy.value || (!text.trim() && !files.length)) return
  props.onSubmit({ text: text.trim(), files })
}

const copied = ref<string>()
function copy(message: AiChatMessage) {
  navigator.clipboard?.writeText(message.text).then(() => {
    copied.value = message.id
    setTimeout(() => (copied.value = undefined), 2000)
  })
}
</script>

<template>
  <div data-slot="ai-chat" :class="cn('flex h-full min-h-0 flex-col', props.class)">
    <Conversation :aria-label="label">
      <ConversationContent class="mx-auto w-full max-w-3xl">
        <ConversationEmptyState v-if="messages.length === 0" :title="emptyTitle" :description="emptyDescription" class="min-h-64" />
        <Message v-for="message in messages" v-else :key="message.id" :from="message.role">
          <Attachments v-if="message.attachments?.length" variant="inline" :class="cn(message.role === 'user' && 'ml-auto')">
            <Attachment v-for="file in message.attachments" :key="file.id" :data="file">
              <AttachmentPreview />
              <AttachmentInfo />
            </Attachment>
          </Attachments>
          <MessageContent>
            <MessageResponse v-if="message.role === 'assistant'">
              <slot name="content" :message="message"><p>{{ message.text }}</p></slot>
            </MessageResponse>
            <template v-else>{{ message.text }}</template>
          </MessageContent>
          <MessageActions v-if="message.role === 'assistant' && message.text">
            <MessageAction :tooltip="copied === message.id ? 'Copié' : 'Copier'" @click="copy(message)">
              <CheckIcon v-if="copied === message.id" />
              <CopyIcon v-else />
            </MessageAction>
          </MessageActions>
        </Message>
        <Message v-if="status === 'submitted'" from="assistant" role="status">
          <Shimmer as="span" class="text-sm">Réflexion…</Shimmer>
        </Message>
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
    <div class="mx-auto w-full max-w-3xl space-y-3 p-4 pt-0">
      <Suggestions v-if="messages.length === 0 && suggestions.length">
        <Suggestion v-for="s in suggestions" :key="s" :suggestion="s" @click="send($event)" />
      </Suggestions>
      <PromptInput v-slot="{ files, removeFile }" :accept="accept" multiple @submit="send($event.text, $event.files)">
        <!-- Dropped or pasted files show even without the menu: nothing is sent unseen. -->
        <PromptInputHeader v-if="files.length">
          <Attachments variant="inline">
            <Attachment v-for="file in files" :key="file.id" :data="file" @remove="removeFile(file.id)">
              <AttachmentPreview />
              <AttachmentInfo />
              <AttachmentRemove />
            </Attachment>
          </Attachments>
        </PromptInputHeader>
        <PromptInputBody>
          <PromptInputTextarea :placeholder="placeholder" />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionMenu v-if="attachments">
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
          </PromptInputTools>
          <PromptInputSubmit v-if="onStop" :status="status" @stop="onStop" />
          <PromptInputSubmit v-else :status="status" :disabled="busy" />
        </PromptInputFooter>
      </PromptInput>
    </div>
  </div>
</template>
