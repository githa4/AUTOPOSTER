/**
 * Провайдер: LaoZhang.ai (НЕОФИЦИАЛЬНЫЙ)
 * ⚠️ Реселлер, используйте на свой риск
 * Курируемый список — API не публичный
 */

import { UnifiedModel, ProviderModelsResult } from '../types';

// Курируемый список моделей LaoZhang.ai
// Цены примерные, обновлять по мере необходимости
const CURATED_MODELS: UnifiedModel[] = [
  {
    id: 'laozhang:gpt-4-turbo',
    name: 'GPT-4 Turbo',
    providerId: 'laozhang',
    providerModelId: 'gpt-4-turbo',
    category: 'text',
    contextLength: 128000,
    pricing: {
      inputPerM: 3.0,  // ~70% скидка от OpenAI
      outputPerM: 9.0,
    },
    description: 'GPT-4 Turbo через LaoZhang (реселлер)',
    accessUrl: 'https://api.laozhang.ai',
  },
  {
    id: 'laozhang:gpt-4o',
    name: 'GPT-4o',
    providerId: 'laozhang',
    providerModelId: 'gpt-4o',
    category: 'multimodal',
    contextLength: 128000,
    pricing: {
      inputPerM: 1.25,  // ~50% скидка от OpenAI
      outputPerM: 5.0,
    },
    description: 'GPT-4o через LaoZhang (реселлер)',
    accessUrl: 'https://api.laozhang.ai',
  },
  {
    id: 'laozhang:gpt-4o-mini',
    name: 'GPT-4o Mini',
    providerId: 'laozhang',
    providerModelId: 'gpt-4o-mini',
    category: 'text',
    contextLength: 128000,
    pricing: {
      inputPerM: 0.075,
      outputPerM: 0.30,
    },
    description: 'GPT-4o Mini через LaoZhang (реселлер)',
    accessUrl: 'https://api.laozhang.ai',
  },
  {
    id: 'laozhang:claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    providerId: 'laozhang',
    providerModelId: 'claude-3-5-sonnet-20241022',
    category: 'text',
    contextLength: 200000,
    pricing: {
      inputPerM: 1.5,  // ~50% скидка от Anthropic
      outputPerM: 7.5,
    },
    description: 'Claude 3.5 Sonnet через LaoZhang (реселлер)',
    accessUrl: 'https://api.laozhang.ai',
  },
  {
    id: 'laozhang:claude-3-opus',
    name: 'Claude 3 Opus',
    providerId: 'laozhang',
    providerModelId: 'claude-3-opus-20240229',
    category: 'text',
    contextLength: 200000,
    pricing: {
      inputPerM: 7.5,  // ~50% скидка от Anthropic
      outputPerM: 37.5,
    },
    description: 'Claude 3 Opus через LaoZhang (реселлер)',
    accessUrl: 'https://api.laozhang.ai',
  },
  {
    id: 'laozhang:deepseek-chat',
    name: 'DeepSeek V3',
    providerId: 'laozhang',
    providerModelId: 'deepseek-chat',
    category: 'text',
    contextLength: 64000,
    pricing: {
      inputPerM: 0.07,
      outputPerM: 0.14,
    },
    description: 'DeepSeek V3 через LaoZhang',
    accessUrl: 'https://api.laozhang.ai',
  },
];

export const fetchLaozhangModels = async (_apiKey?: string): Promise<ProviderModelsResult> => {
  // Курируемый список, API не публичный
  
  return {
    providerId: 'laozhang',
    models: CURATED_MODELS,
    lastUpdated: Date.now(),
  };
};
