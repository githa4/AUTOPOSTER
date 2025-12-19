/**
 * Провайдер: Kie.ai
 * Специализируется на видео, картинках, музыке
 * API не публичный — используем курируемый список
 * Особенность: Veo 3.1, Runway Aleph, Suno, русский интерфейс
 */

import { UnifiedModel, ProviderModelsResult } from '../types';

// Курируемый список моделей Kie.ai
// Данные с сайта https://kie.ai — обновлять вручную
const CURATED_MODELS: UnifiedModel[] = [
  // === ВИДЕО ===
  {
    id: 'kie:veo-3.1',
    name: 'Google Veo 3.1',
    providerId: 'kie',
    providerModelId: 'veo-3.1',
    category: 'video',
    pricing: { requestFixed: 0.40 },
    description: 'Последняя модель видео от Google DeepMind с синхронизированным звуком и 1080p',
    accessUrl: 'https://kie.ai/ru/veo-3-1',
  },
  {
    id: 'kie:veo-3.1-fast',
    name: 'Google Veo 3.1 Fast',
    providerId: 'kie',
    providerModelId: 'veo-3.1-fast',
    category: 'video',
    pricing: { requestFixed: 0.25 },
    description: 'Быстрая версия Veo 3.1 с меньшими затратами',
    accessUrl: 'https://kie.ai/ru/features/v3-fast-api',
  },
  {
    id: 'kie:runway-aleph',
    name: 'Runway Aleph',
    providerId: 'kie',
    providerModelId: 'runway-gen4-aleph',
    category: 'video',
    pricing: { requestFixed: 0.35 },
    description: 'Runway Gen-4 Aleph с редактированием видео через текст',
    accessUrl: 'https://kie.ai/ru/runway/gen4-aleph',
  },
  {
    id: 'kie:runway-gen4-turbo',
    name: 'Runway Gen-4 Turbo',
    providerId: 'kie',
    providerModelId: 'runway-gen4-turbo',
    category: 'video',
    pricing: { requestFixed: 0.20 },
    description: 'Быстрая и доступная генерация видео Runway',
    accessUrl: 'https://kie.ai/ru/features/gen4-turbo-api',
  },
  {
    id: 'kie:kling-v2.1',
    name: 'Kling V2.1',
    providerId: 'kie',
    providerModelId: 'kling-v2-1',
    category: 'video',
    pricing: { requestFixed: 0.30 },
    description: 'Kling от Kuaishou',
    accessUrl: 'https://kie.ai/ru/kling/v2-1',
  },
  {
    id: 'kie:seedance-v1',
    name: 'Seedance V1',
    providerId: 'kie',
    providerModelId: 'seedance-v1',
    category: 'video',
    pricing: { requestFixed: 0.25 },
    description: 'Генерация танцевальных видео от ByteDance',
    accessUrl: 'https://kie.ai/ru/bytedance/seedance-v1',
  },
  {
    id: 'kie:wan-v2.2',
    name: 'Wan V2.2 A14B',
    providerId: 'kie',
    providerModelId: 'wan-v2-2',
    category: 'video',
    pricing: { requestFixed: 0.15 },
    description: 'Text-to-Video модель Wan',
    accessUrl: 'https://kie.ai/ru/wan/v2-2',
  },

  // === ИЗОБРАЖЕНИЯ ===
  {
    id: 'kie:4o-image',
    name: 'GPT-4o Image',
    providerId: 'kie',
    providerModelId: '4o-image-api',
    category: 'image',
    pricing: { imagePerUnit: 0.08 },
    description: 'Генерация изображений GPT-4o от OpenAI',
    accessUrl: 'https://kie.ai/ru/4o-image-api',
  },
  {
    id: 'kie:flux-kontext',
    name: 'Flux.1 Kontext',
    providerId: 'kie',
    providerModelId: 'flux1-kontext',
    category: 'image',
    pricing: { imagePerUnit: 0.05 },
    description: 'Flux Kontext от Black Forest Labs для согласованных изображений',
    accessUrl: 'https://kie.ai/ru/features/flux1-kontext',
  },
  {
    id: 'kie:flux-kontext-dev',
    name: 'Flux.1 Kontext Dev',
    providerId: 'kie',
    providerModelId: 'flux-1-kontext-dev',
    category: 'image',
    pricing: { imagePerUnit: 0.025 },
    description: 'Версия для разработки Flux Kontext',
    accessUrl: 'https://kie.ai/ru/features/flux-1-kontext-dev-api',
  },
  {
    id: 'kie:nano-banana',
    name: 'Nano Banana (Gemini 2.5 Flash)',
    providerId: 'kie',
    providerModelId: 'nano-banana',
    category: 'image',
    pricing: { imagePerUnit: 0.02 },
    description: 'Быстрая генерация и редактирование изображений',
    accessUrl: 'https://kie.ai/ru/nano-banana',
  },
  {
    id: 'kie:ideogram-v3',
    name: 'Ideogram V3',
    providerId: 'kie',
    providerModelId: 'ideogram-v3',
    category: 'image',
    pricing: { imagePerUnit: 0.08 },
    description: 'Ideogram v3 с отличной работой с текстом',
    accessUrl: 'https://kie.ai/ru/ideogram/v3',
  },
  {
    id: 'kie:ideogram-character',
    name: 'Ideogram Character',
    providerId: 'kie',
    providerModelId: 'ideogram-character',
    category: 'image',
    pricing: { imagePerUnit: 0.10 },
    description: 'Генерация согласованных персонажей',
    accessUrl: 'https://kie.ai/ru/ideogram/character',
  },
  {
    id: 'kie:imagen4',
    name: 'Google Imagen 4',
    providerId: 'kie',
    providerModelId: 'imagen4',
    category: 'image',
    pricing: { imagePerUnit: 0.06 },
    description: 'Imagen 4 от Google',
    accessUrl: 'https://kie.ai/ru/google/imagen4',
  },
  {
    id: 'kie:qwen-image-edit',
    name: 'Qwen Image Edit',
    providerId: 'kie',
    providerModelId: 'qwen-image-edit',
    category: 'image',
    pricing: { imagePerUnit: 0.03 },
    description: 'Редактирование изображений от Qwen',
    accessUrl: 'https://kie.ai/ru/qwen/image-edit',
  },

  // === МУЗЫКА ===
  {
    id: 'kie:suno-v4.5',
    name: 'Suno V4.5 Plus',
    providerId: 'kie',
    providerModelId: 'suno-v4-5-plus',
    category: 'audio',
    pricing: { requestFixed: 0.30 },
    description: 'Генерация музыки Suno до 8 минут с улучшенными вокалами',
    accessUrl: 'https://kie.ai/ru/suno-api',
  },
  {
    id: 'kie:suno-v4',
    name: 'Suno V4',
    providerId: 'kie',
    providerModelId: 'suno-v4',
    category: 'audio',
    pricing: { requestFixed: 0.20 },
    description: 'Генерация музыки Suno V4',
    accessUrl: 'https://kie.ai/ru/suno-api',
  },
  {
    id: 'kie:suno-v3.5',
    name: 'Suno V3.5',
    providerId: 'kie',
    providerModelId: 'suno-v3-5',
    category: 'audio',
    pricing: { requestFixed: 0.10 },
    description: 'Генерация музыки Suno V3.5',
    accessUrl: 'https://kie.ai/ru/suno-api',
  },
];

export const fetchKieModels = async (_apiKey?: string): Promise<ProviderModelsResult> => {
  // Kie.ai не имеет публичного API для списка моделей
  // Возвращаем курируемый список
  
  return {
    providerId: 'kie',
    models: CURATED_MODELS,
    lastUpdated: Date.now(),
  };
};
