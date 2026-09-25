import { useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/registry/react/ui/button"
import { Stepper, StepperDescription, StepperIndicator, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from "@/registry/react/ui/stepper"

const steps = [
  { step: 1, title: "Entreprise", description: "SIREN et raison sociale" },
  { step: 2, title: "Contacts", description: "Interlocuteurs" },
  { step: 3, title: "Validation", description: "Récapitulatif" },
]

export default function StepperDemo() {
  const [value, setValue] = useState(2)
  return (
    <div className="space-y-4">
      <Stepper value={value} onValueChange={setValue} className="w-full max-w-xl items-start">
        {steps.map((s) => (
          <StepperItem key={s.step} step={s.step} className="relative flex-1 flex-col">
            <StepperTrigger>
              <StepperIndicator>{s.step < value ? <Check className="size-4" /> : s.step}</StepperIndicator>
              <StepperTitle>{s.title}</StepperTitle>
              <StepperDescription>{s.description}</StepperDescription>
            </StepperTrigger>
            {s.step < steps.length && <StepperSeparator className="absolute top-5 right-[calc(-50%+20px)] left-[calc(50%+30px)] h-0.5" />}
          </StepperItem>
        ))}
      </Stepper>
      <div className="flex gap-2">
        <Button variant="outline" disabled={value === 1} onClick={() => setValue(value - 1)}>Précédent</Button>
        <Button disabled={value === steps.length} onClick={() => setValue(value + 1)}>Suivant</Button>
      </div>
    </div>
  )
}
