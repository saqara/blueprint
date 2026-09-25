import { EXAMPLES } from "../catalog"
import { Preview } from "../components/Preview"
import type { Fw } from "../lib/framework"
import { NotFound } from "./NotFound"

export function ExamplePage({ slug, fw }: { slug: string; fw: Fw }) {
  const example = EXAMPLES.find((e) => e.slug === slug)
  if (!example) return <NotFound />
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">{example.title}</h1>
        <p className="text-muted-foreground">{example.description}</p>
      </header>
      <Preview key={`${fw}-${slug}`} kind="examples" fw={fw} name={slug} framed />
    </article>
  )
}
