import { Label } from "@/registry/react/ui/label"
import { RadioGroup, RadioGroupItem } from "@/registry/react/ui/radio-group"

export default function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="conforme">
      {["conforme", "partiel", "non conforme"].map((v) => (
        <div key={v} className="flex items-center gap-2">
          <RadioGroupItem value={v} id={`radio-${v}`} />
          <Label htmlFor={`radio-${v}`}>{v}</Label>
        </div>
      ))}
    </RadioGroup>
  )
}
