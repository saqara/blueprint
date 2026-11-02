import * as React from "react"
import { Button } from "@/registry/react/ui/button"
import type { QuestionOption } from "@/registry/react/ui/question"
import { Questionnaire, type QuestionnaireStep } from "@/registry/react/ui/questionnaire"

const steps: QuestionnaireStep[] = [
  {
    id: "effectif",
    question: "Quel est l'effectif de l'entreprise ?",
    options: [
      { value: "tpe", label: "Moins de 10 salariés" },
      { value: "pme", label: "10 à 249 salariés" },
      { value: "eti", label: "250 salariés et plus" },
    ],
  },
  {
    id: "politique",
    question: "Avez-vous une politique environnementale écrite ?",
    options: [
      { value: "oui", label: "Oui, publiée", description: "Sur le site ou dans le rapport annuel" },
      { value: "interne", label: "Oui, en interne" },
      { value: "non", label: "Pas encore" },
    ],
  },
  {
    id: "perimetre",
    question: "Sur quel périmètre porte l'évaluation ?",
    options: [
      { value: "groupe", label: "Tout le groupe" },
      { value: "filiale", label: "Une filiale" },
      { value: "site", label: "Un seul site" },
    ],
  },
]

export default function QuestionnaireDemo() {
  const [answers, setAnswers] = React.useState<Record<string, QuestionOption> | null>(null)
  const [round, setRound] = React.useState(0)

  return (
    <div className="w-full max-w-2xl space-y-2">
      {answers ? (
        <div className="space-y-3 rounded-xl border p-4 text-sm">
          <ul className="space-y-1">
            {steps.map((s) => <li key={s.id}><span className="text-muted-foreground">{s.question}</span> {answers[s.id]?.label}</li>)}
          </ul>
          <Button size="sm" variant="outline" onClick={() => { setAnswers(null); setRound(round + 1) }}>Recommencer</Button>
        </div>
      ) : (
        // Not on page load (the doc page keeps its focus): only when it starts again.
        <Questionnaire key={round} steps={steps} autoFocus={round > 0} onComplete={setAnswers} />
      )}
      <p className="text-sm text-muted-foreground">Flèches et Entrée, ou un chiffre de 1 à 9 pour chaque question.</p>
    </div>
  )
}
