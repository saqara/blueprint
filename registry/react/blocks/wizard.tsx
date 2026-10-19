"use client"

import * as React from "react"
import { cn } from "cn"
import { CheckIcon, CircleAlertIcon, CircleCheckIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/registry/react/ui/alert"
import { Button } from "@/registry/react/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/registry/react/ui/card"
import { Spinner } from "@/registry/react/ui/spinner"
import { Stepper, StepperDescription, StepperIndicator, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from "@/registry/react/ui/stepper"

export type WizardStep = { title: string; description?: string; content: React.ReactNode }

type WizardProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  steps: WizardStep[]
  /** Checks a step before moving forward (Suivant, a later step in the stepper, or the final submit).
   *  Return the messages to fix (shown in a summary that takes the focus); nothing or [] lets the user through. */
  validate?: (step: number) => string[] | undefined | void
  /** Adds a last step (before submit) to re-read the answers. */
  review?: React.ReactNode
  reviewTitle?: string
  reviewDescription?: string
  /** "submitting" locks the controls and spins the submit button; "done" replaces the form with `done`. */
  status?: "idle" | "submitting" | "done"
  submitLabel?: string
  /** False keeps the final button disabled (e.g. terms not accepted yet). */
  canSubmit?: boolean
  onSubmit?: () => void
  onStepChange?: (step: number) => void
  doneTitle?: React.ReactNode
  done?: React.ReactNode
  className?: string
}

// The page has one heading: the card title is an h1, each step's title an h2 (CardTitle is a div).
const titleClass = "font-heading text-xl leading-none font-semibold"

// Saqara block: presentational multi-step form. The app owns the fields and their values; the block runs the
// steps (1-based), asks `validate` before going forward, and says what to fix.
function Wizard({
  title, description, steps, validate, review, reviewTitle = "Récapitulatif", reviewDescription = "Vérifiez avant d’envoyer", status = "idle",
  submitLabel = "Envoyer", canSubmit = true, onSubmit, onStepChange, doneTitle = "C’est envoyé", done, className,
}: WizardProps) {
  const all = review ? [...steps, { title: reviewTitle, description: reviewDescription, content: review }] : steps
  const id = React.useId()
  const [step, setStep] = React.useState(1)
  const [errors, setErrors] = React.useState<string[]>([])
  const heading = React.useRef<HTMLHeadingElement>(null)
  const summary = React.useRef<HTMLDivElement>(null)
  const doneHeading = React.useRef<HTMLHeadingElement>(null)
  // Focus follows the user's action only (not the first render): the new step's heading, or the summary.
  const focusNext = React.useRef<"heading" | "summary" | null>(null)
  const submitting = status === "submitting"
  const last = step === all.length

  React.useEffect(() => {
    const target = focusNext.current === "summary" ? summary.current : focusNext.current === "heading" ? heading.current : null
    focusNext.current = null
    target?.focus()
  }, [step, errors])

  // Once sent, the confirmation takes the focus (it replaces the button the user just pressed).
  React.useEffect(() => {
    if (status === "done") doneHeading.current?.focus()
  }, [status])

  // Forward moves check every step on the way (a later step in the stepper skips none).
  const check = (from: number, to: number) => {
    for (let s = from; s < to; s++) {
      const found = (s <= steps.length && validate?.(s)) || []
      if (found.length) {
        if (s !== step) onStepChange?.(s)
        setStep(s)
        setErrors(found)
        focusNext.current = "summary"
        return false
      }
    }
    return true
  }
  const goTo = (next: number) => {
    if (next === step || submitting || (next > step && !check(step, next))) return
    setErrors([])
    setStep(next)
    focusNext.current = "heading"
    onStepChange?.(next)
  }
  const submit = () => {
    if (check(1, all.length + 1)) onSubmit?.()
  }

  if (status === "done") {
    return (
      <Card data-slot="wizard" className={cn("w-full max-w-2xl", className)}>
        <CardHeader className="items-center text-center">
          <CircleCheckIcon aria-hidden="true" className="mx-auto size-10 text-success" />
          <h1 ref={doneHeading} tabIndex={-1} className={cn(titleClass, "outline-none")}>{doneTitle}</h1>
        </CardHeader>
        {done && <CardContent className="text-center text-sm text-muted-foreground">{done}</CardContent>}
      </Card>
    )
  }

  const current = all[step - 1]
  return (
    <Card data-slot="wizard" className={cn("w-full max-w-2xl", className)}>
      {(title || description) && (
        <CardHeader>
          {title && <h1 className={titleClass}>{title}</h1>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="space-y-6">
        <Stepper value={step} onValueChange={goTo} className="w-full items-start" aria-label="Étapes">
          {all.map((s, i) => (
            <StepperItem key={i} step={i + 1} disabled={submitting} className="relative flex-1 flex-col">
              <StepperTrigger>
                <StepperIndicator>{i + 1 < step ? <CheckIcon className="size-4" aria-hidden="true" /> : i + 1}</StepperIndicator>
                <StepperTitle className="max-sm:sr-only">{s.title}</StepperTitle>
                {s.description && <StepperDescription className="max-sm:hidden">{s.description}</StepperDescription>}
              </StepperTrigger>
              {i + 1 < all.length && <StepperSeparator className="absolute top-5 right-[calc(-50%+20px)] left-[calc(50%+30px)] h-0.5" />}
            </StepperItem>
          ))}
        </Stepper>

        <section aria-labelledby={`${id}-step`} className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground">Étape {step} sur {all.length}</p>
            <h2 id={`${id}-step`} ref={heading} tabIndex={-1} className="text-lg font-semibold outline-none">{current.title}</h2>
          </div>
          {errors.length > 0 && (
            <Alert ref={summary} variant="destructive" tabIndex={-1} data-slot="wizard-errors" className="outline-none focus-visible:ring-[3px] focus-visible:ring-destructive/30">
              <CircleAlertIcon />
              <AlertTitle>{errors.length > 1 ? `${errors.length} points à corriger` : "Un point à corriger"}</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-4">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
              </AlertDescription>
            </Alert>
          )}
          {current.content}
        </section>
      </CardContent>
      <CardFooter className="justify-between gap-2">
        <Button variant="outline" disabled={step === 1 || submitting} onClick={() => goTo(step - 1)}>Précédent</Button>
        {last ? (
          <Button disabled={!canSubmit || submitting} onClick={submit}>
            {submitting && <Spinner aria-hidden="true" />}{submitting ? "Envoi…" : submitLabel}
          </Button>
        ) : (
          <Button onClick={() => goTo(step + 1)}>Suivant</Button>
        )}
      </CardFooter>
    </Card>
  )
}

export { Wizard }
