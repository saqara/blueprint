import { Checkbox } from "@/registry/react/ui/checkbox"
import { Label } from "@/registry/react/ui/label"

export default function CheckboxDemo() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="checkbox-cgu" defaultChecked />
      <Label htmlFor="checkbox-cgu">J'accepte les conditions</Label>
    </div>
  )
}
