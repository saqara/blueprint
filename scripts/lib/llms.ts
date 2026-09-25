import type { Manifest } from "./manifest.ts"

type Input = {
  react: Manifest
  vue: Manifest
  categories: { label: string; items: string[] }[]
  blocks: string[]
  site: string
}

// llms.txt (https://llmstxt.org): a Markdown index that coding assistants can read to use Blueprint correctly.
export function llmsTxt({ react, categories, blocks, site }: Input): string {
  const describe = (name: string) => (react.items.find((i) => i.name === name)?.description as string | undefined) ?? ""
  // Links point to the registry JSON (real source + dependencies); SPA doc URLs are useless to a fetcher.
  const line = (name: string, _section: "composants" | "blocs") => `- [@saqara/${name}](${site}r/react/${name}.json): ${describe(name)}`
  const registries = (fw: "react" | "vue") => JSON.stringify({ registries: { "@saqara": `${site}r/${fw}/{name}.json` } }, null, 2)

  return [
    "# Saqara Blueprint",
    "",
    "> Design system des applications Saqara : un registry shadcn/ui (React) et shadcn-vue (Vue) aux couleurs Saqara. La CLI copie le code des composants dans l'app, qui en devient propriétaire. Chaque composant existe en React et en Vue avec la même API.",
    "",
    "## Installation",
    "",
    "Prérequis : Tailwind CSS v4 et `shadcn init` (React) ou `shadcn-vue init` (Vue). Déclarer le registry dans `components.json` :",
    "",
    "React :",
    "```json",
    registries("react"),
    "```",
    "",
    "Vue :",
    "```json",
    registries("vue"),
    "```",
    "",
    "Installer le thème, puis les composants :",
    "",
    "```bash",
    "npx shadcn@latest add @saqara/saqara-theme",
    "npx shadcn-vue@latest add @saqara/saqara-theme",
    "npx shadcn@latest add @saqara/button @saqara/data-table",
    "```",
    "",
    "## Règles",
    "",
    "- Utiliser un composant @saqara existant plutôt que d'en écrire un nouveau.",
    "- Couleurs : uniquement les tokens (`bg-primary`, `text-muted-foreground`, `bg-success`…), jamais de valeur hex.",
    "- Textes d'interface en français.",
    "- React : placer `<TooltipProvider>` et `<Toaster />` une fois à la racine. Vue : `<Toaster />` une fois à la racine.",
    "- `data-table` : le tri est contrôlé par la page (`sorting` + `onSortingChange`, Vue `v-model:sorting`).",
    "",
    ...categories.flatMap((c) => [`## ${c.label}`, "", ...c.items.map((name) => line(name, "composants")), ""]),
    "## Blocs",
    "",
    ...blocks.map((name) => line(name, "blocs")),
    "",
    "## Optional",
    "",
    `- [Documentation](${site}): aperçus, code et installation de chaque composant.`,
    `- [Thème et tokens](${site}#/demarrer/tokens): palette clair / sombre et contrastes.`,
    "",
  ].join("\n")
}
