import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/registry/react/ui/tool"

const input = { query: "SELECT ville, COUNT(*) FROM entreprises GROUP BY ville LIMIT 3" }
const output = [{ ville: "Lyon", total: 412 }, { ville: "Paris", total: 389 }, { ville: "Lille", total: 201 }]

export default function ToolDemo() {
  return (
    <div className="w-full max-w-xl">
      <Tool defaultOpen>
        <ToolHeader type="tool-run_sql" title="Requête BigQuery" state="output-available" />
        <ToolContent>
          <ToolInput input={input} />
          <ToolOutput output={output} errorText={undefined} />
        </ToolContent>
      </Tool>
      <Tool>
        <ToolHeader type="tool-run_sql" title="Requête BigQuery" state="output-error" />
        <ToolContent>
          <ToolOutput output={undefined} errorText="Table « fournisseur » introuvable." />
        </ToolContent>
      </Tool>
    </div>
  )
}
