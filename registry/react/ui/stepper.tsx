"use client"

import * as React from "react"
import { cn } from "cn"

// Saqara: React port of the shadcn-vue (Reka UI) Stepper API. Steps are 1-based.
export type StepState = "completed" | "active" | "inactive"

export function stepState(step: number, value: number, completed?: boolean): StepState {
  if (completed || step < value) return "completed"
  return step === value ? "active" : "inactive"
}

// Clamped, like Reka's roving focus (loop: false).
export function moveIndex(current: number, delta: number, count: number): number {
  return Math.min(count - 1, Math.max(0, current + delta))
}

// Reka's linear rule: any previous step, the current one, and the next one.
export function isReachable(step: number, value: number, linear: boolean): boolean {
  return !linear || step <= value + 1
}

export function composeHandlers<E extends { defaultPrevented: boolean }>(consumer: ((event: E) => void) | undefined, own: (event: E) => void) {
  return (event: E) => {
    consumer?.(event)
    if (!event.defaultPrevented) own(event)
  }
}

type StepperContextValue = { value: number; setValue: (value: number) => void; orientation: "horizontal" | "vertical"; linear: boolean }
type StepperItemContextValue = { step: number; state: StepState; disabled: boolean }


const StepperContext = React.createContext<StepperContextValue | null>(null)
const StepperItemContext = React.createContext<StepperItemContextValue | null>(null)

function useRequired<T>(context: React.Context<T | null>, name: string): T {
  const value = React.useContext(context)
  if (!value) throw new Error(`${name} must be used within <Stepper> / <StepperItem>`)
  return value
}

type StepperProps = Omit<React.ComponentProps<"div">, "defaultValue"> & {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  orientation?: "horizontal" | "vertical"
  linear?: boolean
}

function Stepper({ value: valueProp, defaultValue = 1, onValueChange, orientation = "horizontal", linear = true, className, onKeyDown, ...props }: StepperProps) {
  const [inner, setInner] = React.useState(defaultValue)
  const value = valueProp ?? inner
  const setValue = (next: number) => {
    if (valueProp === undefined) setInner(next)
    onValueChange?.(next)
  }
  const keys: Record<string, number> = orientation === "horizontal" ? { ArrowRight: 1, ArrowLeft: -1 } : { ArrowDown: 1, ArrowUp: -1 }

  return (
    <StepperContext.Provider value={{ value, setValue, orientation, linear }}>
      <div
        data-slot="stepper"
        role="group"
        aria-label="Progression"
        data-orientation={orientation}
        className={cn("flex gap-2", orientation === "vertical" && "flex-col", className)}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          const delta = keys[event.key]
          if (!delta) return
          const triggers = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[data-slot="stepper-trigger"]:not(:disabled)')]
          const index = triggers.indexOf(document.activeElement as HTMLButtonElement)
          if (index === -1) return
          event.preventDefault()
          triggers[moveIndex(index, delta, triggers.length)]?.focus()
        }}
        {...props}
      />
    </StepperContext.Provider>
  )
}

type StepperItemProps = React.ComponentProps<"div"> & { step: number; completed?: boolean; disabled?: boolean }

function StepperItem({ step, completed, disabled = false, className, ...props }: StepperItemProps) {
  const { value, linear } = useRequired(StepperContext, "StepperItem")
  const state = stepState(step, value, completed)
  const unreachable = disabled || !isReachable(step, value, linear)
  return (
    <StepperItemContext.Provider value={{ step, state, disabled: unreachable }}>
      <div
        data-slot="stepper-item"
        data-state={state}
        data-disabled={unreachable ? "" : undefined}
        className={cn("group flex items-center gap-2 data-[disabled]:pointer-events-none", className)}
        {...props}
      />
    </StepperItemContext.Provider>
  )
}

function StepperTrigger({ className, onClick, ...props }: React.ComponentProps<"button">) {
  const { setValue } = useRequired(StepperContext, "StepperTrigger")
  const { step, state, disabled } = useRequired(StepperItemContext, "StepperTrigger")
  return (
    <button
      type="button"
      data-slot="stepper-trigger"
      aria-current={state === "active" ? "step" : undefined}
      disabled={disabled}
      onClick={composeHandlers(onClick, () => setValue(step))}
      className={cn("flex flex-col items-center gap-1 rounded-md p-1 text-center outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50", className)}
      {...props}
    />
  )
}

function StepperIndicator({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="stepper-indicator"
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground/50",
        "group-data-[disabled]:text-muted-foreground group-data-[disabled]:opacity-50",
        "group-data-[state=active]:bg-primary group-data-[state=active]:text-primary-foreground",
        "group-data-[state=completed]:bg-accent group-data-[state=completed]:text-accent-foreground",
        className,
      )}
      {...props}
    />
  )
}

function StepperTitle({ className, ...props }: React.ComponentProps<"h4">) {
  return <h4 data-slot="stepper-title" className={cn("text-md font-semibold whitespace-nowrap", className)} {...props} />
}

function StepperDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="stepper-description" className={cn("text-xs text-muted-foreground", className)} {...props} />
}

function StepperSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stepper-separator"
      aria-hidden
      className={cn(
        "bg-muted group-data-[disabled]:bg-muted group-data-[disabled]:opacity-50 group-data-[state=completed]:bg-accent",
        className,
      )}
      {...props}
    />
  )
}

export { Stepper, StepperDescription, StepperIndicator, StepperItem, StepperSeparator, StepperTitle, StepperTrigger }
