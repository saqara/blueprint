import { Slider } from "@/registry/react/ui/slider"

const bands = [{ value: 6, label: "6" }, { value: 13, label: "13" }]

export default function SliderDemo() {
  return (
    <div className="w-full max-w-sm space-y-2 text-sm">
      <p>Note qualité minimale</p>
      <Slider defaultValue={[8, 16]} min={0} max={20} step={1} thumbLabels={["Note minimale", "Note maximale"]} marks={bands} />
    </div>
  )
}
