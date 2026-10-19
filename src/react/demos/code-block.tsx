import { CodeBlock, CodeBlockActions, CodeBlockCopyButton, CodeBlockFilename, CodeBlockHeader, CodeBlockTitle } from "@/registry/react/ui/code-block"

const code = `SELECT ville, COUNT(*) AS fournisseurs
FROM entreprises
WHERE statut = 'actif'
GROUP BY ville
ORDER BY fournisseurs DESC
LIMIT 10;`

export default function CodeBlockDemo() {
  return (
    <CodeBlock code={code} language="sql" showLineNumbers>
      <CodeBlockHeader>
        <CodeBlockTitle><CodeBlockFilename>top-villes.sql</CodeBlockFilename></CodeBlockTitle>
        <CodeBlockActions><CodeBlockCopyButton /></CodeBlockActions>
      </CodeBlockHeader>
    </CodeBlock>
  )
}
