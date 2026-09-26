"use client"

import * as React from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/registry/react/ui/input-group"

type PasswordInputProps = Omit<React.ComponentProps<"input">, "type"> & {
  showLabel?: string
  hideLabel?: string
}

// Saqara: password or secret (API key…) with a reveal toggle; attributes go to the input.
function PasswordInput({ className, showLabel = "Afficher le mot de passe", hideLabel = "Masquer le mot de passe", ...props }: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false)
  return (
    <InputGroup className={className}>
      <InputGroupInput type={visible ? "text" : "password"} autoComplete="current-password" {...props} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton size="icon-xs" aria-label={visible ? hideLabel : showLabel} aria-pressed={visible}
          disabled={props.disabled} onClick={() => setVisible((v) => !v)}>
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

export { PasswordInput }
