/**
 * Universal Model Registry Service
 * 
 * Единая система загрузки моделей для всех провайдеров с:
 * - Кэшированием в localStorage (TTL 24 часа)
 * - Ленивой загрузкой при первом запросе
 * - Пагинацией для больших списков
 * - Fallback на статические модели при ошибках
 */

import { Model, ApiProvider } from '../types';
import { getSpecsForModel, GEMINI_TEXT_MODELS, KIE_DEFAULT_MODELS } from './geminiService';
import { fetchReplicateModels as fetchReplicateFromProvider } from './modelRating/providers/replicateProvider';

// === CONSTANTS ===
const CACHE_KEY_PREFIX = 'autopost_models_cache_';
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours
const PROXY_URL = 'https://corsproxy.io/?';

// === TYPES ===
interface CacheEntry {
    models: Model[];
    fetchedAt: number;
    provider: ApiProvider;
}

interface FetchOptions {
    apiKey: string;
    forceRefresh?: boolean;
    signal?: AbortSignal;
}

const normalizeAndSortNewestFirst = (models: Model[]): Model[] => {
    const nowSec = Date.now() / 1000;
    return models
        .map((m, idx) => ({
            ...m,
            created: typeof m.created === 'number' && Number.isFinite(m.created)
                ? m.created
                : (nowSec - idx),
        }))
        .sort((a, b) => (b.created || 0) - (a.created || 0));
};

/**
 * Конвертирует UnifiedModel из providerReplicateProvider в формат Model
 */
const convertUnifiedToModel = (unified: any): Model => {
    const formatPricing = (pricing: any) => {
        if (!pricing) return { prompt: '?', completion: '' };
        if (pricing.perImage) return { prompt: `$${pricing.perImage}/image`, completion: '' };
        if (pricing.videoPerSecond) return { prompt: `$${pricing.videoPerSecond}/sec`, completion: '' };
        if (pricing.perMinute) return { prompt: `$${pricing.perMinute}/min`, completion: '' };
        if (pricing.inputPerM || pricing.outputPerM) {
            return { 
                prompt: pricing.inputPerM ? `$${pricing.inputPerM}/1M` : '?',
                completion: pricing.outputPerM ? `$${pricing.outputPerM}/1M` : ''
            };
        }
        return { prompt: '?', completion: '' };
    };

    // Мапинг category -> modality
    const categoryToModality = (cat?: string): string => {
        switch (cat) {
            case 'image': return 'text->image';
            case 'video': return 'text->video';
            case 'audio': return 'text->audio';
            case 'tts': return 'text->speech';
            case 'coding': return 'text->code';
            case 'multimodal': return 'multi->multi';
            default: return 'text->text';
        }
    };

    return {
        // Используем providerModelId для API (owner/name формат)
        // raw.uniqueId хранит уникальный id для React keys
        id: unified.providerModelId || unified.id,
        name: unified.name,
        provider: 'replicate' as ApiProvider,
        description: unified.description || `${unified.category} model${unified.elo ? ` (ELO: ${unified.elo})` : ''}`,
        contextLength: unified.contextLength || 0,
        isFree: unified.isFree ?? false,
        created: unified.createdAt || Date.now() / 1000,
        pricing: formatPricing(unified.pricing),
        modality: categoryToModality(unified.category),
        category: unified.category || 'text',
        // Сохраняем уникальный id и category для дедупликации
        raw: { uniqueId: unified.id, category: unified.category },
    };
};

// Загружаем модели из replicateProvider (включая лидерборд)
let _replicateModelsCache: Model[] | null = null;
const getReplicateFallbackModels = async (): Promise<Model[]> => {
    if (_replicateModelsCache) return _replicateModelsCache;
    
    const result = await fetchReplicateFromProvider();
    _replicateModelsCache = result.models.map(convertUnifiedToModel);
    return _replicateModelsCache;
};

