import { createElement as e } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { PaginationLink, PaginationNext, PaginationPrevious } from "../registry/react/ui/pagination"

// Pagination held in state (no URL): links without href are buttons, disableable.
describe("react pagination without href", () => {
  it("renders buttons, disabled when asked", () => {
    expect(renderToString(e(PaginationLink, { onClick: () => {} }, "2"))).toMatch(/^<button[^>]*type="button"/)
    expect(renderToString(e(PaginationPrevious, { onClick: () => {}, disabled: true }))).toMatch(/^<button[^>]*disabled=""/)
    expect(renderToString(e(PaginationNext, { onClick: () => {} }))).toMatch(/^<button/)
  })
  it("keeps links with href, disabled through aria-disabled", () => {
    const html = renderToString(e(PaginationNext, { href: "?page=3", disabled: true }))
    expect(html).toMatch(/^<a[^>]*href="\?page=3"/)
    expect(html).toContain('aria-disabled="true"')
    expect(html).toContain('tabindex="-1"')
  })
})
