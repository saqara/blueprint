// What the registry must pass in consumer apps: the React Compiler rules of eslint-plugin-react-hooks v7.
import reactHooks from "eslint-plugin-react-hooks"
import tseslint from "typescript-eslint"

export default [
  {
    files: ["registry/react/**/*.{ts,tsx}"],
    languageOptions: { parser: tseslint.parser },
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
]
