/**
 * Провайдер: API2D (НЕОФИЦИАЛЬНЫЙ)
 * ⚠️ Реселлер, используйте на свой риск
 * Курируемый список — API не публичный
 */

import { UnifiedModel, ProviderModelsResult } from '../types';

// Курируемый список моделей API2D
// Цены примерные, обновлять по мере необходимости
const CURATED_MODELS: UnifiedModel[] = [
  {
    id: 'api2d:gpt-4-turbo',
    name: 'GPT-4 Turbo',
    providerId: 'api2d',
    providerModelId: 'gpt-4-turbo-preview',
    category: 'text',
    contextLength: 128000,
    pricing: {
      inputPerM: 4.0,  // ~60% скидка
      outputPerM: 12.0,
    },
    description: 'GPT-4 Turbo через API2D (реселлер)',
    accessUrl: 'https://api2d.com',
  },
  {
    id: 'api2d:gpt-4o',
    name: 'GPT-4o',
    providerId: 'api2d',
    providerModelId: 'gpt-4o',
    category: 'multimodal',
    contextLength: 128000,
    pricing: {
      inputPerM: 1.5,
      outputPerM: 6.0,
    },
    description: 'GPT-4o через API2D (реселлер)',
    accessUrl: 'https://api2d.com',
  },
  {
    id: 'api2d:gpt-4o-mini',
    name: 'GPT-4o Mini',
    providerId: 'api2d',
    providerModelId: 'gpt-4o-mini',
    category: 'text',
    contextLength: 128000,
    pricing: {
      inputPerM: 0.1,
      outputPerM: 0.4,
    },
    description: 'GPT-4o Mini через API2D (реселлер)',
    accessUrl: 'https://api2d.com',
  },
  {
    id: 'api2d:claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    providerId: 'api2d',
    providerModelId: 'claude-3-5-sonnet',
    category: 'text',
    contextLength: 200000,
    pricing: {
      inputPerM: 1.8,
      outputPerM: 9.0,
    },
    description: 'Claude 3.5 Sonnet через API2D (реселлер)',
    accessUrl: 'https://api2d.com',
  },
  {
    id: 'api2d:claude-3-opus',
    name: 'Claude 3 Opus',
    providerId: 'api2d',
    providerModelId: 'claude-3-opus',
    category: 'text',
    contextLength: 200000,
    pricing: {
      inputPerM: 9.0,
      outputPerM: 45.0,
    },
    description: 'Claude 3 Opus через API2D (реселлер)',
    accessUrl: 'https://api2d.com',
  },
];

export const fetchApi2dModels = async (_apiKey?: string): Promise<ProviderModelsResult> => {
  // Курируемый список, API не публичный
  
  return {
    providerId: 'api2d',
    models: CURATED_MODELS,
    lastUpdated: Date.now(),
  };
};
