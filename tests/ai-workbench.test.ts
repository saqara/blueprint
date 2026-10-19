import { createElement as e } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import * as RConfirm from "../registry/react/ui/confirmation"
import * as RContext from "../registry/react/ui/context"
import * as RTree from "../registry/react/ui/file-tree"
import { ModelSelectorLogo as RLogo } from "../registry/react/ui/model-selector"
import * as RStack from "../registry/react/ui/stack-trace"
import { Terminal as RTerminal, stripAnsi } from "../registry/react/ui/terminal"
import * as RTests from "../registry/react/ui/test-results"
import * as VConfirm from "../registry/vue/ui/confirmation"
import * as VContext from "../registry/vue/ui/context"
import * as VTree from "../registry/vue/ui/file-tree"
import { ModelSelectorLogo as VLogo } from "../registry/vue/ui/model-selector"
import * as VStack from "../registry/vue/ui/stack-trace"
import { Terminal as VTerminal } from "../registry/vue/ui/terminal"
import * as VTests from "../registry/vue/ui/test-results"

const vue = (render: () => unknown) => renderVue(createSSRApp({ render: render as never }))
type Fw = "react" | "vue"

const usage = { inputTokens: 42_300, outputTokens: 3_900 }
const context = (fw: Fw, costs?: object) =>
  fw === "react"
    ? renderToString(e(RContext.Context, { usedTokens: 48_000, maxTokens: 1_000_000, usage, costs },
        e(RContext.ContextTrigger), e(RContext.ContextContentHeader), e(RContext.ContextInputUsage), e(RContext.ContextContentFooter)))
    : vue(() => h(VContext.Context, { usedTokens: 48_000, maxTokens: 1_000_000, usage, costs }, () => [
        h(VContext.ContextTrigger), h(VContext.ContextContentHeader), h(VContext.ContextInputUsage), h(VContext.ContextContentFooter)]))

describe.each(["react", "vue"] as const)("%s context", (fw) => {
  it("names the trigger with the French percentage and labels rows in French", async () => {
    const html = await context(fw)
    expect(html).toMatch(/aria-label="Contexte utilisé : 4,8\s%"/)
    expect(html).toContain("Entrée")
  })
  it("shows the total cost only when the app gives it, formatted in French", async () => {
    expect(await context(fw)).not.toContain("Coût total")
    expect(await context(fw, { total: 0.11, input: 0.05 })).toMatch(/Coût total[\s\S]*0,11\s\$US/)
  })
})

const confirmation = (fw: Fw, state: string, approval?: object) => {
  const kids = (C: typeof RConfirm | typeof VConfirm) => [C.ConfirmationRequest, C.ConfirmationAccepted, C.ConfirmationRejected]
  const texts = ["Autoriser la requête ?", "Autorisée", "Refusée"]
  return fw === "react"
    ? renderToString(e(RConfirm.Confirmation, { state: state as RConfirm.ToolState, approval: approval as never },
        ...kids(RConfirm).map((K, i) => e(K as never, { key: i }, texts[i]))))
    : vue(() => h(VConfirm.Confirmation, { state, approval }, () => kids(VConfirm).map((K, i) => h(K as never, null, () => texts[i]))))
}

describe.each(["react", "vue"] as const)("%s confirmation", (fw) => {
  it("asks while approval is requested, then shows the decision", async () => {
    expect(await confirmation(fw, "approval-requested", { id: "1" })).toContain("Autoriser la requête ?")
    const done = await confirmation(fw, "approval-responded", { id: "1", approved: false })
    expect(done).toContain("Refusée")
    expect(done).not.toContain("Autorisée")
  })
  it("stays hidden while the tool input streams", async () => {
    expect(await confirmation(fw, "input-streaming", { id: "1" })).not.toContain("Autoriser")
  })
})

describe("terminal", () => {
  it("strips ANSI escapes", () => {
    expect(stripAnsi("\u001b[32m✔\u001b[0m ok \u001b[1;31mKO\u001b[0m")).toBe("✔ ok KO")
  })
  it.each([
    ["react", () => renderToString(e(RTerminal, { output: "\u001b[32mOK\u001b[0m", onClear: () => {} }))],
    ["vue", () => vue(() => h(VTerminal, { output: "\u001b[32mOK\u001b[0m", onClear: () => {} }))],
  ] as const)("%s shows plain text and names its buttons and output in French", async (_, render) => {
    const html = await render()
    expect(html).not.toContain("\u001b")
    expect(html).toContain('aria-label="Copier la sortie"')
    expect(html).toContain('aria-label="Effacer la sortie"')
    expect(html).toMatch(/aria-label="Sortie du terminal"/)
  })
})

