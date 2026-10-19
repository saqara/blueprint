import { DatabaseIcon, SearchIcon } from "lucide-react"
import {
  ChainOfThought, ChainOfThoughtContent, ChainOfThoughtHeader, ChainOfThoughtSearchResult, ChainOfThoughtSearchResults, ChainOfThoughtStep,
} from "@/registry/react/ui/chain-of-thought"

export default function ChainOfThoughtDemo() {
  return (
    <ChainOfThought defaultOpen className="w-full max-w-xl">
      <ChainOfThoughtHeader />
      <ChainOfThoughtContent>
        <ChainOfThoughtStep icon={SearchIcon} label="Recherche des tables utiles">
          <ChainOfThoughtSearchResults>
            <ChainOfThoughtSearchResult>entreprises</ChainOfThoughtSearchResult>
            <ChainOfThoughtSearchResult>evaluations</ChainOfThoughtSearchResult>
          </ChainOfThoughtSearchResults>
        </ChainOfThoughtStep>
        <ChainOfThoughtStep icon={DatabaseIcon} label="Exécution de la requête" description="1 284 lignes lues" status="active" />
        <ChainOfThoughtStep label="Rédaction de la réponse" status="pending" />
      </ChainOfThoughtContent>
    </ChainOfThought>
  )
}
