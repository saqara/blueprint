import { Input } from "@/registry/react/ui/input"
import { Label } from "@/registry/react/ui/label"

export default function LabelDemo() {
  return (
    <div className="grid max-w-sm gap-2">
      <Label htmlFor="label-email">E-mail</Label>
      <Input id="label-email" type="email" />
    </div>
  )
}
