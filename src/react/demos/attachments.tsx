import { useState } from "react"
import { Attachment, AttachmentEmpty, AttachmentInfo, AttachmentPreview, AttachmentRemove, Attachments, type AttachmentData } from "@/registry/react/ui/attachments"

const initial: AttachmentData[] = [
  { id: "1", type: "file", mediaType: "text/csv", filename: "fournisseurs-lyon.csv", url: "#" },
  { id: "2", type: "file", mediaType: "application/pdf", filename: "contrat-cadre-2026.pdf", url: "#" },
  { id: "3", type: "source-document", sourceId: "kbis", mediaType: "text/html", title: "Extrait Kbis – Acme SAS" },
]

export default function AttachmentsDemo() {
  const [files, setFiles] = useState(initial)
  return (
    <div className="w-full max-w-md space-y-6">
      <Attachments variant="inline">
        {files.map((file) => (
          <Attachment key={file.id} data={file} onRemove={() => setFiles(files.filter((f) => f.id !== file.id))}>
            <AttachmentPreview />
            <AttachmentInfo />
            <AttachmentRemove />
          </Attachment>
        ))}
      </Attachments>
      <Attachments variant="list">
        {files.length ? files.map((file) => (
          <Attachment key={file.id} data={file}>
            <AttachmentPreview />
            <AttachmentInfo showMediaType />
          </Attachment>
        )) : <AttachmentEmpty />}
      </Attachments>
    </div>
  )
}
