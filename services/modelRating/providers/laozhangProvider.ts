/**
 * Провайдер: LaoZhang.ai (НЕОФИЦИАЛЬНЫЙ)
 * ⚠️ Реселлер, используйте на свой риск
 * Динамическая загрузка через OpenAI-совместимый API /v1/models
 */

import { UnifiedModel, ProviderModelsResult, ModelCategory } from '../types';

const API_BASE = 'https://api.laozhang.ai';
const LS_CACHE_KEY = 'autopost_laozhang_models_cache';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 час

interface CacheEntry {
  fetchedAtMs: number;
  models: UnifiedModel[];
}

// Определение категории по имени модели
const guessCategory = (id: string): ModelCategory => {
  const lower = id.toLowerCase();
  
  // Image модели (максимально широкий список)
  if (
    lower.includes('dall-e') || lower.includes('dalle') ||
    lower.includes('stable-diffusion') || lower.includes('sdxl') || lower.includes('sd-') ||
    lower.includes('midjourney') ||
    lower.includes('flux') ||
    lower.includes('ideogram') ||
    lower.includes('imagen') ||
    lower.includes('playground') ||
    lower.includes('kolors') ||
    lower.includes('recraft') ||
    lower.includes('pixart') ||
    lower.includes('hunyuan') ||
    lower.includes('omnigen') ||
    lower.includes('image') && !lower.includes('imagebind')
  ) return 'image';
  
  // Audio
  if (lower.includes('whisper') || lower.includes('tts') || lower.includes('audio') || lower.includes('suno')) return 'audio';
  
  // Video
  if (lower.includes('video') || lower.includes('sora') || lower.includes('runway') || lower.includes('kling')) return 'video';
  
  // Multimodal (текст + картинки)
  if (lower.includes('4o') || lower.includes('gemini') || lower.includes('vision') || lower.includes('multimodal')) return 'multimodal';
  
  // Coding
  if (lower.includes('code') || lower.includes('codex') || lower.includes('starcoder') || lower.includes('deepseek-coder')) return 'coding';
  
  return 'text';
};

// Форматирование имени модели
const formatModelName = (id: string): string => {
  return id
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/Gpt/g, 'GPT')
    .replace(/Dall E/gi, 'DALL-E')
    .replace(/Tts/g, 'TTS')
    .replace(/4o/g, '4o')
    .trim();
};

// Примерные цены (LaoZhang обычно ~50-70% от оригинала)
const guessPricing = (id: string): { inputPerM: number; outputPerM: number } => {
  const lower = id.toLowerCase();
  // GPT-4 Turbo
  if (lower.includes('gpt-4-turbo') || lower.includes('gpt-4-1106')) return { inputPerM: 3.0, outputPerM: 9.0 };
  // GPT-4o
  if (lower.includes('gpt-4o-mini')) return { inputPerM: 0.075, outputPerM: 0.30 };
  if (lower.includes('gpt-4o')) return { inputPerM: 1.25, outputPerM: 5.0 };
  // GPT-4
  if (lower.includes('gpt-4')) return { inputPerM: 5.0, outputPerM: 15.0 };
  // GPT-3.5
  if (lower.includes('gpt-3.5')) return { inputPerM: 0.25, outputPerM: 0.75 };
  // Claude 3.5
  if (lower.includes('claude-3-5') || lower.includes('claude-3.5')) return { inputPerM: 1.5, outputPerM: 7.5 };
  // Claude 3 Opus
  if (lower.includes('claude-3-opus')) return { inputPerM: 7.5, outputPerM: 37.5 };
  // Claude 3 Sonnet/Haiku
  if (lower.includes('claude-3-sonnet')) return { inputPerM: 1.5, outputPerM: 7.5 };
  if (lower.includes('claude-3-haiku')) return { inputPerM: 0.125, outputPerM: 0.625 };
  // DeepSeek
  if (lower.includes('deepseek')) return { inputPerM: 0.07, outputPerM: 0.14 };
  // o1/o3
  if (lower.includes('o1-') || lower.includes('o3-')) return { inputPerM: 7.5, outputPerM: 30.0 };
  // Gemini
  if (lower.includes('gemini')) return { inputPerM: 0.35, outputPerM: 1.05 };
  // Default
  return { inputPerM: 1.0, outputPerM: 3.0 };
};

// Примерный контекст
const guessContext = (id: string): number => {
  const lower = id.toLowerCase();
  if (lower.includes('claude-3')) return 200000;
  if (lower.includes('gpt-4-turbo') || lower.includes('gpt-4o') || lower.includes('gpt-4-1106')) return 128000;
  if (lower.includes('gpt-4-32k')) return 32000;
  if (lower.includes('gpt-4')) return 8192;
  if (lower.includes('gpt-3.5-turbo-16k')) return 16000;
  if (lower.includes('gpt-3.5')) return 4096;
  if (lower.includes('deepseek')) return 64000;
  if (lower.includes('gemini')) return 1000000;
  if (lower.includes('o1') || lower.includes('o3')) return 128000;
  return 8192;
};

const loadCache = (): CacheEntry | null => {
  try {
    const raw = localStorage.getItem(LS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (Date.now() - parsed.fetchedAtMs < CACHE_TTL_MS) return parsed;
  } catch {}
  return null;
};

const saveCache = (models: UnifiedModel[]) => {
  try {
    const entry: CacheEntry = { fetchedAtMs: Date.now(), models };
    localStorage.setItem(LS_CACHE_KEY, JSON.stringify(entry));
  } catch {}
};

export const fetchLaozhangModels = async (apiKey?: string): Promise<ProviderModelsResult> => {
  // Без ключа — возвращаем пустой список
  if (!apiKey) {
    return {
      providerId: 'laozhang',
      models: [],
      lastUpdated: Date.now(),
      error: 'API ключ не указан',
    };
  }

  // Проверяем кэш
  const cached = loadCache();
  if (cached) {
    return {
      providerId: 'laozhang',
      models: cached.models,
      lastUpdated: cached.fetchedAtMs,
    };
  }

  try {
    const response = await fetch(`${API_BASE}/v1/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    const data = json.data ?? json.models ?? json;

    if (!Array.isArray(data)) {
      throw new Error('Неожиданный формат ответа');
    }

    const models: UnifiedModel[] = data.map((m: any) => {
      const modelId = m.id ?? m.name ?? 'unknown';
      return {
        id: `laozhang:${modelId}`,
        name: formatModelName(modelId),
        providerId: 'laozhang',
        providerModelId: modelId,
        category: guessCategory(modelId),
        contextLength: guessContext(modelId),
        pricing: guessPricing(modelId),
        description: `${formatModelName(modelId)} через LaoZhang (реселлер)`,
        accessUrl: API_BASE,
        createdAt: m.created ? m.created * 1000 : undefined,
      };
    });

    // Сортируем: новые сверху
    models.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

    saveCache(models);

    return {
      providerId: 'laozhang',
      models,
      lastUpdated: Date.now(),
    };
  } catch (e: any) {
    console.error('[LaoZhang] Failed to fetch models:', e);
    return {
      providerId: 'laozhang',
      models: [],
      lastUpdated: Date.now(),
      error: e.message ?? 'Ошибка загрузки моделей',
    };
  }
};
