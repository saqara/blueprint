<!-- StatusBadge.vue -->
<script setup lang="ts">
import type { ToolPart } from './types'
import type { Component } from 'vue'
import {
  CheckCircleIcon,
  CircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@lucide/vue'
import { Badge } from '@/registry/vue/ui/badge'
import { computed } from 'vue'

const props = defineProps<{
  state: ToolPart['state']
}>()

const label = computed(() => {
  const labels: Record<ToolPart['state'], string> = {
    'input-streaming': 'En préparation',
    'input-available': 'En cours',
    'approval-requested': 'En attente de validation',
    'approval-responded': 'Validation reçue',
    'output-available': 'Terminé',
    'output-error': 'Erreur',
    'output-denied': 'Refusé',
  }
  return labels[props.state]
})

const icon = computed<Component>(() => {
  const icons: Record<ToolPart['state'], Component> = {
    'input-streaming': CircleIcon,
    'input-available': ClockIcon,
    'approval-requested': ClockIcon,
    'approval-responded': CheckCircleIcon,
    'output-available': CheckCircleIcon,
    'output-error': XCircleIcon,
    'output-denied': XCircleIcon,
  }
  return icons[props.state]
})

const iconClass = computed(() => {
  const classes: Record<ToolPart['state'], string> = {
    'input-streaming': 'size-4',
    'input-available': 'size-4 animate-pulse motion-reduce:animate-none',
    'approval-requested': 'size-4 text-yellow-600',
    'approval-responded': 'size-4 text-blue-600',
    'output-available': 'size-4 text-green-600',
    'output-error': 'size-4 text-red-600',
    'output-denied': 'size-4 text-orange-600',
  }
  return classes[props.state]
})
</script>

<template>
  <Badge class="gap-1.5 rounded-full text-xs" variant="secondary">
    <component :is="icon" :class="iconClass" />
    <span>{{ label }}</span>
  </Badge>
</template>
