import { useEffect, useState } from "react"
import { Autocomplete, type AutocompleteOption } from "@/registry/react/ui/autocomplete"
import { Label } from "@/registry/react/ui/label"

const streets = ["rue de la République", "rue de la Paix", "avenue Jean Jaurès", "boulevard Vivier Merle"]
const cities = ["69002 Lyon", "75002 Paris", "69007 Lyon", "69003 Lyon"]

// Stands in for a geocoding API.
function search(query: string): Promise<AutocompleteOption[]> {
  const n = query.match(/^\d+/)?.[0] ?? "12"
  return new Promise((resolve) => setTimeout(() => resolve(
    streets.filter((s) => `${n} ${s}`.toLowerCase().includes(query.toLowerCase().replace(/^\d+\s*/, "").trim()) || !/[a-z]/i.test(query))
      .map((s, i) => ({ value: `${n}-${i}`, label: `${n} ${s}`, description: cities[i] }))), 400))
}

export default function AutocompleteDemo() {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<AutocompleteOption[]>([])
  const [loading, setLoading] = useState(false)
  const [chosen, setChosen] = useState<AutocompleteOption>()

  // Debounced search: the component only shows what the app passes back.
  useEffect(() => {
    if (query.trim().length < 3) { setSuggestions([]); return }
    setLoading(true)
    let live = true
    const timer = setTimeout(() => search(query).then((r) => { if (live) { setSuggestions(r); setLoading(false) } }), 250)
    return () => { live = false; clearTimeout(timer) }
  }, [query])

  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="adresse">Adresse du siège</Label>
      <Autocomplete id="adresse" placeholder="12 rue de la…" minChars={3} value={query} onValueChange={setQuery}
        suggestions={suggestions} loading={loading} onSelect={(o) => { setChosen(o); setQuery(o.label) }} />
      <p className="text-sm text-muted-foreground">{chosen ? `${chosen.label}, ${chosen.description}` : "Saisissez au moins 3 caractères."}</p>
    </div>
  )
}
