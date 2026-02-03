<template>
  <!-- 移动端：底部浮动按钮 -->
  <div v-if="isMobile" class="mobile-container">
    <button v-if="!isExpanded"
            @click="toggleExpand"
            class="mobile-fab">
      <i class="fas fa-code-branch text-2xl text-white"></i>
    </button>

    <!-- 移动端全屏展开 -->
    <div v-else class="mobile-fullscreen">
      <div class="mobile-header">
        <h2 class="text-lg font-semibold">预设分支管理</h2>
        <button @click="toggleExpand" class="p-2">
          <i class="fas fa-times text-xl text-gray-600"></i>
        </button>
      </div>

      <div class="mobile-content">
        <!-- 预设选择 -->
        <div>
          <label class="block text-sm font-medium mb-2">选择预设</label>
          <select v-model="selectedPreset"
                  @change="onPresetChange"
                  class="w-full min-h-[44px] rounded-lg border px-4 py-3 bg-white">
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
                    class="flex-1 min-h-[44px] rounded-lg border px-4 py-3 bg-white">
              <option v-if="!branches.length" value="">无分支</option>
              <option v-for="branch in branches" :key="branch.name" :value="branch.name">
                {{ branch.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- 分支列表 -->
        <div v-if="branches.length > 0" class="branch-list-mobile">
          <div v-for="branch in branches"
               :key="branch.name"
               @click="switchToBranch(branch.name)"
               :class="['branch-item-mobile', branch.isActive ? 'active' : '']">
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
                  class="w-full min-h-[44px] rounded-lg bg-blue-500 px-4 py-3 text-white font-medium">
            <i class="fas fa-edit mr-2"></i>修改条目
          </button>

          <div v-if="selectedBranch" class="flex gap-2">
            <button @click="openRenameModal"
                    class="flex-1 min-h-[44px] rounded-lg bg-gray-200 px-4 py-3 font-medium">
              <i class="fas fa-edit mr-2"></i>重命名
            </button>
            <button @click="openDeleteModal"
                    class="flex-1 min-h-[44px] rounded-lg bg-red-500 px-4 py-3 text-white font-medium">
              <i class="fas fa-trash mr-2"></i>删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 桌面端：悬浮窗 -->
  <div v-else class="desktop-container">
    <!-- 折叠状态 -->
    <div v-if="!isExpanded"
         class="desktop-collapsed"
         @click="toggleExpand">
      <span class="text-sm font-medium">预设分支</span>
      <i class="fas fa-chevron-down text-gray-400"></i>
    </div>

    <!-- 展开状态 -->
    <div v-else>
      <!-- 顶部栏 -->
      <div class="desktop-header" ref="dragHandle">
        <span class="text-sm font-medium">预设分支</span>
        <button @click="toggleExpand" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-chevron-up"></i>
        </button>
      </div>

      <!-- 工具栏 -->
      <div class="desktop-toolbar">
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
      <div class="branch-list-desktop">
        <div v-if="!branches.length" class="p-4 text-center text-gray-500 text-sm">
          暂无分支
        </div>
        <div v-else class="divide-y">
          <div v-for="branch in branches"
               :key="branch.name"
               @click="switchToBranch(branch.name)"
               :class="['branch-item-desktop', branch.isActive ? 'active' : '']">
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
import toastr from 'toastr';
import { nextTick, onMounted, ref, watch } from 'vue';
import { getActiveBranchName, getBranchList, getCurrentPresetName, getPresetList, switchBranch } from './branch-manager';
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

// 获取父级 iframe 元素
function getParentIframe(): HTMLIFrameElement | null {
  return window.frameElement as HTMLIFrameElement | null;
}

// 更新 iframe 大小
function updateIframeSize() {
  const iframe = getParentIframe();
  if (!iframe) return;

  const $iframe = $(iframe);

  if (isMobile.value) {
    if (isExpanded.value) {
      // 移动端展开：全屏
      $iframe.css({
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        transform: 'none',
        maxHeight: 'none',
      });
    } else {
      // 移动端折叠：右下角浮动按钮
      $iframe.css({
        position: 'fixed',
        top: 'auto',
        left: 'auto',
        right: '16px',
        bottom: '16px',
        width: '56px',
        height: '56px',
        transform: 'none',
        maxHeight: 'none',
      });
    }
  } else {
    // 桌面端：固定宽度，高度自适应
    $iframe.css({
      position: 'fixed',
      right: 'auto',
      bottom: 'auto',
      width: '320px',
      height: 'auto',
      maxHeight: '80vh',
    });

    // 延迟计算实际高度
    nextTick(() => {
      const contentHeight = document.body.scrollHeight;
      $iframe.css('height', Math.min(contentHeight, window.parent.innerHeight * 0.8) + 'px');
    });
  }
}

// 初始化
onMounted(async () => {
  await loadPresetNames();
  await loadCurrentPreset();

  // 初始化 iframe 大小
  updateIframeSize();

  // 桌面端初始化拖动功能
  if (!isMobile.value) {
    await nextTick();
    initDraggable();
  }
});

// 监听展开状态变化，更新 iframe 大小
watch(isExpanded, () => {
  nextTick(() => {
    updateIframeSize();
    if (!isMobile.value && isExpanded.value) {
      nextTick(initDraggable);
    }
  });
});

// 监听分支列表变化，更新 iframe 高度
watch(branches, () => {
  if (!isMobile.value) {
    nextTick(updateIframeSize);
  }
}, { deep: true });

function initDraggable() {
  if (!dragHandle.value) return;

  const iframe = getParentIframe();
  if (!iframe) return;

  const $iframe = $(iframe);

  // 恢复保存的位置或使用居中位置
  const saved = localStorage.getItem('preset-branch-position');
  if (saved) {
    try {
      const { left, top } = JSON.parse(saved);
      $iframe.css({ left: left + 'px', top: top + 'px', transform: 'none' });
    } catch (e) {
      console.error('恢复悬浮窗位置失败:', e);
    }
  }

  // 使用原生拖动实现（因为 jquery-ui draggable 在跨 iframe 时有问题）
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;

  const onMouseDown = (e: MouseEvent) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = iframe.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
    e.preventDefault();
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    const newLeft = startLeft + deltaX;
    const newTop = startTop + deltaY;
    $iframe.css({
      left: newLeft + 'px',
      top: newTop + 'px',
      transform: 'none',
    });
  };

  const onMouseUp = () => {
    if (isDragging) {
      isDragging = false;
      // 保存位置
      const rect = iframe.getBoundingClientRect();
      localStorage.setItem(
        'preset-branch-position',
        JSON.stringify({ left: rect.left, top: rect.top })
      );
    }
  };

  dragHandle.value.addEventListener('mousedown', onMouseDown);
  window.parent.document.addEventListener('mousemove', onMouseMove);
  window.parent.document.addEventListener('mouseup', onMouseUp);
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
    const currentPresetName = getCurrentPresetName();
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

<style scoped>
/* 移动端样式 */
.mobile-container { width: 100%; height: 100%; }
.mobile-fab { width: 56px; height: 56px; border-radius: 50%; background-color: #3b82f6; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; }
.mobile-fab:active { transform: scale(0.95); }
.mobile-fullscreen { position: absolute; inset: 0; background: white; display: flex; flex-direction: column; }
.mobile-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; border-bottom: 1px solid #e5e7eb; background: white; }
.mobile-content { flex: 1; padding: 16px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; }
.branch-list-mobile { border: 1px solid #e5e7eb; border-radius: 8px; max-height: 256px; overflow-y: auto; }
.branch-item-mobile { padding: 12px; cursor: pointer; border-bottom: 1px solid #e5e7eb; }
.branch-item-mobile:last-child { border-bottom: none; }
.branch-item-mobile.active { background-color: #eff6ff; }

/* 桌面端样式 */
.desktop-container { background: white; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb; overflow: hidden; }
.desktop-collapsed { display: flex; align-items: center; justify-content: space-between; padding: 12px; cursor: pointer; }
.desktop-collapsed:hover { background-color: #f9fafb; }
.desktop-header { display: flex; align-items: center; justify-content: space-between; padding: 12px; border-bottom: 1px solid #e5e7eb; cursor: move; background-color: #f9fafb; }
.desktop-toolbar { display: flex; align-items: center; gap: 8px; padding: 12px; border-bottom: 1px solid #e5e7eb; }
.branch-list-desktop { max-height: 256px; overflow-y: auto; }
.branch-item-desktop { padding: 12px; cursor: pointer; transition: background-color 0.15s; }
.branch-item-desktop:hover { background-color: #f9fafb; }
.branch-item-desktop.active { background-color: #eff6ff; border-left: 4px solid #3b82f6; }

/* 通用工具类 */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.font-semibold { font-weight: 600; }
.font-medium { font-weight: 500; }
.text-white { color: white; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-gray-600 { color: #4b5563; }
.text-blue-500 { color: #3b82f6; }
.text-red-500 { color: #ef4444; }
.bg-white { background-color: white; }
.bg-blue-500 { background-color: #3b82f6; }
.bg-gray-200 { background-color: #e5e7eb; }
.bg-red-500 { background-color: #ef4444; }
.rounded { border-radius: 4px; }
.rounded-lg { border-radius: 8px; }
.border { border: 1px solid #e5e7eb; }
.p-2 { padding: 8px; }
.p-4 { padding: 16px; }
.px-2 { padding-left: 8px; padding-right: 8px; }
.px-3 { padding-left: 12px; padding-right: 12px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-1\.5 { padding-top: 6px; padding-bottom: 6px; }
.py-3 { padding-top: 12px; padding-bottom: 12px; }
.p-1\.5 { padding: 6px; }
.mb-2 { margin-bottom: 8px; }
.mr-2 { margin-right: 8px; }
.ml-2 { margin-left: 8px; }
.mt-1 { margin-top: 4px; }
.pt-2 { padding-top: 8px; }
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.flex { display: flex; }
.flex-1 { flex: 1; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.w-full { width: 100%; }
.min-w-0 { min-width: 0; }
.min-h-\[44px\] { min-height: 44px; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cursor-pointer { cursor: pointer; }
.block { display: block; }
.divide-y > * + * { border-top: 1px solid #e5e7eb; }
.transition-colors { transition-property: color, background-color, border-color; transition-duration: 150ms; }
.hover\:bg-blue-600:hover { background-color: #2563eb; }
.hover\:text-gray-600:hover { color: #4b5563; }
.hover\:text-gray-700:hover { color: #374151; }
.hover\:text-red-700:hover { color: #b91c1c; }

:global(body) { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
</style>
