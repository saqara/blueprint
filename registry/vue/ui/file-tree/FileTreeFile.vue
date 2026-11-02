<script setup lang="ts">
import type { HTMLAttributes, VNode } from 'vue'
import { FileIcon } from '@lucide/vue'
import { cn } from '@/lib/utils'
import { computed, provide } from 'vue'
import { FileTreeFileKey, useFileTreeContext } from './context'
import FileTreeIcon from './FileTreeIcon.vue'
import FileTreeName from './FileTreeName.vue'

interface Props extends /* @vue-ignore */ HTMLAttributes {
  path: string
  name: string
  icon?: VNode
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const { selectedPath, onSelect } = useFileTreeContext()

const isSelected = computed(() => selectedPath.value === props.path)

provide(FileTreeFileKey, {
  path: props.path,
  name: props.name,
})
</script>

<template>
  <div
    data-slot="file-tree-row"
    :class="
      cn(
        'flex cursor-pointer items-center gap-1 rounded px-2 py-1 transition-colors outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        isSelected && 'bg-muted',
        props.class,
      )
    "
    :aria-selected="isSelected"
    role="treeitem"
    tabindex="0"
    v-bind="$attrs"
    @click="() => onSelect(props.path)"
    @keydown.enter="() => onSelect(props.path)"
    @keydown.space.prevent="() => onSelect(props.path)"
  >
    <slot>
      <span class="size-4" /> <!-- Spacer for alignment -->
      <FileTreeIcon>
        <component :is="props.icon" v-if="props.icon" />
        <FileIcon v-else class="size-4 text-muted-foreground" />
      </FileTreeIcon>
      <FileTreeName>{{ props.name }}</FileTreeName>
    </slot>
  </div>
</template>
