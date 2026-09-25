import { useState } from "react"
import { toast } from "sonner"
import { FileDropzone, type FileRejection } from "@/registry/react/ui/file-dropzone"

const reasons = { type: "format non accepté", size: "fichier trop lourd (2 Mo max.)", count: "un seul fichier à la fois" }

export default function FileDropzoneDemo() {
  const [files, setFiles] = useState<File[]>([])
  const onReject = (rejections: FileRejection[]) =>
    rejections.forEach(({ file, reason }) => toast.error(`${file.name} : ${reasons[reason]}`))
  return (
    <FileDropzone className="max-w-md" accept="image/png,image/jpeg,image/webp,image/svg+xml" maxSize={2 * 1024 * 1024}
      files={files} onFilesChange={setFiles} onReject={onReject} label="Déposez votre logo (PNG, JPEG, WebP, SVG — 2 Mo max.)" />
  )
}
