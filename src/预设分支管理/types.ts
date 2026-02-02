// 预设分支管理的类型定义

export interface PromptEnabledState {
  [promptId: string]: boolean;
}

export interface BranchData {
  promptsEnabled: PromptEnabledState;
  createdAt: number;
  updatedAt: number;
  description?: string;
}

export interface PresetBranches {
  activeBranch: string | null;
  branches: Record<string, BranchData>;
}

export interface PresetBranchesStorage {
  [presetName: string]: PresetBranches;
}

export interface PresetPrompt {
  id: string;
  name: string;
  enabled: boolean;
  content?: string;
  position?: number;
  role?: string;
}

export interface BranchListItem {
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
}
