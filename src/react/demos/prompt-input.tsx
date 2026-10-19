import { useState } from "react"
import { Attachment, AttachmentInfo, AttachmentPreview, AttachmentRemove, Attachments } from "@/registry/react/ui/attachments"
import {
  PromptInput, PromptInputActionAddAttachments, PromptInputActionMenu, PromptInputActionMenuContent, PromptInputActionMenuTrigger,
  PromptInputBody, PromptInputFooter, PromptInputHeader, PromptInputSubmit, PromptInputTextarea, PromptInputTools, usePromptInputAttachments, type ChatStatus,
} from "@/registry/react/ui/prompt-input"

// The files attached so far (menu, drag and drop, paste), each with a remove button.
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

export default function PromptInputDemo() {
  const [status, setStatus] = useState<ChatStatus>("ready")
  const [last, setLast] = useState("")
  return (
    <div className="w-full max-w-2xl space-y-2">
      <PromptInput
        onSubmit={({ text }) => {
          if (!text.trim()) return
          setLast(text)
          setStatus("streaming")
          setTimeout(() => setStatus("ready"), 2000)
        }}
      >
        <AttachedFiles />
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
          <PromptInputSubmit status={status} onStop={() => setStatus("ready")} />
        </PromptInputFooter>
      </PromptInput>
      <p className="text-sm text-muted-foreground">{last ? `Envoyé : ${last}` : "Entrée envoie, Maj + Entrée passe à la ligne."}</p>
    </div>
  )
}
