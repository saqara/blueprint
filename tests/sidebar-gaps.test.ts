// @vitest-environment happy-dom
import { act, createElement as e } from "react"
import { createRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { createApp, createSSRApp, h, nextTick } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { readFileSync } from "node:fs"
import { afterEach, describe, expect, it } from "vitest"
import * as RS from "../registry/react/ui/sidebar"
import * as VS from "../registry/vue/ui/sidebar"
import { AppShellHeader as RHeader } from "../registry/react/blocks/app-shell-header"
import VHeader from "../registry/vue/blocks/AppShellHeader.vue"

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
const cleanups: (() => unknown)[] = []
afterEach(async () => {
  for (const c of cleanups.splice(0)) await c()
  document.body.innerHTML = ""
})
const decode = (s: string) => s.replace(/&gt;/g, ">").replace(/&amp;/g, "&")

describe("active entry differs from hover", () => {
  const button = (html: string) => decode(html.match(/<(?:button|a)[^>]*data-active="true"[^>]*class="([^"]*)"|<(?:button|a)[^>]*class="([^"]*)"[^>]*data-active="true"/)!.slice(1).find(Boolean)!)
  it("react: red tint and text when active, neutral grey on hover", () => {
    const cls = RS.sidebarMenuButtonVariants()
    expect(cls).toContain("data-[active=true]:bg-primary/10")
    expect(cls).toContain("data-[active=true]:text-identity-text")
    expect(cls).not.toContain("data-[active=true]:bg-sidebar-accent")
    expect(cls).toContain("hover:bg-sidebar-accent")
  })
  it("vue: same classes", () => {
    const cls = VS.sidebarMenuButtonVariants()
    expect(cls).toContain("data-[active=true]:bg-primary/10")
    expect(cls).toContain("data-[active=true]:text-identity-text")
    expect(cls).not.toContain("data-[active=true]:bg-sidebar-accent")
  })
  it.each([["react"], ["vue"]])("%s app-shell-header tabs use the same active style", async (fw) => {
    const nav = [{ id: "a", label: "Mes entreprises" }, { id: "b", label: "Organisation" }]
    const html = fw === "react"
      ? renderToString(e(RHeader as any, { nav, activeId: "a" }, "x"))
      : await renderVue(createSSRApp({ render: () => h(VHeader as any, { nav, activeId: "a" }, { default: () => "x" }) }))
    const active = decode(html.match(/<(?:a|button)[^>]*aria-current="page"[^>]*class="([^"]*)"|<(?:a|button)[^>]*class="([^"]*)"[^>]*aria-current="page"/)!.slice(1).find(Boolean)!)
    expect(active).toContain("bg-primary/10")
    expect(active).toContain("text-identity-text")
    void button
  })
})

describe("badge in icon mode", () => {
  it.each(["registry/react/ui/sidebar.tsx", "registry/vue/ui/sidebar/SidebarMenuBadge.vue"])("%s turns into a dot instead of disappearing", (file) => {
    const src = readFileSync(file, "utf8")
    const badge = file.endsWith(".vue") ? src : src.slice(src.indexOf("function SidebarMenuBadge"), src.indexOf("function SidebarMenuSkeleton"))
    expect(badge).not.toContain("group-data-[collapsible=icon]:hidden")
    expect(badge).toContain("group-data-[collapsible=icon]:size-2")
  })
})

const ctrlB = () => {
  const ev = new KeyboardEvent("keydown", { key: "b", ctrlKey: true, bubbles: true, cancelable: true })
  window.dispatchEvent(ev)
  return ev.defaultPrevented
}

describe.each([
  ["react", async (p: Record<string, unknown>) => {
    const root = createRoot(document.body.appendChild(document.createElement("div")))
    await act(async () => root.render(e(RS.SidebarProvider, p as any, e(RS.Sidebar, null, "Nav"))))
    cleanups.push(() => act(async () => root.unmount()))
  }],
  ["vue", async (p: Record<string, unknown>) => {
    const app = createApp({ render: () => h(VS.SidebarProvider, p, () => h(VS.Sidebar, () => "Nav")) })
    app.mount(document.body.appendChild(document.createElement("div")))
    cleanups.push(() => app.unmount())
    await nextTick()
  }],
])("%s SidebarProvider", (_, mount) => {
  it("captures Cmd/Ctrl+B by default", async () => {
    await mount({})
    expect(ctrlB()).toBe(true)
  })
  it("leaves Cmd/Ctrl+B alone with keyboardShortcut={false} (rich-text editors)", async () => {
    await mount({ keyboardShortcut: false })
    expect(ctrlB()).toBe(false)
  })
  it("switches to the mobile sheet under mobileBreakpoint", async () => {
    await mount({ mobileBreakpoint: 5000 })
    expect(document.querySelector("[data-slot=sidebar][data-variant]")).toBeNull()
    for (const c of cleanups.splice(0)) await c()
    document.body.innerHTML = ""
    await mount({ mobileBreakpoint: 100 })
    expect(document.querySelector("[data-slot=sidebar][data-variant]")).not.toBeNull()
  })
})
