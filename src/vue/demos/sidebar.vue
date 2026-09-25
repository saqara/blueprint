<script setup lang="ts">
import { Building2, ClipboardCheck, Users } from "@lucide/vue"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@/registry/vue/ui/sidebar"

const items = [
  { label: "Mes entreprises", icon: Building2, active: true },
  { label: "Évaluations", icon: ClipboardCheck, active: false },
  { label: "Organisation", icon: Users, active: false },
]
</script>

<template>
  <SidebarProvider class="min-h-0">
    <Sidebar collapsible="none" class="h-64 rounded-md border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Portail fournisseur</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem v-for="it in items" :key="it.label">
              <SidebarMenuButton :is-active="it.active"><component :is="it.icon" />{{ it.label }}</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  </SidebarProvider>
</template>
