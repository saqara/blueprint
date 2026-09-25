"use client"

import * as React from "react"
import { InfoIcon, TriangleAlertIcon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/registry/react/ui/alert-dialog"
import { Button } from "@/registry/react/ui/button"

type ConfirmOptions = {
  title?: string
  message: React.ReactNode
  confirmText?: string
  cancelText?: string
  variant?: "warning" | "destructive" | "info"
  /** Runs before confirm() resolves; the dialog stays open and busy until it settles. */
  onConfirm?: () => unknown
}

type Pending = { resolve: (ok: boolean) => void; reject: (error: unknown) => void }

// One dialog per app, like sonner's Toaster: confirm() works from anywhere.
// Options are kept after closing so the text does not vanish while it fades out.
let state = { open: false, loading: false, options: { message: "" } as ConfirmOptions }
let pending: Pending | null = null
const listeners = new Set<() => void>()

function update(next: Partial<typeof state>) {
  state = { ...state, ...next }
  listeners.forEach((listener) => listener())
}

function settle(p: Pending | null, run: (p: Pending) => void) {
  if (!p || p !== pending) return
  pending = null
  update({ open: false, loading: false })
  run(p)
}

/** `if (!(await confirm({ message }))) return` in place of `window.confirm(message)`. */
function confirm(options: ConfirmOptions): Promise<boolean> {
  settle(pending, (p) => p.resolve(false))
  return new Promise((resolve, reject) => {
    pending = { resolve, reject }
    update({ open: true, loading: false, options })
  })
}

async function accept() {
  const p = pending
  if (state.options.onConfirm) {
    update({ loading: true })
    try {
      await state.options.onConfirm()
    } catch (error) {
      return settle(p, (q) => q.reject(error))
    }
  }
  settle(p, (q) => q.resolve(true))
}

const media = {
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
}

function ConfirmDialog() {
  const { open, loading, options } = React.useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => state,
    () => state
  )
  const variant = options.variant ?? "warning"
  const Icon = variant === "info" ? InfoIcon : TriangleAlertIcon

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => !next && !loading && settle(pending, (p) => p.resolve(false))}
    >
      <AlertDialogContent data-slot="confirm-dialog">
        <AlertDialogHeader>
          <AlertDialogMedia className={media[variant]}>
            <Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>{options.title ?? "Confirmation"}</AlertDialogTitle>
          <AlertDialogDescription>{options.message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {options.cancelText ?? "Annuler"}
          </AlertDialogCancel>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            loading={loading}
            onClick={accept}
          >
            {options.confirmText ?? "Confirmer"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { ConfirmDialog, confirm, type ConfirmOptions }
