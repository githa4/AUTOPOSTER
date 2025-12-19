/**
 * Провайдер: Groq
 * API: https://api.groq.com/openai/v1/models (требует ключ)
 * Особенность: Сверхбыстрые LPU-чипы, бесплатный тир!
 */

import { UnifiedModel, ModelCategory, ProviderModelsResult } from '../types';

interface GroqModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  active: boolean;
  context_window?: number;
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
  if (normalized.includes('vision') || normalized.includes('llava')) return 'multimodal';
  if (normalized.includes('whisper')) return 'audio';
  
  return 'text';
};

// Groq pricing (бесплатный тир с лимитами, но есть и платные планы)
// Цены примерные на декабрь 2025
const GROQ_PRICING: Record<string, { input: number; output: number }> = {
  'llama-3.3-70b-versatile': { input: 0.59, output: 0.79 },
  'llama-3.1-70b-versatile': { input: 0.59, output: 0.79 },
  'llama-3.1-8b-instant': { input: 0.05, output: 0.08 },
  'llama3-70b-8192': { input: 0.59, output: 0.79 },
  'llama3-8b-8192': { input: 0.05, output: 0.08 },
  'mixtral-8x7b-32768': { input: 0.24, output: 0.24 },
  'gemma2-9b-it': { input: 0.20, output: 0.20 },
  'gemma-7b-it': { input: 0.07, output: 0.07 },
};

const transformModel = (m: GroqModel): UnifiedModel => {
  const pricing = GROQ_PRICING[m.id] ?? { input: 0.10, output: 0.10 };
  
  // Форматируем имя
  const name = m.id
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
    .replace(/(\d+)b/gi, '$1B');

  return {
    id: `groq:${m.id}`,
    name,
    providerId: 'groq',
    providerModelId: m.id,
    category: detectCategory(m.id),
    contextLength: m.context_window,
    pricing: {
      inputPerM: pricing.input,
      outputPerM: pricing.output,
    },
    createdAt: m.created,
    isFree: true, // Groq имеет бесплатный тир
    accessUrl: `https://console.groq.com/docs/models#${m.id}`,
  };
};

export const fetchGroqModels = async (apiKey?: string): Promise<ProviderModelsResult> => {
  const now = Date.now();
  
  if (!apiKey) {
    return {
      providerId: 'groq',
      models: cache?.models ?? [],
      lastUpdated: cache?.fetchedAtMs ?? now,
      error: 'API ключ не указан',
    };
  }

  if (cache && now - cache.fetchedAtMs < CACHE_TTL_MS) {
    return {
      providerId: 'groq',
      models: cache.models,
      lastUpdated: cache.fetchedAtMs,
    };
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Groq: ${response.status} ${text}`.trim());
    }

    const body = await response.json() as { data: GroqModel[] };
    const models = Array.isArray(body.data) 
      ? body.data.filter(m => m.active).map(transformModel) 
      : [];

    cache = {
      fetchedAtMs: now,
      models,
    };

    return {
      providerId: 'groq',
      models,
      lastUpdated: now,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      providerId: 'groq',
      models: cache?.models ?? [],
      lastUpdated: cache?.fetchedAtMs ?? now,
      error: msg,
    };
  }
};
