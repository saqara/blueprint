import { Progress } from "@/registry/react/ui/progress"

const scores = [
  { label: "Note qualité", value: 82, variant: "success" as const },
  { label: "Note RSE", value: 55, variant: "warning" as const },
  { label: "Documents à jour", value: 20, variant: "destructive" as const },
]

export default function ProgressDemo() {
  return (
    <div className="w-full max-w-sm space-y-4 text-sm">
      <div className="space-y-1">
        <p>Import : 1 250 / 3 000 lignes</p>
        <Progress value={42} />
      </div>
      {scores.map((s) => (
        <div key={s.label} className="space-y-1">
          <p className="flex justify-between"><span>{s.label}</span><span className="text-muted-foreground">{s.value} %</span></p>
          <Progress value={s.value} variant={s.variant} />
        </div>
      ))}
    </div>
  )
}
