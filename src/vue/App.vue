<script setup lang="ts">
import type { Component } from "vue"

const modules = import.meta.glob<{ default: Component }>("./demos/*.vue", { eager: true })
const demos = Object.entries(modules).map(([path, mod]) => ({
  name: path.split("/").pop()!.replace(".vue", ""),
  component: mod.default,
}))
const toggle = () => document.documentElement.classList.toggle("dark")
</script>

<template>
  <main class="mx-auto max-w-4xl space-y-10 p-8">
    <header class="flex items-center justify-between">
      <h1 class="text-2xl font-heading">Blueprint — Vue</h1>
      <button class="rounded-md border px-3 py-1 text-sm" @click="toggle">Clair / sombre</button>
    </header>
    <section v-for="demo in demos" :id="demo.name" :key="demo.name" class="space-y-3">
      <h2 class="text-lg font-heading"><a :href="`#${demo.name}`">{{ demo.name }}</a></h2>
      <component :is="demo.component" />
    </section>
  </main>
</template>
