<script setup lang="ts">
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationNext, PaginationPrevious } from "@/registry/vue/ui/pagination"
</script>

<template>
  <Pagination v-slot="{ page }" :items-per-page="20" :total="120" :default-page="2">
    <PaginationContent v-slot="{ items }">
      <PaginationPrevious />
      <template v-for="(item, index) in items" :key="index">
        <PaginationItem v-if="item.type === 'page'" :value="item.value" :is-active="item.value === page">{{ item.value }}</PaginationItem>
        <PaginationEllipsis v-else :index="index" />
      </template>
      <PaginationNext />
    </PaginationContent>
  </Pagination>
</template>
