import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/react/ui/tabs"

export default function TabsDemo() {
  return (
    <Tabs defaultValue="todo" className="max-w-md">
      <TabsList>
        <TabsTrigger value="todo">À traiter</TabsTrigger>
        <TabsTrigger value="done">Traitées</TabsTrigger>
      </TabsList>
      <TabsContent value="todo" className="text-sm">3 demandes RSE en attente.</TabsContent>
      <TabsContent value="done" className="text-sm">12 demandes traitées ce mois-ci.</TabsContent>
    </Tabs>
  )
}
