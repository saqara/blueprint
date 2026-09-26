// Saqara: French copy (tests/pagination.test.ts).
import * as React from "react"
import { cn } from "cn"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react"

import { buttonVariants, type Button } from "@/registry/react/ui/button"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
  disabled?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">

// Saqara: without `href` (pagination held in state) this is a <button>, natively disableable;
// with `href` it stays a link and `disabled` sets aria-disabled.
function PaginationLink({
  className,
  isActive,
  size = "icon",
  disabled = false,
  ...props
}: PaginationLinkProps) {
  const shared = {
    "aria-current": isActive ? ("page" as const) : undefined,
    "data-slot": "pagination-link",
    "data-active": isActive,
    className: cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className
    ),
  }
  if (props.href === undefined) {
    return <button type="button" disabled={disabled} {...shared} {...(props as React.ComponentProps<"button">)} />
  }
  return (
    <a
      {...shared}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : props.tabIndex}
      {...props}
      className={cn(shared.className, disabled && "pointer-events-none opacity-50")}
    />
  )
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Aller à la page précédente"
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">Précédent</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Aller à la page suivante"
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">Suivant</span>
      <ChevronRightIcon />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">Plus de pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
