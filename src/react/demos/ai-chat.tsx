import { useRef, useState } from "react"
import { AiChat, type AiChatMessage } from "@/registry/react/blocks/ai-chat"
import type { ChatStatus } from "@/registry/react/ui/prompt-input"

const answer = "Sur les 1 284 fournisseurs actifs, 412 sont basés à Lyon, 389 à Paris et 201 à Lille. Les trois villes concentrent 78 % des fournisseurs."

// A fake assistant: waits, then "streams" its answer word by word. The app would call its model here.
export default function AiChatDemo() {
  const [messages, setMessages] = useState<AiChatMessage[]>([])
  const [status, setStatus] = useState<ChatStatus>("ready")
  const timer = useRef<ReturnType<typeof setInterval>>(undefined)

  const stop = () => { clearInterval(timer.current); setStatus("ready") }
  const submit = ({ text, files }: { text: string; files: { filename?: string; mediaType: string; url: string }[] }) => {
    const id = String(Date.now())
    const attachments = files.map((f, i) => ({ ...f, type: "file" as const, id: `${id}-${i}` }))
    setMessages((m) => [...m, { id, role: "user", text, attachments }])
    setStatus("submitted")
    setTimeout(() => {
      const words = answer.split(" ")
      let n = 0
      setStatus("streaming")
      setMessages((m) => [...m, { id: `${id}-a`, role: "assistant", text: "" }])
      timer.current = setInterval(() => {
        n++
        setMessages((m) => m.map((msg) => (msg.id === `${id}-a` ? { ...msg, text: words.slice(0, n).join(" ") } : msg)))
        if (n >= words.length) stop()
      }, 60)
    }, 900)
  }

  return (
    <div className="h-[560px] bg-background">
      <AiChat messages={messages} status={status} attachments onSubmit={submit} onStop={stop}
        suggestions={["Où sont nos fournisseurs actifs ?", "Fournisseurs inactifs depuis 6 mois", "Notes moyennes par catégorie"]} />
    </div>
  )
}