// Синхронный fallback для начальной загрузки (10 базовых моделей)
const REPLICATE_FALLBACK_MODELS_SYNC: Model[] = [
    { id: 'black-forest-labs/flux-schnell', name: 'FLUX.1 Schnell', provider: 'replicate', description: '🏆 AA — Fastest open model', isFree: false, contextLength: 0, pricing: { prompt: '$0.003/image', completion: '' } },
    { id: 'black-forest-labs/flux-dev', name: 'FLUX.1 Dev', provider: 'replicate', description: '🏆 AA — Professional grade', isFree: false, contextLength: 0, pricing: { prompt: '$0.025/image', completion: '' } },
    { id: 'black-forest-labs/flux-1.1-pro', name: 'FLUX 1.1 Pro', provider: 'replicate', description: '🏆 AA — Top quality', isFree: false, contextLength: 0, pricing: { prompt: '$0.04/image', completion: '' } },
    { id: 'black-forest-labs/flux-2-max', name: 'FLUX.2 [max]', provider: 'replicate', description: '🏆 AA (ELO: 1211)', isFree: false, contextLength: 0, pricing: { prompt: '$0.025/image', completion: '' } },
    { id: 'black-forest-labs/flux-2-pro', name: 'FLUX.2 [pro]', provider: 'replicate', description: '🏆 AA (ELO: 1201)', isFree: false, contextLength: 0, pricing: { prompt: '$0.02/image', completion: '' } },
    { id: 'stability-ai/sdxl', name: 'Stable Diffusion XL', provider: 'replicate', description: 'Classic reliable model', isFree: false, contextLength: 0, pricing: { prompt: '$0.002/image', completion: '' } },
    { id: 'recraft-ai/recraft-v3', name: 'Recraft V3', provider: 'replicate', description: '🏆 AA — Vector Art', isFree: false, contextLength: 0, pricing: { prompt: '$0.04/image', completion: '' } },
    { id: 'ideogram-ai/ideogram-v3', name: 'Ideogram 3.0', provider: 'replicate', description: '🏆 AA — Text rendering', isFree: false, contextLength: 0, pricing: { prompt: '$0.03/image', completion: '' } },
    { id: 'kuaishou/kolors-2.1', name: 'Kolors 2.1', provider: 'replicate', description: '🏆 AA (ELO: 1128)', isFree: false, contextLength: 0, pricing: { prompt: '$0.01/image', completion: '' } },
    { id: 'minimax/hailuo-video-01', name: 'Hailuo T2V 01', provider: 'replicate', description: '🏆 AA — Video generation', isFree: false, contextLength: 0, pricing: { prompt: '$0.018/sec', completion: '' } },
];

const OPENROUTER_FALLBACK_MODELS: Model[] = [
    { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'openrouter', description: 'Most capable OpenAI model.', contextLength: 128000, isFree: false, pricing: { prompt: '$2.50/1M', completion: '$10.00/1M' } },
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openrouter', description: 'Fast and cheap GPT-4 variant.', contextLength: 128000, isFree: false, pricing: { prompt: '$0.15/1M', completion: '$0.60/1M' } },
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'openrouter', description: 'Best balance of speed and intelligence.', contextLength: 200000, isFree: false, pricing: { prompt: '$3.00/1M', completion: '$15.00/1M' } },
    { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash', provider: 'openrouter', description: 'Fast multimodal Google model.', contextLength: 1000000, isFree: false, pricing: { prompt: '$0.10/1M', completion: '$0.40/1M' } },
    { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', provider: 'openrouter', description: 'Open-source powerhouse.', contextLength: 131072, isFree: false, pricing: { prompt: '$0.40/1M', completion: '$0.40/1M' } },
];

const OPENAI_FALLBACK_MODELS: Model[] = [
    { id: 'gpt-4o', name: 'GPT-4o (OpenAI)', provider: 'openai', description: 'Official OpenAI ChatGPT-grade model.', contextLength: 128000, isFree: false, pricing: { prompt: '?', completion: '?' } },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini (OpenAI)', provider: 'openai', description: 'Fast, cost-optimized OpenAI model.', contextLength: 128000, isFree: false, pricing: { prompt: '?', completion: '?' } },
    { id: 'o1-mini', name: 'o1-mini (OpenAI)', provider: 'openai', description: 'Reasoning-focused model (if enabled on your account).', contextLength: 128000, isFree: false, pricing: { prompt: '?', completion: '?' } },
];

// === CACHE HELPERS ===
const getCacheKey = (provider: ApiProvider) => `${CACHE_KEY_PREFIX}${provider}`;

const getFromCache = (provider: ApiProvider): CacheEntry | null => {
    try {
        const raw = localStorage.getItem(getCacheKey(provider));
        if (!raw) return null;
        const entry: CacheEntry = JSON.parse(raw);
        // Check TTL
        if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) {
            localStorage.removeItem(getCacheKey(provider));
            return null;
        }
        return entry;
    } catch {
        return null;
    }
};

