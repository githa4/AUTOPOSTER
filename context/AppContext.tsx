
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { AppContextType, PostDraft, TelegramConfig, UiLanguage, ModelConfig, ApiConfig, Model, AppView, EditorState, Folder, Template, ProjectConfig, Toast, ToastType, Integration, ApiKeyEntry, ApiProvider } from '../types';
import { translations, TranslationKey } from '../locales';
import { CORE_MODELS } from '../services/geminiService';

export interface AuthContextProps {
    user: User | null;
    isAuthModalOpen: boolean;
    setIsAuthModalOpen: (isOpen: boolean) => void;
    signOut: () => Promise<void>;
}

type CombinedContext = AppContextType & AuthContextProps;

const AppContext = createContext<CombinedContext | undefined>(undefined);

const LS_TG_KEY = 'autopost_tg_config';
const LS_INTEGRATIONS_KEY = 'autopost_integrations'; 
const LS_HISTORY_KEY = 'autopost_history';
const LS_FOLDERS_KEY = 'autopost_folders';
const LS_TEMPLATES_KEY = 'autopost_templates';
const LS_LANG_KEY = 'autopost_ui_lang';
const LS_MODEL_KEY = 'autopost_model_config';
const LS_API_WALLET_KEY = 'autopost_api_wallet'; 
const LS_USER_CACHE = 'autopost_cached_user'; 
const LS_FAV_MODELS = 'autopost_favorite_models';

// Dev rule: while UX is being built, keep UI in RU to avoid spending time
// translating every new string. Set to null when EN is ready.
const UI_LANGUAGE_LOCK: UiLanguage | null = 'ru';

const DEFAULT_EDITOR_STATE: EditorState = {
  sourceType: 'text',
  topic: '',
  language: 'Russian',
  tone: 'Professional',
  imageStyle: 'Realistic',
  postCount: 1, 
  postMode: 'short',
  includeLongRead: false,
  isTextEnabled: true,
  isImageEnabled: true,
  customSystemPrompt: '', 
  generatedText: '',
  generatedImage: null,
  currentImagePrompt: '',
  isSilent: false,
  hasSpoiler: false,
  inlineButtons: [],
  scheduledAt: '',
  textStats: null,
  imageStats: null,
  currentDraftId: null,
  activeFolderId: null
};

const DEFAULT_MODEL_CONFIG: ModelConfig = {
    textModel: 'gemini-3-flash-preview',
    textProvider: 'gemini',
    youtubeModel: 'gemini-3-pro-preview', 
    youtubeProvider: 'gemini',
    imageProvider: 'gemini',
    imageModel: 'gemini-2.5-flash-image',
    systemPrompt: '',
    textSystemPrompt: '',
    imageSystemPrompt: '',
    youtubeSystemPrompt: '',
};

const normalizeModelConfig = (raw: Partial<ModelConfig> | null | undefined): ModelConfig => {
    const merged: ModelConfig = { ...DEFAULT_MODEL_CONFIG, ...(raw || {}) };

    // One-way migration: legacy systemPrompt -> textSystemPrompt (if new field is empty)
    if (merged.systemPrompt && !merged.textSystemPrompt) {
        merged.textSystemPrompt = merged.systemPrompt;
    }

    return merged;
};

