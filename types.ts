
import { TranslationKey } from './locales';

export type IntegrationProvider = 'telegram' | 'facebook' | 'wordpress' | 'viber' | 'linkedin';

export interface Integration {
  id: string;
  provider: IntegrationProvider;
  name: string;
  credentials: Record<string, any>; 
  isActive: boolean;
}

export enum LoadingState {
  IDLE = 'IDLE',
  GENERATING_TEXT = 'GENERATING_TEXT',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  PUBLISHING = 'PUBLISHING',
  UPLOADING = 'UPLOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  CANCELLED = 'CANCELLED'
}

export interface GenerationStats {
  modelName: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface GeneratedContent {
  posts: { headline: string; body: string }[]; 
  hashtags: string[];
  imagePrompt: string;
  longReadRaw?: string; 
  textStats?: GenerationStats;
  imageStats?: GenerationStats;
}

export interface InlineButton {
  text: string;
  url: string;
}

export interface ProjectConfig {
  defaultModel?: string;
  defaultTone?: string;
  defaultSystemPrompt?: string;
  defaultLanguage?: string;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: number;
  config?: ProjectConfig;
  isExpanded?: boolean;
}

export interface Template {
  id: string;
  name: string;
  createdAt: number;
  config: Partial<EditorState>;
}

export interface PostDraft {
  id: string;
  folderId?: string;
  title?: string;
  topic: string;
  content: string; 
  imageBase64: string | null; 
  imageUrl?: string | null; 
  imagePrompt?: string; 
  customSystemPrompt?: string; 
  createdAt: number;
  scheduledAt?: number | null; 
  status: 'draft' | 'published' | 'scheduled'; 
  postCount: number; 
  stats?: {
    postCount?: number;
    text: GenerationStats;
    image?: GenerationStats;
  };
}

export type SourceType = 'text' | 'youtube';
export type PostMode = 'short' | 'deep';

export interface EditorState {
  sourceType: SourceType;
  topic: string;
  language: string;
  tone: string;       
  imageStyle: string; 
  postCount: number;
  postMode: PostMode;
  includeLongRead: boolean;
  isTextEnabled: boolean;
  isImageEnabled: boolean;
  customSystemPrompt?: string; 
  generatedText: string; 
  generatedImage: string | null;
  currentImagePrompt: string; 
  isSilent: boolean;
  hasSpoiler: boolean; 
  inlineButtons: InlineButton[];
  scheduledAt?: string;
  textStats: GenerationStats | null;
  imageStats: GenerationStats | null;
  currentDraftId: string | null;
  activeFolderId?: string | null; 
}

export interface TelegramConfig {
  botToken: string;
  channelId: string;
  messageThreadId?: string; 
}

export type ApiProvider = 'gemini' | 'openai' | 'openrouter' | 'kie' | 'replicate';
export type ImageProvider = 'gemini' | 'replicate';

// --- NEW API KEY SYSTEM ---
export interface ApiKeyEntry {
  id: string;
  name: string;
  provider: ApiProvider;
  key: string;
  isDefault: boolean;
  createdAt: number;
}

export interface ApiConfig {
  provider: ApiProvider;
  geminiKey: string;     
  openaiKey: string;
  openRouterKey: string;
  kieKey: string;
  replicateKey?: string; 
}

export interface ModelSpecs {
    maxOutputTokens: number;
    temperatureRange: { min: number; max: number; default: number };
    topP?: { min: number; max: number; default: number };
    topK?: { min: number; max: number; default: number };
    supportsImages: boolean;
    supportsVideo: boolean;
    supportsAudio: boolean;
    supportsJsonMode: boolean;
    supportsFunctionCalling: boolean;
    supportsSystemPrompt: boolean;
    knowledgeCutoff?: string;
}

export interface Model {
  id: string;
  name: string;
  provider: ApiProvider;
  description?: string;
  contextLength?: number;
  pricing?: {
    prompt: string;
    completion: string;
  };
  isFree?: boolean;
  created?: number;
  modality?: string; // e.g. 'text->text', 'text->image', 'text->video'
  category?: string; // e.g. 'text', 'image', 'video', 'audio'
  supportedInputs?: string[];
  specs?: ModelSpecs;
  raw?: any; 
}

export interface ModelConfig {
  textModel: string;
  textProvider: ApiProvider;
  youtubeModel: string; 
  youtubeProvider: ApiProvider;
  imageProvider: ImageProvider; 
  imageModel: string; 
  // Legacy field (kept for backwards compatibility / migration)
  systemPrompt?: string;

  // Preferred prompts
  textSystemPrompt?: string;
  imageSystemPrompt?: string;

  // Optional, used when SourceType is 'youtube'
  youtubeSystemPrompt?: string;

  // Optional generation tuning
  temperature?: number;
  maxTokens?: number;
}

export interface ModelLimit {
  rpm: number; 
  rpd: number; 
}

export interface DailyUsage {
  date: string; 
  count: number;
}

export type UiLanguage = 'en' | 'ru';
export type AppView = 'main' | 'settings' | 'help' | 'calendar' | 'benchmarks';
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export interface AppContextType {
  telegramConfig: TelegramConfig;
  setTelegramConfig: (config: TelegramConfig) => void;
  integrations: Integration[];
  addIntegration: (integration: Omit<Integration, 'id'>) => void;
  removeIntegration: (id: string) => void;
  
  // NEW API WALLET METHODS
  apiKeys: ApiKeyEntry[];
  addApiKey: (name: string, provider: ApiProvider, key: string) => void;
  updateApiKey: (id: string, name: string, key: string) => void;
  deleteApiKey: (id: string) => void;
  setDefaultApiKey: (id: string) => void;

  apiConfig: ApiConfig;
  setApiConfig: (config: ApiConfig) => void;
  modelConfig: ModelConfig;
  setModelConfig: (config: ModelConfig) => void;
  availableModels: Model[];
  setAvailableModels: (models: Model[] | ((prev: Model[]) => Model[])) => void;
  
  favoriteModelIds: string[];
  toggleFavoriteModel: (id: string) => void;

  history: PostDraft[];
  folders: Folder[];
  templates: Template[];
  addToHistory: (draft: PostDraft) => void;
  updateDraftStatus: (id: string, status: 'published' | 'scheduled', scheduledAt?: number) => void;
  deleteDraft: (id: string) => void;
  moveDraft: (id: string, folderId: string | undefined) => void;
  renameDraft: (id: string, title: string) => void;
  createFolder: (name: string, config?: ProjectConfig) => void;
  updateFolder: (id: string, name: string, config?: ProjectConfig) => void;
  deleteFolder: (id: string) => void;
  toggleFolder: (id: string) => void;
  saveTemplate: (name: string, state: EditorState) => void;
  deleteTemplate: (id: string) => void;
  loadTemplate: (template: Template) => void;
  editorState: EditorState;
  setEditorState: (state: EditorState) => void;
  loadDraftToEditor: (draft: PostDraft) => void;
  setActiveFolder: (folderId: string | null) => void;
  incrementQuota: () => void;
  dailyUsage: number;
  resetQuota: () => void;
  uiLanguage: UiLanguage;
  setUiLanguage: (lang: UiLanguage) => void;
  t: (key: TranslationKey) => string;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  isProjectModalOpen: boolean;
  setIsProjectModalOpen: (isOpen: boolean) => void;
  isSaveTemplateModalOpen: boolean;
  setIsSaveTemplateModalOpen: (isOpen: boolean) => void;
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}
