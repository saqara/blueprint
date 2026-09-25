import { Slider } from "@/registry/react/ui/slider"

export default function SliderDemo() {
  return (
    <div className="max-w-sm space-y-2 text-sm">
      <p>Note qualité minimale</p>
      <Slider defaultValue={[8, 16]} min={0} max={20} step={1} />
    </div>
  )
}
