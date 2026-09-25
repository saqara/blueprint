import { reactive } from "vue"

export interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: "warning" | "destructive" | "info"
  /** Runs before confirm() resolves; the dialog stays open and busy until it settles. */
  onConfirm?: () => unknown
}

interface Pending { resolve: (ok: boolean) => void, reject: (error: unknown) => void }

// One dialog per app, like vue-sonner's Toaster: confirm() works from anywhere.
// Options are kept after closing so the text does not vanish while it fades out.
export const state = reactive({ open: false, loading: false, options: { message: "" } as ConfirmOptions })
let pending: Pending | null = null

function settle(p: Pending | null, run: (p: Pending) => void) {
  if (!p || p !== pending) return
  pending = null
  state.open = false
  state.loading = false
  run(p)
}

/** `if (!(await confirm({ message }))) return` in place of `window.confirm(message)`. */
export function confirm(options: ConfirmOptions): Promise<boolean> {
  settle(pending, p => p.resolve(false))
  return new Promise((resolve, reject) => {
    pending = { resolve, reject }
    Object.assign(state, { open: true, loading: false, options })
  })
}

export function cancel() {
  if (!state.loading) settle(pending, p => p.resolve(false))
}

export async function accept() {
  const p = pending
  if (state.options.onConfirm) {
    state.loading = true
    try {
      await state.options.onConfirm()
    }
    catch (error) {
      return settle(p, q => q.reject(error))
    }
  }
  settle(p, q => q.resolve(true))
}