const saveToCache = (provider: ApiProvider, models: Model[]) => {
    try {
        const entry: CacheEntry = {
            models: normalizeAndSortNewestFirst(models),
            fetchedAt: Date.now(),
            provider
        };
        localStorage.setItem(getCacheKey(provider), JSON.stringify(entry));
    } catch (e) {
        console.warn('Cache save failed:', e);
    }
};

export const getCachedModels = (provider: ApiProvider): Model[] | null => {
    const cached = getFromCache(provider);
    return cached?.models ? normalizeAndSortNewestFirst(cached.models) : null;
};

// === PROVIDER FETCHERS ===

/**
 * Fetch Gemini models from Google AI API
 */
const fetchGeminiModels = async (apiKey: string, signal?: AbortSignal): Promise<Model[]> => {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
            { signal }
        );
        if (!response.ok) throw new Error(`Gemini API: ${response.status}`);
        
        const data = await response.json();
        const models: Model[] = (data.models || [])
            .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
            .map((m: any) => ({
                id: m.name.replace('models/', ''),
                name: m.displayName || m.name.replace('models/', ''),
                provider: 'gemini' as ApiProvider,
                description: m.description || '',
                contextLength: m.inputTokenLimit || 32000,
                isFree: true,
                created: Date.now() / 1000,
                specs: getSpecsForModel(m.name.replace('models/', '')),
                supportedInputs: m.supportedGenerationMethods || [],
                raw: m
            }));
        
        return models.length > 0 ? models : GEMINI_TEXT_MODELS;
    } catch (e) {
        console.warn('Gemini fetch failed, using fallback:', e);
        return GEMINI_TEXT_MODELS;
    }
};

/**
 * Fetch OpenRouter models
 */
const fetchOpenRouterModels = async (apiKey: string, signal?: AbortSignal): Promise<Model[]> => {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
            headers: { 'Authorization': `Bearer ${apiKey}` },
            signal
        });
        if (!response.ok) throw new Error(`OpenRouter API: ${response.status}`);
        
        const data = await response.json();
        const models: Model[] = (data.data || []).map((m: any) => ({
            id: m.id,
            name: m.name || m.id,
            provider: 'openrouter' as ApiProvider,
            description: m.description || '',
            contextLength: m.context_length || 4096,
            isFree: m.pricing?.prompt === '0' || m.id.includes('free'),
            created: m.created || Date.now() / 1000,
            pricing: m.pricing ? {
                prompt: formatPrice(m.pricing.prompt),
                completion: formatPrice(m.pricing.completion)
            } : undefined,
            specs: getSpecsForModel(m.id),
            raw: m
        }));
        
        return models.length > 0 ? models : OPENROUTER_FALLBACK_MODELS;
    } catch (e) {
        console.warn('OpenRouter fetch failed, using fallback:', e);
        return OPENROUTER_FALLBACK_MODELS;
    }
};

/**
 * Fetch OpenAI models (platform.openai.com)
 * NOTE: In browser environments OpenAI endpoints may be blocked by CORS.
 * We use the same lightweight proxy pattern as Replicate model fetching.
 */
