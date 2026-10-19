import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/registry/react/ui/reasoning"

export default function ReasoningDemo() {
  return (
    <div className="w-full max-w-xl space-y-6">
      <Reasoning isStreaming>
        <ReasoningTrigger />
        <ReasoningContent>
          <p>La question porte sur les fournisseurs <strong>actifs</strong> : je filtre sur <code>statut = 'actif'</code>, puis je regroupe par ville.</p>
        </ReasoningContent>
      </Reasoning>
      <Reasoning duration={4} defaultOpen={false}>
        <ReasoningTrigger />
        <ReasoningContent>
          <p>J’ai comparé les notes moyennes par catégorie avant de répondre.</p>
        </ReasoningContent>
      </Reasoning>
    </div>
  )
}
