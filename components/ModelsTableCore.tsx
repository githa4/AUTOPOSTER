/**
 * Универсальная таблица моделей (выделена из MultiProviderExplorer)
 * Используется в SettingsPage и BenchmarksPage
 * Поддерживает Quick Assign для назначения моделей на задачи
 */

import React, { useMemo, useState, useEffect } from 'react';
import {
  Star,
  Search,
  Brain,
  Youtube,
  Image as ImageIcon,
  ChevronDown,
  ChevronRight,
  DollarSign,
  AlertTriangle,
  FolderOpen,
  FolderClosed,
  Check,
  X,
  Info,
  Cpu,
  Calendar,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { AggregatedModel, ProviderConfig, getProviderById } from '../services/modelRating';
import { ApiProvider, Model } from '../types';

// ============== Типы ==============

type AssignType = 'text' | 'youtube' | 'image';

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

// Универсальный тип для входных моделей
type InputModel = AggregatedModel | Model;

interface ModelsTableCoreProps {
  /** Список моделей (AggregatedModel или Model) */
  models: InputModel[];
  /** Показывать колонку провайдера */
  showProviderColumn?: boolean;
  /** Режим отображения */
  mode?: 'inline' | 'fullpage';
  /** Показывать кнопки Quick Assign */
  showAssignButtons?: boolean;
  /** Показывать панель деталей */
  showDetailsPanel?: boolean;
  /** Показывать группировку по семействам */
  showGrouping?: boolean;
  /** Максимальная высота таблицы */
  maxHeight?: string;
  /** Лимит отображаемых моделей (0 = без лимита) */
  displayLimit?: number;
  /** Callback при назначении модели */
  onAssign?: (modelId: string, type: AssignType, provider: ApiProvider) => void;
  /** Показывать кнопку "Показать ещё" */
  showLoadMore?: boolean;
  /** Идёт загрузка */
  loading?: boolean;
  /** Текущие назначения моделей (для подсветки кнопок) */
  currentAssignments?: {
    textModel?: string;
    youtubeModel?: string;
    imageModel?: string;
  };
}

// ============== Конвертер Model → AggregatedModel ==============

const isAggregatedModel = (m: InputModel): m is AggregatedModel => {
  return 'providerModelId' in m && 'providerId' in m;
};

const toAggregatedModel = (m: InputModel): AggregatedModel => {
  if (isAggregatedModel(m)) return m;
  
  // Конвертация Model → AggregatedModel
  const model = m as Model;
  const parsePrice = (p?: string): number | undefined => {
    if (!p) return undefined;
    const num = parseFloat(p.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? undefined : num;
  };
  
  // Уникальный id для React key (из raw.uniqueId если есть, иначе id+category)
  const uniqueId = model.raw?.uniqueId || `${model.id}-${model.category || 'text'}`;
  
  return {
    id: uniqueId,
    name: model.name || model.id,
    providerModelId: model.id, // Оригинальный id для API (owner/name формат)
    providerId: model.provider || 'openrouter',
    providerName: model.provider || 'OpenRouter',
    providerType: 'official',
    category: (model.category as any) || (model.raw?.category as any) || 'text',
    contextLength: model.contextLength,
    maxOutputTokens: undefined,
    pricing: {
      inputPerM: parsePrice(model.pricing?.prompt),
      outputPerM: parsePrice(model.pricing?.completion),
    },
    isFree: model.isFree ?? false,
    isNew: false,
    isCheapest: false,
    inLeaderboard: false, // Model не имеет этого поля
    modality: model.modality || 'text->text',
    createdAt: model.created,
    description: model.description,
  };
};

// ============== Константы ==============

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

const LS_COLLAPSED_FAMILIES = 'autopost_collapsed_model_families';

const FAMILY_OTHER = 'Другие';

const FAMILY_STOPWORDS = new Set([
  'chat', 'instruct', 'instruction', 'vision', 'audio', 'text', 'code', 'tool', 'tools',
  'preview', 'latest', 'beta', 'alpha', 'experimental', 'exp', 'mini', 'pro', 'turbo',
  'lite', 'small', 'medium', 'large', 'base', 'free', 'fast', 'thinking', 'reasoning',
  'max', 'plus', 'ultra', 'standard', 'v',
]);

// ============== Утилиты ==============

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9а-яё]/gi, '');

const formatContext = (n?: number) => {
  if (!n) return '—';
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
};

const formatMaxOutput = (n?: number) => {
  if (!n) return '—';
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
};