const fetchOpenAiModels = async (apiKey: string, signal?: AbortSignal): Promise<Model[]> => {
    const proxyFetch = async (url: string) => {
        const targetUrl = `${PROXY_URL}${encodeURIComponent(url)}`;
        return fetch(targetUrl, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            signal,
        });
    };

    try {
        const response = await proxyFetch('https://api.openai.com/v1/models');
        if (!response.ok) throw new Error(`OpenAI API: ${response.status}`);

        const data = await response.json();
        const models: Model[] = (data.data || [])
            .filter((m: any) => typeof m?.id === 'string')
            // Keep the list focused: prefer chat/reasoning models.
            .filter((m: any) => /^(gpt-|o\d)/.test(m.id))
            .map((m: any) => ({
                id: m.id,
                name: m.id,
                provider: 'openai' as ApiProvider,
                description: '',
                contextLength: 128000,
                isFree: false,
                created: m.created || Date.now() / 1000,
                specs: getSpecsForModel(m.id),
                raw: m,
            }));

        return models.length > 0 ? models : OPENAI_FALLBACK_MODELS;
    } catch (e) {
        console.warn('OpenAI fetch failed, using fallback:', e);
        return OPENAI_FALLBACK_MODELS;
    }
};

/**
 * Fetch KIE.ai models (OpenAI-compatible API)
 */
const fetchKieModels = async (apiKey: string, signal?: AbortSignal): Promise<Model[]> => {
    try {
        const response = await fetch('https://api.kie.ai/v1/models', {
            headers: { 'Authorization': `Bearer ${apiKey}` },
            signal
        });
        if (!response.ok) throw new Error(`KIE API: ${response.status}`);
        
        const data = await response.json();
        const models: Model[] = (data.data || []).map((m: any) => ({
            id: m.id,
            name: m.name || m.id,
            provider: 'kie' as ApiProvider,
            description: m.description || '',
            contextLength: m.context_length || 128000,
            isFree: false,
            created: m.created || Date.now() / 1000,
            specs: getSpecsForModel(m.id),
            raw: m
        }));
        
        return models.length > 0 ? models : KIE_DEFAULT_MODELS;
    } catch (e) {
        console.warn('KIE fetch failed, using fallback:', e);
        return KIE_DEFAULT_MODELS;
    }
};

/**
 * Fetch Replicate models — использует данные из лидерборда AA
 * + дополняет моделями из API Replicate (только если есть ключ)
 */
const fetchReplicateModels = async (apiKey: string, signal?: AbortSignal): Promise<Model[]> => {
    // Сначала получаем полный список из лидерборда (70+ моделей)
    const leaderboardModels = await getReplicateFallbackModels();
    
    // Если нет API ключа — возвращаем только модели из лидерборда (без API запросов)
    if (!apiKey) {
        return leaderboardModels;
    }
    
    const proxyFetch = async (url: string) => {
        const targetUrl = `${PROXY_URL}${encodeURIComponent(url)}`;
        return fetch(targetUrl, {
            headers: {
                'Authorization': `Token ${apiKey}`,
                'Content-Type': 'application/json'
            },
            signal
        });
    };

    try {
        const leaderboardIds = new Set(leaderboardModels.map(m => m.id));
        
        // Дополняем моделями из API Replicate (коллекции)
        const collectionsToFetch = [
            'text-to-image',
            'image-to-image', 
            'image-upscalers'
        ];
        
        const apiModels: Model[] = [];
        const seenIds = new Set<string>();

        for (const collection of collectionsToFetch) {
            try {
                const response = await proxyFetch(`https://api.replicate.com/v1/collections/${collection}`);
                if (!response.ok) continue;
                
                const data = await response.json();
                const models = (data.models || []).map((m: any) => {
                    const id = `${m.owner}/${m.name}`;
                    if (seenIds.has(id) || leaderboardIds.has(id)) return null;
                    seenIds.add(id);
                    
                    return {
                        id,
                        name: m.name,
                        provider: 'replicate' as ApiProvider,
                        description: m.description || '',
                        contextLength: 0,
                        isFree: false,
                        created: new Date(m.created_at || 0).getTime() / 1000,
                        pricing: { prompt: 'Per Run', completion: '' },
                        raw: m
                    };
                }).filter(Boolean);
                
                apiModels.push(...models);
            } catch {
                // Skip failed collection
            }
        }

        // Лидерборд модели первыми, потом остальные из API
        return [...leaderboardModels, ...apiModels];
    } catch (e) {
        console.warn('Replicate fetch failed, using sync fallback:', e);
        return REPLICATE_FALLBACK_MODELS_SYNC;
    }
};

