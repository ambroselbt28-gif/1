<template>
  <div class="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
    <div
      class="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden flex flex-col"
      :class="{ 'h-full rounded-none': isMobile }"
    >
      <!-- 标题栏 -->
      <div class="flex items-center justify-between border-b p-4 bg-gray-50">
        <h2 class="text-lg font-semibold">重命名分支</h2>
        <button @click="$emit('close')" class="p-2 touch-manipulation hover:bg-gray-200 rounded-lg transition-colors">
          <i class="fas fa-times text-xl text-gray-600"></i>
        </button>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- 当前分支名称 -->
        <div>
          <label class="block text-sm font-medium mb-2">当前分支名称</label>
          <div class="px-4 py-3 bg-gray-100 rounded-lg text-sm text-gray-600">
            {{ oldName }}
          </div>
        </div>

        <!-- 新分支名称 -->
        <div>
          <label class="block text-sm font-medium mb-2">
            新分支名称 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="newName"
            type="text"
            :placeholder="oldName"
            class="w-full min-h-[44px] rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-manipulation"
            :class="{ 'border-red-500': error }"
          />
          <p v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</p>
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
          @click="handleRename"
          :disabled="!newName || !!error"
          class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors touch-manipulation min-h-[44px]"
        >
          重命名
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints } from '@vueuse/core';
import { computed, ref } from 'vue';

const props = defineProps<{
  oldName: string;
  existingBranches: string[];
}>();

const emit = defineEmits<{
  close: [];
  rename: [name: string];
}>();

const breakpoints = useBreakpoints({ mobile: 640 });
const isMobile = breakpoints.smaller('mobile');

const newName = ref(props.oldName);

const error = computed(() => {
  if (!newName.value) return '分支名称不能为空';
  if (newName.value === props.oldName) return '新名称与原名称相同';
  if (props.existingBranches.includes(newName.value)) {
    return '分支名称已存在';
  }
  return '';
});

function handleRename() {
  if (!error.value) {
    emit('rename', newName.value);
  }
}
</script>
