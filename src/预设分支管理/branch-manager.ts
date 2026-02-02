import { getPresetNames } from '@types/function/preset';
import { BranchData, BranchListItem, PresetBranches, PresetBranchesStorage, PresetPrompt, PromptEnabledState } from './types';

// 脚本变量存储键
const STORAGE_KEY = 'preset_branches';

/**
 * 获取预设的分支数据
 */
export function getPresetBranches(): PresetBranchesStorage {
  const storage = getVariables({ type: 'script', script_id: getScriptId() });
  return storage[STORAGE_KEY] || {};
}

/**
 * 保存预设的分支数据
 */
export function savePresetBranches(data: PresetBranchesStorage): void {
  replaceVariables(
    { ...getVariables({ type: 'script', script_id: getScriptId() }), [STORAGE_KEY]: data },
    { type: 'script', script_id: getScriptId() }
  );
}

/**
 * 获取指定预设的分支配置
 */
export function getPresetBranchData(presetName: string): PresetBranches | null {
  const storage = getPresetBranches();
  return storage[presetName] || null;
}

/**
 * 保存指定预设的分支配置
 */
export function savePresetBranchData(presetName: string, data: PresetBranches): void {
  const storage = getPresetBranches();
  storage[presetName] = data;
  savePresetBranches(storage);
}

/**
 * 创建新分支
 * @param presetName 预设名称
 * @param branchName 分支名称
 * @param enabledState 提示词启用状态
 * @param description 可选的描述
 * @returns 是否创建成功
 */
export function createBranch(
  presetName: string,
  branchName: string,
  enabledState: PromptEnabledState,
  description?: string
): boolean {
  const storage = getPresetBranches();
  
  // 检查预设是否存在，不存在则创建
  if (!storage[presetName]) {
    storage[presetName] = {
      activeBranch: null,
      branches: {}
    };
  }
  
  const presetData = storage[presetName];
  
  // 检查分支名称是否已存在
  if (presetData.branches[branchName]) {
    return false;
  }
  
  // 创建新分支
  const now = Date.now();
  const newBranch: BranchData = {
    promptsEnabled: { ...enabledState },
    createdAt: now,
    updatedAt: now,
    description
  };
  
  presetData.branches[branchName] = newBranch;
  presetData.activeBranch = branchName;
  
  savePresetBranches(storage);
  return true;
}

/**
 * 删除分支
 * @param presetName 预设名称
 * @param branchName 分支名称
 * @returns 是否删除成功
 */
export function deleteBranch(presetName: string, branchName: string): boolean {
  const storage = getPresetBranches();
  const presetData = storage[presetName];
  
  if (!presetData || !presetData.branches[branchName]) {
    return false;
  }
  
  // 如果是当前激活分支，需要先切换
  if (presetData.activeBranch === branchName) {
    // 找出其他可用分支
    const otherBranches = Object.keys(presetData.branches).filter(b => b !== branchName);
    presetData.activeBranch = otherBranches.length > 0 ? otherBranches[0] : null;
  }
  
  delete presetData.branches[branchName];
  
  // 如果没有分支了，删除预设记录
  if (Object.keys(presetData.branches).length === 0) {
    delete storage[presetName];
  }
  
  savePresetBranches(storage);
  return true;
}

/**
 * 重命名分支
 * @param presetName 预设名称
 * @param oldName 旧分支名称
 * @param newName 新分支名称
 * @returns 是否重命名成功
 */
export function renameBranch(presetName: string, oldName: string, newName: string): boolean {
  const storage = getPresetBranches();
  const presetData = storage[presetName];
  
  if (!presetData || !presetData.branches[oldName] || presetData.branches[newName]) {
    return false;
  }
  
  // 保留分支数据，更新名称
  presetData.branches[newName] = { ...presetData.branches[oldName], updatedAt: Date.now() };
  
  // 如果是激活分支，更新activeBranch
  if (presetData.activeBranch === oldName) {
    presetData.activeBranch = newName;
  }
  
  delete presetData.branches[oldName];
  
  savePresetBranches(storage);
  return true;
}