// === HELPER FUNCTIONS ===
const formatPrice = (price: string | number | undefined): string => {
    if (!price) return '?';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num) || num === 0) return 'Free';
    if (num < 0.000001) return 'Free';
    // Convert to per-million format
    const perMillion = num * 1000000;
    if (perMillion < 0.01) return `$${perMillion.toFixed(4)}/1M`;
    if (perMillion < 1) return `$${perMillion.toFixed(3)}/1M`;
    return `$${perMillion.toFixed(2)}/1M`;
};

// === MAIN EXPORT ===

/**
 * Fetch models for a specific provider
 * Uses cache if available and not expired
 */
export const fetchModelsForProvider = async (
    provider: ApiProvider,
    options: FetchOptions
): Promise<Model[]> => {
    const { apiKey, forceRefresh = false, signal } = options;
    
    if (!apiKey) {
        // Return static fallback without API key
        switch (provider) {
            case 'gemini': return GEMINI_TEXT_MODELS;
            case 'openai': return OPENAI_FALLBACK_MODELS;
            case 'openrouter': return OPENROUTER_FALLBACK_MODELS;
            case 'kie': return KIE_DEFAULT_MODELS;
            case 'replicate': return REPLICATE_FALLBACK_MODELS_SYNC;
            default: return [];
        }
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
        const cached = getFromCache(provider);
        if (cached) {
            return normalizeAndSortNewestFirst(cached.models);
        }
    }

    // Fetch from API
    let models: Model[];
    switch (provider) {
        case 'gemini':
            models = await fetchGeminiModels(apiKey, signal);
            break;
        case 'openai':
            models = await fetchOpenAiModels(apiKey, signal);
            break;
        case 'openrouter':
            models = await fetchOpenRouterModels(apiKey, signal);
            break;
        case 'kie':
            models = await fetchKieModels(apiKey, signal);
            break;
        case 'replicate':
            models = await fetchReplicateModels(apiKey, signal);
            break;
        default:
            models = [];
    }

    // Save to cache
    const normalized = normalizeAndSortNewestFirst(models);

    // Save to cache
    if (normalized.length > 0) {
        saveToCache(provider, normalized);
    }

    return normalized;
};

export const getLatestModels = (provider: ApiProvider, limit: number = 10): Model[] => {
    const cached = getCachedModels(provider);
    const base = cached ?? getStaticModels(provider);
    return normalizeAndSortNewestFirst(base).slice(0, Math.max(0, limit));
};

/**
 * Get cache status for a provider
 */
export const getCacheStatus = (provider: ApiProvider): { isCached: boolean; age: number; count: number } => {
    const cached = getFromCache(provider);
    if (!cached) return { isCached: false, age: 0, count: 0 };
    return {
        isCached: true,
        age: Date.now() - cached.fetchedAt,
        count: cached.models.length
    };
};

/**
 * Clear cache for a provider or all providers
 */
export const clearModelCache = (provider?: ApiProvider) => {
    if (provider) {
        localStorage.removeItem(getCacheKey(provider));
    } else {
        ['gemini', 'openai', 'openrouter', 'kie', 'replicate'].forEach(p => {
            localStorage.removeItem(getCacheKey(p as ApiProvider));
        });
    }
};

/**
 * Get static fallback models (no API call)
 */
export const getStaticModels = (provider: ApiProvider): Model[] => {
    switch (provider) {
        case 'gemini': return GEMINI_TEXT_MODELS;
        case 'openai': return OPENAI_FALLBACK_MODELS;
        case 'openrouter': return OPENROUTER_FALLBACK_MODELS;
        case 'kie': return KIE_DEFAULT_MODELS;
        case 'replicate': return REPLICATE_FALLBACK_MODELS_SYNC;
        default: return [];
    }
};

/**
 * Get all static models for all providers
 */
export const getAllStaticModels = (): Model[] => [
    ...GEMINI_TEXT_MODELS,
    ...OPENAI_FALLBACK_MODELS,
    ...OPENROUTER_FALLBACK_MODELS,
    ...KIE_DEFAULT_MODELS,
    ...REPLICATE_FALLBACK_MODELS_SYNC
];
