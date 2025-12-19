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
  DollarSign,
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
  | 'name'
  | 'priceIn'
  | 'priceOut'
  | 'context'
  | 'created';

const LS_ENABLED_PROVIDERS = 'autopost_enabled_providers';
const LS_API_KEYS = 'autopost_provider_api_keys';

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
    // По умолчанию только официальные
    return PROVIDERS_CONFIG.filter(p => p.type === 'official' && p.enabled).map(p => p.id);
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
  const [sortKey, setSortKey] = useState<SortKey>('priceIn');
  const [onlyFree, setOnlyFree] = useState(false);
  const [onlyCheapest, setOnlyCheapest] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AggregatedModel | null>(null);

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

    // Сортировка
    const cmp = (a: AggregatedModel, b: AggregatedModel) => {
      switch (sortKey) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'priceIn':
          return (a.pricing.inputPerM ?? Infinity) - (b.pricing.inputPerM ?? Infinity);
        case 'priceOut':
          return (a.pricing.outputPerM ?? Infinity) - (b.pricing.outputPerM ?? Infinity);
        case 'context':
          return (b.contextLength ?? 0) - (a.contextLength ?? 0);
        case 'created':
          return (b.createdAt ?? 0) - (a.createdAt ?? 0);
        default:
          return 0;
      }
    };

    return [...models].sort(cmp);
  }, [result, activeTab, category, search, onlyFree, onlyCheapest, sortKey]);

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
              onChange={e => setSortKey(e.target.value as SortKey)}
              className="bg-[#252526] border border-[#3e3e42] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#007acc]"
            >
              <option value="priceIn">Цена (вход)</option>
              <option value="priceOut">Цена (выход)</option>
              <option value="name">Название</option>
              <option value="context">Контекст</option>
              <option value="created">Дата</option>
            </select>
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

      {/* Таблица */}
      <div className="overflow-auto custom-scrollbar" style={{ maxHeight: '60vh' }}>
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#252526] text-[10px] font-bold text-[#858585] uppercase tracking-wider sticky top-0 z-10">
            <tr>
              <th className="p-4 border-b border-[#3e3e42]">Модель</th>
              {activeTab === 'all' && (
                <th className="p-4 border-b border-[#3e3e42] w-32">Провайдер</th>
              )}
              <th className="p-4 border-b border-[#3e3e42] w-24">Тип</th>
              <th className="p-4 border-b border-[#3e3e42] w-24">Контекст</th>
              <th className="p-4 border-b border-[#3e3e42] w-40">Цена</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2d2e]">
            {loading && !result ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="p-4"><div className="h-4 w-56 bg-[#333] rounded" /></td>
                  {activeTab === 'all' && <td className="p-4"><div className="h-4 w-20 bg-[#333] rounded" /></td>}
                  <td className="p-4"><div className="h-4 w-16 bg-[#333] rounded" /></td>
                  <td className="p-4"><div className="h-4 w-12 bg-[#333] rounded" /></td>
                  <td className="p-4"><div className="h-4 w-28 bg-[#333] rounded" /></td>
                </tr>
              ))
            ) : displayModels.length === 0 ? (
              <tr>
                <td colSpan={activeTab === 'all' ? 5 : 4} className="p-8 text-center text-[#666] text-xs italic">
                  Модели не найдены. Попробуйте изменить фильтры.
                </td>
              </tr>
            ) : (
              displayModels.slice(0, 150).map(model => {
                const provider = getProviderById(model.providerId);
                
                return (
                  <tr
                    key={model.id}
                    className={`hover:bg-[#252526] transition-colors cursor-pointer ${
                      selectedModel?.id === model.id ? 'bg-[#252526]' : ''
                    }`}
                    onClick={() => setSelectedModel(model)}
                  >
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
            )}
          </tbody>
        </table>
      </div>

      {/* Футер */}
      <div className="px-6 py-3 border-t border-[#252526] text-[10px] text-[#858585] flex items-start gap-2">
        <Info className="w-4 h-4 text-[#007acc] mt-0.5 shrink-0" />
        <div>
          <div>Показано {Math.min(displayModels.length, 150)} из {displayModels.length} моделей</div>
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
