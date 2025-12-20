/**
 * Мульти-провайдерный эксплорер моделей
 * С вкладками по провайдерам и общей вкладкой сравнения
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Boxes,
  RefreshCw,
  Search,
  ExternalLink,
  Info,
  Cpu,
  Image as ImageIcon,
  Video,
  Mic,
  Code,
  MessageSquare,
  Settings,
  AlertTriangle,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Star,
  FolderOpen,
  FolderClosed,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import {
  AggregatedModel,
  ModelCategory,
  ProviderConfig,
  fetchAllProviderModels,
  PROVIDERS_CONFIG,
  getProviderById,
  ApiKeys,
  AggregatorResult,
} from '../../services/modelRating';

type ProviderTab = 'all' | string; // 'all' или ID провайдера

type SortKey =
  | 'elo'
  | 'name'
  | 'provider'
  | 'category'
  | 'priceIn'
  | 'priceOut'
  | 'context'
  | 'maxOutput'
  | 'modality'
  | 'created';

type SortDir = 'asc' | 'desc';

const DEFAULT_SORT_DIR: Record<SortKey, SortDir> = {
  elo: 'desc',
  name: 'asc',
  provider: 'asc',
  category: 'asc',
  priceIn: 'asc',
  priceOut: 'asc',
  context: 'desc',
  maxOutput: 'desc',
  modality: 'asc',
  created: 'desc',
};

const LS_ENABLED_PROVIDERS = 'autopost_enabled_providers';
const LS_API_KEYS = 'autopost_provider_api_keys';
const LS_FAVORITE_MODELS = 'autopost_favorite_benchmark_models';
const LS_COLLAPSED_FAMILIES = 'autopost_collapsed_model_families';
const LS_DETAILS_WIDTH = 'autopost_multi_details_width_px';
const LS_SHOW_GROUPS = 'autopost_show_model_groups';

const FAMILY_OTHER = 'Другие';

const familySource = (name: string, modelId: string): string =>
  `${name} ${modelId}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const FAMILY_STOPWORDS = new Set([
  'chat',
  'instruct',
  'instruction',
  'vision',
  'audio',
  'text',
  'code',
  'tool',
  'tools',
  'preview',
  'latest',
  'beta',
  'alpha',
  'experimental',
  'exp',
  'mini',
  'pro',
  'turbo',
  'lite',
  'small',
  'medium',
  'large',
  'base',
  'free',
  'fast',
  'thinking',
  'reasoning',
  'max',
  'plus',
  'ultra',
  'standard',
  'v',
]);

const isVersionToken = (token: string): boolean =>
  /^v?\d+(?:\.\d+)*$/.test(token) || /^(?:20\d{2}|\d{3,})$/.test(token);

const wordsFromFamilySource = (src: string): string[] =>
  src
    .split(' ')
    .map(w => w.trim())
    .filter(Boolean)
    .filter(w => w.length >= 3)
    .filter(w => !FAMILY_STOPWORDS.has(w))
    .filter(w => !isVersionToken(w));

const titleCaseFamily = (value: string): string => {
  const upper = new Set([
    'glm',
    'dbrx',
    'tts',
    'sdxl',
    'sd',
    'api',
    'xai',
  ]);
  if (upper.has(value)) return value.toUpperCase();
  return value
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

type FamilyStats = {
  wordCounts: Map<string, number>;
  bigramCounts: Map<string, number>;
};

const buildFamilyStats = (models: AggregatedModel[]): FamilyStats => {
  const wordCounts = new Map<string, number>();
  const bigramCounts = new Map<string, number>();

  for (const model of models) {
    const src = familySource(model.name, model.providerModelId);
    const words = wordsFromFamilySource(src);

    // Уникальные слова/фразы на модель — чтобы не раздувать счётчики.
    const uniqWords = new Set(words);
    for (const w of uniqWords) {
      wordCounts.set(w, (wordCounts.get(w) ?? 0) + 1);
    }

    const bigrams: string[] = [];
    for (let i = 0; i < words.length - 1; i += 1) {
      bigrams.push(`${words[i]} ${words[i + 1]}`);
    }
    const uniqBigrams = new Set(bigrams);
    for (const b of uniqBigrams) {
      bigramCounts.set(b, (bigramCounts.get(b) ?? 0) + 1);
    }
  }

  return { wordCounts, bigramCounts };
};

// Извлечение семейства из имени модели (группируем строго по названию линейки, без версий)
const getModelFamily = (name: string, modelId: string): string => {
  const lower = (name + ' ' + modelId).toLowerCase();

  // xAI
  if (lower.includes('grok') || lower.includes('xai')) return 'Grok';

  // NVIDIA
  if (lower.includes('nvidia') || lower.includes('nemotron')) return 'NVIDIA';

  // OpenAI / GPT
  if (lower.includes('gpt') || lower.includes('chatgpt') || lower.match(/\bo\d\b/) || lower.match(/\bo\d-/)) {
    return 'GPT';
  }

  // Anthropic
  if (lower.includes('claude')) return 'Claude';

  // Google
  if (lower.includes('gemini')) return 'Gemini';

  // DeepSeek
  if (lower.includes('deepseek')) return 'DeepSeek';

  // Meta
  if (lower.includes('llama') || lower.includes('codellama') || lower.includes('code-llama')) {
    return 'Llama';
  }

  // Mistral
  if (lower.includes('mistral') || lower.includes('mixtral') || lower.includes('codestral')) {
    return 'Mistral';
  }

  // Alibaba
  if (lower.includes('qwen')) return 'Qwen';

  // Microsoft
  if (lower.includes('phi')) return 'Phi';

  // Cohere
  if (lower.includes('cohere') || lower.includes('command')) return 'Cohere';

  // Другие текстовые
  if (lower.includes('gemma')) return 'Gemma';
  if (lower.includes('yi') || lower.match(/\byi\b/)) return 'Yi';
  if (lower.includes('glm') || lower.includes('chatglm')) return 'GLM';
  if (lower.includes('internlm')) return 'InternLM';
  if (lower.includes('jamba')) return 'Jamba';
  if (lower.includes('dbrx')) return 'DBRX';

  // Изображения
  if (lower.includes('dall-e') || lower.includes('dalle')) return 'DALL-E';
  if (lower.includes('stable-diffusion') || lower.includes('sdxl') || lower.includes('sd-')) {
    return 'Stable Diffusion';
  }
  if (lower.includes('flux')) return 'Flux';
  if (lower.includes('midjourney')) return 'Midjourney';

  // Видео
  if (lower.includes('sora')) return 'Sora';
  if (lower.includes('runway')) return 'Runway';
  if (lower.includes('kling')) return 'Kling';

  // Аудио
  if (lower.includes('whisper')) return 'Whisper';
  if (lower.includes('tts')) return 'TTS';
  if (lower.includes('suno')) return 'Suno';

  return FAMILY_OTHER;
};

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9/_\-.]/g, '');

const formatContext = (n?: number) => {
  if (!n) return '—';
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
};

// Формат макс. выходных токенов
const formatMaxOutput = (n?: number) => {
  if (!n) return '—';
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
};

// Формат даты добавления
const formatCreatedAt = (ts?: number) => {
  if (!ts) return '—';
  const date = new Date(ts);
  const now = Date.now();
  const diffDays = Math.floor((now - ts) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Вчера';
  if (diffDays < 7) return `${diffDays} дн. назад`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`;
  
  const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

// Формат модальности
const formatModality = (modality?: string) => {
  if (!modality) return '—';
  const lower = modality.toLowerCase();
  // Сокращаем длинные названия
  if (lower.includes('text') && lower.includes('image')) return 'text↔image';
  if (lower.includes('text->image') || lower === 'text-to-image') return 'text→img';
  if (lower.includes('image->text') || lower === 'image-to-text') return 'img→text';
  if (lower.includes('text->audio') || lower === 'text-to-audio') return 'text→audio';
  if (lower.includes('audio->text') || lower === 'audio-to-text') return 'audio→text';
  if (lower.includes('text->video') || lower === 'text-to-video') return 'text→video';
  if (lower === 'text' || lower === 'text->text') return 'text↔text';
  return modality.length > 12 ? modality.slice(0, 10) + '…' : modality;
};

const formatPrice = (value?: number, suffix = '/1M') => {
  if (value === undefined || value === null) return '—';
  if (value === 0) return 'Бесплатно';
  if (value < 0.01) return `$${value.toFixed(4)}${suffix}`;
  return `$${value.toFixed(2)}${suffix}`;
};

const formatImagePrice = (value?: number) => {
  if (!value) return '—';
  return `$${value.toFixed(3)}/шт`;
};

const formatRequestPrice = (value?: number) => {
  if (!value) return '—';
  if (value < 0.01) return `$${value.toFixed(4)}/запрос`;
  return `$${value.toFixed(2)}/запрос`;
};

const formatAudioPrice = (value?: number) => {
  if (!value) return '—';
  return `$${value.toFixed(3)}/мин`;
};

const formatVideoPrice = (value?: number) => {
  if (!value) return '—';
  return `$${value.toFixed(3)}/сек`;
};

// Компоненты UI
const Badge: React.FC<{ label: string; variant?: 'default' | 'warning' | 'success' }> = ({ 
  label, 
  variant = 'default' 
}) => {
  const cls = {
    default: 'border-[#3e3e42] bg-[#252526] text-[#ccc]',
    warning: 'border-yellow-500/30 bg-yellow-900/20 text-yellow-200',
    success: 'border-green-500/30 bg-green-900/20 text-green-200',
  }[variant];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${cls}`}>
      {label}
    </span>
  );
};

const ProviderBadge: React.FC<{ provider: ProviderConfig; small?: boolean }> = ({ provider, small }) => {
  const isUnofficial = provider.type === 'unofficial';
  
  return (
    <span 
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
        isUnofficial 
          ? 'border-yellow-500/30 bg-yellow-900/20 text-yellow-200' 
          : 'border-blue-500/30 bg-blue-900/20 text-blue-200'
      } ${small ? 'text-[8px] px-1.5' : ''}`}
      title={isUnofficial ? provider.warningText : provider.description}
    >
      {isUnofficial && <AlertTriangle className="w-2.5 h-2.5" />}
      {provider.name}
    </span>
  );
};

const CheapestBadge: React.FC = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase border border-green-500/30 bg-green-900/20 text-green-200">
    <DollarSign className="w-2.5 h-2.5" />
    Лучшая цена
  </span>
);

// Модальное окно настроек провайдеров
const ProviderSettingsModal: React.FC<{
  open: boolean;
  onClose: () => void;
  enabledProviders: string[];
  onToggleProvider: (id: string) => void;
  apiKeys: ApiKeys;
  onUpdateApiKey: (provider: string, key: string) => void;
}> = ({ open, onClose, enabledProviders, onToggleProvider, apiKeys, onUpdateApiKey }) => {
  if (!open) return null;

  const officialProviders = PROVIDERS_CONFIG.filter(p => p.type === 'official');
  const unofficialProviders = PROVIDERS_CONFIG.filter(p => p.type === 'unofficial');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-[#1e1e1e] border border-[#3e3e42] rounded-lg w-full max-w-lg max-h-[80vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#252526] flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Настройки провайдеров</h3>
          <button onClick={onClose} className="text-[#858585] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Официальные */}
          <div>
            <h4 className="text-xs font-bold text-[#858585] uppercase mb-3">
              ✅ Официальные провайдеры
            </h4>
            <div className="space-y-3">
              {officialProviders.map(provider => (
                <ProviderSettingsRow
                  key={provider.id}
                  provider={provider}
                  enabled={enabledProviders.includes(provider.id)}
                  onToggle={() => onToggleProvider(provider.id)}
                  apiKey={(apiKeys as Record<string, string | undefined>)[provider.id]}
                  onUpdateApiKey={(key) => onUpdateApiKey(provider.id, key)}
                />
              ))}
            </div>
          </div>

          {/* Неофициальные */}
          <div>
            <h4 className="text-xs font-bold text-yellow-400 uppercase mb-2 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              Неофициальные реселлеры
            </h4>
            <p className="text-[10px] text-yellow-200/70 mb-3">
              ⚠️ Используйте на свой риск. Могут нарушать ToS оригинальных провайдеров.
            </p>
            <div className="space-y-3">
              {unofficialProviders.map(provider => (
                <ProviderSettingsRow
                  key={provider.id}
                  provider={provider}
                  enabled={enabledProviders.includes(provider.id)}
                  onToggle={() => onToggleProvider(provider.id)}
                  apiKey={(apiKeys as Record<string, string | undefined>)[provider.id]}
                  onUpdateApiKey={(key) => onUpdateApiKey(provider.id, key)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#252526] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};

const ProviderSettingsRow: React.FC<{
  provider: ProviderConfig;
  enabled: boolean;
  onToggle: () => void;
  apiKey?: string;
  onUpdateApiKey: (key: string) => void;
}> = ({ provider, enabled, onToggle, apiKey, onUpdateApiKey }) => {
  const [showKey, setShowKey] = useState(false);
  const isUnofficial = provider.type === 'unofficial';

  return (
    <div className={`p-3 rounded border ${
      isUnofficial ? 'border-yellow-500/20 bg-yellow-900/10' : 'border-[#3e3e42] bg-[#252526]'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className={`w-10 h-5 rounded-full transition-colors relative ${
              enabled ? 'bg-blue-600' : 'bg-[#3e3e42]'
            }`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              enabled ? 'left-5' : 'left-0.5'
            }`} />
          </button>
          <span className="text-sm font-bold text-white">{provider.name}</span>
          {isUnofficial && (
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
          )}
        </div>
        <a 
          href={provider.siteUrl} 
          target="_blank" 
          rel="noreferrer"
          className="text-[#007acc] hover:underline text-[10px] flex items-center gap-1"
        >
          Сайт <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
      
      <p className="text-[10px] text-[#858585] mb-2">{provider.description}</p>
      
      {provider.apiKeyRequired && enabled && (
        <div className="mt-2">
          <label className="text-[10px] text-[#858585] block mb-1">
            API ключ {!provider.apiKeyRequired && '(опционально)'}
          </label>
          <div className="flex gap-2">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey ?? ''}
              onChange={e => onUpdateApiKey(e.target.value)}
              placeholder={`Введите ${provider.apiKeyEnvName ?? 'API_KEY'}`}
              className="flex-1 bg-[#1e1e1e] border border-[#3e3e42] rounded px-2 py-1 text-xs text-white outline-none focus:border-[#007acc]"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="px-2 py-1 bg-[#3e3e42] rounded text-[10px] text-[#ccc] hover:bg-[#4e4e52]"
            >
              {showKey ? 'Скрыть' : 'Показать'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const MultiProviderExplorer: React.FC = () => {
  const { t } = useAppContext();

  // Состояние провайдеров
  const [enabledProviders, setEnabledProviders] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(LS_ENABLED_PROVIDERS);
      if (raw) return JSON.parse(raw);
    } catch {}
    // По умолчанию только провайдеры без обязательного API ключа (OpenRouter)
    return PROVIDERS_CONFIG.filter(p => p.type === 'official' && p.enabled && !p.apiKeyRequired).map(p => p.id);
  });

  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => {
    try {
      const raw = localStorage.getItem(LS_API_KEYS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {};
  });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AggregatorResult | null>(null);

  // UI состояние
  const [activeTab, setActiveTab] = useState<ProviderTab>('all');
  const [category, setCategory] = useState<ModelCategory>('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('elo');
  const [sortDir, setSortDir] = useState<SortDir>(DEFAULT_SORT_DIR.elo);
  const [showGroups, setShowGroups] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(LS_SHOW_GROUPS);
      return raw === 'true';
    } catch {}
    return false;
  });
  const [onlyFree, setOnlyFree] = useState(false);
  const [onlyCheapest, setOnlyCheapest] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortFavoritesTop, setSortFavoritesTop] = useState(true); // Сортировать избранные вверху
  const [selectedModel, setSelectedModel] = useState<AggregatedModel | null>(null);
  const [displayLimit, setDisplayLimit] = useState(20);

  const handleSortChange = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(key);
    setSortDir(DEFAULT_SORT_DIR[key]);
  };

  // Ширина панели деталей
  const [detailsWidthPx, setDetailsWidthPx] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(LS_DETAILS_WIDTH);
      const parsed = raw ? Number.parseInt(raw, 10) : NaN;
      return Number.isFinite(parsed) ? parsed : 360;
    } catch {
      return 360;
    }
  });
  const [isResizing, setIsResizing] = useState(false);
  const [showDetails, setShowDetails] = useState(true);

  // Сохранение ширины панели
  useEffect(() => {
    try {
      localStorage.setItem(LS_DETAILS_WIDTH, String(detailsWidthPx));
    } catch {}
  }, [detailsWidthPx]);

  // Сохранение режима группировки
  useEffect(() => {
    try {
      localStorage.setItem(LS_SHOW_GROUPS, String(showGroups));
    } catch {}
  }, [showGroups]);

  // Resize handlers
  const startResize = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startW = detailsWidthPx;

    const onMove = (ev: PointerEvent) => {
      const delta = startX - ev.clientX;
      const newW = Math.max(200, Math.min(600, startW + delta));
      setDetailsWidthPx(newW);
    };

    const onUp = () => {
      setIsResizing(false);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  // Свёрнутые семейства
  const [collapsedFamilies, setCollapsedFamilies] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(LS_COLLAPSED_FAMILIES);
      if (raw) return new Set(JSON.parse(raw));
    } catch {}
    return new Set();
  });

  const toggleFamily = (family: string) => {
    setCollapsedFamilies(prev => {
      const next = new Set(prev);
      if (next.has(family)) {
        next.delete(family);
      } else {
        next.add(family);
      }
      return next;
    });
  };

  // Сохранение свёрнутых семейств
  useEffect(() => {
    try {
      localStorage.setItem(LS_COLLAPSED_FAMILIES, JSON.stringify([...collapsedFamilies]));
    } catch {}
  }, [collapsedFamilies]);

  // Избранные модели
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(LS_FAVORITE_MODELS);
      if (raw) return new Set(JSON.parse(raw));
    } catch {}
    return new Set();
  });

  const toggleFavorite = (modelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (next.has(modelId)) {
        next.delete(modelId);
      } else {
        next.add(modelId);
      }
      return next;
    });
  };

  // Сохранение избранного в localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LS_FAVORITE_MODELS, JSON.stringify([...favoriteIds]));
    } catch {}
  }, [favoriteIds]);

  // Сохранение настроек
  useEffect(() => {
    try {
      localStorage.setItem(LS_ENABLED_PROVIDERS, JSON.stringify(enabledProviders));
    } catch {}
  }, [enabledProviders]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_API_KEYS, JSON.stringify(apiKeys));
    } catch {}
  }, [apiKeys]);

  // Загрузка данных
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllProviderModels(enabledProviders, apiKeys);
      setResult(data);
    } catch (e) {
      console.error('Failed to load models:', e);
    } finally {
      setLoading(false);
    }
  }, [enabledProviders, apiKeys]);

  useEffect(() => {
    void load();
  }, [load]);

  // Обработчики настроек
  const handleToggleProvider = (id: string) => {
    setEnabledProviders(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const handleUpdateApiKey = (provider: string, key: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: key || undefined }));
  };

  // Фильтрация и сортировка
  const displayModels = useMemo(() => {
    if (!result) return [];

    let models = result.allModels;

    // Фильтр по провайдеру
    if (activeTab !== 'all') {
      models = models.filter(m => m.providerId === activeTab);
    }

    // Фильтр по категории
    if (category !== 'all') {
      models = models.filter(m => m.category === category);
    }

    // Поиск
    if (search) {
      const q = normalize(search);
      models = models.filter(m => {
        const hay = `${m.name} ${m.providerModelId} ${m.providerName}`;
        return normalize(hay).includes(q);
      });
    }

    // Только бесплатные
    if (onlyFree) {
      models = models.filter(m => m.isFree);
    }

    // Только с лучшей ценой
    if (onlyCheapest && activeTab === 'all') {
      models = models.filter(m => m.isCheapest);
    }

    // Только избранные
    if (onlyFavorites) {
      models = models.filter(m => favoriteIds.has(m.id));
    }

    // Сортировка
    const dir = sortDir === 'asc' ? 1 : -1;
    const cmp = (a: AggregatedModel, b: AggregatedModel) => {
      switch (sortKey) {
        case 'name':
          return dir * a.name.localeCompare(b.name);
        case 'provider':
          return dir * a.providerName.localeCompare(b.providerName);
        case 'category':
          return dir * a.category.localeCompare(b.category);
        case 'priceIn':
          return dir * ((a.pricing.inputPerM ?? Infinity) - (b.pricing.inputPerM ?? Infinity));
        case 'priceOut':
          return dir * ((a.pricing.outputPerM ?? Infinity) - (b.pricing.outputPerM ?? Infinity));
        case 'context':
          return dir * ((a.contextLength ?? 0) - (b.contextLength ?? 0));
        case 'maxOutput':
          return dir * ((a.maxOutputTokens ?? 0) - (b.maxOutputTokens ?? 0));
        case 'modality':
          return dir * (a.modality ?? '').localeCompare(b.modality ?? '');
        case 'created':
          return dir * ((a.createdAt ?? 0) - (b.createdAt ?? 0));
        case 'elo':
          return dir * ((a.elo ?? 0) - (b.elo ?? 0));
        default:
          return 0;
      }
    };

    // Сортировка
    const sorted = [...models].sort(cmp);
    
    // Избранные вверху только если включена опция
    if (sortFavoritesTop) {
      const favs = sorted.filter(m => favoriteIds.has(m.id));
      const rest = sorted.filter(m => !favoriteIds.has(m.id));
      return [...favs, ...rest];
    }
    
    return sorted;
  }, [result, activeTab, category, search, onlyFree, onlyCheapest, onlyFavorites, favoriteIds, sortKey, sortDir, sortFavoritesTop]);

  // Группировка по семействам
  const groupedModels = useMemo(() => {
    const stats = buildFamilyStats(displayModels);

    const pickDynamicFamily = (model: AggregatedModel): string => {
      const base = getModelFamily(model.name, model.providerModelId);
      if (base !== FAMILY_OTHER) return base;

      const src = familySource(model.name, model.providerModelId);
      const words = wordsFromFamilySource(src);

      // Сначала пробуем биграммы — они точнее (например, "stable diffusion").
      let best: { key: string; count: number; kind: 'bigram' | 'word' } | null = null;

      for (let i = 0; i < words.length - 1; i += 1) {
        const key = `${words[i]} ${words[i + 1]}`;
        const count = stats.bigramCounts.get(key) ?? 0;
        if (count <= 1) continue;
        if (!best || count > best.count || (count === best.count && key.length > best.key.length)) {
          best = { key, count, kind: 'bigram' };
        }
      }

      // Потом одиночные слова.
      for (const w of new Set(words)) {
        const count = stats.wordCounts.get(w) ?? 0;
        if (count <= 1) continue;
        if (!best || count > best.count || (count === best.count && w.length > best.key.length)) {
          best = { key: w, count, kind: 'word' };
        }
      }

      return best ? titleCaseFamily(best.key) : FAMILY_OTHER;
    };

    const groups = new Map<string, AggregatedModel[]>();
    for (const model of displayModels) {
      const family = pickDynamicFamily(model);
      const existing = groups.get(family) ?? [];
      existing.push(model);
      groups.set(family, existing);
    }

    return Array.from(groups.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [displayModels]);

  const collapseAll = () => {
    setCollapsedFamilies(new Set(groupedModels.map(([family]) => family)));
  };

  const expandAll = () => {
    setCollapsedFamilies(new Set());
  };

  // Сброс лимита при смене фильтров
  useEffect(() => {
    setDisplayLimit(20);
  }, [activeTab, category, search, onlyFree, onlyCheapest, onlyFavorites]);

  // Вкладки провайдеров
  const providerTabs = useMemo(() => {
    const tabs: Array<{ id: ProviderTab; label: string; count: number; isUnofficial?: boolean }> = [
      { id: 'all', label: 'Все', count: result?.allModels.length ?? 0 },
    ];

    for (const providerId of enabledProviders) {
      const config = getProviderById(providerId);
      if (!config) continue;

      const providerResult = result?.byProvider.get(providerId);
      const count = providerResult?.models.length ?? 0;

      tabs.push({
        id: providerId,
        label: config.name,
        count,
        isUnofficial: config.type === 'unofficial',
      });
    }

    return tabs;
  }, [enabledProviders, result]);

  const categories: Array<{ key: ModelCategory; icon: React.ElementType; label: string }> = [
    { key: 'all', icon: Boxes, label: 'Все' },
    { key: 'text', icon: MessageSquare, label: 'Текст' },
    { key: 'coding', icon: Code, label: 'Код' },
    { key: 'image', icon: ImageIcon, label: 'Картинки' },
    { key: 'video', icon: Video, label: 'Видео' },
    { key: 'audio', icon: Mic, label: 'Аудио' },
    { key: 'multimodal', icon: Cpu, label: 'Мультимодальные' },
  ];

  return (
    <div className="mt-6 border border-[#3e3e42] rounded-lg bg-[#1e1e1e] overflow-hidden">
      {/* Заголовок */}
      <div className="px-6 py-4 border-b border-[#252526] bg-[#1e1e1e]">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/20 rounded-lg border border-blue-500/20">
              <Boxes className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Рейтинг AI-моделей
              </h3>
              <p className="text-[11px] text-[#858585]">
                Сравнение цен и характеристик от {enabledProviders.length} провайдеров
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-[#666] hidden md:block">
              Обновлено: {result ? new Date(result.lastUpdated).toLocaleTimeString() : '—'}
            </span>
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 bg-[#252526] hover:bg-[#333] rounded border border-[#3e3e42] text-[#ccc] transition-colors"
              title="Настройки провайдеров"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={load}
              disabled={loading}
              className="p-2 bg-[#252526] hover:bg-[#333] rounded border border-[#3e3e42] text-[#ccc] transition-colors"
              title="Обновить"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Вкладки провайдеров */}
        <div className="flex flex-wrap gap-2 mb-4">
          {providerTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all border ${
                activeTab === tab.id
                  ? tab.isUnofficial
                    ? 'bg-yellow-900/30 text-yellow-200 border-yellow-500/30'
                    : 'bg-[#37373d] text-white border-[#3e3e42]'
                  : tab.isUnofficial
                    ? 'bg-[#252526] text-yellow-200/60 border-yellow-500/20 hover:text-yellow-200'
                    : 'bg-[#252526] text-[#858585] border-[#3e3e42] hover:text-[#ccc]'
              }`}
            >
              {tab.isUnofficial && <AlertTriangle className="w-3 h-3" />}
              {tab.label}
              <span className="text-[10px] opacity-60">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Фильтры по категориям */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all border ${
                  category === key
                    ? 'bg-[#37373d] text-white border-[#3e3e42]'
                    : 'bg-[#252526] text-[#858585] border-[#3e3e42] hover:text-[#ccc]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#666]" />
              <input
                type="text"
                placeholder="Поиск по моделям..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[#252526] border border-[#3e3e42] rounded px-3 py-2 pl-9 text-xs text-white outline-none focus:border-[#007acc]"
              />
            </div>

            <button
              onClick={() => setOnlyFavorites(v => !v)}
              className={`px-3 py-2 rounded border text-xs font-bold transition-colors flex items-center gap-1.5 ${
                onlyFavorites
                  ? 'bg-yellow-900/20 text-yellow-200 border-yellow-500/30'
                  : 'bg-[#252526] text-[#ccc] border-[#3e3e42] hover:bg-[#333]'
              }`}
              title={`Показать только избранные (${favoriteIds.size})`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-yellow-400' : ''}`} />
              {favoriteIds.size > 0 && <span>{favoriteIds.size}</span>}
            </button>

            <button
              onClick={() => setSortFavoritesTop(v => !v)}
              className={`px-3 py-2 rounded border text-xs font-bold transition-colors flex items-center gap-1.5 ${
                sortFavoritesTop
                  ? 'bg-blue-900/20 text-blue-200 border-blue-500/30'
                  : 'bg-[#252526] text-[#ccc] border-[#3e3e42] hover:bg-[#333]'
              }`}
              title="Сортировать избранные вверху списка"
            >
              ⬆ Вверху
            </button>

            <button
              onClick={() => setOnlyFree(v => !v)}
              className={`px-3 py-2 rounded border text-xs font-bold transition-colors ${
                onlyFree
                  ? 'bg-green-900/20 text-green-200 border-green-500/30'
                  : 'bg-[#252526] text-[#ccc] border-[#3e3e42] hover:bg-[#333]'
              }`}
            >
              Бесплатные
            </button>

            {activeTab === 'all' && (
              <button
                onClick={() => setOnlyCheapest(v => !v)}
                className={`px-3 py-2 rounded border text-xs font-bold transition-colors flex items-center gap-1 ${
                  onlyCheapest
                    ? 'bg-green-900/20 text-green-200 border-green-500/30'
                    : 'bg-[#252526] text-[#ccc] border-[#3e3e42] hover:bg-[#333]'
                }`}
              >
                <DollarSign className="w-3 h-3" />
                Лучшие цены
              </button>
            )}

            <select
              value={sortKey}
              onChange={e => {
                const nextKey = e.target.value as SortKey;
                setSortKey(nextKey);
                setSortDir(DEFAULT_SORT_DIR[nextKey]);
              }}
              className="bg-[#252526] border border-[#3e3e42] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#007acc]"
            >
              <option value="elo">🏆 Рейтинг (ELO)</option>
              <option value="priceIn">Цена (вход)</option>
              <option value="priceOut">Цена (выход)</option>
              <option value="name">Название</option>
              <option value="provider">Провайдер</option>
              <option value="category">Тип</option>
              <option value="context">Контекст</option>
              <option value="maxOutput">Выход</option>
              <option value="modality">Модальность</option>
              <option value="created">Дата</option>
            </select>

            {/* Кнопки группировки */}
            <div className="flex gap-1">
              <button
                onClick={() => setShowGroups(v => !v)}
                className={`p-2 border rounded transition-colors flex items-center gap-1 text-xs ${
                  showGroups
                    ? 'bg-blue-900/20 text-blue-200 border-blue-500/30'
                    : 'bg-[#252526] text-[#ccc] border-[#3e3e42] hover:bg-[#333]'
                }`}
                title={showGroups ? 'Показывать плоский список' : 'Группировать по семействам'}
              >
                {showGroups ? <FolderOpen className="w-4 h-4" /> : <FolderClosed className="w-4 h-4" />}
                <span className="hidden sm:inline">Группы</span>
              </button>
              {showGroups && (
                <>
                  <button
                    onClick={collapseAll}
                    className="p-2 bg-[#252526] hover:bg-[#333] border border-[#3e3e42] rounded text-[#ccc] transition-colors"
                    title="Свернуть все группы"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={expandAll}
                    className="p-2 bg-[#252526] hover:bg-[#333] border border-[#3e3e42] rounded text-[#ccc] transition-colors"
                    title="Развернуть все группы"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Ошибки */}
        {result?.errors.length ? (
          <div className="mt-3 p-3 bg-[#252526] border border-yellow-500/30 rounded">
            <div className="text-xs text-yellow-400 font-bold flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              Ошибки загрузки
            </div>
            {result.errors.map((err, i) => (
              <div key={i} className="text-[10px] text-yellow-200/70 mt-1">
                {getProviderById(err.providerId)?.name}: {err.error}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Основной контент: таблица + панель деталей */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* Левая часть: таблица */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Таблица */}
          <div className="overflow-auto custom-scrollbar flex-1" style={{ maxHeight: '60vh' }}>
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#252526] text-[10px] font-bold text-[#858585] uppercase tracking-wider sticky top-0 z-10">
            <tr>
              <th className="p-4 border-b border-[#3e3e42] w-10"></th>
              <th className="p-4 border-b border-[#3e3e42]">
                <button
                  type="button"
                  onClick={() => handleSortChange('name')}
                  className="w-full flex items-center gap-1 text-left cursor-pointer hover:text-[#ccc] hover:underline transition-colors"
                  title="Сортировать по названию"
                >
                  Модель
                  <span className={`text-[10px] ${sortKey === 'name' ? 'text-[#007acc]' : 'text-[#555]'}`}>
                    {sortKey === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                  </span>
                </button>
              </th>
              {activeTab === 'all' && (
                <th className="p-4 border-b border-[#3e3e42] w-32">
                  <button
                    type="button"
                    onClick={() => handleSortChange('provider')}
                    className="w-full flex items-center gap-1 text-left cursor-pointer hover:text-[#ccc] hover:underline transition-colors"
                    title="Сортировать по провайдеру"
                  >
                    Провайдер
                    <span className={`text-[10px] ${sortKey === 'provider' ? 'text-[#007acc]' : 'text-[#555]'}`}>
                      {sortKey === 'provider' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </button>
                </th>
              )}
              <th className="p-4 border-b border-[#3e3e42] w-24">
                <button
                  type="button"
                  onClick={() => handleSortChange('category')}
                  className="w-full flex items-center gap-1 text-left cursor-pointer hover:text-[#ccc] hover:underline transition-colors"
                  title="Сортировать по типу"
                >
                  Тип
                  <span className={`text-[10px] ${sortKey === 'category' ? 'text-[#007acc]' : 'text-[#555]'}`}>
                    {sortKey === 'category' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                  </span>
                </button>
              </th>
              <th className="p-4 border-b border-[#3e3e42] w-24">
                <button
                  type="button"
                  onClick={() => handleSortChange('context')}
                  className="w-full flex items-center gap-1 text-left cursor-pointer hover:text-[#ccc] hover:underline transition-colors"
                  title="Сортировать по контексту"
                >
                  Контекст
                  <span className={`text-[10px] ${sortKey === 'context' ? 'text-[#007acc]' : 'text-[#555]'}`}>
                    {sortKey === 'context' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                  </span>
                </button>
              </th>
              <th className="p-4 border-b border-[#3e3e42] w-20">
                <button
                  type="button"
                  onClick={() => handleSortChange('maxOutput')}
                  className="w-full flex items-center gap-1 text-left cursor-pointer hover:text-[#ccc] hover:underline transition-colors"
                  title="Сортировать по максимальному выходу"
                >
                  Выход
                  <span className={`text-[10px] ${sortKey === 'maxOutput' ? 'text-[#007acc]' : 'text-[#555]'}`}>
                    {sortKey === 'maxOutput' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                  </span>
                </button>
              </th>
              <th className="p-4 border-b border-[#3e3e42] w-24">
                <button
                  type="button"
                  onClick={() => handleSortChange('modality')}
                  className="w-full flex items-center gap-1 text-left cursor-pointer hover:text-[#ccc] hover:underline transition-colors"
                  title="Сортировать по модальности"
                >
                  Модальн.
                  <span className={`text-[10px] ${sortKey === 'modality' ? 'text-[#007acc]' : 'text-[#555]'}`}>
                    {sortKey === 'modality' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                  </span>
                </button>
              </th>
              <th className="p-4 border-b border-[#3e3e42] w-24">
                <button
                  type="button"
                  onClick={() => handleSortChange('created')}
                  className="w-full flex items-center gap-1 text-left cursor-pointer hover:text-[#ccc] hover:underline transition-colors"
                  title="Сортировать по дате добавления"
                >
                  Добавлена
                  <span className={`text-[10px] ${sortKey === 'created' ? 'text-[#007acc]' : 'text-[#555]'}`}>
                    {sortKey === 'created' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                  </span>
                </button>
              </th>
              <th className="p-4 border-b border-[#3e3e42] w-40">
                <button
                  type="button"
                  onClick={() => handleSortChange('priceIn')}
                  className="w-full flex items-center gap-1 text-left cursor-pointer hover:text-[#ccc] hover:underline transition-colors"
                  title="Сортировать по цене (вход)"
                >
                  Цена
                  <span className={`text-[10px] ${sortKey === 'priceIn' ? 'text-[#007acc]' : 'text-[#555]'}`}>
                    {sortKey === 'priceIn' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                  </span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2d2e]">
            {loading && !result ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="p-4"><div className="h-4 w-4 bg-[#333] rounded" /></td>
                  <td className="p-4"><div className="h-4 w-56 bg-[#333] rounded" /></td>
                  {activeTab === 'all' && <td className="p-4"><div className="h-4 w-20 bg-[#333] rounded" /></td>}
                  <td className="p-4"><div className="h-4 w-16 bg-[#333] rounded" /></td>
                  <td className="p-4"><div className="h-4 w-12 bg-[#333] rounded" /></td>
                  <td className="p-4"><div className="h-4 w-28 bg-[#333] rounded" /></td>
                </tr>
              ))
            ) : displayModels.length === 0 ? (
              <tr>
                <td colSpan={activeTab === 'all' ? 9 : 8} className="p-8 text-center text-[#666] text-xs italic">
                  Модели не найдены. Попробуйте изменить фильтры.
                </td>
              </tr>
            ) : !showGroups ? (
              /* Плоский список без группировки */
              displayModels.slice(0, displayLimit).map(model => {
                const provider = getProviderById(model.providerId);
                const isFav = favoriteIds.has(model.id);
                
                return (
                  <tr
                    key={model.id}
                    className={`hover:bg-[#252526] transition-colors cursor-pointer ${
                      selectedModel?.id === model.id ? 'bg-[#252526]' : ''
                    } ${isFav ? 'bg-yellow-900/5' : ''}`}
                    onClick={() => setSelectedModel(model)}
                  >
                    <td className="p-4 w-10">
                      <button
                        onClick={(e) => toggleFavorite(model.id, e)}
                        className={`p-1 rounded transition-colors ${
                          isFav
                            ? 'text-yellow-400 hover:text-yellow-300'
                            : 'text-[#555] hover:text-yellow-400'
                        }`}
                        title={isFav ? 'Убрать из избранного' : 'Добавить в избранное'}
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-yellow-400' : ''}`} />
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-white">{model.name}</span>
                        <span className="text-[10px] font-mono text-[#858585] break-all">
                          {model.providerModelId}
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {model.isFree && <Badge label="Бесплатно" variant="success" />}
                          {model.isNew && <Badge label="Новая" variant="default" />}
                          {model.isCheapest && activeTab === 'all' && <CheapestBadge />}
                        </div>
                      </div>
                    </td>
                    {activeTab === 'all' && (
                      <td className="p-4">
                        {provider && <ProviderBadge provider={provider} small />}
                      </td>
                    )}
                    <td className="p-4">
                      <Badge label={model.category} />
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-mono text-[#ccc]">
                        {formatContext(model.contextLength)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-mono text-[#ccc]">
                        {formatMaxOutput(model.maxOutputTokens)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-mono text-[#888]">
                        {formatModality(model.modality)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] text-[#888]">
                        {formatCreatedAt(model.createdAt)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-[10px] text-[#ccc] font-mono">
                        {model.pricing.inputPerM !== undefined && (
                          <div>in: {formatPrice(model.pricing.inputPerM)}</div>
                        )}
                        {model.pricing.outputPerM !== undefined && (
                          <div>out: {formatPrice(model.pricing.outputPerM)}</div>
                        )}
                        {model.pricing.imagePerUnit !== undefined && (
                          <div>img: {formatImagePrice(model.pricing.imagePerUnit)}</div>
                        )}
                        {model.pricing.requestFixed !== undefined && (
                          <div>{formatRequestPrice(model.pricing.requestFixed)}</div>
                        )}
                        {model.pricing.audioPerMinute !== undefined && (
                          <div>{formatAudioPrice(model.pricing.audioPerMinute)}</div>
                        )}
                        {model.pricing.videoPerSecond !== undefined && (
                          <div>{formatVideoPrice(model.pricing.videoPerSecond)}</div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              /* Группировка по семействам */
              groupedModels.map(([family, models]) => {
                const isCollapsed = collapsedFamilies.has(family);
                const visibleModels = models.slice(0, displayLimit);
                const hasFavorites = models.some(m => favoriteIds.has(m.id));
                
                return (
                  <React.Fragment key={family}>
                    {/* Заголовок группы */}
                    <tr 
                      className="bg-[#1a1a1a] hover:bg-[#222] cursor-pointer border-t border-[#3e3e42]"
                      onClick={() => toggleFamily(family)}
                    >
                      <td colSpan={activeTab === 'all' ? 9 : 8} className="p-3">
                        <div className="flex items-center gap-3">
                          <span className="text-[#666] transition-transform">
                            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </span>
                          <span className="text-sm font-bold text-white">{family}</span>
                          <span className="text-[10px] text-[#858585] bg-[#333] px-2 py-0.5 rounded">
                            {models.length} {models.length === 1 ? 'модель' : models.length < 5 ? 'модели' : 'моделей'}
                          </span>
                          {hasFavorites && (
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          )}
                        </div>
                      </td>
                    </tr>
                    
                    {/* Модели группы */}
                    {!isCollapsed && visibleModels.map(model => {
                      const provider = getProviderById(model.providerId);
                      const isFav = favoriteIds.has(model.id);
                      
                      return (
                        <tr
                          key={model.id}
                          className={`hover:bg-[#252526] transition-colors cursor-pointer ${
                            selectedModel?.id === model.id ? 'bg-[#252526]' : ''
                          } ${isFav ? 'bg-yellow-900/5' : ''}`}
                          onClick={() => setSelectedModel(model)}
                        >
                          <td className="p-4 w-10">
                            <button
                              onClick={(e) => toggleFavorite(model.id, e)}
                              className={`p-1 rounded transition-colors ${
                                isFav
                                  ? 'text-yellow-400 hover:text-yellow-300'
                                  : 'text-[#555] hover:text-yellow-400'
                              }`}
                              title={isFav ? 'Убрать из избранного' : 'Добавить в избранное'}
                            >
                              <Star className={`w-4 h-4 ${isFav ? 'fill-yellow-400' : ''}`} />
                            </button>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-bold text-white">{model.name}</span>
                              <span className="text-[10px] font-mono text-[#858585] break-all">
                                {model.providerModelId}
                              </span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {model.isFree && <Badge label="Бесплатно" variant="success" />}
                                {model.isNew && <Badge label="Новая" variant="default" />}
                                {model.isCheapest && activeTab === 'all' && <CheapestBadge />}
                              </div>
                            </div>
                          </td>
                          {activeTab === 'all' && (
                            <td className="p-4">
                              {provider && <ProviderBadge provider={provider} small />}
                            </td>
                          )}
                          <td className="p-4">
                            <Badge label={model.category} />
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-mono text-[#ccc]">
                              {formatContext(model.contextLength)}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-mono text-[#ccc]">
                              {formatMaxOutput(model.maxOutputTokens)}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-[10px] font-mono text-[#888]">
                              {formatModality(model.modality)}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-[10px] text-[#888]">
                              {formatCreatedAt(model.createdAt)}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="text-[10px] text-[#ccc] font-mono">
                              {model.pricing.inputPerM !== undefined && (
                                <div>in: {formatPrice(model.pricing.inputPerM)}</div>
                              )}
                              {model.pricing.outputPerM !== undefined && (
                                <div>out: {formatPrice(model.pricing.outputPerM)}</div>
                              )}
                              {model.pricing.imagePerUnit !== undefined && (
                                <div>img: {formatImagePrice(model.pricing.imagePerUnit)}</div>
                              )}
                              {model.pricing.requestFixed !== undefined && (
                                <div>{formatRequestPrice(model.pricing.requestFixed)}</div>
                              )}
                              {model.pricing.audioPerMinute !== undefined && (
                                <div>{formatAudioPrice(model.pricing.audioPerMinute)}</div>
                              )}
                              {model.pricing.videoPerSecond !== undefined && (
                                <div>{formatVideoPrice(model.pricing.videoPerSecond)}</div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Кнопка "Показать ещё" */}
      {displayModels.length > displayLimit && (
        <div className="px-6 py-3 border-t border-[#252526] flex items-center justify-center gap-3">
          <button
            onClick={() => setDisplayLimit(prev => prev + 20)}
            className="px-4 py-2 bg-[#252526] hover:bg-[#333] border border-[#3e3e42] rounded text-xs font-bold text-[#ccc] transition-colors"
          >
            Показать ещё 20
          </button>
          <button
            onClick={() => setDisplayLimit(displayModels.length)}
            className="px-4 py-2 bg-[#007acc] hover:bg-[#0587d4] border border-[#007acc] rounded text-xs font-bold text-white transition-colors"
          >
            Показать все ({displayModels.length})
          </button>
        </div>
      )}
        </div>

        {/* Разделитель для ресайза (только на десктопе) */}
        <div className="hidden lg:flex">
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Изменить размер панели"
            onPointerDown={startResize}
            onDoubleClick={() => setDetailsWidthPx(360)}
            className={`w-3 cursor-col-resize relative transition-colors ${
              isResizing ? 'bg-[#2a2d2e]' : 'bg-transparent hover:bg-[#252526]'
            }`}
            style={{ touchAction: 'none' }}
          >
            <span className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-[#3e3e42]" />
          </div>
        </div>

        {/* Правая панель: детали модели */}
        <div
          className="border-t lg:border-t-0 lg:border-l border-[#252526] bg-[#1e1e1e] flex-shrink-0"
          style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? detailsWidthPx : '100%' }}
        >
          <div className="px-4 py-3 border-b border-[#252526] flex items-center justify-between">
            <div className="text-[10px] text-[#858585] uppercase tracking-wider font-bold">
              Детали модели
            </div>
            {selectedModel && (
              <button
                onClick={() => setSelectedModel(null)}
                className="text-[#666] hover:text-white transition-colors"
                title="Закрыть"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {selectedModel ? (
            <div className="px-4 py-4 space-y-4 overflow-auto custom-scrollbar" style={{ maxHeight: '55vh' }}>
              {/* Название и ID */}
              <div>
                <div className="text-sm font-bold text-white break-words">
                  {selectedModel.name}
                </div>
                <div className="text-[10px] font-mono text-[#858585] break-all mt-1">
                  {selectedModel.providerModelId}
                </div>
                {selectedModel.accessUrl && (
                  <a
                    href={selectedModel.accessUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#007acc] hover:underline text-[10px] flex items-center gap-1 mt-2"
                  >
                    Открыть API <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Описание */}
              {selectedModel.description && (
                <div className="text-[11px] text-[#ccc] leading-relaxed">
                  {selectedModel.description}
                </div>
              )}

              {/* Контекст и дата */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-[#252526] border border-[#3e3e42] rounded">
                  <div className="text-[9px] text-[#858585] font-bold uppercase">Контекст</div>
                  <div className="text-xs font-mono text-white mt-1">{formatContext(selectedModel.contextLength)}</div>
                </div>
                <div className="p-3 bg-[#252526] border border-[#3e3e42] rounded">
                  <div className="text-[9px] text-[#858585] font-bold uppercase">Дата</div>
                  <div className="text-xs font-mono text-white mt-1">{formatCreatedAt(selectedModel.createdAt)}</div>
                </div>
              </div>

              {/* Выход и модальность */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-[#252526] border border-[#3e3e42] rounded">
                  <div className="text-[9px] text-[#858585] font-bold uppercase">Макс. выход</div>
                  <div className="text-xs font-mono text-white mt-1">{formatMaxOutput(selectedModel.maxOutputTokens)}</div>
                </div>
                <div className="p-3 bg-[#252526] border border-[#3e3e42] rounded">
                  <div className="text-[9px] text-[#858585] font-bold uppercase">Модальность</div>
                  <div className="text-xs font-mono text-white mt-1">{formatModality(selectedModel.modality)}</div>
                </div>
              </div>

              {/* Цена */}
              <div className="p-3 bg-[#252526] border border-[#3e3e42] rounded">
                <div className="text-[9px] text-[#858585] font-bold uppercase">Цена</div>
                <div className="text-xs font-mono text-white mt-2 space-y-1">
                  {selectedModel.pricing.inputPerM !== undefined && (
                    <div>in: <span className="text-green-400">{formatPrice(selectedModel.pricing.inputPerM)}</span></div>
                  )}
                  {selectedModel.pricing.outputPerM !== undefined && (
                    <div>out: <span className="text-green-400">{formatPrice(selectedModel.pricing.outputPerM)}</span></div>
                  )}
                  {selectedModel.pricing.imagePerUnit !== undefined && (
                    <div>img: <span className="text-green-400">{formatImagePrice(selectedModel.pricing.imagePerUnit)}</span></div>
                  )}
                  {selectedModel.pricing.audioPerMinute !== undefined && (
                    <div>audio: <span className="text-green-400">{formatAudioPrice(selectedModel.pricing.audioPerMinute)}</span></div>
                  )}
                  {selectedModel.pricing.requestFixed !== undefined && (
                    <div>запрос: <span className="text-green-400">{formatRequestPrice(selectedModel.pricing.requestFixed)}</span></div>
                  )}
                </div>
              </div>

              {/* Провайдер */}
              <div className="p-3 bg-[#252526] border border-[#3e3e42] rounded">
                <div className="text-[9px] text-[#858585] font-bold uppercase">Провайдер</div>
                <div className="mt-2">
                  <ProviderBadge provider={getProviderById(selectedModel.providerId)!} />
                </div>
                {selectedModel.providerType === 'unofficial' && (
                  <div className="text-[10px] text-yellow-400 mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Неофициальный провайдер
                  </div>
                )}
              </div>

              {/* Альтернативные провайдеры */}
              {selectedModel.alternativeProviders && selectedModel.alternativeProviders.length > 0 && (
                <div className="p-3 bg-[#252526] border border-[#3e3e42] rounded">
                  <div className="text-[9px] text-[#858585] font-bold uppercase">Другие провайдеры</div>
                  <div className="mt-2 space-y-2">
                    {selectedModel.alternativeProviders.map(alt => (
                      <div key={alt.providerId} className="flex items-center justify-between text-[10px]">
                        <span className="text-[#ccc]">{alt.providerName}</span>
                        <span className="font-mono text-green-400">
                          {formatPrice(alt.pricing.inputPerM)} / {formatPrice(alt.pricing.outputPerM)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Сырой JSON (свёрнут по умолчанию) */}
              <details className="p-3 bg-[#252526] border border-[#3e3e42] rounded">
                <summary className="text-[9px] text-[#858585] font-bold uppercase cursor-pointer hover:text-white">
                  Сырой JSON
                </summary>
                <pre className="mt-2 text-[9px] text-[#ccc] whitespace-pre-wrap break-words max-h-40 overflow-auto custom-scrollbar">
{JSON.stringify(selectedModel, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <div className="px-4 py-10 text-center text-[#666] text-xs italic">
              Выберите модель для просмотра деталей
            </div>
          )}
        </div>
      </div>

      {/* Футер */}
      <div className="px-6 py-3 border-t border-[#252526] text-[10px] text-[#858585] flex items-start gap-2">
        <Info className="w-4 h-4 text-[#007acc] mt-0.5 shrink-0" />
        <div>
          <div>Показано {Math.min(displayLimit, displayModels.length)} из {displayModels.length} моделей</div>
          <div className="mt-1">
            Цены зависят от типа модели: /1M токенов, /шт, /запрос, /мин, /сек. Данные обновляются автоматически.
          </div>
        </div>
      </div>

      {/* Модальное окно настроек */}
      <ProviderSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        enabledProviders={enabledProviders}
        onToggleProvider={handleToggleProvider}
        apiKeys={apiKeys}
        onUpdateApiKey={handleUpdateApiKey}
      />
    </div>
  );
};
