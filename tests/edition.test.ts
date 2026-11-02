import { describe, expect, it } from "vitest"
import edition from "../edition.json"
import { basePath, CURRENT, editionHref, registryUrl, siteUrl } from "../site/lib/edition"

describe("editions", () => {
  it("serves V1 at the root and V2 under /v2/", () => {
    expect(basePath("v1")).toBe("/blueprint/")
    expect(basePath("v2")).toBe("/blueprint/v2/")
    expect(registryUrl("vue", "v2")).toBe("https://saqara.github.io/blueprint/v2/r/vue/{name}.json")
    expect(siteUrl("v1")).toBe("https://saqara.github.io/blueprint/")
  })
  it("builds this branch as the edition edition.json names", () => {
    expect(CURRENT).toBe(edition.current)
    expect(siteUrl()).toBe(siteUrl(CURRENT))
  })
  it("opens the same page, framework and anchor in the other edition", () => {
    const here = { pathname: basePath() + "index.html", search: "?fw=vue", hash: "#/composants/button" }
    const other = CURRENT === "v1" ? "v2" : "v1"
    expect(editionHref(other, here)).toBe(`${basePath(other)}index.html?fw=vue#/composants/button`)
  })
})
