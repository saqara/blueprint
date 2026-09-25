<script setup lang="ts">
import { Field, FieldDescription, FieldError, FieldLabel } from "@/registry/vue/ui/field"
import { Input } from "@/registry/vue/ui/input"
</script>

<template>
  <Field class="max-w-sm" data-invalid="true">
    <FieldLabel for="field-siren">SIREN</FieldLabel>
    <Input id="field-siren" aria-invalid="true" default-value="12345" />
    <FieldDescription>9 chiffres, sans espace.</FieldDescription>
    <FieldError>Le SIREN doit contenir 9 chiffres.</FieldError>
  </Field>
</template>
