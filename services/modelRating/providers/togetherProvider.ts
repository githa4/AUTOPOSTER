/**
 * Провайдер: Together AI
 * API: https://api.together.xyz/v1/models (требует ключ)
 */

import { UnifiedModel, ModelCategory, ProviderModelsResult } from '../types';

interface TogetherModel {
  id: string;
  object: string;
  created: number;
  type: string;
  display_name?: string;
  organization?: string;
  context_length?: number;
  pricing?: {
    input?: number;
    output?: number;
    hourly?: number;
  };
}

const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 часов

let cache: {
  fetchedAtMs: number;
  models: UnifiedModel[];
} | undefined;

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9/_\-.]/g, '');

const detectCategory = (model: TogetherModel): ModelCategory => {
  const type = (model.type ?? '').toLowerCase();
  const id = normalize(model.id);

  if (type.includes('image') || id.includes('stable-diffusion') || id.includes('sdxl')) return 'image';
  if (type.includes('embedding') || type.includes('moderation')) return 'text';
  
  const isCoding = id.includes('code') || id.includes('coder');
  if (isCoding) return 'coding';

  return 'text';
};

const transformModel = (m: TogetherModel): UnifiedModel => {
  // Together API возвращает цену за токен, умножаем на 1M
  const inputPerM = m.pricing?.input ? m.pricing.input * 1_000_000 : undefined;
  const outputPerM = m.pricing?.output ? m.pricing.output * 1_000_000 : undefined;

  return {
    id: `together:${m.id}`,
    name: m.display_name || m.id.split('/').pop() || m.id,
    providerId: 'together',
    providerModelId: m.id,
    category: detectCategory(m),
    contextLength: m.context_length,
    pricing: {
      inputPerM,
      outputPerM,
    },
    createdAt: m.created,
    isFree: inputPerM === 0 && outputPerM === 0,
    accessUrl: `https://api.together.xyz/models/${m.id}`,
  };
};

export const fetchTogetherModels = async (apiKey?: string): Promise<ProviderModelsResult> => {
  const now = Date.now();
  
  if (!apiKey) {
    return {
      providerId: 'together',
      models: cache?.models ?? [],
      lastUpdated: cache?.fetchedAtMs ?? now,
      error: 'API ключ не указан',
    };
  }

  if (cache && now - cache.fetchedAtMs < CACHE_TTL_MS) {
    return {
      providerId: 'together',
      models: cache.models,
      lastUpdated: cache.fetchedAtMs,
    };
  }

  try {
    const response = await fetch('https://api.together.xyz/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Together AI: ${response.status} ${text}`.trim());
    }

    const body = await response.json() as TogetherModel[];
    const models = Array.isArray(body) ? body.map(transformModel) : [];

    cache = {
      fetchedAtMs: now,
      models,
    };

    return {
      providerId: 'together',
      models,
      lastUpdated: now,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      providerId: 'together',
      models: cache?.models ?? [],
      lastUpdated: cache?.fetchedAtMs ?? now,
      error: msg,
    };
  }
};
