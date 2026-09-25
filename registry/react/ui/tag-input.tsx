"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { cn } from "cn"
import { Badge } from "@/registry/react/ui/badge"

export type TagOptions = { suggestions?: string[]; allowCreate?: boolean; maxTags?: number }

const fold = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
const normalize = (s: string) => s.trim().replace(/\s+/g, " ")

// Adds raw entries one by one: trimmed, deduplicated (case and accents), catalogue spelling, maxTags.
export function addTags(values: string[], raws: string[], { suggestions, allowCreate = true, maxTags }: TagOptions): string[] {
  let next = values
  for (const raw of raws) {
    const tag = normalize(raw)
    if (!tag || (maxTags !== undefined && next.length >= maxTags)) continue
    if (next.some((v) => fold(v) === fold(tag))) continue
    const known = suggestions?.find((s) => fold(s) === fold(tag))
    if (!known && !allowCreate) continue
    next = [...next, known ?? tag]
  }
  return next
}

export function filterSuggestions(suggestions: string[], query: string, values: string[], limit = 8): string[] {
  const q = fold(normalize(query))
  const chosen = new Set(values.map(fold))
  return suggestions.filter((s) => !chosen.has(fold(s)) && fold(s).includes(q)).slice(0, limit)
}

type TagInputProps = TagOptions & {
  value: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  removeLabel?: string
  disabled?: boolean
  id?: string
  "aria-label"?: string
  className?: string
}

// Saqara: free entry (e-mails, SIRET…) or a catalogue with suggestions (tags); replaces MultiInput / TagCombobox.
function TagInput({
  value, onValueChange, suggestions, allowCreate = true, maxTags, placeholder = "Ajouter…", removeLabel = "Retirer",
  disabled = false, id, "aria-label": ariaLabel, className,
}: TagInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listId = React.useId()
  const [query, setQuery] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState(0)
  const options = suggestions ? filterSuggestions(suggestions, query, value) : []
  const full = maxTags !== undefined && value.length >= maxTags
  const showList = open && options.length > 0 && !full

  const commit = (raws: string[]) => {
    const next = addTags(value, raws, { suggestions, allowCreate, maxTags })
    if (next !== value) onValueChange(next)
    setQuery("")
    setActive(0)
  }
  const onChange = (text: string) => {
    // Typed or pasted commas split entries; the text after the last comma stays in the field.
    const parts = text.split(",")
    if (parts.length > 1) commit(parts.slice(0, -1))
    setQuery(parts[parts.length - 1])
    setOpen(true)
    setActive(0)
  }
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      if (showList && (query.trim() || !allowCreate)) commit([options[active]])
      else if (query.trim()) commit([query])
    } else if (event.key === "Backspace" && !query && value.length) {
      onValueChange(value.slice(0, -1))
    } else if (event.key === "ArrowDown" && options.length) {
      event.preventDefault()
      setOpen(true)
      setActive((i) => Math.min(i + 1, options.length - 1))
    } else if (event.key === "ArrowUp" && options.length) {
      event.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (event.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div data-slot="tag-input" className={cn("relative", className)}>
      <div
        className="flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 dark:bg-input/30"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
            {tag}
            <button type="button" aria-label={`${removeLabel} ${tag}`} disabled={disabled}
              className="rounded-sm opacity-70 outline-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => onValueChange(value.filter((t) => t !== tag))}>
              <XIcon className="size-3" />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          aria-label={ariaLabel}
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList ? `${listId}-${active}` : undefined}
          value={query}
          disabled={disabled || full}
          placeholder={value.length ? undefined : placeholder}
          className="min-w-24 flex-1 bg-transparent py-0.5 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => { setOpen(false); if (query.trim() && allowCreate) commit([query]) }}
        />
      </div>
      {showList && (
        <ul id={listId} role="listbox" className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          {options.map((option, i) => (
            <li key={option} id={`${listId}-${i}`} role="option" aria-selected={i === active}
              className={cn("cursor-pointer rounded-sm px-2 py-1.5 text-sm", i === active && "bg-accent text-accent-foreground")}
              onMouseDown={(event) => { event.preventDefault(); commit([option]) }}
              onMouseEnter={() => setActive(i)}>
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export { TagInput }
