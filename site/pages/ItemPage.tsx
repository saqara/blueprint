import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/registry/react/ui/breadcrumb"
import { Badge } from "@/registry/react/ui/badge"
import { BLOCKS, CATEGORIES, itemInfo, SAQARA_MADE } from "../catalog"
import { InstallCommand } from "../components/InstallCommand"
import { Preview } from "../components/Preview"
import type { Fw } from "../lib/framework"
import { NotFound } from "./NotFound"

export function ItemPage({ kind, name, fw }: { kind: "composants" | "blocs"; name: string; fw: Fw }) {
  const info = itemInfo(name)
  const category = CATEGORIES.find((c) => c.items.includes(name))
  const listed = kind === "blocs" ? BLOCKS.includes(name) : !!category
  if (!info || !listed) return <NotFound />
  const docs = fw === "react" ? `https://ui.shadcn.com/docs/components/${name}` : `https://www.shadcn-vue.com/docs/components/${name}`
  return (
    <article className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="#/">Blueprint</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>{kind === "blocs" ? "Blocs" : category!.label}</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{info.title}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-semibold">{info.title}</h1>
          {SAQARA_MADE.has(name) && <Badge variant="identity">Saqara</Badge>}
        </div>
        <p className="text-muted-foreground">{info.description.replace(/ \(Saqara\)\.?$/, ".")}</p>
        {!SAQARA_MADE.has(name) && <a className="text-sm text-primary underline-offset-4 hover:underline" href={docs} target="_blank" rel="noreferrer">Documentation officielle ({fw === "react" ? "shadcn/ui" : "shadcn-vue"}) ↗</a>}
      </header>
      <InstallCommand name={name} fw={fw} />
      <Preview key={`${fw}-${name}`} kind="demos" fw={fw} name={name} framed={kind === "blocs"} />
    </article>
  )
}
