import { useState } from "react"
import { Suggestion, Suggestions } from "@/registry/react/ui/suggestion"

const suggestions = ["Top 10 des villes", "Fournisseurs inactifs depuis 6 mois", "Évolution des inscriptions en 2026", "Notes moyennes par catégorie"]

export default function SuggestionDemo() {
  const [picked, setPicked] = useState<string>()
  return (
    <div className="w-full max-w-xl space-y-3">
      <Suggestions>
        {suggestions.map((s) => <Suggestion key={s} suggestion={s} onClick={setPicked} />)}
      </Suggestions>
      <p className="text-sm text-muted-foreground">{picked ? `Question choisie : ${picked}` : "Choisissez une question."}</p>
    </div>
  )
}
