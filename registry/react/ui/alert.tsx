import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { XIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/registry/react/ui/button"

const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current has-data-[slot=alert-action]:grid-cols-[0_1fr_auto] has-[>svg]:has-data-[slot=alert-action]:grid-cols-[calc(var(--spacing)*4)_1fr_auto]",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 [&>svg]:text-current",
        success: "border-success/50 bg-success/10 text-foreground [&>svg]:text-success",
        warning: "border-warning/50 bg-warning/10 text-foreground [&>svg]:text-warning",
        info: "border-info/50 bg-info/10 text-foreground [&>svg]:text-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        // Saqara: no line-clamp — long French titles wrap instead of being cut off (opt in with className="line-clamp-1").
        "col-start-2 min-h-4 font-medium tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-1 text-sm text-muted-foreground [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

// Saqara: action slot (third column, top right) and its most common use, a close button.
function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-action" className={cn("col-start-3 row-start-1 -my-0.5 flex items-center gap-1 self-start justify-self-end", className)} {...props} />
}

function AlertClose({ label = "Fermer", className, ...props }: Omit<React.ComponentProps<typeof Button>, "children"> & { label?: string }) {
  return (
    <AlertAction>
      <Button type="button" variant="ghost" size="icon-sm" aria-label={label} className={cn("-mr-2 size-6 text-current opacity-70 hover:opacity-100", className)} {...props}>
        <XIcon />
      </Button>
    </AlertAction>
  )
}

export { Alert, AlertAction, AlertClose, AlertTitle, AlertDescription, alertVariants }
