"use client"

import * as React from "react"
import { cn } from "cn"
import { CornerDownLeftIcon, XIcon } from "lucide-react"
import { Button } from "@/registry/react/ui/button"

export type QuestionOption = {
  value: string
  label: string
  /** Second line, muted ("SAINT-VINCENT-DE-TYROSSE · Carrelage"). */
  description?: string
  disabled?: boolean
}

type QuestionProps = {
  options: QuestionOption[]
  /** Title above the options. Without it, name the list with `aria-label`. */
  question?: React.ReactNode
  "aria-label"?: string
  /** "Autre réponse…": the link that hands back to the text field (shown when `onOther` is given). */
  otherLabel?: string
  closeLabel?: string
  /** Takes the focus when it appears (it replaces the text field). */
  autoFocus?: boolean
  disabled?: boolean
  onSelect: (option: QuestionOption) => void
  onOther?: () => void
  /** Close button and Escape (shown when given). */
  onClose?: () => void
  className?: string
}

// Saqara: the assistant asks the user to pick one answer, in place of the prompt input (like Claude
// Code's AskUserQuestion). Arrows move, Enter or a click picks, 1–9 pick directly, Escape closes.
function Question({
  options, question, "aria-label": ariaLabel, otherLabel = "Autre réponse…", closeLabel = "Fermer", autoFocus = true, disabled = false,
  onSelect, onOther, onClose, className,
}: QuestionProps) {
  const id = React.useId()
  const list = React.useRef<HTMLUListElement>(null)
  const enabled = options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0)
  const [active, setActive] = React.useState(enabled[0] ?? -1)
  // The options can change (a new question): keep the highlight on an enabled option.
  const current = enabled.includes(active) ? active : (enabled[0] ?? -1)

  React.useEffect(() => {
    if (autoFocus) list.current?.focus({ preventScroll: true })
  }, [autoFocus])
  React.useEffect(() => {
    list.current?.querySelector(`[data-index="${current}"]`)?.scrollIntoView?.({ block: "nearest" })
  }, [current])

  const pick = (index: number) => {
    const option = options[index]
    if (!disabled && option && !option.disabled) onSelect(option)
  }
  const move = (step: number) => {
    if (!enabled.length) return
    const at = enabled.indexOf(current)
    setActive(enabled[(at + step + enabled.length) % enabled.length])
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    if (disabled) return
    const key = event.key
    if (key === "ArrowDown" || key === "ArrowUp") move(key === "ArrowDown" ? 1 : -1)
    else if (key === "Home" || key === "End") setActive(key === "Home" ? (enabled[0] ?? -1) : (enabled[enabled.length - 1] ?? -1))
    else if (key === "Enter" || key === " ") pick(current)
    else if (/^[1-9]$/.test(key) && !event.altKey && !event.ctrlKey && !event.metaKey) pick(Number(key) - 1)
    else return
    event.preventDefault()
  }

  return (
    <div
      data-slot="question"
      className={cn("flex flex-col overflow-hidden rounded-md border bg-background shadow-xs", disabled && "opacity-60", className)}
      onKeyDown={(event) => {
        if (event.key === "Escape" && onClose) { event.preventDefault(); onClose() }
      }}
    >
      {(question || onClose) && (
        <div className="flex items-start gap-2 py-2 pr-2 pl-4">
          {question && <p id={`${id}-question`} className="flex-1 py-1 text-sm font-medium">{question}</p>}
          {onClose && (
            <Button type="button" variant="ghost" size="icon-sm" className="ml-auto shrink-0" aria-label={closeLabel} onClick={onClose}>
              <XIcon />
            </Button>
          )}
        </div>
      )}
      <ul
        ref={list}
        id={`${id}-list`}
        role="listbox"
        tabIndex={disabled ? -1 : 0}
        aria-labelledby={question ? `${id}-question` : undefined}
        aria-label={question ? undefined : ariaLabel}
        aria-activedescendant={current >= 0 ? `${id}-${current}` : undefined}
        aria-disabled={disabled || undefined}
        className="max-h-[min(31rem,60vh)] overflow-y-auto border-t p-1 outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:ring-inset"
        onKeyDown={onKeyDown}
      >
        {options.map((option, index) => (
          <li
            key={option.value}
            id={`${id}-${index}`}
            data-index={index}
            role="option"
            aria-selected={index === current}
            aria-disabled={option.disabled || undefined}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-sm px-3 py-2 text-sm",
              index === current && "bg-accent text-accent-foreground",
              option.disabled && "cursor-not-allowed opacity-50",
            )}
            onMouseEnter={() => !option.disabled && setActive(index)}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => pick(index)}
          >
            <span aria-hidden="true" className="w-4 shrink-0 text-center font-mono text-xs text-muted-foreground">{index < 9 ? index + 1 : ""}</span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium">{option.label}</span>
              {option.description && <span className="truncate text-xs text-muted-foreground">{option.description}</span>}
            </span>
            {index === current && <CornerDownLeftIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />}
          </li>
        ))}
      </ul>
      {onOther && (
        <div className="border-t px-1 py-1">
          <Button type="button" variant="link" size="sm" className="h-8 px-3 text-muted-foreground" disabled={disabled} onClick={onOther}>
            {otherLabel}
          </Button>
        </div>
      )}
    </div>
  )
}

export { Question }
