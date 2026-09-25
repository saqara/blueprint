export type Fw = "react" | "vue"
export const FW_KEY = "blueprint-framework"

export function readFramework(search: string, stored: string | null): Fw {
  const fromUrl = new URLSearchParams(search).get("fw")
  if (fromUrl === "react" || fromUrl === "vue") return fromUrl
  return stored === "vue" ? "vue" : "react"
}

// Sets ?fw= and keeps the rest of the URL, hash included (shareable links always carry the framework).
export function withFramework(href: string, fw: Fw): string {
  const url = new URL(href)
  url.searchParams.set("fw", fw)
  return url.toString()
}
