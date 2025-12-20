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

const guessCategory = (name: string, description?: string | null): 'text' | 'image' | 'audio' | 'video' | 'code' | 'multimodal' => {
  const lower = `${name} ${description ?? ''}`.toLowerCase();
  
  // Видео
  if (lower.includes('video') || lower.includes('kling') || lower.includes('luma') || 
      lower.includes('runway') || lower.includes('sora') || lower.includes('wan-') ||
      lower.includes('minimax') || lower.includes('animate') || lower.includes('motion')) {
    return 'video';
  }
  
  // Аудио
  if (lower.includes('audio') || lower.includes('whisper') || lower.includes('tts') || 
      lower.includes('speech') || lower.includes('music') || lower.includes('voice') ||
      lower.includes('suno') || lower.includes('bark') || lower.includes('xtts')) {
    return 'audio';
  }
  
  // Изображения
  if (lower.includes('flux') || lower.includes('sdxl') || lower.includes('stable-diffusion') ||
      lower.includes('sd-') || lower.includes('image') || lower.includes('diffusion') ||
      lower.includes('ideogram') || lower.includes('recraft') || lower.includes('dalle') ||
      lower.includes('midjourney') || lower.includes('playground') || lower.includes('kandinsky') ||
      lower.includes('controlnet') || lower.includes('upscale') || lower.includes('img2img') ||
      lower.includes('inpaint') || lower.includes('portrait') || lower.includes('face') ||
      lower.includes('lora') || lower.includes('dreambooth')) {
    return 'image';
  }
  
  // Код
  if (lower.includes('code') || lower.includes('coder') || lower.includes('codestral') ||
      lower.includes('starcoder') || lower.includes('codellama')) {
    return 'code';
  }
  
  // Текст (LLM)
  if (lower.includes('llama') || lower.includes('mistral') || lower.includes('mixtral') ||
      lower.includes('gemma') || lower.includes('phi') || lower.includes('qwen') ||
      lower.includes('yi-') || lower.includes('vicuna') || lower.includes('alpaca') ||
      lower.includes('chat') || lower.includes('instruct') || lower.includes('gpt') ||
      lower.includes('language') || lower.includes('llm')) {
    return 'text';
  }
  
  return 'multimodal';
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
    category: guessCategory(providerModelId, m.description),
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

  // Увеличиваем лимиты для загрузки большего количества моделей
  while (url && pagesFetched < 20 && merged.length < 1000) {
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
      if (merged.length >= 1000) break;
    }

    url = data.next;
    pagesFetched += 1;
  }

  return merged;
};

