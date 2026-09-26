import { CodeBlock } from "../components/CodeBlock"
import type { Fw } from "../lib/framework"

const RULES = `## Design system : Saqara Blueprint

- Les composants d'interface viennent du registry \`@saqara\` (doc : https://saqara.github.io/blueprint/, index pour IA : https://saqara.github.io/blueprint/llms.txt).
- Avant d'écrire un composant, vérifier qu'il n'existe pas déjà dans Blueprint ; l'installer avec la CLI plutôt que le recopier.
- Couleurs : uniquement les tokens du thème (\`bg-primary\`, \`text-muted-foreground\`, \`bg-success\`…), jamais de hex.
- Texte coloré (statuts, scores) : \`text-success-text\`, \`text-warning-text\`, \`text-info-text\`, \`text-identity-text\`, \`text-destructive-text\` — lisibles sur le fond, la carte et la teinte \`bg-X/10\`. Jamais \`text-success\` ou \`text-warning\` pour du texte : ces tokens servent aux fonds et aux icônes.
- Textes d'interface en français.
- \`select\` : aucun item à valeur vide (Radix l'interdit). Pour « Tous », une valeur sentinelle (\`"all"\`) que l'app traduit ; pour revenir au placeholder, \`value=""\`.
- Tout contrôle sans \`<Label>\` visible (\`SelectTrigger\`, \`Switch\`, \`Checkbox\`, \`multi-select\` via \`triggerProps\`) reçoit un \`aria-label\`.
- Formulaire verrouillé (« Modifier » pour éditer) : \`readOnly\` sur \`input\` / \`textarea\` / \`SelectTrigger\`, pas \`disabled\` (\`disabled\` = indisponible, valeur atténuée).
- Champ obligatoire : \`<FieldLabel required>\` pour l'astérisque, et \`required\` sur le contrôle lui-même.
- \`data-table\` (React) : définir \`columns\` hors du composant ou avec \`useMemo\` : une fonction \`cell\` recréée à chaque rendu remonte la cellule (focus et état perdus). L'état vivant lu par une cellule (« Copié ! »…) passe par la prop \`meta\` de \`DataTable\` et se lit dans \`table.options.meta\`.
- Ne pas modifier les composants de \`components/ui\` pour un besoin local : composer autour.`

export function Ai({ fw }: { fw: Fw }) {
  const cli = fw === "react" ? "shadcn" : "shadcn-vue"
  const llms = `${location.origin}${import.meta.env.BASE_URL}llms.txt`
  return (
    <article className="space-y-6 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:text-muted-foreground">
      <h1 className="text-3xl font-semibold">Utiliser avec une IA</h1>
      <p>
        Les assistants de code (Claude Code, Cursor, Copilot, Codex…) produisent du code conforme à Blueprint s'ils connaissent son catalogue.
        Trois moyens, du plus simple au plus intégré.
      </p>

      <h2>1. llms.txt</h2>
      <p>
        Un index Markdown de tous les composants, blocs, règles et commandes d'installation, régénéré à chaque publication :{" "}
        <a className="text-primary underline-offset-4 hover:underline" href={llms} target="_blank" rel="noreferrer">llms.txt</a>.
        Le donner en contexte à l'assistant (URL ou fichier).
      </p>

      <h2>2. Serveur MCP</h2>
      <p>
        La CLI {cli} fournit un serveur MCP qui lit les registries déclarés dans <code>components.json</code> : une fois <code>@saqara</code> déclaré
        (voir <a className="text-primary underline-offset-4 hover:underline" href="#/demarrer/installation">Installation</a>), l'assistant peut chercher,
        afficher et installer les composants Blueprint lui-même.
      </p>
      <CodeBlock lang="bash" code={`npx ${cli}@latest mcp init --client claude\n# autres clients : cursor, vscode, codex, opencode`} />

      <h2>3. Consignes du projet</h2>
      <p>À coller dans le <code>CLAUDE.md</code>, les règles de l'éditeur ou le README de l'app :</p>
      <CodeBlock lang="markdown" code={RULES} />
    </article>
  )
}
