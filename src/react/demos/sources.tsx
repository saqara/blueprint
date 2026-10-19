import { Source, Sources, SourcesContent, SourcesTrigger } from "@/registry/react/ui/sources"

const sources = [
  { href: "https://www.insee.fr/fr/statistiques", title: "Insee — statistiques des entreprises" },
  { href: "https://annuaire-entreprises.data.gouv.fr", title: "Annuaire des entreprises" },
]

export default function SourcesDemo() {
  return (
    <Sources className="w-full max-w-xl">
      <SourcesTrigger count={sources.length} />
      <SourcesContent>
        {sources.map((s) => <Source key={s.href} href={s.href} title={s.title} />)}
      </SourcesContent>
    </Sources>
  )
}
