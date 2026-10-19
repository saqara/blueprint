"use client"

import * as React from "react"
import { cn } from "cn"
import { Button } from "@/registry/react/ui/button"

export type SettingsSection = {
  id: string
  label: string
  /** Under the section title. */
  description?: React.ReactNode
  /** The section's fields (Field, Input, Switch…). */
  content: React.ReactNode
}

type SettingsPageProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  sections: SettingsSection[]
  /** Shown section (controlled). Default: the first, then the one clicked. */
  activeSection?: string
  onActiveSectionChange?: (id: string) => void
  /** The form differs from what is saved: the app compares, the block shows the save bar. */
  dirty?: boolean
  status?: "idle" | "saving" | "saved" | "error"
  /** Message when `status` is "error". */
  error?: string
  /** Asks the browser to confirm leaving the page (reload, close, external link) while `dirty`. In-app navigation is the app's router guard. */
  warnOnLeave?: boolean
  saveLabel?: string
  cancelLabel?: string
  onSave?: () => void
  onCancel?: () => void
  className?: string
}

const statusText = (status: SettingsPageProps["status"], dirty: boolean, error?: string) =>
  status === "saving" ? "Enregistrement…"
  : status === "error" ? (error ?? "L’enregistrement a échoué. Réessayez.")
  : status === "saved" && !dirty ? "Modifications enregistrées."
  : dirty ? "Modifications non enregistrées."
  : ""

// Saqara block: presentational settings screen. The app owns the values, compares them to decide `dirty`,
// saves on `onSave` and drives `status`. Every section stays mounted (hidden), so switching keeps what was typed.
function SettingsPage({
  title = "Paramètres", description, sections, activeSection, onActiveSectionChange, dirty = false, status = "idle", error,
  warnOnLeave = true, saveLabel = "Enregistrer", cancelLabel = "Annuler", onSave, onCancel, className,
}: SettingsPageProps) {
  const id = React.useId()
  const [localActive, setLocalActive] = React.useState(sections[0]?.id)
  const active = activeSection ?? localActive
  const saving = status === "saving"
  const message = statusText(status, dirty, error)
  const barShown = dirty || saving || status === "error"

  React.useEffect(() => {
    if (!warnOnLeave || !dirty) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [warnOnLeave, dirty])

  const select = (next: string) => {
    setLocalActive(next)
    onActiveSectionChange?.(next)
  }

  return (
    <form
      data-slot="settings-page"
      className={cn("flex min-h-full flex-col", className)}
      noValidate
      onSubmit={(event) => { event.preventDefault(); if (dirty && !saving) onSave?.() }}
    >
      <header className="space-y-1 px-4 pt-6 sm:px-6">
        <h1 className="font-heading text-2xl font-semibold">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </header>
      <div className="flex flex-1 flex-col gap-6 p-4 sm:px-6 md:flex-row md:gap-10">
        {/* Below md the same list becomes a scrolling row of tabs-like buttons (one DOM). */}
        <nav aria-label="Sections des paramètres" className="shrink-0 md:w-56">
          <ul className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 md:flex-col md:overflow-visible md:pb-0">
            {sections.map((section) => (
              <li key={section.id} className="shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  aria-current={section.id === active ? "page" : undefined}
                  aria-controls={`${id}-${section.id}`}
                  className="w-full justify-start aria-[current=page]:bg-muted aria-[current=page]:font-semibold"
                  onClick={() => select(section.id)}
                >
                  {section.label}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="min-w-0 flex-1">
          {sections.map((section) => (
            <section key={section.id} id={`${id}-${section.id}`} aria-labelledby={`${id}-${section.id}-title`} hidden={section.id !== active} className="max-w-2xl space-y-6">
              <div className="space-y-1">
                <h2 id={`${id}-${section.id}-title`} className="text-lg font-semibold">{section.label}</h2>
                {section.description && <p className="text-sm text-muted-foreground">{section.description}</p>}
              </div>
              {section.content}
            </section>
          ))}
        </div>
      </div>
      {/* Always mounted, so screen readers hear each change of state. */}
      <p role="status" className="sr-only">{message}</p>
      <div
        data-slot="settings-save-bar"
        hidden={!barShown}
        className="sticky bottom-0 z-10 border-t bg-background/95 px-4 py-3 backdrop-blur-sm sm:px-6"
      >
        <div className="flex flex-wrap items-center justify-end gap-3">
          <p aria-hidden="true" className={cn("basis-full text-sm sm:mr-auto sm:basis-auto", status === "error" ? "text-destructive" : "text-muted-foreground")}>{message}</p>
          <Button type="button" variant="outline" disabled={saving} onClick={onCancel}>{cancelLabel}</Button>
          <Button type="submit" loading={saving} disabled={!dirty}>{saveLabel}</Button>
        </div>
      </div>
    </form>
  )
}

export { SettingsPage }
