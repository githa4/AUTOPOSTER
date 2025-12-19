/**
 * Агрегатор моделей от всех провайдеров
 */

import { 
  UnifiedModel, 
  AggregatedModel, 
  ProviderModelsResult,
  ProviderConfig 
} from './types';
import { PROVIDERS_CONFIG, getProviderById } from './providersConfig';
import {
  fetchOpenRouterModels,
  fetchTogetherModels,
  fetchFireworksModels,
  fetchGroqModels,
  fetchReplicateModels,
  fetchFalModels,
  fetchKieModels,
  fetchLaozhangModels,
  fetchApi2dModels,
} from './providers';

export interface ApiKeys {
  together?: string;
  groq?: string;
  replicate?: string;
  fireworks?: string;
  fal?: string;
  kie?: string;
  laozhang?: string;
  api2d?: string;
}

export interface AggregatorResult {
  byProvider: Map<string, ProviderModelsResult>;
  allModels: AggregatedModel[];
  errors: Array<{ providerId: string; error: string }>;
  lastUpdated: number;
}

// Нормализация имени модели для сопоставления
const normalizeModelName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/preview|latest|turbo/g, '')
    .trim();
};

// Загрузка моделей от конкретного провайдера
const fetchProviderModels = async (
  providerId: string, 
  apiKeys: ApiKeys
): Promise<ProviderModelsResult | null> => {
  const config = getProviderById(providerId);
  if (!config || !config.enabled) return null;

  switch (providerId) {
    case 'openrouter':
      return fetchOpenRouterModels();
    case 'together':
      return fetchTogetherModels(apiKeys.together);
    case 'groq':
      return fetchGroqModels(apiKeys.groq);
    case 'replicate':
      return fetchReplicateModels(apiKeys.replicate);
    case 'fireworks':
      return fetchFireworksModels(apiKeys.fireworks);
    case 'fal':
      return fetchFalModels(apiKeys.fal);
    case 'kie':
      return fetchKieModels(apiKeys.kie);
    case 'laozhang':
      return fetchLaozhangModels(apiKeys.laozhang);
    case 'api2d':
      return fetchApi2dModels(apiKeys.api2d);
    default:
      return null;
  }
};

// Поиск самой дешёвой версии модели
const findCheapest = (models: UnifiedModel[]): UnifiedModel | null => {
  if (models.length === 0) return null;
  
  return models.reduce((cheapest, current) => {
    const cheapestPrice = cheapest.pricing.inputPerM ?? Infinity;
    const currentPrice = current.pricing.inputPerM ?? Infinity;
    return currentPrice < cheapestPrice ? current : cheapest;
  });
};

// Группировка моделей по базовому имени
const groupByBaseModel = (models: AggregatedModel[]): Map<string, AggregatedModel[]> => {
  const groups = new Map<string, AggregatedModel[]>();
  
  for (const model of models) {
    const baseName = normalizeModelName(model.name);
    const existing = groups.get(baseName) ?? [];
    existing.push(model);
    groups.set(baseName, existing);
  }
  
  return groups;
};

export const fetchAllProviderModels = async (
  enabledProviderIds: string[],
  apiKeys: ApiKeys = {}
): Promise<AggregatorResult> => {
  const byProvider = new Map<string, ProviderModelsResult>();
  const errors: Array<{ providerId: string; error: string }> = [];
  
  // Загружаем данные параллельно
  const results = await Promise.all(
    enabledProviderIds.map(async id => {
      const result = await fetchProviderModels(id, apiKeys);
      return { id, result };
    })
  );
  
  // Собираем результаты
  for (const { id, result } of results) {
    if (result) {
      byProvider.set(id, result);
      if (result.error) {
        errors.push({ providerId: id, error: result.error });
      }
    }
  }
  
  // Собираем все модели в единый список
  const allModels: AggregatedModel[] = [];
  
  for (const [providerId, result] of byProvider) {
    const config = getProviderById(providerId);
    if (!config) continue;
    
    for (const model of result.models) {
      allModels.push({
        ...model,
        providerName: config.name,
        providerType: config.type,
      });
    }
  }
  
  // Помечаем самые дешёвые версии моделей
  const grouped = groupByBaseModel(allModels);
  for (const models of grouped.values()) {
    if (models.length > 1) {
      const cheapest = findCheapest(models);
      if (cheapest) {
        const cheapestModel = allModels.find(m => m.id === cheapest.id);
        if (cheapestModel) {
          cheapestModel.isCheapest = true;
          
          // Добавляем информацию об альтернативных провайдерах
          cheapestModel.alternativeProviders = models
            .filter(m => m.id !== cheapest.id)
            .map(m => ({
              providerId: m.providerId,
              providerName: m.providerName,
              pricing: m.pricing,
            }));
        }
      }
    } else if (models.length === 1) {
      // Единственный провайдер — тоже "самый дешёвый"
      models[0].isCheapest = true;
    }
  }
  
  return {
    byProvider,
    allModels,
    errors,
    lastUpdated: Date.now(),
  };
};

// Хелпер для получения конфига провайдеров
export const getProvidersWithStatus = (
  enabledIds: string[]
): Array<ProviderConfig & { isActive: boolean }> => {
  return PROVIDERS_CONFIG.map(config => ({
    ...config,
    isActive: enabledIds.includes(config.id),
  }));
};
