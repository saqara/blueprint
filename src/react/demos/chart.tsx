import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/registry/react/ui/chart"

const data = [
  { month: "Avr.", qualite: 14, rse: 12 },
  { month: "Mai", qualite: 15, rse: 12 },
  { month: "Juin", qualite: 15, rse: 13 },
  { month: "Juil.", qualite: 16, rse: 13 },
  { month: "Août", qualite: 16, rse: 14 },
  { month: "Sept.", qualite: 17, rse: 14 },
]
const config = {
  qualite: { label: "Note qualité", color: "var(--chart-1)" },
  rse: { label: "Note RSE", color: "var(--chart-2)" },
} satisfies ChartConfig

export default function ChartDemo() {
  return (
    <ChartContainer config={config} className="h-64 w-full max-w-2xl">
      <LineChart data={data} margin={{ left: 0, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis domain={[0, 20]} tickLine={false} axisLine={false} width={28} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line dataKey="qualite" type="monotone" stroke="var(--color-qualite)" strokeWidth={2} dot={false} />
        <Line dataKey="rse" type="monotone" stroke="var(--color-rse)" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  )
}
