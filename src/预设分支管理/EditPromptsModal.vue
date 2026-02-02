<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
    <div
      class="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col"
      :class="{ 'h-full rounded-none': isMobile }"
    >
      <!-- 标题栏 -->
      <div class="flex items-center justify-between border-b p-4 bg-gray-50">
        <h2 class="text-lg font-semibold">修改预设条目</h2>
        <button @click="$emit('close')" class="p-2 touch-manipulation hover:bg-gray-200 rounded-lg transition-colors">
          <i class="fas fa-times text-xl text-gray-600"></i>
        </button>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 overflow-y-auto p-4">
        <div class="mb-4">
          <span class="text-sm text-gray-600">当前预设：</span>
          <span class="font-medium">{{ presetName }}</span>
        </div>

        <div class="space-y-2">
          <div
            v-for="prompt in prompts"
            :key="prompt.id"
            class="flex items-center justify-between p-3 border rounded-lg transition-colors"
            :class="{ 'bg-blue-50 border-blue-300': prompt.enabled, 'hover:bg-gray-50': !prompt.enabled }"
          >
            <div class="flex-1 min-w-0 pr-3">
              <div class="text-sm font-medium truncate">{{ prompt.name }}</div>
              <div v-if="prompt.content" class="text-xs text-gray-500 truncate mt-1">
                {{ prompt.content }}
              </div>
            </div>
            <input
              type="checkbox"
              v-model="prompt.enabled"
              class="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500 touch-manipulation cursor-pointer"
            />
          </div>

          <div v-if="!prompts.length" class="p-8 text-center text-gray-500 text-sm">
            暂无提示词条目
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="flex justify-end gap-3 border-t p-4 bg-gray-50">
        <button
          @click="$emit('close')"
          class="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors touch-manipulation min-h-[44px]"
        >
          取消
        </button>
        <button
          @click="handleSaveAsNewBranch"
          class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors touch-manipulation min-h-[44px]"
        >
          保存为新分支
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints } from '@vueuse/core';
import { PresetPrompt } from './types';

const props = defineProps<{
  presetName: string;
  prompts: PresetPrompt[];
}>();

const emit = defineEmits<{
  close: [];
  saveAsNewBranch: [enabledState: Record<string, boolean>];
}>();

const breakpoints = useBreakpoints({ mobile: 640 });
const isMobile = breakpoints.smaller('mobile');

function handleSaveAsNewBranch() {
  const enabledState: Record<string, boolean> = {};
  props.prompts.forEach(prompt => {
    if (prompt.id) {
      enabledState[prompt.id] = prompt.enabled;
    }
  });
  emit('saveAsNewBranch', enabledState);
}
</script>
