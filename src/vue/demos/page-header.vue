<script setup lang="ts">
import { DownloadIcon, PlusIcon } from "@lucide/vue"
import { Button } from "@/registry/vue/ui/button"
import { PageHeader, SectionHeader } from "@/registry/vue/ui/page-header"
</script>

<template>
  <div class="grid w-full max-w-2xl gap-8">
    <PageHeader title="Mes entreprises" description="24 entreprises suivies par votre organisation.">
      <template #actions>
        <Button variant="outline"><DownloadIcon />Exporter</Button>
        <Button><PlusIcon />Ajouter</Button>
      </template>
    </PageHeader>
    <SectionHeader title="Contacts" description="Personnes à joindre pour cette entreprise.">
      <template #actions><Button variant="outline" size="sm">Ajouter un contact</Button></template>
    </SectionHeader>
  </div>
</template>
