/**
 * Провайдер: FAL.ai
 * Специализируется на изображениях и видео
 * API не имеет публичного эндпоинта для списка моделей — используем курируемый список
 */

import { UnifiedModel, ProviderModelsResult } from '../types';

// Курируемый список популярных моделей FAL.ai
// Обновлять вручную по мере необходимости
const CURATED_MODELS: UnifiedModel[] = [
  {
    id: 'fal:flux-pro',
    name: 'Flux Pro',
    providerId: 'fal',
    providerModelId: 'fal-ai/flux-pro',
    category: 'image',
    pricing: {
      imagePerUnit: 0.05,
    },
    description: 'Высококачественная генерация изображений от Black Forest Labs',
    accessUrl: 'https://fal.ai/models/flux-pro',
  },
  {
    id: 'fal:flux-dev',
    name: 'Flux Dev',
    providerId: 'fal',
    providerModelId: 'fal-ai/flux/dev',
    category: 'image',
    pricing: {
      imagePerUnit: 0.025,
    },
    description: 'Быстрая версия Flux для разработки',
    accessUrl: 'https://fal.ai/models/flux-dev',
  },
  {
    id: 'fal:flux-schnell',
    name: 'Flux Schnell',
    providerId: 'fal',
    providerModelId: 'fal-ai/flux/schnell',
    category: 'image',
    pricing: {
      imagePerUnit: 0.003,
    },
    description: 'Самая быстрая версия Flux',
    isFree: false,
    accessUrl: 'https://fal.ai/models/flux-schnell',
  },
  {
    id: 'fal:sdxl',
    name: 'Stable Diffusion XL',
    providerId: 'fal',
    providerModelId: 'fal-ai/fast-sdxl',
    category: 'image',
    pricing: {
      imagePerUnit: 0.01,
    },
    description: 'Stable Diffusion XL с оптимизацией',
    accessUrl: 'https://fal.ai/models/fast-sdxl',
  },
  {
    id: 'fal:sd3',
    name: 'Stable Diffusion 3',
    providerId: 'fal',
    providerModelId: 'fal-ai/stable-diffusion-v3-medium',
    category: 'image',
    pricing: {
      imagePerUnit: 0.035,
    },
    description: 'Stable Diffusion 3 Medium',
    accessUrl: 'https://fal.ai/models/stable-diffusion-v3-medium',
  },
  {
    id: 'fal:ideogram',
    name: 'Ideogram v2',
    providerId: 'fal',
    providerModelId: 'fal-ai/ideogram/v2',
    category: 'image',
    pricing: {
      imagePerUnit: 0.08,
    },
    description: 'Отличная работа с текстом на изображениях',
    accessUrl: 'https://fal.ai/models/ideogram-v2',
  },
  {
    id: 'fal:kling',
    name: 'Kling 1.5',
    providerId: 'fal',
    providerModelId: 'fal-ai/kling-video/v1.5/pro',
    category: 'video',
    pricing: {
      requestFixed: 0.10,
    },
    description: 'Генерация видео от Kuaishou',
    accessUrl: 'https://fal.ai/models/kling-video',
  },
  {
    id: 'fal:minimax',
    name: 'MiniMax Video',
    providerId: 'fal',
    providerModelId: 'fal-ai/minimax/video-01',
    category: 'video',
    pricing: {
      requestFixed: 0.20,
    },
    description: 'Генерация видео от MiniMax',
    accessUrl: 'https://fal.ai/models/minimax-video',
  },
];

export const fetchFalModels = async (_apiKey?: string): Promise<ProviderModelsResult> => {
  // FAL.ai не имеет публичного API для списка моделей
  // Возвращаем курируемый список
  
  return {
    providerId: 'fal',
    models: CURATED_MODELS,
    lastUpdated: Date.now(),
  };
};
