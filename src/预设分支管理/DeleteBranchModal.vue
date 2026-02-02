<template>
  <div class="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
    <div
      class="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden flex flex-col"
      :class="{ 'h-full rounded-none': isMobile }"
    >
      <!-- 标题栏 -->
      <div class="flex items-center justify-between border-b p-4 bg-gray-50">
        <h2 class="text-lg font-semibold">删除分支</h2>
        <button @click="$emit('close')" class="p-2 touch-manipulation hover:bg-gray-200 rounded-lg transition-colors">
          <i class="fas fa-times text-xl text-gray-600"></i>
        </button>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- 警告图标 -->
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <i class="fas fa-exclamation-triangle text-3xl text-red-500"></i>
          </div>
        </div>

        <!-- 警告文字 -->
        <div class="text-center space-y-2">
          <h3 class="text-lg font-semibold text-gray-900">确定要删除此分支吗？</h3>
          <p class="text-gray-600">
            分支 <span class="font-semibold text-gray-900">"{{ branchName }}"</span> 将被永久删除，此操作无法撤销。
          </p>
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
          @click="handleDelete"
          class="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 active:bg-red-700 transition-colors touch-manipulation min-h-[44px]"
        >
          删除
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints } from '@vueuse/core';

const props = defineProps<{
  branchName: string;
}>();

const emit = defineEmits<{
  close: [];
  delete: [];
}>();

const breakpoints = useBreakpoints({ mobile: 640 });
const isMobile = breakpoints.smaller('mobile');

function handleDelete() {
  emit('delete');
}
</script>
