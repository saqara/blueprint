import { Agent, AgentContent, AgentHeader, AgentInstructions, AgentOutput, AgentTool, AgentTools } from "@/registry/react/ui/agent"

const runSql = {
  description: "Exécute une requête SQL en lecture sur BigQuery",
  inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
}

export default function AgentDemo() {
  return (
    <Agent className="max-w-xl">
      <AgentHeader name="Analyste fournisseurs" model="gemini-2.5-pro" />
      <AgentContent>
        <AgentInstructions>Réponds en français, cite la requête utilisée et ne modifie jamais les données.</AgentInstructions>
        <AgentTools type="single" collapsible>
          <AgentTool tool={runSql} value="run_sql" />
        </AgentTools>
        <AgentOutput schema={"{ reponse: string; requete: string }"} />
      </AgentContent>
    </Agent>
  )
}
