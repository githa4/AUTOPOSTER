/**
 * Провайдер: OpenRouter
 * API: https://openrouter.ai/api/v1/models (публичный, без ключа)
 */

import { UnifiedModel, ModelCategory, ProviderModelsResult } from '../types';

interface OpenRouterModel {
  id: string;
  name: string;
  created?: number;
  description?: string;
  context_length?: number;
  architecture?: {
    modality?: string;
    tokenizer?: string;
  };
  pricing?: {
    prompt?: string;
    completion?: string;
    image?: string;
    audio?: string;
  };
  top_provider?: {
    context_length?: number;
    max_completion_tokens?: number;
  };
  per_request_limits?: {
    max_input_tokens?: number;
    max_output_tokens?: number;
  };
}

const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 часов

let cache: {
  fetchedAtMs: number;
  models: UnifiedModel[];
} | undefined;

const toPerM = (perToken: string | undefined): number | undefined => {
  if (!perToken) return undefined;
  const parsed = Number.parseFloat(perToken);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed * 1_000_000;
};

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9/_\-.]/g, '');

const detectCategory = (model: OpenRouterModel): ModelCategory => {
  const modalityRaw = model.architecture?.modality ?? '';
  const modality = normalize(modalityRaw);
  const id = normalize(model.id);
  const name = normalize(model.name);

  if (modality.includes('video')) return 'video';
  if (modality.includes('audio')) return 'audio';
  
  // Проверяем вывод изображений
  if (modality.includes('->image') || modality.includes('+image->')) return 'image';
  
  // Модели с вводом изображений (vision) = multimodal
  if (modality.includes('image->') || modality.includes('image+')) return 'multimodal';

  const isCoding =
    id.includes('code') ||
    name.includes('code') ||
    id.includes('coder') ||
    name.includes('coder');
  if (isCoding) return 'coding';

  return 'text';
};

const transformModel = (m: OpenRouterModel): UnifiedModel => {
  const idLower = (m.id ?? '').toLowerCase();
  const nameLower = (m.name ?? '').toLowerCase();
  const isFree = idLower.includes(':free') || nameLower.includes('free');

  const NOW_DAYS = 30;
  const nowMs = Date.now();
  const isNew = typeof m.created === 'number'
    ? nowMs - m.created * 1000 <= NOW_DAYS * 24 * 60 * 60 * 1000
    : false;

  return {
    id: `openrouter:${m.id}`,
    name: m.name,
    providerId: 'openrouter',
    providerModelId: m.id,
    category: detectCategory(m),
    contextLength: m.context_length ?? m.top_provider?.context_length,
    maxOutputTokens: m.top_provider?.max_completion_tokens ?? m.per_request_limits?.max_output_tokens,
    pricing: {
      inputPerM: toPerM(m.pricing?.prompt),
      outputPerM: toPerM(m.pricing?.completion),
      imagePerUnit: m.pricing?.image ? Number.parseFloat(m.pricing.image) : undefined,
      audioPerMinute: m.pricing?.audio ? Number.parseFloat(m.pricing.audio) : undefined,
    },
    description: m.description,
    createdAt: m.created,
    isFree,
    isNew,
    modality: m.architecture?.modality,
    accessUrl: `https://openrouter.ai/models/${m.id}`,
  };
};

export const fetchOpenRouterModels = async (): Promise<ProviderModelsResult> => {
  const now = Date.now();
  
  if (cache && now - cache.fetchedAtMs < CACHE_TTL_MS) {
    return {
      providerId: 'openrouter',
      models: cache.models,
      lastUpdated: cache.fetchedAtMs,
    };
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/models');
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`OpenRouter: ${response.status} ${text}`.trim());
    }

    const body = await response.json() as { data: OpenRouterModel[] };
    const models = Array.isArray(body.data) ? body.data.map(transformModel) : [];

    cache = {
      fetchedAtMs: now,
      models,
    };

    return {
      providerId: 'openrouter',
      models,
      lastUpdated: now,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      providerId: 'openrouter',
      models: cache?.models ?? [],
      lastUpdated: cache?.fetchedAtMs ?? now,
      error: msg,
    };
  }
};