/**
 * 切换分支
 * @param presetName 预设名称
 * @param branchName 分支名称
 * @returns 是否切换成功
 */
export function switchBranch(presetName: string, branchName: string): boolean {
  const storage = getPresetBranches();
  const presetData = storage[presetName];
  
  if (!presetData || !presetData.branches[branchName]) {
    return false;
  }
  
  // 获取分支数据
  const branchData = presetData.branches[branchName];
  
  try {
    // 获取当前in_use预设
    const currentPreset = getPreset('in_use');
    
    if (!currentPreset || !currentPreset.prompts) {
      console.error('无法获取当前预设');
      return false;
    }
    
    // 更新每个提示词的enabled状态
    currentPreset.prompts.forEach(prompt => {
      if (prompt.id && branchData.promptsEnabled.hasOwnProperty(prompt.id)) {
        prompt.enabled = branchData.promptsEnabled[prompt.id];
      }
    });
    
    // 保存预设
    replacePreset('in_use', currentPreset);
    
    // 更新激活分支
    presetData.activeBranch = branchName;
    savePresetBranches(storage);
    
    return true;
  } catch (error) {
    console.error('切换分支失败:', error);
    return false;
  }
}

/**
 * 更新当前激活分支
 * @param presetName 预设名称
 * @param enabledState 新的提示词启用状态
 */
export function updateActiveBranch(presetName: string, enabledState: PromptEnabledState): void {
  const storage = getPresetBranches();
  const presetData = storage[presetName];
  
  if (!presetData || !presetData.activeBranch) {
    return;
  }
  
  const activeBranchName = presetData.activeBranch;
  if (presetData.branches[activeBranchName]) {
    presetData.branches[activeBranchName].promptsEnabled = { ...enabledState };
    presetData.branches[activeBranchName].updatedAt = Date.now();
    savePresetBranches(storage);
  }
}

/**
 * 获取预设的分支列表
 */
export function getBranchList(presetName: string): BranchListItem[] {
  const presetData = getPresetBranchData(presetName);
  
  if (!presetData || !presetData.branches) {
    return [];
  }
  
  return Object.entries(presetData.branches).map(([name, data]) => ({
    name,
    description: data.description,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    isActive: name === presetData.activeBranch
  }));
}

/**
 * 获取当前激活的分支名称
 */
export function getActiveBranchName(presetName: string): string | null {
  const presetData = getPresetBranchData(presetName);
  return presetData?.activeBranch || null;
}

/**
 * 获取预设的所有提示词及其当前启用状态
 */
export function getPromptsFromPreset(): PresetPrompt[] {
  try {
    const currentPreset = getPreset('in_use');
    
    if (!currentPreset || !currentPreset.prompts) {
      return [];
    }
    
    return currentPreset.prompts.map(prompt => ({
      id: prompt.id || '',
      name: prompt.name || '未命名提示词',
      enabled: prompt.enabled || false,
      content: prompt.content || ''
    }));
  } catch (error) {
    console.error('获取预设提示词失败:', error);
    return [];
  }
}

/**
 * 提取预设的提示词启用状态
 */
export function extractPromptsEnabledState(): PromptEnabledState {
  const prompts = getPromptsFromPreset();
  const state: PromptEnabledState = {};

  prompts.forEach(prompt => {
    if (prompt.id) {
      state[prompt.id] = prompt.enabled;
    }
  });

  return state;
}

/**
 * 获取当前加载的预设名称
 */
export function getCurrentPresetName(): string {
  try {
    return getLoadedPresetName();
  } catch (error) {
    console.error('获取当前预设名称失败:', error);
    return '';
  }
}

/**
 * 获取所有预设列表
 */
export async function getPresetList(): Promise<string[]> {
  try {
    const presetNames = getPresetNames();
    return presetNames || [];
  } catch (error) {
    console.error('获取预设列表失败:', error);
    return [];
  }
}
