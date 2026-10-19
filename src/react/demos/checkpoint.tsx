import { useState } from "react"
import { Checkpoint, CheckpointIcon, CheckpointTrigger } from "@/registry/react/ui/checkpoint"

export default function CheckpointDemo() {
  const [restored, setRestored] = useState(false)
  return (
    <div className="w-full max-w-xl space-y-3">
      <Checkpoint>
        <CheckpointIcon />
        <CheckpointTrigger tooltip="Revenir à la conversation telle qu’elle était à ce moment" onClick={() => setRestored(true)}>
          Restaurer ce point
        </CheckpointTrigger>
      </Checkpoint>
      <p className="text-sm text-muted-foreground">{restored ? "Conversation restaurée avant la question sur Lyon." : "Point enregistré avant la question sur Lyon."}</p>
    </div>
  )
}
