import { useState } from "react"
import {
  Confirmation, ConfirmationAccepted, ConfirmationAction, ConfirmationActions, ConfirmationRejected, ConfirmationRequest, ConfirmationTitle,
  type ToolState,
} from "@/registry/react/ui/confirmation"

export default function ConfirmationDemo() {
  const [state, setState] = useState<ToolState>("approval-requested")
  const [approved, setApproved] = useState<boolean>()
  const respond = (ok: boolean) => { setApproved(ok); setState("approval-responded") }
  return (
    <div className="w-full max-w-xl">
      <Confirmation approval={approved === undefined ? { id: "q1" } : { id: "q1", approved }} state={state}>
        <ConfirmationTitle>
          <ConfirmationRequest>L’assistant veut exécuter une requête sur BigQuery (environ 2,1 Go analysés).</ConfirmationRequest>
          <ConfirmationAccepted>Requête autorisée : exécution en cours.</ConfirmationAccepted>
          <ConfirmationRejected>Requête refusée : rien n’a été exécuté.</ConfirmationRejected>
        </ConfirmationTitle>
        <ConfirmationActions>
          <ConfirmationAction variant="outline" onClick={() => respond(false)}>Refuser</ConfirmationAction>
          <ConfirmationAction onClick={() => respond(true)}>Autoriser</ConfirmationAction>
        </ConfirmationActions>
      </Confirmation>
    </div>
  )
}
