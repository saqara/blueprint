import * as React from "react"
import { cn } from "cn"
import { Card, CardContent, CardDescription, CardHeader } from "@/registry/react/ui/card"

type StatCardProps = Omit<React.ComponentProps<typeof Card>, "children"> & {
  label: React.ReactNode
  value: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
}

function StatCard({ label, value, description, icon, className, ...props }: StatCardProps) {
  return (
    <Card data-slot="stat-card" className={cn("gap-2 py-4", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 px-4">
        <CardDescription>{label}</CardDescription>
        {icon && <span className="text-muted-foreground [&_svg]:size-4">{icon}</span>}
      </CardHeader>
      <CardContent className="px-4">
        <div className="font-heading text-2xl font-semibold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  )
}

export { StatCard }
