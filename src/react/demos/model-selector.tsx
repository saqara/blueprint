import { CheckIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/registry/react/ui/button"
import {
  ModelSelector, ModelSelectorContent, ModelSelectorEmpty, ModelSelectorGroup, ModelSelectorInput, ModelSelectorItem, ModelSelectorList,
  ModelSelectorName, ModelSelectorTrigger,
} from "@/registry/react/ui/model-selector"

const models = [
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", hint: "Analyses complexes" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", hint: "Rapide, usage courant" },
  { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite", hint: "Questions simples" },
]

export default function ModelSelectorDemo() {
  const [open, setOpen] = useState(false)
  const [model, setModel] = useState(models[1])
  return (
    <ModelSelector open={open} onOpenChange={setOpen}>
      <ModelSelectorTrigger asChild>
        <Button variant="outline">Modèle : {model.name}</Button>
      </ModelSelectorTrigger>
      <ModelSelectorContent>
        <ModelSelectorInput placeholder="Rechercher un modèle…" />
        <ModelSelectorList>
          <ModelSelectorEmpty>Aucun modèle trouvé.</ModelSelectorEmpty>
          <ModelSelectorGroup heading="Google">
            {models.map((m) => (
              <ModelSelectorItem key={m.id} value={m.name} onSelect={() => { setModel(m); setOpen(false) }}>
                <ModelSelectorName>{m.name}</ModelSelectorName>
                <span className="text-xs text-muted-foreground">{m.hint}</span>
                {m.id === model.id && <CheckIcon className="size-4" aria-label="Sélectionné" />}
              </ModelSelectorItem>
            ))}
          </ModelSelectorGroup>
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  )
}
