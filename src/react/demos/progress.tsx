import { Progress } from "@/registry/react/ui/progress"

export default function ProgressDemo() {
  return (
    <div className="max-w-sm space-y-1 text-sm">
      <p>Import : 1 250 / 3 000 lignes</p>
      <Progress value={42} />
    </div>
  )
}
