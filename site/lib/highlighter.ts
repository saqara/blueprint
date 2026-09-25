import { createHighlighterCore, type HighlighterCore } from "shiki/core"
import { createJavaScriptRegexEngine } from "shiki/engine/javascript"

// Only the languages and themes the docs use, with the JS regex engine (no wasm): a small, lazy chunk.
let highlighter: Promise<HighlighterCore> | undefined

export function getHighlighter() {
  highlighter ??= createHighlighterCore({
    themes: [import("@shikijs/themes/github-light"), import("@shikijs/themes/github-dark")],
    langs: [
      import("@shikijs/langs/tsx"),
      import("@shikijs/langs/vue"),
      import("@shikijs/langs/bash"),
      import("@shikijs/langs/json"),
      import("@shikijs/langs/css"),
      import("@shikijs/langs/markdown"),
    ],
    engine: createJavaScriptRegexEngine(),
  })
  return highlighter
}