const trace = "BigQueryError: Unrecognized name: villes\n    at run (/app/chat.ts:88:19)\n    at next (node:internal/process/task_queues:95:5)"
describe.each([
  ["react", () => renderToString(e(RStack.StackTrace, { trace, defaultOpen: true },
    e(RStack.StackTraceHeader, null, e(RStack.StackTraceError, null, e(RStack.StackTraceErrorType)), e(RStack.StackTraceActions, null, e(RStack.StackTraceCopyButton))),
    e(RStack.StackTraceContent, null, e(RStack.StackTraceFrames, { showInternalFrames: false }))))],
  ["vue", () => vue(() => h(VStack.StackTrace, { trace, defaultOpen: true }, () => [
    h(VStack.StackTraceHeader, null, () => [h(VStack.StackTraceError, null, () => h(VStack.StackTraceErrorType)), h(VStack.StackTraceActions, null, () => h(VStack.StackTraceCopyButton))]),
    h(VStack.StackTraceContent, null, () => h(VStack.StackTraceFrames, { showInternalFrames: false }))]))],
] as const)("%s stack-trace", (_, render) => {
  it("parses the error, keeps the header keyboard-reachable and names the copy button", async () => {
    const html = await render()
    expect(html).toContain("BigQueryError")
    expect(html).toMatch(/role="button"[^>]*tabindex="0"|tabindex="0"[^>]*role="button"/)
    expect(html).toContain('aria-label="Copier la trace"')
    expect(html).toContain("/app/chat.ts")
    expect(html).not.toContain("task_queues")
  })
})

describe.each([
  ["react", () => renderToString(e(RTests.TestResults, { summary: { passed: 3, failed: 1, skipped: 0, total: 4, duration: 2340 } },
    e(RTests.TestResultsHeader, null, e(RTests.TestResultsSummary), e(RTests.TestResultsDuration)),
    e(RTests.Test, { name: "Aucun SIRET en double", status: "failed" })))],
  ["vue", () => vue(() => h(VTests.TestResults, { summary: { passed: 3, failed: 1, skipped: 0, total: 4, duration: 2340 } }, () => [
    h(VTests.TestResultsHeader, null, () => [h(VTests.TestResultsSummary), h(VTests.TestResultsDuration)]),
    h(VTests.Test, { name: "Aucun SIRET en double", status: "failed" })]))],
] as const)("%s test-results", (_, render) => {
  it("summarises in French, with DS status tokens and a spoken status", async () => {
    const html = await render()
    expect(html).toMatch(/3(<!--[^>]*-->)? réussi\(s\)/)
    expect(html).toMatch(/1(<!--[^>]*-->)? échoué\(s\)/)
    expect(html).toContain("2,34 s")
    expect(html).toContain("text-destructive-text")
    expect(html).toMatch(/class="sr-only"[^>]*>Échoué</)
    expect(html).not.toMatch(/(green|red|yellow|blue)-\d/)
  })
})

describe.each([
  ["react", () => renderToString(e(RTree.FileTree, { defaultExpanded: new Set(["exports"]), selectedPath: "exports/a.csv" },
    e(RTree.FileTreeFolder, { path: "exports", name: "exports" }, e(RTree.FileTreeFile, { path: "exports/a.csv", name: "a.csv" }))))],
  ["vue", () => vue(() => h(VTree.FileTree, { defaultExpanded: new Set(["exports"]), selectedPath: "exports/a.csv" }, () =>
    h(VTree.FileTreeFolder, { path: "exports", name: "exports" }, () => h(VTree.FileTreeFile, { path: "exports/a.csv", name: "a.csv" }))))],
] as const)("%s file-tree", (_, render) => {
  it("exposes the tree state and keeps folder colours on DS tokens", async () => {
    const html = await render()
    expect(html).toMatch(/role="treeitem"[^>]*aria-expanded="true"|aria-expanded="true"[^>]*role="treeitem"/)
    expect(html).toMatch(/aria-selected="true"[^>]*role="treeitem"|role="treeitem"[^>]*aria-selected="true"/)
    expect(html).toContain('role="group"')
    expect(html).not.toContain("text-blue-500")
  })
})

describe.each([
  ["react", () => renderToString(e(RLogo, { provider: "google" }))],
  ["vue", () => vue(() => h(VLogo, { provider: "google" }))],
] as const)("%s model-selector logo", (_, render) => {
  it("is decorative next to the model name", async () => {
    expect(await render()).toMatch(/<img alt(="")? /)
  })
})

describe("react file-tree chevron", () => {
  it("names the expand button with the folder", () => {
    const html = renderToString(e(RTree.FileTree, null, e(RTree.FileTreeFolder, { path: "x", name: "exports" })))
    expect(html).toContain('aria-label="Déplier exports"')
  })
})
