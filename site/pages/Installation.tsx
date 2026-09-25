import type { Fw } from "../lib/framework"
import { CodeBlock } from "../components/CodeBlock"

export function Installation({ fw }: { fw: Fw }) {
  const cli = fw === "react" ? "shadcn" : "shadcn-vue"
  const registry = `https://saqara.github.io/blueprint/r/${fw}/{name}.json`
  return (
    <article className="space-y-6 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:text-muted-foreground">
      <h1 className="text-3xl font-semibold">Installation ({fw === "react" ? "React" : "Vue"})</h1>
      <p>Prérequis : Tailwind CSS v4 et <code>{cli} init</code> déjà exécuté dans l'app.</p>
      <h2>1. Déclarer le registry</h2>
      <p>Dans <code>components.json</code> :</p>
      <CodeBlock lang="json" code={JSON.stringify({ registries: { "@saqara": registry } }, null, 2)} />
      <h2>2. Installer le thème</h2>
      <CodeBlock lang="bash" code={`npx ${cli}@latest add @saqara/saqara-theme`} />
      <h2>3. Ajouter des composants</h2>
      <CodeBlock lang="bash" code={`npx ${cli}@latest add @saqara/button @saqara/data-table`} />
      <h2>Éléments racine</h2>
      <p>{fw === "react" ? "Placer <TooltipProvider> et <Toaster theme={…} /> une fois à la racine de l'app." : "Monter <Toaster /> une fois à la racine de l'app ; la feuille de style de vue-sonner est importée par le composant."}</p>
      <h2>Mettre à jour</h2>
      <p>Le code appartient à l'app : relancer <code>add</code> avec <code>--overwrite</code> et relire le diff.</p>
    </article>
  )
}
