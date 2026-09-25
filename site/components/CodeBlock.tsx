import { useEffect, useState } from "react"

// Shiki (core + the 6 languages the docs use) is loaded on demand so the first paint stays light. Sources are our own files (trusted HTML).
export function CodeBlock({ code, lang }: { code: string; lang: "tsx" | "vue" | "bash" | "json" | "css" | "markdown" }) {
  const [html, setHtml] = useState<string>()
  useEffect(() => {
    let alive = true
    import("../lib/highlighter")
      .then(({ getHighlighter }) => getHighlighter())
      .then((h) => h.codeToHtml(code.trimEnd(), { lang, themes: { light: "github-light", dark: "github-dark" } }))
      .then((out) => { if (alive) setHtml(out) })
    return () => { alive = false }
  }, [code, lang])
  return html
    ? <div className={`max-h-[600px] overflow-auto rounded-lg border text-sm ${lang === "markdown" ? "[&_pre]:whitespace-pre-wrap" : ""}`} dangerouslySetInnerHTML={{ __html: html }} />
    : <pre className="max-h-[600px] overflow-auto rounded-lg border p-4 text-sm"><code>{code}</code></pre>
}
