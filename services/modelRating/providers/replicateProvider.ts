/**
 * Провайдер: Replicate
 * API: https://api.replicate.com/v1/models (требует ключ)
 * Особенность: 500+ моделей, картинки, видео, аудио
 */

import { UnifiedModel, ProviderModelsResult } from '../types';

// Replicate API сложный (пагинация, много данных)
// Используем курируемый список популярных моделей + опционально API

const CACHE_KEY = 'modelRating:replicate:models:v1';
const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 часов

type ReplicatePaginated<T> = {
  next: string | null;
  previous: string | null;
  results: T[];
};

type ReplicateApiModel = {
  owner: string;
  name: string;
  description?: string | null;
  url?: string;
  run_count?: number;
  latest_version?: {
    id: string;
    created_at?: string;
  } | null;
};

const safeId = (value: string): string =>
  value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-_/]/g, '-');

const loadCache = (): { fetchedAtMs: number; models: UnifiedModel[] } | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { fetchedAtMs: number; models: UnifiedModel[] };
    if (!parsed?.fetchedAtMs || !Array.isArray(parsed.models)) return null;
    if (Date.now() - parsed.fetchedAtMs > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
};

const saveCache = (models: UnifiedModel[]): void => {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ fetchedAtMs: Date.now(), models }),
    );
  } catch {
    // ignore
  }
};

const mapApiModelToUnified = (m: ReplicateApiModel): UnifiedModel => {
  const providerModelId = `${m.owner}/${m.name}`;
  const createdAt = m.latest_version?.created_at
    ? Math.floor(Date.parse(m.latest_version.created_at) / 1000)
    : undefined;

  return {
    id: `replicate:${safeId(providerModelId)}`,
    name: providerModelId,
    providerId: 'replicate',
    providerModelId,
    category: 'multimodal',
    pricing: {},
    description: m.description ?? undefined,
    createdAt,
    accessUrl: m.url ?? `https://replicate.com/${providerModelId}`,
  };
};

const fetchApiModels = async (apiKey: string): Promise<UnifiedModel[]> => {
  const merged: UnifiedModel[] = [];
  let url: string | null =
    'https://api.replicate.com/v1/models?sort_by=latest_version_created_at&sort_direction=desc';
  let pagesFetched = 0;

  while (url && pagesFetched < 6 && merged.length < 200) {
    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!resp.ok) {
      throw new Error(`Replicate API error: ${resp.status}`);
    }

    const data = (await resp.json()) as ReplicatePaginated<ReplicateApiModel>;
    for (const item of data.results ?? []) {
      merged.push(mapApiModelToUnified(item));
      if (merged.length >= 200) break;
    }

    url = data.next;
    pagesFetched += 1;
  }

  return merged;
};

