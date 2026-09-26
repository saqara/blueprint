import { DownloadIcon, PlusIcon } from "lucide-react"
import { Button } from "@/registry/react/ui/button"
import { PageHeader, SectionHeader } from "@/registry/react/ui/page-header"

export default function PageHeaderDemo() {
  return (
    <div className="grid w-full max-w-2xl gap-8">
      <PageHeader title="Mes entreprises" description="24 entreprises suivies par votre organisation."
        actions={<><Button variant="outline"><DownloadIcon />Exporter</Button><Button><PlusIcon />Ajouter</Button></>} />
      <SectionHeader title="Contacts" description="Personnes à joindre pour cette entreprise."
        actions={<Button variant="outline" size="sm">Ajouter un contact</Button>} />
    </div>
  )
}
