import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/react/ui/tabs"
import { demoFor } from "../demos"
import type { Fw } from "../lib/framework"
import { CodeBlock } from "./CodeBlock"
import { VueIsland } from "./VueIsland"

export function Preview({ kind, fw, name, framed = false }: { kind: "demos" | "examples"; fw: Fw; name: string; framed?: boolean }) {
  const demo = demoFor(kind, fw, name)
  if (!demo) return <p className="text-sm text-muted-foreground">Pas encore de démo pour ce framework.</p>
  const body = demo.fw === "react" ? <demo.Component /> : <VueIsland component={demo.Component} />
  return (
    <Tabs defaultValue="preview">
      <TabsList><TabsTrigger value="preview">Aperçu</TabsTrigger><TabsTrigger value="code">Code</TabsTrigger></TabsList>
      <TabsContent value="preview">
        {framed
          ? <div className="h-[720px] overflow-auto rounded-lg border [transform:translateZ(0)]">{body}</div>
          : <div className="flex min-h-48 items-center justify-center rounded-lg border p-8">{body}</div>}
      </TabsContent>
      <TabsContent value="code">
        <CodeBlock code={demo.source} lang={demo.fw === "react" ? "tsx" : "vue"} />
      </TabsContent>
    </Tabs>
  )
}
