import { existsSync, readdirSync } from "node:fs"
import { readManifest } from "./lib/manifest.ts"
import { exampleErrors, parityErrors } from "./lib/parity.ts"

const errors: string[] = parityErrors(readManifest("registry.react.json"), readManifest("registry.vue.json"), (fw, name) =>
  existsSync(`src/${fw}/demos/${name}.${fw === "react" ? "tsx" : "vue"}`),
)
const examples = (fw: "react" | "vue") =>
  readdirSync(`src/examples/${fw}`).filter((f) => f.endsWith(fw === "react" ? ".tsx" : ".vue")).map((f) => f.replace(/\.(tsx|vue)$/, ""))
errors.push(...exampleErrors(examples("react"), examples("vue")))
if (errors.length) {
  console.error(errors.join("\n"))
  process.exit(1)
}
console.log("parity ok")
