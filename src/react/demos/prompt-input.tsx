import { useState } from "react"
import {
  PromptInput, PromptInputActionAddAttachments, PromptInputActionMenu, PromptInputActionMenuContent, PromptInputActionMenuTrigger,
  PromptInputBody, PromptInputFooter, PromptInputSubmit, PromptInputTextarea, PromptInputTools, type ChatStatus,
} from "@/registry/react/ui/prompt-input"

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
