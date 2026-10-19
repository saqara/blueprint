import { useState } from "react"
import { Terminal } from "@/registry/react/ui/terminal"

// ANSI colours from the CLI are stripped: the terminal shows (and copies) plain text.
const LOG = "$ bq query --use_legacy_sql=false < top-villes.sql\n\u001b[32m✔\u001b[0m Requête terminée en 1,8 s (2,1 Go analysés)\n\nville   fournisseurs\nLyon    412\nParis   389\nLille   201\n"

export default function TerminalDemo() {
  const [output, setOutput] = useState(LOG)
  return <Terminal className="w-full max-w-2xl" output={output} onClear={() => setOutput("")} />
}
