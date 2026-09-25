export type Fw = "react" | "vue"
export const FW_KEY = "blueprint-framework"

export function readFramework(search: string, stored: string | null): Fw {
  const fromUrl = new URLSearchParams(search).get("fw")
  if (fromUrl === "react" || fromUrl === "vue") return fromUrl
  return stored === "vue" ? "vue" : "react"
}
