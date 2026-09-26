import * as React from "react"
import { cn } from "cn"

type HeaderProps = Omit<React.ComponentProps<"div">, "title"> & {
  title: React.ReactNode
  description?: React.ReactNode
  /** Right-aligned; one primary action at most. */
  actions?: React.ReactNode
}

// Saqara: the one page / section header — title, optional line under it, actions on the right; wraps on mobile.
function Header({ level, title, description, actions, className, ...props }: HeaderProps & { level: 1 | 2 }) {
  const Heading = level === 1 ? "h1" : "h2"
  return (
    <div data-slot="page-header" data-level={level} className={cn("flex flex-wrap items-start justify-between gap-4", className)} {...props}>
      <div className="min-w-0">
        <Heading className={cn("font-semibold", level === 1 ? "text-2xl" : "text-lg")}>{title}</Heading>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div data-slot="page-header-actions" className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

function PageHeader(props: HeaderProps) {
  return <Header level={1} {...props} />
}

function SectionHeader(props: HeaderProps) {
  return <Header level={2} {...props} />
}

export { PageHeader, SectionHeader }
