import { existsSync } from "node:fs"
import { readManifest } from "./lib/manifest.ts"
import { parityErrors } from "./lib/parity.ts"

const errors = parityErrors(readManifest("registry.react.json"), readManifest("registry.vue.json"), (fw, name) =>
  existsSync(`src/${fw}/demos/${name}.${fw === "react" ? "tsx" : "vue"}`),
)
if (errors.length) {
  console.error(errors.join("\n"))
  process.exit(1)
}
console.log("parity ok")
