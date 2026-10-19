<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import {
  ChevronRightIcon,
  FolderIcon,
  FolderOpenIcon,
} from '@lucide/vue'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/registry/vue/ui/collapsible'
import { cn } from '@/lib/utils'
import { computed, provide } from 'vue'
import { FileTreeFolderKey, useFileTreeContext } from './context'
import FileTreeIcon from './FileTreeIcon.vue'
import FileTreeName from './FileTreeName.vue'

interface Props extends /* @vue-ignore */ HTMLAttributes {
  path: string
  name: string
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const { expandedPaths, togglePath, selectedPath, onSelect } = useFileTreeContext()

const isExpanded = computed(() => expandedPaths.value.has(props.path))
const isSelected = computed(() => selectedPath.value === props.path)

provide(FileTreeFolderKey, {
  path: props.path,
  name: props.name,
  isExpanded: isExpanded.value,
})
</script>

<template>
  <Collapsible :open="isExpanded" @update:open="() => togglePath(props.path)">
    <!-- Saqara: the folder's button takes the focus (no extra tab stop on the item);
         the item carries its expanded / selected state. -->
    <div
      :aria-expanded="isExpanded"
      :aria-selected="isSelected"
      :class="cn('', props.class)"
      role="treeitem"
      v-bind="$attrs"
    >
      <CollapsibleTrigger as-child>
        <button
          :class="
            cn(
              'flex w-full items-center gap-1 rounded px-2 py-1 text-left transition-colors hover:bg-muted/50 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
              isSelected && 'bg-muted',
            )
          "
          type="button"
          @click="() => onSelect(props.path)"
        >
          <ChevronRightIcon
            :class="
              cn(
                'size-4 shrink-0 text-muted-foreground transition-transform',
                isExpanded && 'rotate-90',
              )
            "
          />
          <FileTreeIcon>
            <FolderOpenIcon v-if="isExpanded" class="size-4 text-muted-foreground" />
            <FolderIcon v-else class="size-4 text-muted-foreground" />
          </FileTreeIcon>
          <FileTreeName>{{ props.name }}</FileTreeName>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div class="ml-4 border-l pl-2" role="group">
          <slot />
        </div>
      </CollapsibleContent>
    </div>
  </Collapsible>
</template>
