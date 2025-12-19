/**
 * Провайдер: Fireworks AI
 * API: https://api.fireworks.ai/inference/v1/models (требует ключ)
 */

import { UnifiedModel, ModelCategory, ProviderModelsResult } from '../types';

interface FireworksModel {
  id: string;
  object: string;
  created?: number;
  owned_by?: string;
  context_length?: number;
  pricing?: {
    input_price_per_token?: number;
    output_price_per_token?: number;
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

const detectCategory = (id: string): ModelCategory => {
  const normalized = normalize(id);
  
  if (normalized.includes('code') || normalized.includes('coder')) return 'coding';
  if (normalized.includes('vision') || normalized.includes('image')) return 'multimodal';
  
  return 'text';
};

const transformModel = (m: FireworksModel): UnifiedModel => {
  const inputPerM = m.pricing?.input_price_per_token 
    ? m.pricing.input_price_per_token * 1_000_000 
    : undefined;
  const outputPerM = m.pricing?.output_price_per_token 
    ? m.pricing.output_price_per_token * 1_000_000 
    : undefined;

  const name = m.id.split('/').pop() || m.id;

  return {
    id: `fireworks:${m.id}`,
    name,
    providerId: 'fireworks',
    providerModelId: m.id,
    category: detectCategory(m.id),
    contextLength: m.context_length,
    pricing: {
      inputPerM,
      outputPerM,
    },
    createdAt: m.created,
    isFree: inputPerM === 0 && outputPerM === 0,
    accessUrl: `https://fireworks.ai/models/${m.id}`,
  };
};

export const fetchFireworksModels = async (apiKey?: string): Promise<ProviderModelsResult> => {
  const now = Date.now();
  
  if (!apiKey) {
    return {
      providerId: 'fireworks',
      models: cache?.models ?? [],
      lastUpdated: cache?.fetchedAtMs ?? now,
      error: 'API ключ не указан',
    };
  }

  if (cache && now - cache.fetchedAtMs < CACHE_TTL_MS) {
    return {
      providerId: 'fireworks',
      models: cache.models,
      lastUpdated: cache.fetchedAtMs,
    };
  }

  try {
    const response = await fetch('https://api.fireworks.ai/inference/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Fireworks AI: ${response.status} ${text}`.trim());
    }

    const body = await response.json() as { data: FireworksModel[] };
    const models = Array.isArray(body.data) ? body.data.map(transformModel) : [];

    cache = {
      fetchedAtMs: now,
      models,
    };

    return {
      providerId: 'fireworks',
      models,
      lastUpdated: now,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      providerId: 'fireworks',
      models: cache?.models ?? [],
      lastUpdated: cache?.fetchedAtMs ?? now,
      error: msg,
    };
  }
};
