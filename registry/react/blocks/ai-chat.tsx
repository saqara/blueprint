"use client"

import * as React from "react"
import { cn } from "cn"
import { CheckIcon, CopyIcon } from "lucide-react"
import { Attachment, AttachmentInfo, AttachmentPreview, AttachmentRemove, Attachments, type AttachmentData } from "@/registry/react/ui/attachments"
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/registry/react/ui/conversation"
import { Message, MessageAction, MessageActions, MessageContent, MessageResponse } from "@/registry/react/ui/message"
import {
  PromptInput, PromptInputActionAddAttachments, PromptInputActionMenu, PromptInputActionMenuContent, PromptInputActionMenuTrigger,
  PromptInputBody, PromptInputFooter, PromptInputHeader, PromptInputSubmit, PromptInputTextarea, PromptInputTools, usePromptInputAttachments,
  type ChatStatus, type FileUIPart,
} from "@/registry/react/ui/prompt-input"
import { Shimmer } from "@/registry/react/ui/shimmer"
import { Suggestion, Suggestions } from "@/registry/react/ui/suggestion"

export type AiChatMessage = {
  id: string
  role: "user" | "assistant"
  /** Plain text: copied by the copy action, shown when `renderContent` is not given. */
  text: string
  attachments?: AttachmentData[]
}

type AiChatProps = {
  messages: AiChatMessage[]
  /** "submitted": waiting for the first token (a "Réflexion…" line shows); "streaming": the last message grows. */
  status?: ChatStatus
  /** The app's rendering of a message (its markdown, sanitized), styled by MessageResponse. Default: the text. */
  renderContent?: (message: AiChatMessage) => React.ReactNode
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
  onSubmit: (message: { text: string; files: FileUIPart[] }) => void
  /** Turns the send button into "stop" while generating. */
  onStop?: () => void
  className?: string
}

function AttachedFiles() {
  const attachments = usePromptInputAttachments()
  if (!attachments.files.length) return null
  return (
    <PromptInputHeader>
      <Attachments variant="inline">
        {attachments.files.map((file) => (
          <Attachment key={file.id} data={file} onRemove={() => attachments.remove(file.id)}>
            <AttachmentPreview />
            <AttachmentInfo />
            <AttachmentRemove />
          </Attachment>
        ))}
      </Attachments>
    </PromptInputHeader>
  )
}

function CopyAction({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <MessageAction
      tooltip={copied ? "Copié" : "Copier"}
      onClick={() => navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </MessageAction>
  )
}

// Saqara block: a complete chat screen (conversation, suggestions, input with attachments). Presentational:
// the app owns the messages, calls its model, and drives `status`. Give it a height (it fills its parent).
function AiChat({
  messages, status = "ready", renderContent, suggestions = [], emptyTitle = "Comment puis-je vous aider ?",
  emptyDescription = "Posez une question sur vos données.", placeholder, attachments = false, accept, label = "Conversation avec l’assistant",
  onSubmit, onStop, className,
}: AiChatProps) {
  const busy = status === "submitted" || status === "streaming"
  const send = (text: string, files: FileUIPart[] = []) => {
    if (busy || (!text.trim() && !files.length)) return
    onSubmit({ text: text.trim(), files })
  }

  return (
    <div data-slot="ai-chat" className={cn("flex h-full min-h-0 flex-col", className)}>
      <Conversation aria-label={label}>
        <ConversationContent className="mx-auto w-full max-w-3xl">
          {messages.length === 0 ? (
            <ConversationEmptyState title={emptyTitle} description={emptyDescription} className="min-h-64" />
          ) : (
            messages.map((message) => (
              <Message key={message.id} from={message.role}>
                {!!message.attachments?.length && (
                  <Attachments variant="inline" className={cn(message.role === "user" && "ml-auto")}>
                    {message.attachments.map((file) => (
                      <Attachment key={file.id} data={file}><AttachmentPreview /><AttachmentInfo /></Attachment>
                    ))}
                  </Attachments>
                )}
                <MessageContent>
                  {message.role === "assistant" ? <MessageResponse>{renderContent ? renderContent(message) : <p>{message.text}</p>}</MessageResponse> : message.text}
                </MessageContent>
                {message.role === "assistant" && message.text && (
                  <MessageActions><CopyAction text={message.text} /></MessageActions>
                )}
              </Message>
            ))
          )}
          {status === "submitted" && (
            <Message from="assistant" role="status"><Shimmer as="span" className="text-sm">Réflexion…</Shimmer></Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="mx-auto w-full max-w-3xl space-y-3 p-4 pt-0">
        {messages.length === 0 && suggestions.length > 0 && (
          <Suggestions>
            {suggestions.map((s) => <Suggestion key={s} suggestion={s} onClick={(text) => send(text)} />)}
          </Suggestions>
        )}
        <PromptInput accept={accept} multiple onSubmit={({ text, files }) => send(text, files)}>
          {/* Dropped or pasted files show even without the menu: nothing is sent unseen. */}
          <AttachedFiles />
          <PromptInputBody>
            <PromptInputTextarea placeholder={placeholder} />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              {attachments && (
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
              )}
            </PromptInputTools>
            <PromptInputSubmit status={status} onStop={onStop} disabled={busy && !onStop} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  )
}

export { AiChat }
