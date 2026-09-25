import { useEffect, useState } from "react"
import { Skeleton } from "@/registry/react/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/react/ui/tabs"
import { loadDemo, type Demo } from "../demos"
import type { Fw } from "../lib/framework"
import { CodeBlock } from "./CodeBlock"
import { VueIsland } from "./VueIsland"

export function Preview({ kind, fw, name, framed = false }: { kind: "demos" | "examples"; fw: Fw; name: string; framed?: boolean }) {
  // undefined = loading, null = no demo for this framework
  const [demo, setDemo] = useState<Demo | null>()
  useEffect(() => {
    let alive = true
    setDemo(undefined)
    loadDemo(kind, fw, name).then((d) => { if (alive) setDemo(d ?? null) })
    return () => { alive = false }
  }, [kind, fw, name])
  if (demo === undefined) return <Skeleton className={framed ? "h-[720px] w-full" : "h-48 w-full"} />
  if (demo === null) return <p className="text-sm text-muted-foreground">Pas encore de démo pour ce framework.</p>
  const body = demo.fw === "react" ? <demo.Component /> : <VueIsland component={demo.Component} />
  return (
    <Tabs defaultValue="preview">
      <TabsList><TabsTrigger value="preview">Aperçu</TabsTrigger><TabsTrigger value="code">Code</TabsTrigger></TabsList>
      <TabsContent value="preview">
        {framed
          ? <div className="h-[720px] overflow-auto rounded-lg border [transform:translateZ(0)]">{body}</div>
          : (
              // Every demo is centered: demos with a max-w-* fill up to it, the others shrink to their content.
              // (Vue islands are display:contents, so their root is a flex item here too.)
              <div className="flex min-h-48 items-center justify-center rounded-lg border p-8">
                <div className="flex w-full max-w-3xl flex-col items-center [&>[class*=max-w-]]:w-full [&>.contents>[class*=max-w-]]:w-full">{body}</div>
              </div>
            )}
      </TabsContent>
      <TabsContent value="code">
        <CodeBlock code={demo.source} lang={demo.fw === "react" ? "tsx" : "vue"} />
      </TabsContent>
    </Tabs>
  )
}
