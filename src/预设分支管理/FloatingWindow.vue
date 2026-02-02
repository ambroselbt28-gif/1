<template>
  <!-- 移动端：底部浮动按钮 -->
  <div v-if="isMobile" class="fixed bottom-4 right-4 z-50">
    <button v-if="!isExpanded"
            @click="toggleExpand"
            class="h-14 w-14 rounded-full bg-blue-500 shadow-lg touch-manipulation active:scale-95 flex items-center justify-center">
      <i class="fas fa-code-branch text-2xl text-white"></i>
    </button>

    <!-- 移动端全屏展开 -->
    <div v-else class="fixed inset-0 z-50 bg-white flex flex-col">
      <div class="flex items-center justify-between border-b p-4 bg-white">
        <h2 class="text-lg font-semibold">预设分支管理</h2>
        <button @click="toggleExpand" class="p-2 touch-manipulation">
          <i class="fas fa-times text-xl text-gray-600"></i>
        </button>
      </div>

      <div class="flex-1 p-4 space-y-4 overflow-y-auto">
        <!-- 预设选择 -->
        <div>
          <label class="block text-sm font-medium mb-2">选择预设</label>
          <select v-model="selectedPreset"
                  @change="onPresetChange"
                  class="w-full min-h-[44px] rounded-lg border px-4 py-3 touch-manipulation bg-white">
            <option v-for="preset in presetNames" :key="preset" :value="preset">
              {{ preset }}
            </option>
          </select>
        </div>

        <!-- 分支选择 -->
        <div>
          <label class="block text-sm font-medium mb-2">选择分支</label>
          <div class="flex gap-2">
            <select v-model="selectedBranch"
                    @change="onBranchChange"
                    class="flex-1 min-h-[44px] rounded-lg border px-4 py-3 touch-manipulation bg-white">
              <option v-if="!branches.length" value="">无分支</option>
              <option v-for="branch in branches" :key="branch.name" :value="branch.name">
                {{ branch.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- 分支列表 -->
        <div v-if="branches.length > 0" class="border rounded-lg divide-y max-h-64 overflow-y-auto">
          <div v-for="branch in branches"
               :key="branch.name"
               @click="switchToBranch(branch.name)"
               :class="[
                 'p-3 cursor-pointer touch-manipulation',
                 branch.isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
               ]">
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate">{{ branch.name }}</div>
                <div v-if="branch.description" class="text-xs text-gray-500 truncate mt-1">
                  {{ branch.description }}
                </div>
              </div>
              <i v-if="branch.isActive" class="fas fa-check text-blue-500 ml-2"></i>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex flex-col gap-2 pt-2">
          <button @click="openEditModal"
                  class="w-full min-h-[44px] rounded-lg bg-blue-500 px-4 py-3 text-white font-medium touch-manipulation active:bg-blue-600">
            <i class="fas fa-edit mr-2"></i>修改条目
          </button>

          <div v-if="selectedBranch" class="flex gap-2">
            <button @click="openRenameModal"
                    class="flex-1 min-h-[44px] rounded-lg bg-gray-200 px-4 py-3 font-medium touch-manipulation active:bg-gray-300">
              <i class="fas fa-edit mr-2"></i>重命名
            </button>
            <button @click="openDeleteModal"
                    class="flex-1 min-h-[44px] rounded-lg bg-red-500 px-4 py-3 text-white font-medium touch-manipulation active:bg-red-600">
              <i class="fas fa-trash mr-2"></i>删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 桌面端：悬浮窗 -->
  <div v-else
       id="preset-branch-float"
       class="fixed z-50 w-80 bg-white rounded-lg shadow-xl border bg-opacity-95 backdrop-blur-sm">
    <!-- 折叠状态 -->
    <div v-if="!isExpanded"
         class="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
         @click="toggleExpand">
      <span class="text-sm font-medium">预设分支</span>
      <i class="fas fa-chevron-down text-gray-400"></i>
    </div>

    <!-- 展开状态 -->
    <div v-else>
      <!-- 顶部栏 -->
      <div class="flex items-center justify-between p-3 border-b cursor-move bg-gray-50 rounded-t-lg"
           ref="dragHandle">
        <span class="text-sm font-medium">预设分支</span>
        <button @click="toggleExpand" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-chevron-up"></i>
        </button>
      </div>

      <!-- 工具栏 -->
      <div class="flex items-center gap-2 p-3 border-b">
        <button @click="openEditModal"
                class="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          修改
        </button>

        <select v-model="selectedPreset"
                @change="onPresetChange"
                class="flex-1 text-sm border rounded px-2 py-1.5 bg-white cursor-pointer">
          <option v-for="preset in presetNames" :key="preset" :value="preset">
            {{ preset }}
          </option>
        </select>

        <select v-model="selectedBranch"
                @change="onBranchChange"
                class="flex-1 text-sm border rounded px-2 py-1.5 bg-white cursor-pointer">
          <option v-if="!branches.length" value="">无分支</option>
          <option v-for="branch in branches" :key="branch.name" :value="branch.name">
            {{ branch.name }}
          </option>
        </select>

        <div v-if="selectedBranch" class="flex gap-1">
          <button @click="openRenameModal"
                  class="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                  title="重命名">
            <i class="fas fa-edit text-xs"></i>
          </button>
          <button @click="openDeleteModal"
                  class="p-1.5 text-red-500 hover:text-red-700 transition-colors"
                  title="删除">
            <i class="fas fa-trash text-xs"></i>
          </button>
        </div>
      </div>

      <!-- 分支列表 -->
      <div class="max-h-64 overflow-y-auto">
        <div v-if="!branches.length" class="p-4 text-center text-gray-500 text-sm">
          暂无分支
        </div>
        <div v-else class="divide-y">
          <div v-for="branch in branches"
               :key="branch.name"
               @click="switchToBranch(branch.name)"
               :class="[
                 'p-3 cursor-pointer hover:bg-gray-50 transition-colors',
                 branch.isActive ? 'bg-blue-50 border-l-4 border-blue-500' : ''
               ]">
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate">{{ branch.name }}</div>
                <div v-if="branch.description" class="text-xs text-gray-500 truncate mt-1">
                  {{ branch.description }}
                </div>
              </div>
              <i v-if="branch.isActive" class="fas fa-check text-blue-500"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints } from '@vueuse/core';
