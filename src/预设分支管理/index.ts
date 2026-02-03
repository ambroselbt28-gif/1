import { createScriptIdIframe, teleportStyle } from '@util/script';
import $ from 'jquery';
import _ from 'lodash';
import { createPinia } from 'pinia';
import toastr from 'toastr';
import { createApp, ref } from 'vue';
import DeleteBranchModal from './DeleteBranchModal.vue';
import EditPromptsModal from './EditPromptsModal.vue';
import FloatingWindow from './FloatingWindow.vue';
import RenameBranchModal from './RenameBranchModal.vue';
import SaveBranchModal from './SaveBranchModal.vue';
import {
  createBranch,
  deleteBranch,
  extractPromptsEnabledState,
  getActiveBranchName,
  getBranchList,
  getPromptsFromPreset,
  renameBranch,
  updateActiveBranch
} from './branch-manager';
import { PresetPrompt, PromptEnabledState } from './types';

$(() => {
  errorCatched(init)();
});

async function init() {
  console.info('[预设分支管理] 脚本初始化开始');

  // 检查必要的函数是否可用
  if (typeof getPreset === 'undefined' || typeof replacePreset === 'undefined') {
    console.error('[预设分支管理] 预设接口不可用');
    toastr.error('预设分支管理：预设接口不可用');
    return;
  }

  // 创建 Vue 应用
  const app = createApp({
    components: {
      FloatingWindow,
      EditPromptsModal,
      SaveBranchModal,
      RenameBranchModal,
      DeleteBranchModal,
    },
    setup() {
      // 弹窗状态
      const showEditModal = ref(false);
      const showSaveModal = ref(false);
      const showRenameModal = ref(false);
      const showDeleteModal = ref(false);

      // 编辑相关数据
      const editPrompts = ref<PresetPrompt[]>([]);
      const editPresetName = ref('');

      // 保存分支相关数据
      const saveBranchName = ref('');
      const saveBranchDescription = ref('');

      // 重命名相关数据
      const renameOldName = ref('');
      const renameNewName = ref('');

      // 删除相关数据
      const deleteBranchName = ref('');

      // 悬浮窗组件引用
      const floatingWindowRef = ref<InstanceType<typeof FloatingWindow> | null>(null);

      // 监听预设变更事件
      eventOn(tavern_events.PRESET_CHANGED, async () => {
        console.info('[预设分支管理] 预设已变更，刷新界面');
        if (floatingWindowRef.value) {
          await floatingWindowRef.value.refreshPreset();
        }
      });

      // 防抖的预设更新监听
      const debouncedUpdateActiveBranch = _.debounce(() => {
        try {
          const currentPresetName = getLoadedPresetName();
          if (currentPresetName && getActiveBranchName(currentPresetName)) {
            const enabledState = extractPromptsEnabledState();
            updateActiveBranch(currentPresetName, enabledState);
          }
        } catch (error) {
          console.error('[预设分支管理] 更新激活分支失败:', error);
        }
      }, 1000);

      // 监听预设保存事件（通过监听 in_use 预设的变化）
      let lastPresetState: string | null = null;
      setInterval(() => {
        try {
          const currentPreset = getPreset('in_use');
          const currentState = JSON.stringify(currentPreset.prompts?.map(p => ({ id: p.id, enabled: p.enabled })));

          if (lastPresetState && lastPresetState !== currentState) {
            console.info('[预设分支管理] 检测到预设变更');
            debouncedUpdateActiveBranch();
          }

          lastPresetState = currentState;
        } catch (error) {
          // 忽略错误，可能是预设还未加载
        }
      }, 2000);

      // 打开编辑弹窗
      function openEditModal() {
        try {
          editPresetName.value = getLoadedPresetName() || '未知预设';
          editPrompts.value = getPromptsFromPreset();
          showEditModal.value = true;
        } catch (error) {
          console.error('[预设分支管理] 打开编辑弹窗失败:', error);
          toastr.error('打开编辑弹窗失败');
        }
      }

      // 打开保存分支弹窗
      function openSaveBranchModal(enabledState: PromptEnabledState) {
        // 根据编辑后的提示词状态更新 editPrompts
        editPrompts.value.forEach((prompt: PresetPrompt) => {
          if (prompt.id && enabledState.hasOwnProperty(prompt.id)) {
            prompt.enabled = enabledState[prompt.id];
          }
        });

        // 获取现有分支列表
        const currentPresetName = getLoadedPresetName();
        if (currentPresetName) {
          const branches = getBranchList(currentPresetName);
          const existingNames = branches.map(b => b.name);

          // 设置已存在的分支名称列表（用于验证）
          showSaveModal.value = true;
        }
      }

      // 保存新分支
      function saveNewBranch(name: string, description: string) {
        try {
          const enabledState: PromptEnabledState = {};
          editPrompts.value.forEach((prompt: PresetPrompt) => {
            if (prompt.id) {
              enabledState[prompt.id] = prompt.enabled;
            }
          });

          const currentPresetName = getLoadedPresetName();
          if (!currentPresetName) {
            toastr.error('无法获取当前预设名称');
            return;
          }

          const success = createBranch(currentPresetName, name, enabledState, description);
          if (success) {
            showSaveModal.value = false;
            saveBranchName.value = '';
            saveBranchDescription.value = '';

            // 刷新分支列表
            if (floatingWindowRef.value) {
              floatingWindowRef.value.refreshBranches();
            }

            toastr.success(`分支 "${name}" 创建成功`);
          } else {
            toastr.error('分支创建失败，可能名称已存在');
          }
        } catch (error) {
          console.error('[预设分支管理] 保存分支失败:', error);
          toastr.error('保存分支失败');
        }
      }

      // 打开重命名弹窗
      function openRenameModal(branchName: string) {
        renameOldName.value = branchName;
        renameNewName.value = branchName;
        showRenameModal.value = true;
      }

      // 重命名分支
      function renameBranchAction(name: string) {
        try {
          const currentPresetName = getLoadedPresetName();
          if (!currentPresetName) {
            toastr.error('无法获取当前预设名称');
            return;
          }

          const success = renameBranch(currentPresetName, renameOldName.value, name);
          if (success) {
            showRenameModal.value = false;
            renameOldName.value = '';
            renameNewName.value = '';

            // 刷新分支列表
            if (floatingWindowRef.value) {
              floatingWindowRef.value.refreshBranches();
            }

            toastr.success('分支重命名成功');
          } else {
            toastr.error('分支重命名失败，可能名称已存在');
          }
        } catch (error) {
          console.error('[预设分支管理] 重命名分支失败:', error);
          toastr.error('重命名分支失败');
        }
      }

      // 打开删除确认弹窗
      function openDeleteModal(branchName: string) {
        deleteBranchName.value = branchName;
        showDeleteModal.value = true;
      }

      // 删除分支
      function deleteBranchAction() {
        try {
          const currentPresetName = getLoadedPresetName();
          if (!currentPresetName) {
            toastr.error('无法获取当前预设名称');
            return;
          }

          const success = deleteBranch(currentPresetName, deleteBranchName.value);
          if (success) {
            showDeleteModal.value = false;
            deleteBranchName.value = '';

            // 刷新分支列表
            if (floatingWindowRef.value) {
              floatingWindowRef.value.refreshBranches();
            }

            toastr.success('分支删除成功');
          } else {
            toastr.error('分支删除失败');
          }
        } catch (error) {
          console.error('[预设分支管理] 删除分支失败:', error);
          toastr.error('删除分支失败');
        }
      }

      return {
        showEditModal,
        showSaveModal,
        showRenameModal,
        showDeleteModal,
        editPrompts,
        editPresetName,
        saveBranchName,
        saveBranchDescription,
        renameOldName,
        renameNewName,
        deleteBranchName,
        floatingWindowRef,
        openEditModal,
        openSaveBranchModal,
        saveNewBranch,
        openRenameModal,
        renameBranchAction,
        openDeleteModal,
        deleteBranchAction,
        getExistingBranchNames: () => {
          const currentPresetName = getLoadedPresetName();
          if (!currentPresetName) return [];
          return getBranchList(currentPresetName).map(b => b.name);
        },
      };
    },
    template: `
      <div>
        <FloatingWindow ref="floatingWindowRef" @edit="openEditModal" @rename="openRenameModal" @delete="openDeleteModal" />
        <EditPromptsModal v-if="showEditModal" :preset-name="editPresetName" :prompts="editPrompts" @close="showEditModal = false" @saveAsNewBranch="openSaveBranchModal" />
        <SaveBranchModal v-if="showSaveModal" :existing-branches="getExistingBranchNames()" @close="showSaveModal = false" @save="saveNewBranch" />
        <RenameBranchModal v-if="showRenameModal" :old-name="renameOldName" :existing-branches="getExistingBranchNames()" @close="showRenameModal = false" @rename="renameBranchAction" />
        <DeleteBranchModal v-if="showDeleteModal" :branch-name="deleteBranchName" @close="showDeleteModal = false" @delete="deleteBranchAction" />
      </div>
    `,
  });

  const pinia = createPinia();
  app.use(pinia);

  // 创建 iframe 并设置样式（悬浮窗居中显示）
  const $app = createScriptIdIframe()
    .css({
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '320px',
      height: 'auto',
      minHeight: '60px',
      maxHeight: '80vh',
      border: 'none',
      zIndex: 9999,
      background: 'transparent',
      pointerEvents: 'auto',
    })
    .appendTo('body')
    .on('load', function () {
      const iframe = this as HTMLIFrameElement;
      const iframeDoc = iframe.contentDocument!;

      // 复制样式到 iframe
      teleportStyle(iframeDoc.head);

      // 挂载 Vue 应用到 iframe 内部
      app.mount(iframeDoc.body);

      console.info('[预设分支管理] 脚本初始化完成');
      toastr.success('预设分支管理已加载');
    });

  // 页面卸载时清理
  $(window).on('pagehide', () => {
    app.unmount();
    $app.remove();
    console.info('[预设分支管理] 脚本已卸载');
  });
}
