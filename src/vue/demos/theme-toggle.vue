<script setup lang="ts">
import { ref, watch } from "vue"
import { ThemeToggle } from "@/registry/vue/ui/theme-toggle"

const theme = ref<"light" | "dark">(typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light")
watch(theme, (t) => document.documentElement.classList.toggle("dark", t === "dark"))
</script>

<template>
  <ThemeToggle v-model:theme="theme" />
</template>