import $ from 'jquery';
import 'jquery-ui';
import { nextTick, onMounted, ref } from 'vue';
import { getActiveBranchName, getBranchList, getPresetList, switchBranch } from './branch-manager';
import { BranchListItem } from './types';

const emit = defineEmits<{
  edit: [];
  rename: [branchName: string];
  delete: [branchName: string];
}>();

const breakpoints = useBreakpoints({
  mobile: 640,
});

const isMobile = breakpoints.smaller('mobile');
const isExpanded = ref(true);
const dragHandle = ref<HTMLElement | null>(null);

// 预设和分支数据
const presetNames = ref<string[]>([]);
const selectedPreset = ref('');
const branches = ref<BranchListItem[]>([]);
const selectedBranch = ref('');

// 初始化
onMounted(async () => {
  await loadPresetNames();
  await loadCurrentPreset();

  // 桌面端初始化拖动功能
  if (!isMobile.value) {
    await nextTick();
    initDraggable();
  }
});

function initDraggable() {
  if (!dragHandle.value) return;

  const $float = $('#preset-branch-float');
  $float.draggable({
    handle: dragHandle.value,
    containment: 'window',
    stop: (_event, ui) => {
      localStorage.setItem(
        'preset-branch-position',
        JSON.stringify({ left: ui.position.left, top: ui.position.top })
      );
    },
  });

  // 恢复保存的位置
  const saved = localStorage.getItem('preset-branch-position');
  if (saved) {
    try {
      const { left, top } = JSON.parse(saved);
      $float.css({ left, top });
    } catch (e) {
      console.error('恢复悬浮窗位置失败:', e);
    }
  }
}

async function loadPresetNames() {
  try {
    const allPresets = await getPresetList();
    presetNames.value = allPresets;
  } catch (error) {
    console.error('加载预设列表失败:', error);
    toastr.error('加载预设列表失败');
  }
}

async function loadCurrentPreset() {
  try {
    const currentPresetName = getLoadedPresetName();
    if (currentPresetName) {
      selectedPreset.value = currentPresetName;
      await loadBranches(selectedPreset.value);
      selectedBranch.value = getActiveBranchName(selectedPreset.value) || '';
    }
  } catch (error) {
    console.error('加载当前预设失败:', error);
  }
}

async function loadBranches(presetName: string) {
  try {
    branches.value = getBranchList(presetName);
  } catch (error) {
    console.error('加载分支列表失败:', error);
    branches.value = [];
  }
}

async function onPresetChange() {
  try {
    await loadBranches(selectedPreset.value);
    selectedBranch.value = getActiveBranchName(selectedPreset.value) || '';
  } catch (error) {
    console.error('切换预设失败:', error);
    toastr.error('切换预设失败');
  }
}

async function onBranchChange() {
  if (!selectedBranch.value) return;

  try {
    const success = switchBranch(selectedPreset.value, selectedBranch.value);
    if (success) {
      await loadBranches(selectedPreset.value);
      toastr.success('切换分支成功');
    } else {
      toastr.error('切换分支失败');
    }
  } catch (error) {
    console.error('切换分支失败:', error);
    toastr.error('切换分支失败');
  }
}

async function switchToBranch(branchName: string) {
  selectedBranch.value = branchName;
  await onBranchChange();
}

function toggleExpand() {
  isExpanded.value = !isExpanded.value;
}

function openEditModal() {
  emit('edit');
}

function openRenameModal() {
  if (selectedBranch.value) {
    emit('rename', selectedBranch.value);
  }
}

function openDeleteModal() {
  if (selectedBranch.value) {
    emit('delete', selectedBranch.value);
  }
}

// 暴露方法供外部调用
defineExpose({
  refreshPreset: loadCurrentPreset,
  refreshBranches: async () => {
    if (selectedPreset.value) {
      await loadBranches(selectedPreset.value);
    }
  },
});
</script>
