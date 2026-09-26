export type RatingCriterion = { id: string, label: string, description?: string }
export type RatingLevel = { value: string, label: string }

export const defaultScale: RatingLevel[] = ["0", "1", "2", "3", "4", "5"].map(v => ({ value: v, label: v }))

// Native radios, styled like radio-group's item (checked = inner dot).
export const radioClass
  = "size-4 shrink-0 cursor-pointer appearance-none rounded-full border border-input shadow-xs outline-none transition-[color,box-shadow] checked:border-primary checked:bg-primary checked:shadow-[inset_0_0_0_3px_var(--background)] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:checked:bg-primary"
