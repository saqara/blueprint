import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/registry/react/ui/button"
import type { Fw } from "../lib/framework"

export function InstallCommand({ name, fw }: { name: string; fw: Fw }) {
  const command = `npx ${fw === "react" ? "shadcn" : "shadcn-vue"}@latest add @saqara/${name}`
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-1.5 font-mono text-sm">
      <code className="flex-1 truncate">{command}</code>
      <Button variant="ghost" size="icon" className="size-7" aria-label="Copier la commande"
        onClick={async () => { await navigator.clipboard.writeText(command); setCopied(true); setTimeout(() => setCopied(false), 1500) }}>
        {copied ? <Check /> : <Copy />}
      </Button>
    </div>
  )
}