const CURATED_MODELS: UnifiedModel[] = [
  // === ИЗОБРАЖЕНИЯ ===
  {
    id: 'replicate:flux-pro',
    name: 'Flux Pro 1.1',
    providerId: 'replicate',
    providerModelId: 'black-forest-labs/flux-1.1-pro',
    category: 'image',
    pricing: { imagePerUnit: 0.04 },
    description: 'Высококачественная генерация изображений от Black Forest Labs',
    accessUrl: 'https://replicate.com/black-forest-labs/flux-1.1-pro',
  },
  {
    id: 'replicate:flux-dev',
    name: 'Flux Dev',
    providerId: 'replicate',
    providerModelId: 'black-forest-labs/flux-dev',
    category: 'image',
    pricing: { imagePerUnit: 0.025 },
    description: 'Flux для разработки и тестирования',
    accessUrl: 'https://replicate.com/black-forest-labs/flux-dev',
  },
  {
    id: 'replicate:flux-schnell',
    name: 'Flux Schnell',
    providerId: 'replicate',
    providerModelId: 'black-forest-labs/flux-schnell',
    category: 'image',
    pricing: { imagePerUnit: 0.003 },
    description: 'Самая быстрая версия Flux',
    accessUrl: 'https://replicate.com/black-forest-labs/flux-schnell',
  },
  {
    id: 'replicate:sdxl',
    name: 'Stable Diffusion XL',
    providerId: 'replicate',
    providerModelId: 'stability-ai/sdxl',
    category: 'image',
    pricing: { imagePerUnit: 0.0023 },
    description: 'Stable Diffusion XL от Stability AI',
    accessUrl: 'https://replicate.com/stability-ai/sdxl',
  },
  {
    id: 'replicate:sd3',
    name: 'Stable Diffusion 3',
    providerId: 'replicate',
    providerModelId: 'stability-ai/stable-diffusion-3',
    category: 'image',
    pricing: { imagePerUnit: 0.035 },
    description: 'Stable Diffusion 3 от Stability AI',
    accessUrl: 'https://replicate.com/stability-ai/stable-diffusion-3',
  },
  {
    id: 'replicate:ideogram',
    name: 'Ideogram v2 Turbo',
    providerId: 'replicate',
    providerModelId: 'ideogram-ai/ideogram-v2-turbo',
    category: 'image',
    pricing: { imagePerUnit: 0.04 },
    description: 'Отличная работа с текстом на изображениях',
    accessUrl: 'https://replicate.com/ideogram-ai/ideogram-v2-turbo',
  },
  {
    id: 'replicate:recraft-v3',
    name: 'Recraft V3',
    providerId: 'replicate',
    providerModelId: 'recraft-ai/recraft-v3',
    category: 'image',
    pricing: { imagePerUnit: 0.04 },
    description: 'Высококачественные иллюстрации и иконки',
    accessUrl: 'https://replicate.com/recraft-ai/recraft-v3',
  },

  // === ВИДЕО ===
  {
    id: 'replicate:kling-1.6',
    name: 'Kling 1.6 Pro',
    providerId: 'replicate',
    providerModelId: 'kwaivgi/kling-v1.6-pro',
    category: 'video',
    pricing: { requestFixed: 0.32 },
    description: 'Генерация видео от Kuaishou',
    accessUrl: 'https://replicate.com/kwaivgi/kling-v1.6-pro',
  },
  {
    id: 'replicate:luma-ray2',
    name: 'Luma Ray 2',
    providerId: 'replicate',
    providerModelId: 'luma/ray-2',
    category: 'video',
    pricing: { requestFixed: 0.40 },
    description: 'Luma Dream Machine Ray 2',
    accessUrl: 'https://replicate.com/luma/ray-2',
  },
  {
    id: 'replicate:minimax',
    name: 'MiniMax Video-01',
    providerId: 'replicate',
    providerModelId: 'minimax/video-01',
    category: 'video',
    pricing: { requestFixed: 0.30 },
    description: 'Генерация видео от MiniMax',
    accessUrl: 'https://replicate.com/minimax/video-01',
  },
  {
    id: 'replicate:wan-2.1',
    name: 'Wan 2.1',
    providerId: 'replicate',
    providerModelId: 'wavymulder/wan-2.1',
    category: 'video',
    pricing: { requestFixed: 0.10 },
    description: 'Text-to-Video модель Wan',
    accessUrl: 'https://replicate.com/wavymulder/wan-2.1',
  },

  // === АУДИО ===
  {
    id: 'replicate:whisper',
    name: 'Whisper Large V3',
    providerId: 'replicate',
    providerModelId: 'openai/whisper',
    category: 'audio',
    pricing: { audioPerMinute: 0.006 },
    description: 'Speech-to-Text от OpenAI',
    accessUrl: 'https://replicate.com/openai/whisper',
  },
  {
    id: 'replicate:xtts-v2',
    name: 'XTTS v2',
    providerId: 'replicate',
    providerModelId: 'lucataco/xtts-v2',
    category: 'audio',
    pricing: { requestFixed: 0.02 },
    description: 'Text-to-Speech с клонированием голоса',
    accessUrl: 'https://replicate.com/lucataco/xtts-v2',
  },
  {
    id: 'replicate:musicgen',
    name: 'MusicGen',
    providerId: 'replicate',
    providerModelId: 'meta/musicgen',
    category: 'audio',
    pricing: { requestFixed: 0.03 },
    description: 'Генерация музыки от Meta',
    accessUrl: 'https://replicate.com/meta/musicgen',
  },

  // === ТЕКСТ ===
  {
    id: 'replicate:llama-3.1-405b',
    name: 'Llama 3.1 405B',
    providerId: 'replicate',
    providerModelId: 'meta/meta-llama-3.1-405b-instruct',
    category: 'text',
    contextLength: 128000,
    pricing: { inputPerM: 0.95, outputPerM: 0.95 },
    description: 'Крупнейшая open-source модель Meta',
    accessUrl: 'https://replicate.com/meta/meta-llama-3.1-405b-instruct',
  },
  {
    id: 'replicate:llama-3.3-70b',
    name: 'Llama 3.3 70B',
    providerId: 'replicate',
    providerModelId: 'meta/llama-3.3-70b-instruct',
    category: 'text',
    contextLength: 128000,
    pricing: { inputPerM: 0.35, outputPerM: 0.40 },
    description: 'Оптимизированная 70B модель Meta',
    accessUrl: 'https://replicate.com/meta/llama-3.3-70b-instruct',
  },
];

export const fetchReplicateModels = async (apiKey?: string): Promise<ProviderModelsResult> => {
  if (!apiKey) {
    return {
      providerId: 'replicate',
      models: CURATED_MODELS,
      lastUpdated: Date.now(),
    };
  }

  const cached = loadCache();
  if (cached) {
    return {
      providerId: 'replicate',
      models: cached.models,
      lastUpdated: cached.fetchedAtMs,
    };
  }

  try {
    const apiModels = await fetchApiModels(apiKey);

    // Сохраняем curated-модели (с ценами) при совпадении providerModelId
    const byProviderModelId = new Map<string, UnifiedModel>();
    for (const m of apiModels) byProviderModelId.set(m.providerModelId, m);
    for (const curated of CURATED_MODELS) {
      byProviderModelId.set(curated.providerModelId, curated);
    }

    const models = Array.from(byProviderModelId.values());
    saveCache(models);

    return {
      providerId: 'replicate',
      models,
      lastUpdated: Date.now(),
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return {
      providerId: 'replicate',
      models: CURATED_MODELS,
      lastUpdated: Date.now(),
      error: `Replicate: не удалось загрузить список моделей из API (${message}). Показан curated-список.`,
    };
  }
};
