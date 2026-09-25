import { createElement as e } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import * as R from "../registry/react/ui/pagination"
import * as V from "../registry/vue/ui/pagination"

// Saqara: pagination copy is French (visible labels and screen-reader text).
const english = /Previous|Next|More pages|Go to|aria-label="pagination"/

describe("pagination copy", () => {
  it("react renders French labels only", () => {
    const html = renderToString(e(R.Pagination, null, e(R.PaginationContent, null,
      e(R.PaginationItem, null, e(R.PaginationPrevious, { href: "#" })),
      e(R.PaginationItem, null, e(R.PaginationEllipsis)),
      e(R.PaginationItem, null, e(R.PaginationNext, { href: "#" })))))
    expect(html).toContain("Précédent")
    expect(html).toContain("Suivant")
    expect(html).toContain("Plus de pages")
    expect(html).not.toMatch(english)
  })
  it("vue renders French labels only", async () => {
    const html = await renderVue(createSSRApp({ render: () => h(V.Pagination, { total: 100, itemsPerPage: 10, defaultPage: 2 }, () =>
      h(V.PaginationContent, null, () => [h(V.PaginationPrevious), h(V.PaginationEllipsis, { index: 1 }), h(V.PaginationNext)])) }))
    expect(html).toContain("Précédent")
    expect(html).toContain("Suivant")
    expect(html).toContain("Plus de pages")
    expect(html).not.toMatch(english)
  })
})
