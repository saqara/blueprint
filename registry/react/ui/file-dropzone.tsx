"use client"

import * as React from "react"
import { UploadIcon, XIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/registry/react/ui/button"

export type FileRejection = { file: File; reason: "type" | "size" }

// `accept` follows the <input accept> syntax: extensions (.xlsx), wildcards (image/*) and exact MIME types.
export function matchesAccept(file: { name: string; type: string }, accept?: string): boolean {
  if (!accept) return true
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return accept.split(",").map((rule) => rule.trim().toLowerCase()).filter(Boolean).some((rule) =>
    rule.startsWith(".") ? name.endsWith(rule) : rule.endsWith("/*") ? type.startsWith(rule.slice(0, -1)) : type === rule,
  )
}

export function partitionFiles(files: File[], { accept, maxSize }: { accept?: string; maxSize?: number }) {
  const accepted: File[] = []
  const rejected: FileRejection[] = []
  for (const file of files) {
    if (!matchesAccept(file, accept)) rejected.push({ file, reason: "type" })
    else if (maxSize !== undefined && file.size > maxSize) rejected.push({ file, reason: "size" })
    else accepted.push(file)
  }
  return { accepted, rejected }
}

type FileDropzoneProps = {
  files: File[]
  onFilesChange: (files: File[]) => void
  onReject?: (rejections: FileRejection[]) => void
  accept?: string
  maxSize?: number
  multiple?: boolean
  disabled?: boolean
  label?: React.ReactNode
  removeLabel?: string
  className?: string
}

// Saqara: selection + validation only; the app uploads and shows its own progress.
function FileDropzone({
  files, onFilesChange, onReject, accept, maxSize, multiple = false, disabled = false,
  label = "Glissez un fichier ici ou cliquez pour parcourir", removeLabel = "Retirer", className,
}: FileDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = React.useState(false)
  const add = (list: FileList | null) => {
    if (!list || disabled) return
    const { accepted, rejected } = partitionFiles([...list], { accept, maxSize })
    if (rejected.length) onReject?.(rejected)
    if (accepted.length) onFilesChange(multiple ? [...files, ...accepted] : accepted.slice(0, 1))
  }

  return (
    <div data-slot="file-dropzone" className={cn("grid gap-2", className)}>
      <button
        type="button"
        disabled={disabled}
        data-dragging={dragging ? "" : undefined}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); add(e.dataTransfer.files) }}
        className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-input p-6 text-sm text-muted-foreground transition-colors outline-none hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[dragging]:border-primary data-[dragging]:bg-accent"
      >
        <UploadIcon className="size-5" />
        {label}
      </button>
      <input ref={inputRef} type="file" hidden accept={accept} multiple={multiple} disabled={disabled}
        onChange={(e) => { add(e.target.files); e.target.value = "" }} />
      {files.length > 0 && (
        <ul className="grid gap-1 text-sm">
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`} className="flex items-center justify-between gap-2 rounded-md border px-3 py-1.5">
              <span className="truncate">{file.name}</span>
              <Button type="button" variant="ghost" size="icon" className="size-7" aria-label={`${removeLabel} ${file.name}`}
                onClick={() => onFilesChange(files.filter((_, j) => j !== i))}>
                <XIcon />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export { FileDropzone }
