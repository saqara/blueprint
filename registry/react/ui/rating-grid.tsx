"use client"

import * as React from "react"
import { cn } from "cn"

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/registry/react/ui/table"

export type RatingCriterion = { id: string; label: string; description?: string }
export type RatingLevel = { value: string; label: string }

const defaultScale: RatingLevel[] = ["0", "1", "2", "3", "4", "5"].map((v) => ({ value: v, label: v }))

type RatingGridProps = {
  criteria: RatingCriterion[]
  /** Columns, 0 to 5 by default. */
  scale?: RatingLevel[]
  value: Record<string, string>
  onValueChange?: (value: Record<string, string>) => void
  caption?: React.ReactNode
  /** Prefix of the native radio names (one group per criterion). */
  name?: string
  disabled?: boolean
  className?: string
}

// Native radios, styled like radio-group's item (checked = inner dot).
const radio =
  "size-4 shrink-0 cursor-pointer appearance-none rounded-full border border-input shadow-xs outline-none transition-[color,box-shadow] checked:border-primary checked:bg-primary checked:shadow-[inset_0_0_0_3px_var(--background)] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:checked:bg-primary"

// Saqara: Likert / rating grid — one row per criterion, one native radio group per row (arrows move
// within a row, Tab moves between rows), inside a real table (no role overrides).
function RatingGrid({ criteria, scale = defaultScale, value, onValueChange, caption, name, disabled = false, className }: RatingGridProps) {
  const id = React.useId()
  const prefix = name ?? `rating-${id}`
  return (
    <Table data-slot="rating-grid" className={className}>
      {caption && <TableCaption className="mt-0 mb-1 caption-top px-2 pt-3 text-left font-medium text-foreground">{caption}</TableCaption>}
      <TableHeader>
        <TableRow>
          <TableHead>Critère</TableHead>
          {scale.map((level) => <TableHead key={level.value} className="text-center">{level.label}</TableHead>)}
        </TableRow>
      </TableHeader>
      <TableBody>
        {criteria.map((criterion) => (
          <TableRow key={criterion.id}>
            <TableCell className="whitespace-normal">
              <span className="block">{criterion.label}</span>
              {criterion.description && <span className="block text-xs text-muted-foreground">{criterion.description}</span>}
            </TableCell>
            {scale.map((level) => (
              <TableCell key={level.value} className="text-center">
                <input
                  type="radio"
                  name={`${prefix}-${criterion.id}`}
                  value={level.value}
                  checked={value[criterion.id] === level.value}
                  disabled={disabled}
                  aria-label={`${criterion.label} : ${level.label}`}
                  className={cn(radio, "align-middle")}
                  onChange={() => onValueChange?.({ ...value, [criterion.id]: level.value })}
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export { RatingGrid }
