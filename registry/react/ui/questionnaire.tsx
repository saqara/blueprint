"use client"

import * as React from "react"
import { cn } from "cn"
import { ChevronLeftIcon, XIcon } from "lucide-react"
import { Button } from "@/registry/react/ui/button"
import { Question, type QuestionOption } from "@/registry/react/ui/question"

export type QuestionnaireStep = {
  id: string
  question: string
  options: QuestionOption[]
}

type QuestionnaireProps = {
  steps: QuestionnaireStep[]
  /** Called with every answer, by step id, once the last question is answered. */
  onComplete: (answers: Record<string, QuestionOption>) => void
  /** Close button and Escape (shown when given). */
  onClose?: () => void
  backLabel?: string
  closeLabel?: string
  /** Takes the focus when it appears. */
  autoFocus?: boolean
  className?: string
}

// Saqara: several questions, one at a time (a plan-mode interview, an assessment). Each answer moves
// to the next question, which slides in; the back button returns to the previous one.
function Questionnaire({
  steps, onComplete, onClose, backLabel = "Question précédente", closeLabel = "Fermer", autoFocus = true, className,
}: QuestionnaireProps) {
  const [step, setStep] = React.useState(0)
  const [answers, setAnswers] = React.useState<Record<string, QuestionOption>>({})
  // Later steps take the focus: the user is already in the questionnaire.
  const [moved, setMoved] = React.useState(false)
  const current = steps[step]
  if (!current) return null

  const answer = (option: QuestionOption) => {
    const next = { ...answers, [current.id]: option }
    setAnswers(next)
    setMoved(true)
    if (step === steps.length - 1) onComplete(next)
    else setStep(step + 1)
  }

  return (
    <div
      data-slot="questionnaire"
      className={cn("flex flex-col overflow-hidden rounded-xl border bg-background shadow-sm animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ease-spring", className)}
      onKeyDown={(event) => {
        if (event.key === "Escape" && onClose) { event.preventDefault(); onClose() }
      }}
    >
      <div className="flex items-center gap-2 py-2 pr-2 pl-2">
        <Button type="button" variant="ghost" size="icon-sm" aria-label={backLabel} disabled={step === 0} onClick={() => { setMoved(true); setStep(step - 1) }}>
          <ChevronLeftIcon />
        </Button>
        <span className="text-xs text-muted-foreground tabular-nums" aria-live="polite">Question {step + 1} sur {steps.length}</span>
        <span aria-hidden="true" className="ml-auto flex gap-1">
          {steps.map((s, i) => (
            <span key={s.id} className={cn("h-1 w-5 rounded-full bg-muted transition-colors duration-240 ease-tail", i < step && "bg-primary", i === step && "bg-foreground/40")} />
          ))}
        </span>
        {onClose && (
          <Button type="button" variant="ghost" size="icon-sm" aria-label={closeLabel} onClick={onClose}>
            <XIcon />
          </Button>
        )}
      </div>
      <Question
        key={current.id}
        className="rounded-none border-0 border-t shadow-none"
        question={current.question}
        options={current.options}
        autoFocus={autoFocus || moved}
        onSelect={answer}
      />
    </div>
  )
}

export { Questionnaire }
