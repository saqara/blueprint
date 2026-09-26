"use client"

import * as React from "react"
import { cn } from "cn"

import { Input } from "@/registry/react/ui/input"
import { Spinner } from "@/registry/react/ui/spinner"

export type AutocompleteOption = { value: string; label: string; description?: string }

type AutocompleteProps = Omit<React.ComponentProps<"input">, "value" | "onChange" | "onSelect"> & {
  /** The typed text (controlled). */
  value: string
  onValueChange?: (value: string) => void
  /** Suggestions for the current text: the app fetches them (async) and passes them back. */
  suggestions: AutocompleteOption[]
  onSelect?: (option: AutocompleteOption) => void
  loading?: boolean
  loadingMessage?: string
  emptyMessage?: string
  /** Minimum length before the list (or its messages) shows. */
  minChars?: number
  renderSuggestion?: (option: AutocompleteOption) => React.ReactNode
}

// Saqara: a normal Input with a suggestion list (address search…). Focus never leaves the field;
// the app owns fetching, debouncing and what a selection does.
function Autocomplete({
  value, onValueChange, suggestions, onSelect, loading = false, loadingMessage = "Recherche…", emptyMessage = "Aucun résultat.",
  minChars = 1, renderSuggestion, className, onKeyDown, onFocus, onBlur, ...props
}: AutocompleteProps) {
  const listId = React.useId()
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState(0)
  const enough = value.trim().length >= minChars
  const showList = open && enough && suggestions.length > 0 && !loading
  const status = open && enough && (loading ? loadingMessage : suggestions.length === 0 ? emptyMessage : "")

  const pick = (option: AutocompleteOption) => {
    onSelect?.(option)
    setOpen(false)
    setActive(0)
  }

  return (
    <div data-slot="autocomplete" className={cn("relative", className)}>
      <Input
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList ? `${listId}-${active}` : undefined}
        autoComplete="off"
        value={value}
        className={cn(loading && "pr-8")}
        onChange={(event) => { onValueChange?.(event.target.value); setOpen(true); setActive(0) }}
        onFocus={(event) => { setOpen(true); onFocus?.(event) }}
        onBlur={(event) => { setOpen(false); onBlur?.(event) }}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.key === "ArrowDown" && suggestions.length) {
            event.preventDefault()
            if (!open) setOpen(true)
            else setActive((i) => Math.min(i + 1, suggestions.length - 1))
          } else if (event.key === "ArrowUp" && suggestions.length) {
            event.preventDefault()
            setActive((i) => Math.max(i - 1, 0))
          } else if (event.key === "Enter" && showList) {
            event.preventDefault()
            pick(suggestions[active])
          } else if (event.key === "Escape") {
            setOpen(false)
          }
        }}
        {...props}
      />
      {loading && <Spinner aria-hidden="true" role="presentation" className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground" />}
      {showList && (
        <ul id={listId} role="listbox" className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          {suggestions.map((option, i) => (
            <li key={option.value} id={`${listId}-${i}`} role="option" aria-selected={i === active}
              className={cn("cursor-pointer rounded-sm px-2 py-1.5 text-sm", i === active && "bg-accent text-accent-foreground")}
              onMouseDown={(event) => { event.preventDefault(); pick(option) }}
              onMouseEnter={() => setActive(i)}>
              {renderSuggestion ? renderSuggestion(option) : (
                <>
                  <span className="block">{option.label}</span>
                  {option.description && <span className="block text-xs text-muted-foreground">{option.description}</span>}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      {status && (
        <div role="status" className="absolute z-50 mt-1 w-full rounded-md border bg-popover px-3 py-2 text-sm text-muted-foreground shadow-md">
          {status}
        </div>
      )}
    </div>
  )
}

export { Autocomplete }
