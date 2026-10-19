import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/registry/react/ui/conversation"
import { Message, MessageContent, MessageResponse } from "@/registry/react/ui/message"

const messages = [
  { role: "user", text: "Combien de fournisseurs sont actifs ?" },
  { role: "assistant", text: "1 284 fournisseurs sont actifs, soit 87 % du total." },
  { role: "user", text: "Et parmi eux, combien à Lyon ?" },
  { role: "assistant", text: "412 fournisseurs actifs sont basés à Lyon." },
  { role: "user", text: "Lesquels ont une note inférieure à 3 ?" },
  { role: "assistant", text: "23 fournisseurs lyonnais ont une note moyenne inférieure à 3. Le plus fréquent : délais de livraison." },
] as const

export default function ConversationDemo() {
  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <div className="flex h-80 flex-col rounded-md border">
        <Conversation aria-label="Conversation avec l’assistant">
          <ConversationContent>
            {messages.map((m, i) => (
              <Message key={i} from={m.role}>
                <MessageContent><MessageResponse><p>{m.text}</p></MessageResponse></MessageContent>
              </Message>
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>
      <div className="flex h-80 flex-col rounded-md border">
        <ConversationEmptyState />
      </div>
    </div>
  )
}
