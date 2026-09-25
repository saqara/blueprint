import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import * as R from "../registry/react/ui/file-dropzone"
import * as V from "../registry/vue/ui/file-dropzone"

const file = (name: string, type: string, size = 10) => new File([new Uint8Array(size)], name, { type })
const xlsx = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

describe.each([["react", R], ["vue", V]] as const)("%s file-dropzone", (fw, m) => {
  it("matches extensions case-insensitively, wildcards and exact MIME types", () => {
    expect(m.matchesAccept({ name: "IMPORT.XLSX", type: xlsx }, ".xlsx")).toBe(true)
    expect(m.matchesAccept({ name: "logo.png", type: "image/png" }, "image/*")).toBe(true)
    expect(m.matchesAccept({ name: "logo.svg", type: "image/svg+xml" }, "image/png, image/svg+xml")).toBe(true)
    expect(m.matchesAccept({ name: "notes.txt", type: "text/plain" }, ".xlsx,image/*")).toBe(false)
    expect(m.matchesAccept({ name: "anything.bin", type: "" }, undefined)).toBe(true)
  })
  it("accepts everything with */* or *", () => {
    expect(m.matchesAccept({ name: "a.bin", type: "application/octet-stream" }, "*/*")).toBe(true)
    expect(m.matchesAccept({ name: "a.bin", type: "" }, "*")).toBe(true)
  })
  it("keeps one file in single mode and reports the others with reason count", () => {
    const [a, b, c] = [file("a.png", "image/png"), file("b.png", "image/png"), file("c.png", "image/png")]
    expect(m.limitFiles([a, b, c], false)).toEqual({ kept: [a], rejected: [{ file: b, reason: "count" }, { file: c, reason: "count" }] })
    expect(m.limitFiles([a, b], true)).toEqual({ kept: [a, b], rejected: [] })
  })
  it("partitions files by type first, then size", () => {
    const ok = file("logo.png", "image/png", 100)
    const big = file("photo.jpg", "image/jpeg", 3000)
    const wrong = file("cv.pdf", "application/pdf", 100)
    const { accepted, rejected } = m.partitionFiles([ok, big, wrong], { accept: "image/*", maxSize: 2000 })
    expect(accepted).toEqual([ok])
    expect(rejected).toEqual([{ file: big, reason: "size" }, { file: wrong, reason: "type" }])
  })
  it("renders the label and the chosen files", async () => {
    const files = [file("fournisseurs.xlsx", xlsx)]
    const html = fw === "react"
      ? renderToString(createElement(R.FileDropzone, { files, onFilesChange: () => {} }))
      : await renderVue(createSSRApp({ render: () => h(V.FileDropzone, { files }) }))
    expect(html).toContain("Glissez un fichier ici ou cliquez pour parcourir")
    expect(html).toContain("fournisseurs.xlsx")
  })
})
