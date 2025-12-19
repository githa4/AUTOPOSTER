/**
 * Конфигурация всех провайдеров
 * Можно включать/отключать провайдеров здесь
 */

import { ProviderConfig } from './types';

export const PROVIDERS_CONFIG: ProviderConfig[] = [
  // ========== ОФИЦИАЛЬНЫЕ ==========
  {
    id: 'openrouter',
    name: 'OpenRouter',
    type: 'official',
    enabled: true,
    apiKeyRequired: false, // Публичный API
    siteUrl: 'https://openrouter.ai',
    docsUrl: 'https://openrouter.ai/docs',
    description: '300+ моделей, единый OpenAI-совместимый API',
  },
  {
    id: 'together',
    name: 'Together AI',
    type: 'official',
    enabled: true,
    apiKeyRequired: true,
    apiKeyEnvName: 'TOGETHER_API_KEY',
    siteUrl: 'https://together.ai',
    docsUrl: 'https://docs.together.ai',
    description: '100+ моделей, низкие цены, быстрый инференс',
  },
  {
    id: 'groq',
    name: 'Groq',
    type: 'official',
    enabled: true,
    apiKeyRequired: true,
    apiKeyEnvName: 'GROQ_API_KEY',
    siteUrl: 'https://groq.com',
    docsUrl: 'https://console.groq.com/docs',
    description: 'Сверхбыстрые LPU-чипы, бесплатный тир!',
  },
  {
    id: 'replicate',
    name: 'Replicate',
    type: 'official',
    enabled: true,
    apiKeyRequired: true,
    apiKeyEnvName: 'REPLICATE_API_TOKEN',
    siteUrl: 'https://replicate.com',
    docsUrl: 'https://replicate.com/docs',
    description: '500+ моделей: картинки, видео, аудио, текст',
  },
  {
    id: 'fireworks',
    name: 'Fireworks AI',
    type: 'official',
    enabled: true,
    apiKeyRequired: true,
    apiKeyEnvName: 'FIREWORKS_API_KEY',
    siteUrl: 'https://fireworks.ai',
    docsUrl: 'https://docs.fireworks.ai',
    description: '50+ моделей, оптимизированный инференс',
  },
  {
    id: 'fal',
    name: 'FAL.ai',
    type: 'official',
    enabled: true,
    apiKeyRequired: true,
    apiKeyEnvName: 'FAL_API_KEY',
    siteUrl: 'https://fal.ai',
    docsUrl: 'https://docs.fal.ai',
    description: 'Картинки и видео, Flux, SDXL',
  },
  {
    id: 'kie',
    name: 'Kie.ai',
    type: 'official',
    enabled: true,
    apiKeyRequired: true,
    apiKeyEnvName: 'KIE_API_KEY',
    siteUrl: 'https://kie.ai',
    docsUrl: 'https://docs.kie.ai',
    description: 'Veo 3.1, Runway, Suno — видео, картинки, музыка. Русский интерфейс!',
  },
  
  // ========== НЕОФИЦИАЛЬНЫЕ ==========
  {
    id: 'laozhang',
    name: 'LaoZhang.ai',
    type: 'unofficial',
    enabled: false, // Отключен по умолчанию
    apiKeyRequired: true,
    apiKeyEnvName: 'LAOZHANG_API_KEY',
    siteUrl: 'https://api.laozhang.ai',
    description: 'GPT-4, Claude — экономия 50-70%',
    warningText: '⚠️ Неофициальный реселлер. Используйте на свой риск.',
  },
  {
    id: 'api2d',
    name: 'API2D',
    type: 'unofficial',
    enabled: false, // Отключен по умолчанию
    apiKeyRequired: true,
    apiKeyEnvName: 'API2D_API_KEY',
    siteUrl: 'https://api2d.com',
    description: 'GPT-4, Claude — экономия 40-60%',
    warningText: '⚠️ Неофициальный реселлер. Используйте на свой риск.',
  },
];

// Хелперы
export const getProviderById = (id: string): ProviderConfig | undefined =>
  PROVIDERS_CONFIG.find(p => p.id === id);

export const getEnabledProviders = (): ProviderConfig[] =>
  PROVIDERS_CONFIG.filter(p => p.enabled);

export const getOfficialProviders = (): ProviderConfig[] =>
  PROVIDERS_CONFIG.filter(p => p.type === 'official');

export const getUnofficialProviders = (): ProviderConfig[] =>
  PROVIDERS_CONFIG.filter(p => p.type === 'unofficial');
