import { CopyIcon, RefreshCcwIcon, ThumbsUpIcon } from "lucide-react"
import { Message, MessageAction, MessageActions, MessageContent, MessageResponse } from "@/registry/react/ui/message"

export default function MessageDemo() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <Message from="user">
        <MessageContent>Quelles villes comptent le plus de fournisseurs actifs ?</MessageContent>
      </Message>
      <Message from="assistant">
        <MessageContent>
          {/* The app renders its markdown (markdown-it, sanitized) and passes the HTML here. */}
          <MessageResponse>
            <p>Voici les <strong>trois premières villes</strong> :</p>
            <table>
              <thead><tr><th>Ville</th><th>Fournisseurs</th></tr></thead>
              <tbody>
                <tr><td>Lyon</td><td>412</td></tr>
                <tr><td>Paris</td><td>389</td></tr>
                <tr><td>Lille</td><td>201</td></tr>
              </tbody>
            </table>
            <p>Requête utilisée : <code>GROUP BY ville</code>.</p>
          </MessageResponse>
        </MessageContent>
        <MessageActions>
          <MessageAction tooltip="Copier"><CopyIcon /></MessageAction>
          <MessageAction tooltip="Régénérer"><RefreshCcwIcon /></MessageAction>
          <MessageAction tooltip="Réponse utile"><ThumbsUpIcon /></MessageAction>
        </MessageActions>
      </Message>
    </div>
  )
}
