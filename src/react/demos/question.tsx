import { useState } from "react"
import { PromptInput, PromptInputBody, PromptInputFooter, PromptInputSubmit, PromptInputTextarea, PromptInputTools } from "@/registry/react/ui/prompt-input"
import { Question, type QuestionOption } from "@/registry/react/ui/question"

const companies: QuestionOption[] = [
  { value: "1", label: "Carrelages du Sud-Ouest", description: "SAINT-VINCENT-DE-TYROSSE · Carrelage" },
  { value: "2", label: "Carrelages Dupont", description: "BAYONNE · Carrelage, faïence" },
  { value: "3", label: "Dupont Carrelage Services", description: "DAX · Pose de carrelage" },
  { value: "4", label: "Carrelage Atlantique", description: "ANGLET · Carrelage" },
  { value: "5", label: "Dupont & Fils", description: "MONT-DE-MARSAN · Maçonnerie, carrelage" },
  { value: "6", label: "Carrelages Landais", description: "SOUSTONS · Carrelage" },
  { value: "7", label: "SARL Dupont", description: "BIARRITZ · Revêtements de sols" },
  { value: "8", label: "Carrelage Pro 40", description: "CAPBRETON · Carrelage", disabled: true },
  { value: "9", label: "Dupont Rénovation", description: "PEYREHORADE · Rénovation" },
]

// In a chat, the question replaces the text field until the user answers, writes another answer or closes it.
export default function QuestionDemo() {
  const [asking, setAsking] = useState(true)
  const [answer, setAnswer] = useState("")
  // Not on page load (the doc page keeps its focus): only when the question comes back.
  const [rounds, setRounds] = useState(0)
  return (
    <div className="w-full max-w-2xl space-y-2">
      {asking ? (
        <Question
          question="Quelle entreprise cherchez-vous ?"
          autoFocus={rounds > 0}
          options={companies}
          onSelect={(option) => { setAnswer(`${option.label} (${option.description})`); setAsking(false) }}
          onOther={() => { setAnswer(""); setAsking(false) }}
          onClose={() => setAsking(false)}
        />
      ) : (
        <PromptInput onSubmit={({ text }) => { setAnswer(text); setRounds((n) => n + 1); setAsking(true) }}>
          <PromptInputBody><PromptInputTextarea autoFocus /></PromptInputBody>
          <PromptInputFooter><PromptInputTools /><PromptInputSubmit /></PromptInputFooter>
        </PromptInput>
      )}
      <p className="text-sm text-muted-foreground" aria-live="polite">{answer ? `Réponse : ${answer}` : "Flèches et Entrée, ou un chiffre de 1 à 9. Échap ferme."}</p>
    </div>
  )
}
