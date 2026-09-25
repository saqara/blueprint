import { Avatar, AvatarFallback } from "@/registry/react/ui/avatar"

export default function AvatarDemo() {
  return (
    <div className="flex gap-2">
      <Avatar><AvatarFallback>CM</AvatarFallback></Avatar>
      <Avatar><AvatarFallback>BS</AvatarFallback></Avatar>
    </div>
  )
}
