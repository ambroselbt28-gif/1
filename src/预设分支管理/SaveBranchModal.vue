<template>
  <div class="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
    <div
      class="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden flex flex-col"
      :class="{ 'h-full rounded-none': isMobile }"
    >
      <!-- 标题栏 -->
      <div class="flex items-center justify-between border-b p-4 bg-gray-50">
        <h2 class="text-lg font-semibold">保存为新分支</h2>
        <button @click="$emit('close')" class="p-2 touch-manipulation hover:bg-gray-200 rounded-lg transition-colors">
          <i class="fas fa-times text-xl text-gray-600"></i>
        </button>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- 分支名称 -->
        <div>
          <label class="block text-sm font-medium mb-2">
            分支名称 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="branchName"
            type="text"
            placeholder="输入分支名称"
            class="w-full min-h-[44px] rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-manipulation"
            :class="{ 'border-red-500': error }"
          />
          <p v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</p>
        </div>

        <!-- 分支描述 -->
        <div>
          <label class="block text-sm font-medium mb-2">描述（可选）</label>
          <textarea
            v-model="description"
            placeholder="输入分支描述"
            rows="3"
            class="w-full min-h-[44px] rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-manipulation resize-none"
          ></textarea>
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
          @click="handleSave"
          :disabled="!branchName || !!error"
          class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors touch-manipulation min-h-[44px]"
        >
          保存
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints } from '@vueuse/core';
import { computed, ref } from 'vue';

const props = defineProps<{
  existingBranches: string[];
}>();

const emit = defineEmits<{
  close: [];
  save: [name: string, description: string];
}>();

const breakpoints = useBreakpoints({ mobile: 640 });
const isMobile = breakpoints.smaller('mobile');

const branchName = ref('');
const description = ref('');

const error = computed(() => {
  if (!branchName.value) return '分支名称不能为空';
  if (props.existingBranches.includes(branchName.value)) {
    return '分支名称已存在';
  }
  return '';
});

function handleSave() {
  if (!error.value) {
    emit('save', branchName.value, description.value);
  }
}
</script>