const safeSetItem = (key: string, value: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e: any) {
        if (e.name !== 'QuotaExceededError' && e.name !== 'NS_ERROR_DOM_QUOTA_REACHED') {
             console.warn("LocalStorage Error:", e);
        }
    }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
      try {
          const cached = localStorage.getItem(LS_USER_CACHE);
          return cached ? JSON.parse(cached) : null;
      } catch { return null; }
  });
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(() => {
    try {
      const saved = localStorage.getItem(LS_TG_KEY);
      return saved ? JSON.parse(saved) : { botToken: '', channelId: '', messageThreadId: '' };
    } catch { return { botToken: '', channelId: '', messageThreadId: '' }; }
  });

  const [integrations, setIntegrations] = useState<Integration[]>(() => {
    try {
      const saved = localStorage.getItem(LS_INTEGRATIONS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>(() => {
    try {
        const saved = localStorage.getItem(LS_API_WALLET_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const activeApiConfig = useMemo<ApiConfig>(() => {
    const getDef = (p: ApiProvider) => apiKeys.find(k => k.provider === p && k.isDefault)?.key || apiKeys.find(k => k.provider === p)?.key || '';
    return {
        provider: 'gemini', 
        geminiKey: getDef('gemini'),
        openRouterKey: getDef('openrouter'),
        kieKey: getDef('kie'),
        replicateKey: getDef('replicate')
    };
  }, [apiKeys]);

    const [modelConfig, setModelConfig] = useState<ModelConfig>(() => {
        try {
            const saved = localStorage.getItem(LS_MODEL_KEY);
            const parsed = saved ? JSON.parse(saved) : null;
            return normalizeModelConfig(parsed);
        } catch {
            return DEFAULT_MODEL_CONFIG;
        }
    });

  const [availableModels, setAvailableModels] = useState<Model[]>(CORE_MODELS);
  const [favoriteModelIds, setFavoriteModelIds] = useState<string[]>(() => {
      try {
          const saved = localStorage.getItem(LS_FAV_MODELS);
          return saved ? JSON.parse(saved) : ['gemini-3-flash-preview', 'gemini-3-pro-preview', 'gemini-flash-lite-latest'];
      } catch { return []; }
  });

  const [history, setHistory] = useState<PostDraft[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);

  // Hydrate local-only entities early (works for anonymous mode too)
  useEffect(() => {
      try {
          const savedHistory = localStorage.getItem(LS_HISTORY_KEY);
          if (savedHistory) setHistory(JSON.parse(savedHistory));
      } catch {}

      try {
          const savedFolders = localStorage.getItem(LS_FOLDERS_KEY);
          if (savedFolders) setFolders(JSON.parse(savedFolders));
      } catch {}

      try {
          const savedTemplates = localStorage.getItem(LS_TEMPLATES_KEY);
          if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
      } catch {}
  }, []);
  
  // Default to RU as requested
  const [uiLanguage, setUiLanguageState] = useState<UiLanguage>(() => {
      if (UI_LANGUAGE_LOCK) return UI_LANGUAGE_LOCK;
      const saved = localStorage.getItem(LS_LANG_KEY);
      return (saved as UiLanguage) || 'ru';
  });

  const setUiLanguage = (lang: UiLanguage) => {
      const effective = UI_LANGUAGE_LOCK ?? lang;
      setUiLanguageState(effective);
  };

  const [editorState, setEditorState] = useState<EditorState>(DEFAULT_EDITOR_STATE);
  const [dailyUsage, setDailyUsage] = useState<number>(0);
  const [currentView, setCurrentView] = useState<AppView>('main');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
      const id = crypto.randomUUID();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
      setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addApiKey = (name: string, provider: ApiProvider, key: string) => {
      const isFirstOfProvider = !apiKeys.some(k => k.provider === provider);
      const newKey: ApiKeyEntry = {
          id: crypto.randomUUID(),
          name: name || `${provider} Key ${apiKeys.filter(k => k.provider === provider).length + 1}`,
          provider,
          key,
          isDefault: isFirstOfProvider,
          createdAt: Date.now()
      };
      setApiKeys(prev => [...prev, newKey]);
      showToast(t('btnSaveKey'), "success");
  };

  const updateApiKey = (id: string, name: string, key: string) => {
      setApiKeys(prev => prev.map(k => k.id === id ? { ...k, name, key } : k));
      showToast(t('btnUpdateKey'), "success");
  };

  const deleteApiKey = (id: string) => {
      setApiKeys(prev => {
          const keyToDelete = prev.find(k => k.id === id);
          const filtered = prev.filter(k => k.id !== id);
          if (keyToDelete?.isDefault) {
              const nextOfProvider = filtered.find(k => k.provider === keyToDelete.provider);
              if (nextOfProvider) nextOfProvider.isDefault = true;
          }
          return filtered;
      });
  };

  const setDefaultApiKey = (id: string) => {
      setApiKeys(prev => {
          const target = prev.find(k => k.id === id);
          if (!target) return prev;
          return prev.map(k => ({
              ...k,
              isDefault: k.provider === target.provider ? k.id === id : k.isDefault
          }));
      });
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
          setUser(session.user);
          localStorage.setItem(LS_USER_CACHE, JSON.stringify(session.user));
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
          setUser(session.user);
          localStorage.setItem(LS_USER_CACHE, JSON.stringify(session.user));
      } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem(LS_USER_CACHE);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const syncUserData = async () => {
        if (!user) { setIsSettingsLoaded(true); return; }
        try {
            const { data: profileData } = await supabase.from('profiles').select('settings').eq('id', user.id).single();
            if (profileData?.settings) {
                const s = profileData.settings;
                if (s.apiKeys) setApiKeys(s.apiKeys);
                if (s.modelConfig) {
                    setModelConfig(prev => normalizeModelConfig({ ...prev, ...s.modelConfig }));
                }
                if (s.favorites) setFavoriteModelIds(s.favorites);
                if (s.telegramConfig) setTelegramConfig(s.telegramConfig);
            }

            const { data: dbIntegrations, error: integrationsError } = await supabase
                .from('integrations')
                .select('id, provider, name, credentials, is_active')
                .eq('user_id', user.id);

            if (integrationsError) {
                console.error('Failed to load integrations from Supabase', integrationsError);
            } else if (Array.isArray(dbIntegrations)) {
                if (dbIntegrations.length > 0) {
                    setIntegrations(
                        dbIntegrations.map((row: any) => ({
                            id: row.id,
                            provider: row.provider,
                            name: row.name,
                            credentials: row.credentials || {},
                            isActive: Boolean(row.is_active),
                        }))
                    );
                } else if (integrations.length > 0) {
                    const rowsToInsert = integrations.map((i) => ({
                        id: i.id,
                        user_id: user.id,
                        provider: i.provider,
                        name: i.name,
                        credentials: i.credentials,
                        is_active: i.isActive,
                    }));

                    const { error: insertError } = await supabase
                        .from('integrations')
                        .insert(rowsToInsert);

                    if (insertError) {
                        console.error('Failed to migrate local integrations to Supabase', insertError);
                    }
                }
            }

            // --- Projects (folders) ---
            const { data: dbProjects, error: projectsError } = await supabase
                .from('projects')
                .select('id, name, config, created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (projectsError) {
                console.error('Failed to load projects from Supabase', projectsError);
            } else if (Array.isArray(dbProjects)) {
                if (dbProjects.length > 0) {
                    setFolders(
                        dbProjects.map((row: any) => ({
                            id: row.id,
                            name: row.name,
                            config: row.config || undefined,
                            createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
                            isExpanded: true,
                        }))
                    );
                } else if (folders.length > 0) {
                    const rowsToInsert = folders.map((f) => ({
                        id: f.id,
                        user_id: user.id,
                        name: f.name,
                        config: f.config || {},
                        created_at: new Date(f.createdAt).toISOString(),
                    }));

                    const { error: insertError } = await supabase
                        .from('projects')
                        .insert(rowsToInsert);

                    if (insertError) {
                        console.error('Failed to migrate local projects to Supabase', insertError);
                    }
                }
            }

            // --- Templates ---
            const { data: dbTemplates, error: templatesError } = await supabase
                .from('templates')
                .select('id, name, config, created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (templatesError) {
                console.error('Failed to load templates from Supabase', templatesError);
            } else if (Array.isArray(dbTemplates)) {
                if (dbTemplates.length > 0) {
                    setTemplates(
                        dbTemplates.map((row: any) => ({
                            id: row.id,
                            name: row.name,
                            config: row.config || {},
                            createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
                        }))
                    );
                } else if (templates.length > 0) {
                    const rowsToInsert = templates.map((t) => ({
                        id: t.id,
                        user_id: user.id,
                        name: t.name,
                        config: t.config,
                        created_at: new Date(t.createdAt).toISOString(),
                    }));

                    const { error: insertError } = await supabase
                        .from('templates')
                        .insert(rowsToInsert);

                    if (insertError) {
                        console.error('Failed to migrate local templates to Supabase', insertError);
                    }
                }
            }

            // --- Posts (history) ---
            const { data: dbPosts, error: postsError } = await supabase
                .from('posts')
                .select('id, project_id, topic, content, image_url, status, scheduled_at, created_at, stats, title')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (postsError) {
                console.error('Failed to load posts from Supabase', postsError);
            } else if (Array.isArray(dbPosts)) {
                if (dbPosts.length > 0) {
                    setHistory(
                        dbPosts.map((row: any) => ({
                            id: row.id,
                            folderId: row.project_id || undefined,
                            title: row.title || undefined,
                            topic: row.topic || '',
                            content: row.content || '',
                            imageBase64: null,
                            imageUrl: row.image_url || null,
                            createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
                            scheduledAt: row.scheduled_at ? new Date(row.scheduled_at).getTime() : null,
                            status: row.status || 'draft',
                            postCount: row.stats?.postCount || 1,
                            stats: row.stats || undefined,
                        }))
                    );
                } else if (history.length > 0) {
                    const rowsToInsert = history.map((d) => ({
                        id: d.id,
                        user_id: user.id,
                        project_id: d.folderId || null,
                        topic: d.topic,
                        content: d.content,
                        // Never store base64 in DB; only URL (Storage) or null
                        image_url: d.imageUrl || null,
                        status: d.status,
                        scheduled_at: d.scheduledAt ? new Date(d.scheduledAt).toISOString() : null,
                        created_at: new Date(d.createdAt).toISOString(),
                        stats: d.stats ? { ...d.stats, postCount: d.postCount } : { postCount: d.postCount },
                        title: d.title || null,
                    }));

                    const { error: insertError } = await supabase
                        .from('posts')
                        .insert(rowsToInsert);

                    if (insertError) {
                        console.error('Failed to migrate local posts to Supabase', insertError);
                    }
                }
            }
        } catch (e) { console.error("Sync Error", e); }
        finally { setIsSettingsLoaded(true); }
    };
    syncUserData();
  }, [user]);

  useEffect(() => {
      if (!user || !isSettingsLoaded) return;
      const timer = setTimeout(async () => {
          await supabase.from('profiles').update({
              settings: { apiKeys, modelConfig, favorites: favoriteModelIds, telegramConfig },
              updated_at: new Date().toISOString()
          }).eq('id', user.id);
      }, 2000);
      return () => clearTimeout(timer);
  }, [apiKeys, modelConfig, favoriteModelIds, telegramConfig, user, isSettingsLoaded]);

  useEffect(() => { safeSetItem(LS_TG_KEY, telegramConfig); }, [telegramConfig]);
  useEffect(() => { safeSetItem(LS_INTEGRATIONS_KEY, integrations); }, [integrations]);

    useEffect(() => { safeSetItem(LS_HISTORY_KEY, history); }, [history]);
    useEffect(() => { safeSetItem(LS_FOLDERS_KEY, folders); }, [folders]);
    useEffect(() => { safeSetItem(LS_TEMPLATES_KEY, templates); }, [templates]);

  useEffect(() => { safeSetItem(LS_API_WALLET_KEY, apiKeys); }, [apiKeys]);
  useEffect(() => { safeSetItem(LS_MODEL_KEY, modelConfig); }, [modelConfig]);
  useEffect(() => { safeSetItem(LS_FAV_MODELS, favoriteModelIds); }, [favoriteModelIds]);
  useEffect(() => {
      const effective = UI_LANGUAGE_LOCK ?? uiLanguage;
      localStorage.setItem(LS_LANG_KEY, effective);
      if (effective !== uiLanguage) {
          setUiLanguageState(effective);
      }
  }, [uiLanguage]);

  const signOut = async () => {
      await supabase.auth.signOut();
      localStorage.removeItem(LS_USER_CACHE);
      setUser(null);
  };

  const toggleFavoriteModel = (id: string) => {
      setFavoriteModelIds(prev => 
          prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
      );
  };

  const addIntegration = async (integration: Omit<Integration, 'id'>) => {
      const id = crypto.randomUUID();
      const newInt = { ...integration, id };
      setIntegrations(prev => [...prev, newInt]);

      if (!user) return;

      const { error } = await supabase.from('integrations').insert({
          id,
          user_id: user.id,
          provider: integration.provider,
          name: integration.name,
          credentials: integration.credentials,
          is_active: integration.isActive,
      });

      if (error) {
          console.error('Failed to save integration to Supabase', error);
          setIntegrations(prev => prev.filter(i => i.id !== id));
          showToast(t('toastIntegrationSaveFailed'), 'error');
      }
  };

  const removeIntegration = async (id: string) => {
      const snapshot = integrations;
      setIntegrations(prev => prev.filter(i => i.id !== id));
      if (!user) return;

      const { error } = await supabase
          .from('integrations')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

      if (error) {
          console.error('Failed to delete integration from Supabase', error);
          setIntegrations(snapshot);
          showToast(t('toastIntegrationDeleteFailed'), 'error');
      }
  };

  const addToHistory = async (draft: PostDraft) => {
    setHistory(prev => [draft, ...prev]);
    if (user) {
        const stats = draft.stats
            ? { ...draft.stats, postCount: draft.postCount }
            : { postCount: draft.postCount };

        await supabase.from('posts').insert({
            id: draft.id,
            user_id: user.id,
            project_id: draft.folderId || null,
            title: draft.title || null,
            topic: draft.topic,
            content: draft.content,
                        // Never store base64 in DB
                        image_url: draft.imageUrl || null,
            status: draft.status,
            scheduled_at: draft.scheduledAt ? new Date(draft.scheduledAt).toISOString() : null,
            created_at: new Date(draft.createdAt).toISOString(),
            stats,
        });
    }
  };

  const updateDraftStatus = async (id: string, status: 'published' | 'scheduled', scheduledAt?: number) => {
    setHistory(prev => prev.map(item => item.id === id ? { ...item, status, scheduledAt } : item));
    if (user) {
        await supabase.from('posts').update({ status, scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null }).eq('id', id);
    }
  };

  const deleteDraft = async (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    if (user) await supabase.from('posts').delete().eq('id', id);
  };

  const moveDraft = async (id: string, folderId: string | undefined) => {
    setHistory(prev => prev.map(item => item.id === id ? { ...item, folderId } : item));
    if (user) await supabase.from('posts').update({ project_id: folderId || null }).eq('id', id);
  };

  const renameDraft = async (id: string, title: string) => {
      setHistory(prev => prev.map(item => item.id === id ? { ...item, title } : item));
  };

  const createFolder = async (name: string, config?: ProjectConfig) => {
      const newFolder: Folder = { id: crypto.randomUUID(), name, createdAt: Date.now(), config, isExpanded: true };
      setFolders(prev => [...prev, newFolder]);
      if (user) {
          await supabase.from('projects').insert({ id: newFolder.id, user_id: user.id, name: newFolder.name, config: newFolder.config || {}, created_at: new Date(newFolder.createdAt).toISOString() });
      }
  };

  const updateFolder = async (id: string, name: string, config?: ProjectConfig) => {
      setFolders(prev => prev.map(f => f.id === id ? { ...f, name, config } : f));
      if (user) await supabase.from('projects').update({ name, config }).eq('id', id);
  };

  const deleteFolder = async (id: string) => {
      setFolders(prev => prev.filter(f => f.id !== id));
      if (user) await supabase.from('projects').delete().eq('id', id);
  };

  const toggleFolder = (id: string) => {
      setFolders(prev => prev.map(f => f.id === id ? { ...f, isExpanded: !f.isExpanded } : f));
  };

  const saveTemplate = async (name: string, state: EditorState) => {
      const newTemplate: Template = { id: crypto.randomUUID(), name, createdAt: Date.now(), config: state };
      setTemplates(prev => [...prev, newTemplate]);
      if (user) await supabase.from('templates').insert({ id: newTemplate.id, user_id: user.id, name: newTemplate.name, config: newTemplate.config, created_at: new Date(newTemplate.createdAt).toISOString() });
  };

  const deleteTemplate = async (id: string) => {
      setTemplates(prev => prev.filter(t => t.id !== id));
      if (user) await supabase.from('templates').delete().eq('id', id);
  };

  const loadTemplate = (template: Template) => {
      setEditorState({ ...DEFAULT_EDITOR_STATE, ...template.config });
  };

  const setActiveFolder = (folderId: string | null) => {
      setEditorState(prev => ({ ...prev, activeFolderId: folderId }));
  };

  const loadDraftToEditor = (draft: PostDraft) => {
    setEditorState({
      ...DEFAULT_EDITOR_STATE,
      topic: draft.topic,
      sourceType: draft.topic.includes('youtube.com') ? 'youtube' : 'text',
      generatedText: draft.content,
      generatedImage: draft.imageUrl || draft.imageBase64,
      currentImagePrompt: draft.imagePrompt || '',
      textStats: draft.stats?.text || null,
      imageStats: draft.stats?.image || null,
      currentDraftId: draft.id,
      postCount: draft.postCount || 1,
      customSystemPrompt: draft.customSystemPrompt || '',
      activeFolderId: draft.folderId || null,
      scheduledAt: draft.scheduledAt ? new Date(draft.scheduledAt).toISOString().slice(0, 16) : ''
    });
    setCurrentView('main');
  };

    const t = (key: TranslationKey): string => {
        const current = translations[uiLanguage] as Partial<Record<TranslationKey, string>>;
        return current[key] ?? translations.ru[key] ?? key;
    };

  return (
    <AppContext.Provider value={{
      user, isAuthModalOpen, setIsAuthModalOpen, signOut,
      telegramConfig, setTelegramConfig, integrations, addIntegration, removeIntegration,
      apiKeys, addApiKey, updateApiKey, deleteApiKey, setDefaultApiKey,
      apiConfig: activeApiConfig, setApiConfig: () => {}, 
      modelConfig, setModelConfig, availableModels, setAvailableModels,
      favoriteModelIds, toggleFavoriteModel,
      history, addToHistory, updateDraftStatus, deleteDraft, moveDraft, renameDraft,
      folders, createFolder, updateFolder, deleteFolder, toggleFolder,
      templates, saveTemplate, deleteTemplate, loadTemplate,
      editorState, setEditorState, loadDraftToEditor, setActiveFolder,
      incrementQuota: () => setDailyUsage(prev => prev + 1), dailyUsage, resetQuota: () => setDailyUsage(0),
      uiLanguage, setUiLanguage, t, currentView, setCurrentView,
      isProjectModalOpen, setIsProjectModalOpen, isSaveTemplateModalOpen, setIsSaveTemplateModalOpen,
      toasts, showToast, removeToast
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within an AppProvider");
  return context;
};
