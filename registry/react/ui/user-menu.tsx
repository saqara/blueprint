import * as React from "react"
import { LogOutIcon } from "lucide-react"
import { cn } from "cn"
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/react/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/registry/react/ui/dropdown-menu"

export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return "?"
  const letters = words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[words.length - 1][0]
  return letters.toUpperCase()
}

type UserMenuProps = {
  name: string
  email?: string
  avatarUrl?: string
  onSignOut?: () => void
  signOutLabel?: string
  compact?: boolean
  children?: React.ReactNode
  className?: string
}

function UserMenu({ name, email, avatarUrl, onSignOut, signOutLabel = "Se déconnecter", compact = false, children, className }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger data-slot="user-menu" aria-label={name}
        className={cn("flex items-center gap-2 rounded-md p-1 text-left text-sm outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50", className)}>
        <Avatar className="size-8">
          {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
          <AvatarFallback>{initials(name)}</AvatarFallback>
        </Avatar>
        {!compact && (
          <span className="grid leading-tight">
            <span className="truncate font-medium">{name}</span>
            {email && <span className="truncate text-xs text-muted-foreground">{email}</span>}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel className="grid font-normal">
          <span className="font-medium">{name}</span>
          {email && <span className="text-xs text-muted-foreground">{email}</span>}
        </DropdownMenuLabel>
        {children && (<><DropdownMenuSeparator />{children}</>)}
        {onSignOut && (<><DropdownMenuSeparator /><DropdownMenuItem onSelect={onSignOut}><LogOutIcon />{signOutLabel}</DropdownMenuItem></>)}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { UserMenu }