const CURATED_MODELS: UnifiedModel[] = [
  // ==================== ИЗОБРАЖЕНИЯ ====================
  // --- Flux ---
  {
    id: 'replicate:flux-1.1-pro',
    name: 'Flux 1.1 Pro',
    providerId: 'replicate',
    providerModelId: 'black-forest-labs/flux-1.1-pro',
    category: 'image',
    pricing: { imagePerUnit: 0.04 },
    description: 'Высококачественная генерация изображений от Black Forest Labs',
    accessUrl: 'https://replicate.com/black-forest-labs/flux-1.1-pro',
  },
  {
    id: 'replicate:flux-1.1-pro-ultra',
    name: 'Flux 1.1 Pro Ultra',
    providerId: 'replicate',
    providerModelId: 'black-forest-labs/flux-1.1-pro-ultra',
    category: 'image',
    pricing: { imagePerUnit: 0.06 },
    description: 'Flux Pro с ультра-качеством до 4MP',
    accessUrl: 'https://replicate.com/black-forest-labs/flux-1.1-pro-ultra',
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
    id: 'replicate:flux-fill-pro',
    name: 'Flux Fill Pro',
    providerId: 'replicate',
    providerModelId: 'black-forest-labs/flux-fill-pro',
    category: 'image',
    pricing: { imagePerUnit: 0.05 },
    description: 'Flux для inpainting и outpainting',
    accessUrl: 'https://replicate.com/black-forest-labs/flux-fill-pro',
  },
  {
    id: 'replicate:flux-canny-pro',
    name: 'Flux Canny Pro',
    providerId: 'replicate',
    providerModelId: 'black-forest-labs/flux-canny-pro',
    category: 'image',
    pricing: { imagePerUnit: 0.05 },
    description: 'Flux с контролем через Canny edges',
    accessUrl: 'https://replicate.com/black-forest-labs/flux-canny-pro',
  },
  {
    id: 'replicate:flux-depth-pro',
    name: 'Flux Depth Pro',
    providerId: 'replicate',
    providerModelId: 'black-forest-labs/flux-depth-pro',
    category: 'image',
    pricing: { imagePerUnit: 0.05 },
    description: 'Flux с контролем через depth maps',
    accessUrl: 'https://replicate.com/black-forest-labs/flux-depth-pro',
  },
  {
    id: 'replicate:flux-redux-dev',
    name: 'Flux Redux Dev',
    providerId: 'replicate',
    providerModelId: 'black-forest-labs/flux-redux-dev',
    category: 'image',
    pricing: { imagePerUnit: 0.025 },
    description: 'Flux для image variations',
    accessUrl: 'https://replicate.com/black-forest-labs/flux-redux-dev',
  },
  
  // --- Stable Diffusion ---
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
    id: 'replicate:sd3.5-large',
    name: 'Stable Diffusion 3.5 Large',
    providerId: 'replicate',
    providerModelId: 'stability-ai/stable-diffusion-3.5-large',
    category: 'image',
    pricing: { imagePerUnit: 0.065 },
    description: 'SD 3.5 Large - 8B параметров',
    accessUrl: 'https://replicate.com/stability-ai/stable-diffusion-3.5-large',
  },
  {
    id: 'replicate:sd3.5-large-turbo',
    name: 'SD 3.5 Large Turbo',
    providerId: 'replicate',
    providerModelId: 'stability-ai/stable-diffusion-3.5-large-turbo',
    category: 'image',
    pricing: { imagePerUnit: 0.04 },
    description: 'SD 3.5 Large ускоренная версия',
    accessUrl: 'https://replicate.com/stability-ai/stable-diffusion-3.5-large-turbo',
  },
  {
    id: 'replicate:sd3.5-medium',
    name: 'Stable Diffusion 3.5 Medium',
    providerId: 'replicate',
    providerModelId: 'stability-ai/stable-diffusion-3.5-medium',
    category: 'image',
    pricing: { imagePerUnit: 0.035 },
    description: 'SD 3.5 Medium - оптимальный баланс',
    accessUrl: 'https://replicate.com/stability-ai/stable-diffusion-3.5-medium',
  },
  
  // --- Ideogram & Recraft ---
  {
    id: 'replicate:ideogram-v2',
    name: 'Ideogram v2',
    providerId: 'replicate',
    providerModelId: 'ideogram-ai/ideogram-v2',
    category: 'image',
    pricing: { imagePerUnit: 0.08 },
    description: 'Лучшая работа с текстом на изображениях',
    accessUrl: 'https://replicate.com/ideogram-ai/ideogram-v2',
  },
  {
    id: 'replicate:ideogram-v2-turbo',
    name: 'Ideogram v2 Turbo',
    providerId: 'replicate',
    providerModelId: 'ideogram-ai/ideogram-v2-turbo',
    category: 'image',
    pricing: { imagePerUnit: 0.04 },
    description: 'Ideogram быстрая версия',
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
  {
    id: 'replicate:recraft-v3-svg',
    name: 'Recraft V3 SVG',
    providerId: 'replicate',
    providerModelId: 'recraft-ai/recraft-v3-svg',
    category: 'image',
    pricing: { imagePerUnit: 0.08 },
    description: 'Генерация векторной графики SVG',
    accessUrl: 'https://replicate.com/recraft-ai/recraft-v3-svg',
  },
  
  // --- Другие image модели ---
  {
    id: 'replicate:playground-v2.5',
    name: 'Playground v2.5',
    providerId: 'replicate',
    providerModelId: 'playgroundai/playground-v2.5-1024px-aesthetic',
    category: 'image',
    pricing: { imagePerUnit: 0.0023 },
    description: 'Эстетичные изображения от Playground',
    accessUrl: 'https://replicate.com/playgroundai/playground-v2.5-1024px-aesthetic',
  },
  {
    id: 'replicate:kandinsky-2.2',
    name: 'Kandinsky 2.2',
    providerId: 'replicate',
    providerModelId: 'ai-forever/kandinsky-2.2',
    category: 'image',
    pricing: { imagePerUnit: 0.002 },
    description: 'Kandinsky от Sber AI',
    accessUrl: 'https://replicate.com/ai-forever/kandinsky-2.2',
  },
  {
    id: 'replicate:realvisxl-v4',
    name: 'RealVisXL V4',
    providerId: 'replicate',
    providerModelId: 'lucataco/realvisxl-v4.0',
    category: 'image',
    pricing: { imagePerUnit: 0.003 },
    description: 'Фотореалистичные изображения',
    accessUrl: 'https://replicate.com/lucataco/realvisxl-v4.0',
  },
  {
    id: 'replicate:juggernaut-xl',
    name: 'Juggernaut XL',
    providerId: 'replicate',
    providerModelId: 'lucataco/juggernaut-xl-v9',
    category: 'image',
    pricing: { imagePerUnit: 0.003 },
    description: 'Популярная модель для реализма',
    accessUrl: 'https://replicate.com/lucataco/juggernaut-xl-v9',
  },
  {
    id: 'replicate:kolors',
    name: 'Kolors',
    providerId: 'replicate',
    providerModelId: 'kwai-kolors/kolors',
    category: 'image',
    pricing: { imagePerUnit: 0.003 },
    description: 'Модель от Kuaishou для цветных изображений',
    accessUrl: 'https://replicate.com/kwai-kolors/kolors',
  },
  
  // --- Upscale & Restore ---
  {
    id: 'replicate:real-esrgan',
    name: 'Real-ESRGAN',
    providerId: 'replicate',
    providerModelId: 'nightmareai/real-esrgan',
    category: 'image',
    pricing: { imagePerUnit: 0.002 },
    description: 'Апскейл изображений до 4x',
    accessUrl: 'https://replicate.com/nightmareai/real-esrgan',
  },
  {
    id: 'replicate:clarity-upscaler',
    name: 'Clarity Upscaler',
    providerId: 'replicate',
    providerModelId: 'philz1337x/clarity-upscaler',
    category: 'image',
    pricing: { imagePerUnit: 0.01 },
    description: 'Умный апскейл с улучшением деталей',
    accessUrl: 'https://replicate.com/philz1337x/clarity-upscaler',
  },
  {
    id: 'replicate:codeformer',
    name: 'CodeFormer',
    providerId: 'replicate',
    providerModelId: 'sczhou/codeformer',
    category: 'image',
    pricing: { imagePerUnit: 0.003 },
    description: 'Восстановление лиц на фото',
    accessUrl: 'https://replicate.com/sczhou/codeformer',
  },
  {
    id: 'replicate:gfpgan',
    name: 'GFPGAN',
    providerId: 'replicate',
    providerModelId: 'tencentarc/gfpgan',
    category: 'image',
    pricing: { imagePerUnit: 0.002 },
    description: 'Улучшение качества лиц',
    accessUrl: 'https://replicate.com/tencentarc/gfpgan',
  },
  {
    id: 'replicate:remove-bg',
    name: 'Remove Background',
    providerId: 'replicate',
    providerModelId: 'cjwbw/rembg',
    category: 'image',
    pricing: { imagePerUnit: 0.001 },
    description: 'Удаление фона с изображений',
    accessUrl: 'https://replicate.com/cjwbw/rembg',
  },
  
  // --- Face & Portrait ---
  {
    id: 'replicate:instantid',
    name: 'InstantID',
    providerId: 'replicate',
    providerModelId: 'zsxkib/instant-id',
    category: 'image',
    pricing: { imagePerUnit: 0.01 },
    description: 'Генерация с сохранением лица',
    accessUrl: 'https://replicate.com/zsxkib/instant-id',
  },
  {
    id: 'replicate:photomaker',
    name: 'PhotoMaker',
    providerId: 'replicate',
    providerModelId: 'tencentarc/photomaker',
    category: 'image',
    pricing: { imagePerUnit: 0.008 },
    description: 'Кастомизация лиц в изображениях',
    accessUrl: 'https://replicate.com/tencentarc/photomaker',
  },
  {
    id: 'replicate:pulid',
    name: 'PuLID',
    providerId: 'replicate',
    providerModelId: 'zsxkib/pulid',
    category: 'image',
    pricing: { imagePerUnit: 0.01 },
    description: 'Pure and Lightning ID customization',
    accessUrl: 'https://replicate.com/zsxkib/pulid',
  },

  // ==================== ВИДЕО ====================
  {
    id: 'replicate:kling-1.6-pro',
    name: 'Kling 1.6 Pro',
    providerId: 'replicate',
    providerModelId: 'kwaivgi/kling-v1.6-pro',
    category: 'video',
    pricing: { requestFixed: 0.32 },
    description: 'Генерация видео от Kuaishou',
    accessUrl: 'https://replicate.com/kwaivgi/kling-v1.6-pro',
  },
  {
    id: 'replicate:kling-1.5-pro',
    name: 'Kling 1.5 Pro',
    providerId: 'replicate',
    providerModelId: 'kwaivgi/kling-v1.5-pro',
    category: 'video',
    pricing: { requestFixed: 0.25 },
    description: 'Kling предыдущей версии',
    accessUrl: 'https://replicate.com/kwaivgi/kling-v1.5-pro',
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
    id: 'replicate:luma-ray2-flash',
    name: 'Luma Ray 2 Flash',
    providerId: 'replicate',
    providerModelId: 'luma/ray-2-flash',
    category: 'video',
    pricing: { requestFixed: 0.20 },
    description: 'Быстрая версия Luma Ray 2',
    accessUrl: 'https://replicate.com/luma/ray-2-flash',
  },
  {
    id: 'replicate:minimax-video-01',
    name: 'MiniMax Video-01',
    providerId: 'replicate',
    providerModelId: 'minimax/video-01',
    category: 'video',
    pricing: { requestFixed: 0.30 },
    description: 'Генерация видео от MiniMax',
    accessUrl: 'https://replicate.com/minimax/video-01',
  },
  {
    id: 'replicate:minimax-video-01-live',
    name: 'MiniMax Video-01 Live',
    providerId: 'replicate',
    providerModelId: 'minimax/video-01-live',
    category: 'video',
    pricing: { requestFixed: 0.25 },
    description: 'MiniMax для анимации портретов',
    accessUrl: 'https://replicate.com/minimax/video-01-live',
  },
  {
    id: 'replicate:hunyuan-video',
    name: 'Hunyuan Video',
    providerId: 'replicate',
    providerModelId: 'tencent/hunyuan-video',
    category: 'video',
    pricing: { requestFixed: 0.20 },
    description: 'Видео-модель от Tencent',
    accessUrl: 'https://replicate.com/tencent/hunyuan-video',
  },
  {
    id: 'replicate:cogvideox-5b',
    name: 'CogVideoX-5B',
    providerId: 'replicate',
    providerModelId: 'thudm/cogvideox-5b',
    category: 'video',
    pricing: { requestFixed: 0.15 },
    description: 'Open-source видео-модель от THUDM',
    accessUrl: 'https://replicate.com/thudm/cogvideox-5b',
  },
  {
    id: 'replicate:animate-diff',
    name: 'AnimateDiff',
    providerId: 'replicate',
    providerModelId: 'lucataco/animate-diff',
    category: 'video',
    pricing: { requestFixed: 0.05 },
    description: 'Анимация статичных изображений',
    accessUrl: 'https://replicate.com/lucataco/animate-diff',
  },
  {
    id: 'replicate:stable-video-diffusion',
    name: 'Stable Video Diffusion',
    providerId: 'replicate',
    providerModelId: 'stability-ai/stable-video-diffusion',
    category: 'video',
    pricing: { requestFixed: 0.04 },
    description: 'Image-to-Video от Stability AI',
    accessUrl: 'https://replicate.com/stability-ai/stable-video-diffusion',
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
  {
    id: 'replicate:mochi-1',
    name: 'Mochi 1',
    providerId: 'replicate',
    providerModelId: 'genmo/mochi-1-preview',
    category: 'video',
    pricing: { requestFixed: 0.15 },
    description: 'Видео-модель от Genmo',
    accessUrl: 'https://replicate.com/genmo/mochi-1-preview',
  },
  {
    id: 'replicate:ltx-video',
    name: 'LTX Video',
    providerId: 'replicate',
    providerModelId: 'lightricks/ltx-video',
    category: 'video',
    pricing: { requestFixed: 0.10 },
    description: 'Видео-модель от Lightricks',
    accessUrl: 'https://replicate.com/lightricks/ltx-video',
  },

  // ==================== АУДИО ====================
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
    id: 'replicate:whisper-diarization',
    name: 'Whisper Diarization',
    providerId: 'replicate',
    providerModelId: 'thomasmol/whisper-diarization',
    category: 'audio',
    pricing: { audioPerMinute: 0.01 },
    description: 'Whisper с разделением спикеров',
    accessUrl: 'https://replicate.com/thomasmol/whisper-diarization',
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
    id: 'replicate:parler-tts',
    name: 'Parler TTS',
    providerId: 'replicate',
    providerModelId: 'cjwbw/parler-tts',
    category: 'audio',
    pricing: { requestFixed: 0.01 },
    description: 'Text-to-Speech с контролем стиля',
    accessUrl: 'https://replicate.com/cjwbw/parler-tts',
  },
  {
    id: 'replicate:f5-tts',
    name: 'F5-TTS',
    providerId: 'replicate',
    providerModelId: 'lucataco/f5-tts',
    category: 'audio',
    pricing: { requestFixed: 0.015 },
    description: 'Быстрый и качественный TTS',
    accessUrl: 'https://replicate.com/lucataco/f5-tts',
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
  {
    id: 'replicate:musicgen-stereo',
    name: 'MusicGen Stereo',
    providerId: 'replicate',
    providerModelId: 'meta/musicgen-stereo-large',
    category: 'audio',
    pricing: { requestFixed: 0.05 },
    description: 'MusicGen в стерео качестве',
    accessUrl: 'https://replicate.com/meta/musicgen-stereo-large',
  },
  {
    id: 'replicate:riffusion',
    name: 'Riffusion',
    providerId: 'replicate',
    providerModelId: 'riffusion/riffusion',
    category: 'audio',
    pricing: { requestFixed: 0.02 },
    description: 'Генерация музыки через спектрограммы',
    accessUrl: 'https://replicate.com/riffusion/riffusion',
  },
  {
    id: 'replicate:bark',
    name: 'Bark',
    providerId: 'replicate',
    providerModelId: 'suno-ai/bark',
    category: 'audio',
    pricing: { requestFixed: 0.02 },
    description: 'TTS с эмоциями и эффектами от Suno',
    accessUrl: 'https://replicate.com/suno-ai/bark',
  },
  {
    id: 'replicate:audio-separator',
    name: 'Audio Separator',
    providerId: 'replicate',
    providerModelId: 'cjwbw/demucs',
    category: 'audio',
    pricing: { requestFixed: 0.02 },
    description: 'Разделение аудио на треки',
    accessUrl: 'https://replicate.com/cjwbw/demucs',
  },

  // ==================== ТЕКСТ (LLM) ====================
  {
    id: 'replicate:llama-3.3-70b',
    name: 'Llama 3.3 70B',
    providerId: 'replicate',
    providerModelId: 'meta/llama-3.3-70b-instruct',
    category: 'text',
    contextLength: 128000,
    pricing: { inputPerM: 0.35, outputPerM: 0.40 },
    description: 'Новейшая 70B модель Meta',
    accessUrl: 'https://replicate.com/meta/llama-3.3-70b-instruct',
  },
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
    id: 'replicate:llama-3.1-70b',
    name: 'Llama 3.1 70B',
    providerId: 'replicate',
    providerModelId: 'meta/meta-llama-3.1-70b-instruct',
    category: 'text',
    contextLength: 128000,
    pricing: { inputPerM: 0.28, outputPerM: 0.28 },
    description: 'Llama 3.1 70B Instruct',
    accessUrl: 'https://replicate.com/meta/meta-llama-3.1-70b-instruct',
  },
  {
    id: 'replicate:llama-3.1-8b',
    name: 'Llama 3.1 8B',
    providerId: 'replicate',
    providerModelId: 'meta/meta-llama-3.1-8b-instruct',
    category: 'text',
    contextLength: 128000,
    pricing: { inputPerM: 0.05, outputPerM: 0.05 },
    description: 'Компактная Llama 3.1',
    accessUrl: 'https://replicate.com/meta/meta-llama-3.1-8b-instruct',
  },
  {
    id: 'replicate:qwen2.5-72b',
    name: 'Qwen 2.5 72B',
    providerId: 'replicate',
    providerModelId: 'qwen/qwen2.5-72b-instruct',
    category: 'text',
    contextLength: 32000,
    pricing: { inputPerM: 0.35, outputPerM: 0.40 },
    description: 'Qwen 2.5 72B от Alibaba',
    accessUrl: 'https://replicate.com/qwen/qwen2.5-72b-instruct',
  },
  {
    id: 'replicate:qwen2.5-coder-32b',
    name: 'Qwen 2.5 Coder 32B',
    providerId: 'replicate',
    providerModelId: 'qwen/qwen2.5-coder-32b-instruct',
    category: 'code',
    contextLength: 32000,
    pricing: { inputPerM: 0.18, outputPerM: 0.22 },
    description: 'Qwen для программирования',
    accessUrl: 'https://replicate.com/qwen/qwen2.5-coder-32b-instruct',
  },
  {
    id: 'replicate:mistral-7b',
    name: 'Mistral 7B',
    providerId: 'replicate',
    providerModelId: 'mistralai/mistral-7b-instruct-v0.2',
    category: 'text',
    contextLength: 32000,
    pricing: { inputPerM: 0.05, outputPerM: 0.05 },
    description: 'Компактная модель от Mistral AI',
    accessUrl: 'https://replicate.com/mistralai/mistral-7b-instruct-v0.2',
  },
  {
    id: 'replicate:mixtral-8x7b',
    name: 'Mixtral 8x7B',
    providerId: 'replicate',
    providerModelId: 'mistralai/mixtral-8x7b-instruct-v0.1',
    category: 'text',
    contextLength: 32000,
    pricing: { inputPerM: 0.24, outputPerM: 0.24 },
    description: 'MoE модель от Mistral AI',
    accessUrl: 'https://replicate.com/mistralai/mixtral-8x7b-instruct-v0.1',
  },

  // ==================== КОД ====================
  {
    id: 'replicate:codellama-70b',
    name: 'CodeLlama 70B',
    providerId: 'replicate',
    providerModelId: 'meta/codellama-70b-instruct',
    category: 'code',
    contextLength: 16000,
    pricing: { inputPerM: 0.35, outputPerM: 0.45 },
    description: 'CodeLlama для программирования',
    accessUrl: 'https://replicate.com/meta/codellama-70b-instruct',
  },
  {
    id: 'replicate:codellama-34b',
    name: 'CodeLlama 34B',
    providerId: 'replicate',
    providerModelId: 'meta/codellama-34b-instruct',
    category: 'code',
    contextLength: 16000,
    pricing: { inputPerM: 0.18, outputPerM: 0.22 },
    description: 'CodeLlama 34B Instruct',
    accessUrl: 'https://replicate.com/meta/codellama-34b-instruct',
  },

  // ==================== 3D & другое ====================
  {
    id: 'replicate:trellis',
    name: 'Trellis',
    providerId: 'replicate',
    providerModelId: 'fofr/trellis',
    category: 'multimodal',
    pricing: { requestFixed: 0.05 },
    description: 'Генерация 3D моделей из изображений',
    accessUrl: 'https://replicate.com/fofr/trellis',
  },
  {
    id: 'replicate:triposr',
    name: 'TripoSR',
    providerId: 'replicate',
    providerModelId: 'camenduru/triposr',
    category: 'multimodal',
    pricing: { requestFixed: 0.03 },
    description: 'Быстрая генерация 3D из изображения',
    accessUrl: 'https://replicate.com/camenduru/triposr',
  },
  {
    id: 'replicate:blip-2',
    name: 'BLIP-2',
    providerId: 'replicate',
    providerModelId: 'salesforce/blip-2',
    category: 'multimodal',
    pricing: { requestFixed: 0.002 },
    description: 'Image captioning и VQA',
    accessUrl: 'https://replicate.com/salesforce/blip-2',
  },
  {
    id: 'replicate:llava-13b',
    name: 'LLaVA 13B',
    providerId: 'replicate',
    providerModelId: 'yorickvp/llava-13b',
    category: 'multimodal',
    pricing: { requestFixed: 0.005 },
    description: 'Vision-Language модель',
    accessUrl: 'https://replicate.com/yorickvp/llava-13b',
  },
  {
    id: 'replicate:moondream2',
    name: 'Moondream 2',
    providerId: 'replicate',
    providerModelId: 'vikhyatk/moondream2',
    category: 'multimodal',
    pricing: { requestFixed: 0.001 },
    description: 'Компактная vision модель',
    accessUrl: 'https://replicate.com/vikhyatk/moondream2',
  },
];

export const fetchReplicateModels = async (_apiKey?: string): Promise<ProviderModelsResult> => {
  // Replicate API не поддерживает CORS для браузерных запросов
  // Используем расширенный curated-список популярных моделей
  return {
    providerId: 'replicate',
    models: CURATED_MODELS,
    lastUpdated: Date.now(),
  };
};
