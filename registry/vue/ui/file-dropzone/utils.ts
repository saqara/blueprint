export type FileRejection = { file: File; reason: "type" | "size" | "count" }

// `accept` follows the <input accept> syntax: extensions (.xlsx), wildcards (image/*) and exact MIME types.
export function matchesAccept(file: { name: string; type: string }, accept?: string): boolean {
  if (!accept) return true
  if (accept.split(",").some((rule) => ["*", "*/*"].includes(rule.trim()))) return true
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

// Single mode keeps the first accepted file; the others are reported, never dropped silently.
export function limitFiles(accepted: File[], multiple: boolean): { kept: File[]; rejected: FileRejection[] } {
  if (multiple) return { kept: accepted, rejected: [] }
  return { kept: accepted.slice(0, 1), rejected: accepted.slice(1).map((file) => ({ file, reason: "count" as const })) }
}