const formatCreatedAt = (ts?: number) => {
  if (!ts || ts <= 0) return '—';
  
  // Если timestamp в секундах (меньше 2000000000), конвертируем в миллисекунды
  const tsMs = ts < 2000000000 ? ts * 1000 : ts;
  
  // Проверяем что дата валидная (после 2020 года)
  if (tsMs < 1577836800000) return '—'; // 1 Jan 2020
  
  const date = new Date(tsMs);
  if (isNaN(date.getTime())) return '—';
  
  const now = Date.now();
  const diffDays = Math.floor((now - tsMs) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Вчера';
  if (diffDays < 7) return `${diffDays} дн. назад`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`;
  
  const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

const formatModality = (modality?: string) => {
  if (!modality) return '—';
  const lower = modality.toLowerCase();
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

// Семейства моделей
const familySource = (name: string, modelId: string): string =>
  `${name} ${modelId}`.toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();

const isVersionToken = (token: string): boolean =>
  /^v?\d+(?:\.\d+)*$/.test(token) || /^(?:20\d{2}|\d{3,})$/.test(token);

const wordsFromFamilySource = (src: string): string[] =>
  src.split(' ').map(w => w.trim()).filter(Boolean)
    .filter(w => w.length >= 3).filter(w => !FAMILY_STOPWORDS.has(w)).filter(w => !isVersionToken(w));

const titleCaseFamily = (value: string): string => {
  const upper = new Set(['glm', 'dbrx', 'tts', 'sdxl', 'sd', 'api', 'xai']);
  if (upper.has(value)) return value.toUpperCase();
  return value.split(' ').filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const getModelFamily = (name: string, modelId: string): string => {
  const lower = (name + ' ' + modelId).toLowerCase();
  if (lower.includes('grok') || lower.includes('xai')) return 'Grok';
  if (lower.includes('nvidia') || lower.includes('nemotron')) return 'NVIDIA';
  if (lower.includes('gpt') || lower.includes('chatgpt') || lower.match(/\bo\d\b/) || lower.match(/\bo\d-/)) return 'GPT';
  if (lower.includes('claude')) return 'Claude';
  if (lower.includes('gemini')) return 'Gemini';
  if (lower.includes('deepseek')) return 'DeepSeek';
  if (lower.includes('llama') || lower.includes('codellama') || lower.includes('code-llama')) return 'Llama';
  if (lower.includes('mistral') || lower.includes('mixtral') || lower.includes('codestral')) return 'Mistral';
  if (lower.includes('qwen')) return 'Qwen';
  if (lower.includes('phi')) return 'Phi';
  if (lower.includes('cohere') || lower.includes('command')) return 'Cohere';
  if (lower.includes('gemma')) return 'Gemma';
  if (lower.includes('yi') || lower.match(/\byi\b/)) return 'Yi';
  if (lower.includes('glm') || lower.includes('chatglm')) return 'GLM';
  if (lower.includes('internlm')) return 'InternLM';
  if (lower.includes('jamba')) return 'Jamba';
  if (lower.includes('dbrx')) return 'DBRX';
  if (lower.includes('dall-e') || lower.includes('dalle')) return 'DALL-E';
  if (lower.includes('stable-diffusion') || lower.includes('sdxl') || lower.includes('sd-')) return 'Stable Diffusion';
  if (lower.includes('flux')) return 'Flux';
  if (lower.includes('midjourney')) return 'Midjourney';
  if (lower.includes('sora')) return 'Sora';
  if (lower.includes('runway')) return 'Runway';
  if (lower.includes('kling')) return 'Kling';
  if (lower.includes('whisper')) return 'Whisper';
  if (lower.includes('tts')) return 'TTS';
  if (lower.includes('suno')) return 'Suno';
  return FAMILY_OTHER;
};

type FamilyStats = { wordCounts: Map<string, number>; bigramCounts: Map<string, number> };

const buildFamilyStats = (models: AggregatedModel[]): FamilyStats => {
  const wordCounts = new Map<string, number>();
  const bigramCounts = new Map<string, number>();
  for (const model of models) {
    const src = familySource(model.name, model.providerModelId);
    const words = wordsFromFamilySource(src);
    const uniqWords = new Set(words);
    for (const w of uniqWords) wordCounts.set(w, (wordCounts.get(w) ?? 0) + 1);
    const bigrams: string[] = [];
    for (let i = 0; i < words.length - 1; i++) bigrams.push(`${words[i]} ${words[i + 1]}`);
    const uniqBigrams = new Set(bigrams);
    for (const b of uniqBigrams) bigramCounts.set(b, (bigramCounts.get(b) ?? 0) + 1);
  }
  return { wordCounts, bigramCounts };
};

// Определение какие assign-кнопки доступны
const getAvailableAssigns = (model: AggregatedModel): AssignType[] => {
  const cat = model.category.toLowerCase();
  if (cat === 'image') return ['image'];
  if (cat === 'video' || cat === 'audio') return [];
  return ['text', 'youtube'];
};

// ============== UI Компоненты ==============

const Badge: React.FC<{ label: string; variant?: 'default' | 'warning' | 'success' }> = ({ label, variant = 'default' }) => {
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

// ============== Главный компонент ==============

export const ModelsTableCore: React.FC<ModelsTableCoreProps> = ({
  models,
  showProviderColumn = true,
  mode = 'inline',
  showAssignButtons = false,
  showDetailsPanel = true,
  showGrouping = false,
  maxHeight = '400px',
  displayLimit: initialDisplayLimit = 20,
  onAssign,
  showLoadMore = true,
  loading = false,
  currentAssignments,
}) => {
  const { t, favoriteModelIds, toggleFavoriteModel, modelConfig } = useAppContext();

  // Используем переданные assignments или fallback на modelConfig
  const effectiveAssignments = currentAssignments ?? {
    textModel: modelConfig.textModel,
    youtubeModel: modelConfig.youtubeModel,
    imageModel: modelConfig.imageModel,
  };

  // UI состояние
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('elo');
  const [sortDir, setSortDir] = useState<SortDir>(DEFAULT_SORT_DIR.elo);
  const [onlyFree, setOnlyFree] = useState(false);
  const [onlyCheapest, setOnlyCheapest] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortFavoritesTop, setSortFavoritesTop] = useState(true);
  const [selectedModel, setSelectedModel] = useState<AggregatedModel | null>(null);
  const [displayLimit, setDisplayLimit] = useState(initialDisplayLimit);
  const [showGroups, setShowGroups] = useState(showGrouping);

  // Свёрнутые семейства
  const [collapsedFamilies, setCollapsedFamilies] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(LS_COLLAPSED_FAMILIES);
      if (raw) return new Set(JSON.parse(raw));
    } catch {}
    return new Set();
  });

  const favoriteIds = useMemo(() => new Set(favoriteModelIds), [favoriteModelIds]);

  const toggleFamily = (family: string) => {
    setCollapsedFamilies(prev => {
      const next = new Set(prev);
      if (next.has(family)) next.delete(family);
      else next.add(family);
      return next;
    });
  };

  // Сохранение свёрнутых семейств
  useEffect(() => {
    try { localStorage.setItem(LS_COLLAPSED_FAMILIES, JSON.stringify([...collapsedFamilies])); } catch {}
  }, [collapsedFamilies]);

  const handleSortChange = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDir(DEFAULT_SORT_DIR[key]);
  };

  const toggleFavorite = (modelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteModel(modelId);
  };

  // Проверка назначения модели
  const isAssignedAs = (modelId: string, type: AssignType): boolean => {
    switch (type) {
      case 'text': return effectiveAssignments.textModel === modelId;
      case 'youtube': return effectiveAssignments.youtubeModel === modelId;
      case 'image': return effectiveAssignments.imageModel === modelId;
      default: return false;
    }
  };

  const handleAssign = (model: AggregatedModel, type: AssignType, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAssign) {
      // Конвертируем providerId в ApiProvider
      const providerMap: Record<string, ApiProvider> = {
        openrouter: 'openrouter',
        gemini: 'gemini',
        replicate: 'replicate',
      };
      const provider = providerMap[model.providerId] || 'openrouter';
      onAssign(model.providerModelId, type, provider);
    }
  };

  // Конвертируем все модели в AggregatedModel
  const normalizedModels = useMemo(() => models.map(toAggregatedModel), [models]);

  // Фильтрация и сортировка
  const displayModels = useMemo(() => {
    let result = normalizedModels;

    // Поиск
    if (search) {
      const q = normalize(search);
      result = result.filter(m => {
        const hay = `${m.name} ${m.providerModelId} ${m.providerName}`;
        return normalize(hay).includes(q);
      });
    }

    // Только бесплатные
    if (onlyFree) result = result.filter(m => m.isFree);

    // Только с лучшей ценой
    if (onlyCheapest) result = result.filter(m => m.isCheapest);

    // Только избранные
    if (onlyFavorites) result = result.filter(m => favoriteIds.has(m.id));

    // Сортировка
    const dir = sortDir === 'asc' ? 1 : -1;
    const sorted = [...result].sort((a, b) => {
      switch (sortKey) {
        case 'name': return dir * a.name.localeCompare(b.name);
        case 'provider': return dir * a.providerName.localeCompare(b.providerName);
        case 'category': return dir * a.category.localeCompare(b.category);
        case 'priceIn': return dir * ((a.pricing.inputPerM ?? Infinity) - (b.pricing.inputPerM ?? Infinity));
        case 'priceOut': return dir * ((a.pricing.outputPerM ?? Infinity) - (b.pricing.outputPerM ?? Infinity));
        case 'context': return dir * ((a.contextLength ?? 0) - (b.contextLength ?? 0));
        case 'maxOutput': return dir * ((a.maxOutputTokens ?? 0) - (b.maxOutputTokens ?? 0));
        case 'modality': return dir * (a.modality ?? '').localeCompare(b.modality ?? '');
        case 'created': return dir * ((a.createdAt ?? 0) - (b.createdAt ?? 0));
        case 'elo': return dir * ((a.elo ?? 0) - (b.elo ?? 0));
        default: return 0;
      }
    });

    // Избранные вверху
    if (sortFavoritesTop) {
      const favs = sorted.filter(m => favoriteIds.has(m.id));
      const rest = sorted.filter(m => !favoriteIds.has(m.id));
      return [...favs, ...rest];
    }

    return sorted;
  }, [normalizedModels, search, onlyFree, onlyCheapest, onlyFavorites, favoriteIds, sortKey, sortDir, sortFavoritesTop]);

  // Группировка по семействам
  const groupedModels = useMemo(() => {
    const stats = buildFamilyStats(displayModels);

    const pickDynamicFamily = (model: AggregatedModel): string => {
      const base = getModelFamily(model.name, model.providerModelId);
      if (base !== FAMILY_OTHER) return base;

      const src = familySource(model.name, model.providerModelId);
      const words = wordsFromFamilySource(src);

      let best: { key: string; count: number } | null = null;
      for (let i = 0; i < words.length - 1; i++) {
        const key = `${words[i]} ${words[i + 1]}`;
        const count = stats.bigramCounts.get(key) ?? 0;
        if (count > 1 && (!best || count > best.count)) best = { key, count };
      }
      for (const w of new Set(words)) {
        const count = stats.wordCounts.get(w) ?? 0;
        if (count > 1 && (!best || count > best.count)) best = { key: w, count };
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

  const collapseAll = () => setCollapsedFamilies(new Set(groupedModels.map(([f]) => f)));
  const expandAll = () => setCollapsedFamilies(new Set());

  // Сброс лимита при смене фильтров
  useEffect(() => { setDisplayLimit(initialDisplayLimit); }, [search, onlyFree, onlyCheapest, onlyFavorites, initialDisplayLimit]);

  const isInline = mode === 'inline';

  // ============== Рендер строки таблицы ==============
  const renderModelRow = (model: AggregatedModel, inGroup = false) => {
    const provider = getProviderById(model.providerId);
    const isFav = favoriteIds.has(model.id);
    const availableAssigns = getAvailableAssigns(model);

    return (
      <tr
        key={model.id}
        className={`hover:bg-[#252526] transition-colors cursor-pointer ${
          selectedModel?.id === model.id ? 'bg-[#007acc]/10 border-l-2 border-l-[#007acc]' : ''
        } ${isFav ? 'bg-yellow-900/5' : ''} ${inGroup ? 'bg-[#1a1a1a]' : ''}`}
        onClick={() => setSelectedModel(model)}
      >
        {/* Избранное */}
        <td className="p-3 w-10">
          <button
            onClick={(e) => toggleFavorite(model.id, e)}
            className={`p-1 rounded transition-colors ${
              isFav ? 'text-yellow-400 hover:text-yellow-300' : 'text-[#555] hover:text-yellow-400'
            }`}
            title={isFav ? 'Убрать из избранного' : 'Добавить в избранное'}
          >
            <Star className={`w-4 h-4 ${isFav ? 'fill-yellow-400' : ''}`} />
          </button>
        </td>

        {/* Название */}
        <td className="p-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{model.name}</span>
              {model.inLeaderboard && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-400 border border-amber-700/50" title="В топ-рейтинге Artificial Analysis">
                  🏆 AA
                </span>
              )}
            </div>
            <span className="text-[10px] font-mono text-[#858585] break-all">{model.providerModelId}</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {model.isFree && <Badge label="Бесплатно" variant="success" />}
              {model.isNew && <Badge label="Новая" />}
              {model.isCheapest && <CheapestBadge />}
            </div>
          </div>
        </td>

        {/* Провайдер */}
        {showProviderColumn && (
          <td className="p-3">
            {provider && <ProviderBadge provider={provider} small />}
          </td>
        )}

        {/* Тип */}
        <td className="p-3">
          <Badge label={model.category} />
        </td>

        {/* Контекст */}
        <td className="p-3">
          <span className="text-xs font-mono text-[#ccc]">{formatContext(model.contextLength)}</span>
        </td>

        {/* Выход */}
        <td className="p-3">
          <span className="text-xs font-mono text-[#ccc]">{formatMaxOutput(model.maxOutputTokens)}</span>
        </td>

        {/* Модальность */}
        <td className="p-3">
          <span className="text-[10px] font-mono text-[#888]">{formatModality(model.modality)}</span>
        </td>

        {/* Дата */}
        <td className="p-3">
          <span className="text-[10px] text-[#888]">{formatCreatedAt(model.createdAt)}</span>
        </td>

        {/* Цена */}
        <td className="p-3">
          <div className="text-[10px] text-[#ccc] font-mono">
            {model.pricing.inputPerM !== undefined && <div>in: {formatPrice(model.pricing.inputPerM)}</div>}
            {model.pricing.outputPerM !== undefined && <div>out: {formatPrice(model.pricing.outputPerM)}</div>}
            {model.pricing.imagePerUnit !== undefined && <div>img: {formatImagePrice(model.pricing.imagePerUnit)}</div>}
          </div>
        </td>

        {/* Quick Assign */}
        {showAssignButtons && (
          <td className="p-3">
            <div className="flex items-center gap-1">
              {availableAssigns.includes('text') && (
                <button
                  onClick={(e) => handleAssign(model, 'text', e)}
                  className={`p-1.5 rounded transition-colors ${
                    isAssignedAs(model.providerModelId, 'text')
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#333] text-[#999] hover:bg-blue-900/50 hover:text-blue-300'
                  }`}
                  title="Назначить для текста"
                >
                  {isAssignedAs(model.providerModelId, 'text') ? <Check className="w-3 h-3" /> : <Brain className="w-3 h-3" />}
                </button>
              )}
              {availableAssigns.includes('youtube') && (
                <button
                  onClick={(e) => handleAssign(model, 'youtube', e)}
                  className={`p-1.5 rounded transition-colors ${
                    isAssignedAs(model.providerModelId, 'youtube')
                      ? 'bg-red-600 text-white'
                      : 'bg-[#333] text-[#999] hover:bg-red-900/50 hover:text-red-300'
                  }`}
                  title="Назначить для YouTube"
                >
                  {isAssignedAs(model.providerModelId, 'youtube') ? <Check className="w-3 h-3" /> : <Youtube className="w-3 h-3" />}
                </button>
              )}
              {availableAssigns.includes('image') && (
                <button
                  onClick={(e) => handleAssign(model, 'image', e)}
                  className={`p-1.5 rounded transition-colors ${
                    isAssignedAs(model.providerModelId, 'image')
                      ? 'bg-purple-600 text-white'
                      : 'bg-[#333] text-[#999] hover:bg-purple-900/50 hover:text-purple-300'
                  }`}
                  title="Назначить для картинок"
                >
                  {isAssignedAs(model.providerModelId, 'image') ? <Check className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                </button>
              )}
            </div>
          </td>
        )}
      </tr>
    );
  };

  return (
    <div className="bg-[#1e1e1e] border border-[#3e3e42] rounded-lg overflow-hidden">
      {/* Заголовок с фильтрами */}
      <div className="p-3 border-b border-[#3e3e42] bg-[#252526] flex flex-wrap gap-2 items-center">
        {/* Поиск */}
        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-[#666]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('hubSearch')}
            className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded pl-7 pr-2 py-1.5 text-xs text-white focus:border-[#007acc] outline-none placeholder-[#555]"
          />
        </div>

        {/* Фильтры */}
        <button
          onClick={() => setOnlyFavorites(!onlyFavorites)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
            onlyFavorites 
              ? 'bg-yellow-900/30 border-yellow-500/30 text-yellow-300' 
              : 'bg-[#1e1e1e] border-[#3e3e42] text-[#888] hover:text-yellow-300'
          }`}
        >
          <Star className={`w-3 h-3 ${onlyFavorites ? 'fill-yellow-400' : ''}`} />
          {favoriteIds.size}
        </button>

        <button
          onClick={() => setSortFavoritesTop(!sortFavoritesTop)}
          className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
            sortFavoritesTop 
              ? 'bg-blue-900/30 border-blue-500/30 text-blue-300' 
              : 'bg-[#1e1e1e] border-[#3e3e42] text-[#888]'
          }`}
          title={sortFavoritesTop ? 'Избранные вверху' : 'Смешанная сортировка'}
        >
          ⬆ Вверху
        </button>

        <button
          onClick={() => setOnlyFree(!onlyFree)}
          className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
            onlyFree 
              ? 'bg-green-900/30 border-green-500/30 text-green-300' 
              : 'bg-[#1e1e1e] border-[#3e3e42] text-[#888]'
          }`}
        >
          Бесплатные
        </button>

        <button
          onClick={() => setOnlyCheapest(!onlyCheapest)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
            onlyCheapest 
              ? 'bg-green-900/30 border-green-500/30 text-green-300' 
              : 'bg-[#1e1e1e] border-[#3e3e42] text-[#888]'
          }`}
        >
          <DollarSign className="w-3 h-3" />
          Лучшие цены
        </button>

        {/* Группировка */}
        {showGrouping && (
          <button
            onClick={() => setShowGroups(!showGroups)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
              showGroups 
                ? 'bg-blue-900/30 border-blue-500/30 text-blue-300' 
                : 'bg-[#1e1e1e] border-[#3e3e42] text-[#888]'
            }`}
          >
            {showGroups ? <FolderOpen className="w-3 h-3" /> : <FolderClosed className="w-3 h-3" />}
            Группы
          </button>
        )}

        {/* Счётчик */}
        <div className="text-[10px] text-[#666]">
          {displayModels.length} моделей
        </div>
      </div>

      {/* Основной контент */}
      <div className={`flex ${showDetailsPanel ? 'flex-col lg:flex-row' : ''}`}>
        {/* Таблица */}
        <div className={`${showDetailsPanel && selectedModel ? 'lg:flex-1' : 'w-full'} min-w-0`}>
          <div className="overflow-auto custom-scrollbar" style={{ maxHeight: isInline ? maxHeight : '60vh' }}>
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#252526] text-[10px] font-bold text-[#858585] uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="p-3 border-b border-[#3e3e42] w-10"></th>
                  <th className="p-3 border-b border-[#3e3e42]">
                    <button onClick={() => handleSortChange('name')} className="flex items-center gap-1 hover:text-[#ccc]">
                      Модель <span className={sortKey === 'name' ? 'text-[#007acc]' : 'text-[#555]'}>{sortKey === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</span>
                    </button>
                  </th>
                  {showProviderColumn && (
                    <th className="p-3 border-b border-[#3e3e42] w-28">
                      <button onClick={() => handleSortChange('provider')} className="flex items-center gap-1 hover:text-[#ccc]">
                        Провайдер <span className={sortKey === 'provider' ? 'text-[#007acc]' : 'text-[#555]'}>{sortKey === 'provider' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</span>
                      </button>
                    </th>
                  )}
                  <th className="p-3 border-b border-[#3e3e42] w-20">
                    <button onClick={() => handleSortChange('category')} className="flex items-center gap-1 hover:text-[#ccc]">
                      Тип <span className={sortKey === 'category' ? 'text-[#007acc]' : 'text-[#555]'}>{sortKey === 'category' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</span>
                    </button>
                  </th>
                  <th className="p-3 border-b border-[#3e3e42] w-20">
                    <button onClick={() => handleSortChange('context')} className="flex items-center gap-1 hover:text-[#ccc]">
                      Контекст <span className={sortKey === 'context' ? 'text-[#007acc]' : 'text-[#555]'}>{sortKey === 'context' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</span>
                    </button>
                  </th>
                  <th className="p-3 border-b border-[#3e3e42] w-16">
                    <button onClick={() => handleSortChange('maxOutput')} className="flex items-center gap-1 hover:text-[#ccc]">
                      Выход <span className={sortKey === 'maxOutput' ? 'text-[#007acc]' : 'text-[#555]'}>{sortKey === 'maxOutput' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</span>
                    </button>
                  </th>
                  <th className="p-3 border-b border-[#3e3e42] w-20">
                    <button onClick={() => handleSortChange('modality')} className="flex items-center gap-1 hover:text-[#ccc]">
                      Модальн. <span className={sortKey === 'modality' ? 'text-[#007acc]' : 'text-[#555]'}>{sortKey === 'modality' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</span>
                    </button>
                  </th>
                  <th className="p-3 border-b border-[#3e3e42] w-20">
                    <button onClick={() => handleSortChange('created')} className="flex items-center gap-1 hover:text-[#ccc]">
                      Добавлена <span className={sortKey === 'created' ? 'text-[#007acc]' : 'text-[#555]'}>{sortKey === 'created' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</span>
                    </button>
                  </th>
                  <th className="p-3 border-b border-[#3e3e42] w-28">
                    <button onClick={() => handleSortChange('priceIn')} className="flex items-center gap-1 hover:text-[#ccc]">
                      Цена <span className={sortKey === 'priceIn' ? 'text-[#007acc]' : 'text-[#555]'}>{sortKey === 'priceIn' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</span>
                    </button>
                  </th>
                  {showAssignButtons && <th className="p-3 border-b border-[#3e3e42] w-24 text-center">Назначить</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2d2e]">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-3"><div className="h-4 w-4 bg-[#333] rounded" /></td>
                      <td className="p-3"><div className="h-4 w-48 bg-[#333] rounded" /></td>
                      {showProviderColumn && <td className="p-3"><div className="h-4 w-20 bg-[#333] rounded" /></td>}
                      <td className="p-3"><div className="h-4 w-12 bg-[#333] rounded" /></td>
                      <td className="p-3"><div className="h-4 w-12 bg-[#333] rounded" /></td>
                      <td className="p-3"><div className="h-4 w-12 bg-[#333] rounded" /></td>
                      <td className="p-3"><div className="h-4 w-16 bg-[#333] rounded" /></td>
                      <td className="p-3"><div className="h-4 w-16 bg-[#333] rounded" /></td>
                      <td className="p-3"><div className="h-4 w-20 bg-[#333] rounded" /></td>
                      {showAssignButtons && <td className="p-3"><div className="h-4 w-16 bg-[#333] rounded" /></td>}
                    </tr>
                  ))
                ) : displayModels.length === 0 ? (
                  <tr>
                    <td colSpan={showProviderColumn ? (showAssignButtons ? 10 : 9) : (showAssignButtons ? 9 : 8)} className="p-8 text-center text-[#666] text-xs italic">
                      Модели не найдены. Попробуйте изменить фильтры.
                    </td>
                  </tr>
                ) : !showGroups ? (
                  displayModels.slice(0, displayLimit).map(model => renderModelRow(model))
                ) : (
                  groupedModels.map(([family, familyModels]) => {
                    const isCollapsed = collapsedFamilies.has(family);
                    const visibleModels = familyModels.slice(0, displayLimit);
                    return (
                      <React.Fragment key={family}>
                        <tr
                          className="bg-[#252526] cursor-pointer hover:bg-[#2a2d2e]"
                          onClick={() => toggleFamily(family)}
                        >
                          <td colSpan={showProviderColumn ? (showAssignButtons ? 10 : 9) : (showAssignButtons ? 9 : 8)} className="p-3">
                            <div className="flex items-center gap-2">
                              {isCollapsed ? <ChevronRight className="w-4 h-4 text-[#888]" /> : <ChevronDown className="w-4 h-4 text-[#888]" />}
                              <span className="text-sm font-bold text-white">{family}</span>
                              <span className="text-[10px] text-[#666]">({familyModels.length})</span>
                            </div>
                          </td>
                        </tr>
                        {!isCollapsed && visibleModels.map(model => renderModelRow(model, true))}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Показать ещё */}
          {showLoadMore && displayModels.length > displayLimit && (
            <div className="px-4 py-3 border-t border-[#3e3e42] flex items-center justify-center gap-3 bg-[#252526]">
              <button
                onClick={() => setDisplayLimit(prev => prev + 20)}
                className="px-4 py-2 bg-[#333] hover:bg-[#444] border border-[#3e3e42] rounded text-xs font-bold text-[#ccc]"
              >
                Показать ещё 20
              </button>
              <button
                onClick={() => setDisplayLimit(displayModels.length)}
                className="px-4 py-2 bg-[#007acc] hover:bg-[#0587d4] rounded text-xs font-bold text-white"
              >
                Показать все ({displayModels.length})
              </button>
            </div>
          )}
        </div>

        {/* Панель деталей */}
        {showDetailsPanel && (
          <div className={`border-t lg:border-t-0 lg:border-l border-[#3e3e42] bg-[#1e1e1e] transition-all ${
            selectedModel ? 'lg:w-80' : 'lg:w-0 lg:overflow-hidden'
          }`}>
            {selectedModel ? (
              <>
                <div className="px-4 py-3 border-b border-[#3e3e42] flex items-center justify-between bg-[#252526]">
                  <div className="text-[10px] text-[#858585] uppercase tracking-wider font-bold flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-[#007acc]" />
                    Детали модели
                  </div>
                  <button onClick={() => setSelectedModel(null)} className="text-[#666] hover:text-white p-1 rounded hover:bg-[#333]">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="px-4 py-4 space-y-4 overflow-auto custom-scrollbar" style={{ maxHeight: isInline ? maxHeight : '55vh' }}>
                  {/* Название */}
                  <div>
                    <div className="text-sm font-bold text-white break-words">{selectedModel.name}</div>
                    <div className="text-[10px] font-mono text-[#858585] break-all mt-1">{selectedModel.providerModelId}</div>
                    {selectedModel.accessUrl && (
                      <a href={selectedModel.accessUrl} target="_blank" rel="noreferrer" className="text-[#007acc] hover:underline text-[10px] flex items-center gap-1 mt-2">
                        Открыть API <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Описание */}
                  {selectedModel.description && (
                    <div className="text-[11px] text-[#ccc] leading-relaxed">{selectedModel.description}</div>
                  )}

                  {/* Бейджи */}
                  <div className="flex flex-wrap gap-1">
                    {selectedModel.isFree && <Badge label="Бесплатно" variant="success" />}
                    {selectedModel.isNew && <Badge label="Новая" />}
                    {selectedModel.isCheapest && <CheapestBadge />}
                    <Badge label={selectedModel.category} />
                  </div>

                  {/* Контекст и выход */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-[#252526] border border-[#3e3e42] rounded">
                      <div className="text-[9px] text-[#858585] font-bold uppercase flex items-center gap-1"><Layers className="w-3 h-3" /> Контекст</div>
                      <div className="text-xs font-mono text-white mt-1">{formatContext(selectedModel.contextLength)}</div>
                    </div>
                    <div className="p-3 bg-[#252526] border border-[#3e3e42] rounded">
                      <div className="text-[9px] text-[#858585] font-bold uppercase flex items-center gap-1"><Cpu className="w-3 h-3" /> Макс. выход</div>
                      <div className="text-xs font-mono text-white mt-1">{formatMaxOutput(selectedModel.maxOutputTokens)}</div>
                    </div>
                  </div>

                  {/* Цена */}
                  <div className="p-3 bg-[#252526] border border-[#3e3e42] rounded">
                    <div className="text-[9px] text-[#858585] font-bold uppercase flex items-center gap-1"><DollarSign className="w-3 h-3" /> Цена</div>
                    <div className="text-xs font-mono text-white mt-2 space-y-1">
                      {selectedModel.pricing.inputPerM !== undefined && <div>in: <span className="text-green-400">{formatPrice(selectedModel.pricing.inputPerM)}</span></div>}
                      {selectedModel.pricing.outputPerM !== undefined && <div>out: <span className="text-green-400">{formatPrice(selectedModel.pricing.outputPerM)}</span></div>}
                      {selectedModel.pricing.imagePerUnit !== undefined && <div>img: <span className="text-green-400">{formatImagePrice(selectedModel.pricing.imagePerUnit)}</span></div>}
                    </div>
                  </div>

                  {/* Провайдер */}
                  <div className="p-3 bg-[#252526] border border-[#3e3e42] rounded">
                    <div className="text-[9px] text-[#858585] font-bold uppercase">Провайдер</div>
                    <div className="mt-2">
                      {getProviderById(selectedModel.providerId) && <ProviderBadge provider={getProviderById(selectedModel.providerId)!} />}
                    </div>
                  </div>

                  {/* Дата */}
                  {selectedModel.createdAt && (
                    <div className="p-3 bg-[#252526] border border-[#3e3e42] rounded">
                      <div className="text-[9px] text-[#858585] font-bold uppercase flex items-center gap-1"><Calendar className="w-3 h-3" /> Добавлено</div>
                      <div className="text-xs font-mono text-white mt-1">{formatCreatedAt(selectedModel.createdAt)}</div>
                    </div>
                  )}

                  {/* Quick Assign в панели */}
                  {showAssignButtons && getAvailableAssigns(selectedModel).length > 0 && (
                    <div className="p-3 bg-[#252526] border border-[#3e3e42] rounded">
                      <div className="text-[9px] text-[#858585] font-bold uppercase mb-2">Быстрое назначение</div>
                      <div className="flex flex-wrap gap-2">
                        {getAvailableAssigns(selectedModel).includes('text') && (
                          <button
                            onClick={(e) => handleAssign(selectedModel, 'text', e)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                              isAssignedAs(selectedModel.providerModelId, 'text')
                                ? 'bg-blue-600 text-white'
                                : 'bg-[#333] text-[#ccc] hover:bg-blue-900/50'
                            }`}
                          >
                            {isAssignedAs(selectedModel.providerModelId, 'text') ? <Check className="w-3.5 h-3.5" /> : <Brain className="w-3.5 h-3.5" />}
                            Текст
                          </button>
                        )}
                        {getAvailableAssigns(selectedModel).includes('youtube') && (
                          <button
                            onClick={(e) => handleAssign(selectedModel, 'youtube', e)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                              isAssignedAs(selectedModel.providerModelId, 'youtube')
                                ? 'bg-red-600 text-white'
                                : 'bg-[#333] text-[#ccc] hover:bg-red-900/50'
                            }`}
                          >
                            {isAssignedAs(selectedModel.providerModelId, 'youtube') ? <Check className="w-3.5 h-3.5" /> : <Youtube className="w-3.5 h-3.5" />}
                            YouTube
                          </button>
                        )}
                        {getAvailableAssigns(selectedModel).includes('image') && (
                          <button
                            onClick={(e) => handleAssign(selectedModel, 'image', e)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                              isAssignedAs(selectedModel.providerModelId, 'image')
                                ? 'bg-purple-600 text-white'
                                : 'bg-[#333] text-[#ccc] hover:bg-purple-900/50'
                            }`}
                          >
                            {isAssignedAs(selectedModel.providerModelId, 'image') ? <Check className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                            Картинка
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* JSON */}
                  <details className="p-3 bg-[#252526] border border-[#3e3e42] rounded">
                    <summary className="text-[9px] text-[#858585] font-bold uppercase cursor-pointer hover:text-white">Сырой JSON</summary>
                    <pre className="mt-2 text-[9px] text-[#ccc] whitespace-pre-wrap break-words max-h-40 overflow-auto custom-scrollbar">
{JSON.stringify(selectedModel, null, 2)}
                    </pre>
                  </details>
                </div>
              </>
            ) : (
              <div className="hidden lg:block px-4 py-10 text-center text-[#666] text-xs italic">
                Выберите модель для просмотра деталей
              </div>
            )}
          </div>
        )}
      </div>

      {/* Футер */}
      <div className="p-2 border-t border-[#3e3e42] bg-[#252526] text-[10px] text-[#666] flex justify-between">
        <span>Избранных: {Array.from(favoriteIds).filter(id => displayModels.some(m => m.id === id)).length}</span>
        <span>Показано: {Math.min(displayLimit, displayModels.length)} / {displayModels.length}</span>
      </div>
    </div>
  );
};

export default ModelsTableCore;
